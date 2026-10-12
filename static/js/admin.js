document.addEventListener("DOMContentLoaded", cargarTablaAdmin);

async function subirFotoMovil(input) {
    if (!input.files || !input.files[0]) return;

    const file = input.files[0];
    const formData = new FormData();
    formData.append("foto", file);

    const preview = document.getElementById("previewFoto");
    preview.innerHTML = "<p>Subiendo foto...</p>";

    try {
        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData
        });

        const data = await res.json();
        if (res.ok) {
            document.getElementById("imagen_url").value = data.url;
            preview.innerHTML = `<img src="${data.url}" alt="Vista previa" style="max-height: 120px; border-radius: 6px; margin-top: 8px;">`;
        } else {
            alert(data.error || "Error al subir la imagen");
            preview.innerHTML = "";
        }
    } catch (err) {
        console.error("Error al subir foto:", err);
        alert("Error de conexión al subir la imagen");
        preview.innerHTML = "";
    }
}

async function cargarTablaAdmin() {
    const res = await fetch('/api/vehiculos');
    const vehiculos = await res.json();
    const tbody = document.getElementById("tablaAdminBody");
    tbody.innerHTML = "";

    vehiculos.forEach(v => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><img src="${v.imagen_url}" style="width: 50px; height: 35px; object-fit: cover; border-radius: 4px;"></td>
            <td><strong>${v.marca} ${v.modelo}</strong> (${v.anio})</td>
            <td>${v.precio.toLocaleString()} €</td>
            <td><span class="badge state-${v.estado}">${v.estado.toUpperCase()}</span></td>
            <td>
                <button onclick="cambiarEstado(${v.id}, 'vendido')" class="btn-sm btn-vendido">Vendido</button>
                <button onclick="eliminarVehiculo(${v.id})" class="btn-sm btn-delete">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function guardarVehiculo(e) {
    e.preventDefault();
    const datos = {
        marca: document.getElementById("marca").value,
        modelo: document.getElementById("modelo").value,
        categoria: document.getElementById("categoria").value,
        precio: parseFloat(document.getElementById("precio").value),
        anio: parseInt(document.getElementById("anio").value),
        kilometros: parseInt(document.getElementById("kilometros").value),
        combustible: document.getElementById("combustible").value,
        estado: document.getElementById("estado").value,
        imagen_url: document.getElementById("imagen_url").value,
        descripcion: document.getElementById("descripcion").value
    };

    const res = await fetch('/api/vehiculos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });

    if (res.ok) {
        document.getElementById("formVehiculo").reset();
        document.getElementById("previewFoto").innerHTML = "";
        cargarTablaAdmin();
    } else {
        alert("Error al guardar el vehículo. Verifica que has iniciado sesión.");
    }
}

async function cambiarEstado(id, nuevoEstado) {
    await fetch(`/api/vehiculos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
    });
    cargarTablaAdmin();
}

async function eliminarVehiculo(id) {
    if (confirm("¿Seguro que deseas eliminar este vehículo?")) {
        await fetch(`/api/vehiculos/${id}`, { method: 'DELETE' });
        cargarTablaAdmin();
    }
}