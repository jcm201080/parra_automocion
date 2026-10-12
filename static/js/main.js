document.addEventListener("DOMContentLoaded", () => {
    cargarVehiculos();
});

async function cargarVehiculos() {
    const marca = document.getElementById("buscarMarca").value;
    const categoria = document.getElementById("buscarCategoria").value;
    const precioMax = document.getElementById("buscarPrecioMax").value;

    let url = `/api/vehiculos?marca=${encodeURIComponent(marca)}&categoria=${encodeURIComponent(categoria)}`;
    if (precioMax) url += `&precio_max=${precioMax}`;

    try {
        const res = await fetch(url);
        const vehiculos = await res.json();
        
        const contenedor = document.getElementById("catalogoVehiculos");
        contenedor.innerHTML = "";

        if (vehiculos.length === 0) {
            contenedor.innerHTML = "<p>No se encontraron vehículos con estos criterios.</p>";
            return;
        }

        vehiculos.forEach(v => {
            const card = document.createElement("div");
            card.className = "card-vehiculo";
            card.innerHTML = `
                ${v.estado === 'vendido' ? '<span class="badge-vendido">VENDIDO</span>' : ''}
                <img src="${v.imagen_url}" alt="${v.marca} ${v.modelo}">
                <div class="card-body">
                    <h3>${v.marca} ${v.modelo}</h3>
                    <p style="color: var(--red-parra); font-size: 1.4rem; font-weight: bold;">${v.precio.toLocaleString()} €</p>
                    <p style="color: var(--text-muted);">${v.anio} | ${v.kilometros.toLocaleString()} km | ${v.combustible}</p>
                    <p>${v.descripcion}</p>
                </div>
            `;
            contenedor.appendChild(card);
        });
    } catch (err) {
        console.error("Error cargando vehículos:", err);
    }
}