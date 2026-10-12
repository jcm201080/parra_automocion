document.addEventListener("DOMContentLoaded", cargarTablaAdmin);

async function cargarTablaAdmin() {
    const res = await fetch('/api/vehiculos');
    const vehiculos = await res.json();
    const tbody = document.getElementById("tablaAdminBody");
    tbody.innerHTML = "";

    vehiculos.forEach(v => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${v.marca} ${v.modelo}</strong> (${v.anio})</td>
            <td>${v.categoria}</td>
            <td>${v.precio.toLocaleString()} €</td>
            <td><span class="badge state-${v.estado}">${v.estado.toUpperCase()}</span></td>
            <td>
                <button onclick="cambiarEstado(${v.id}, 'vendido')" class="btn-sm btn-vendido">Marcar Vendido</button>
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

    await fetch('/api/vehiculos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });

    document.getElementById("formVehiculo").reset();
    cargarTablaAdmin();
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