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
                <button onclick="prepararEdicion(${JSON.stringify(v).replace(/"/g, '&quot;')})" class="btn-sm" style="background:#2563eb; color:white;">Editar</button>
                <button onclick="cambiarEstado(${v.id}, 'reservado')" class="btn-sm" style="background:#ca8a04; color:white;">Reservado</button>
                <button onclick="cambiarEstado(${v.id}, 'vendido')" class="btn-sm btn-vendido">Vendido</button>
                <button onclick="eliminarVehiculo(${v.id})" class="btn-sm btn-delete">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Carga los datos del vehículo en el formulario para editarlo
function prepararEdicion(v) {
    document.getElementById("vehiculoId").value = v.id;
    document.getElementById("marca").value = v.marca;
    document.getElementById("modelo").value = v.modelo;
    document.getElementById("categoria").value = v.categoria;
    document.getElementById("precio").value = v.precio;
    document.getElementById("anio").value = v.anio;
    document.getElementById("kilometros").value = v.kilometros;
    document.getElementById("combustible").value = v.combustible;
    document.getElementById("estado").value = v.estado;
    document.getElementById("imagen_url").value = v.imagen_url;
    document.getElementById("descripcion").value = v.descripcion || "";

    if (v.imagen_url) {
        document.getElementById("previewFoto").innerHTML = `<img src="${v.imagen_url}" style="max-height: 120px; border-radius: 6px; margin-top: 8px;">`;
    }

    document.getElementById("formTitulo").innerText = "Editar Vehículo";
    document.getElementById("btnGuardar").innerText = "Actualizar Vehículo";
}

async function guardarVehiculo(e) {
    e.preventDefault();
    const id = document.getElementById("vehiculoId").value;
    
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

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/vehiculos/${id}` : '/api/vehiculos';

    const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });

    if (res.ok) {
        resetFormulario();
        cargarTablaAdmin();
    } else {
        alert("Error al guardar el vehículo.");
    }
}

function resetFormulario() {
    document.getElementById("formVehiculo").reset();
    document.getElementById("vehiculoId").value = "";
    document.getElementById("imagen_url").value = "";
    document.getElementById("previewFoto").innerHTML = "";
    document.getElementById("formTitulo").innerText = "Añadir Vehículo";
    document.getElementById("btnGuardar").innerText = "Guardar Vehículo";
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
    if (confirm("¿Seguro que deseas eliminar este vehículo del inventario?")) {
        await fetch(`/api/vehiculos/${id}`, { method: 'DELETE' });
        cargarTablaAdmin();
    }
}