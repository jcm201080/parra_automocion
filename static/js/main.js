let galeriaActual = [];
let indiceFotoActual = 0;

document.addEventListener("DOMContentLoaded", () => {
    cargarVehiculos();

    // Controles por teclado para el visor
    document.addEventListener("keydown", (e) => {
        const modal = document.getElementById("modalGaleria");
        if (modal && modal.classList.contains("activo")) {
            if (e.key === "Escape") cerrarGaleria();
            if (e.key === "ArrowLeft") cambiarFoto(-1);
            if (e.key === "ArrowRight") cambiarFoto(1);
        }
    });

    // Soporte para gestos táctiles (swipe en smartphones)
    let startX = 0;
    const modalImg = document.getElementById("modalGaleria");
    if (modalImg) {
        modalImg.addEventListener("touchstart", (e) => startX = e.touches[0].clientX);
        modalImg.addEventListener("touchend", (e) => {
            let endX = e.changedTouches[0].clientX;
            if (startX - endX > 50) cambiarFoto(1);  // Deslizar izquierda -> siguiente
            if (endX - startX > 50) cambiarFoto(-1); // Deslizar derecha -> anterior
        });
    }
});

async function cargarVehiculos() {
    const marcaInput = document.getElementById("buscarMarca");
    const catInput = document.getElementById("buscarCategoria");
    const precioInput = document.getElementById("buscarPrecioMax");

    const marca = marcaInput ? marcaInput.value : "";
    const categoria = catInput ? catInput.value : "todos";
    const precioMax = precioInput ? precioInput.value : "";

    let url = `/api/vehiculos?marca=${encodeURIComponent(marca)}&categoria=${encodeURIComponent(categoria)}`;
    if (precioMax) url += `&precio_max=${precioMax}`;

    try {
        const res = await fetch(url);
        const vehiculos = await res.json();
        
        const contenedor = document.getElementById("catalogoVehiculos");
        if (!contenedor) return;
        contenedor.innerHTML = "";

        if (vehiculos.length === 0) {
            contenedor.innerHTML = "<p style='color: var(--text-muted); grid-column: 1/-1; text-align: center;'>No se encontraron vehículos con estos criterios.</p>";
            return;
        }

        vehiculos.forEach(v => {
            // Combinar la foto principal con las fotos adicionales de la galería
            let fotos = [v.imagen_url];
            if (v.imagenes_galeria && Array.isArray(v.imagenes_galeria) && v.imagenes_galeria.length > 0) {
                fotos = fotos.concat(v.imagenes_galeria);
            }

            // --- LÓGICA PARA MOSTRAR VENDIDO Y RESERVADO ---
            let badgeEstadoHtml = '';
            if (v.estado === 'vendido') {
                badgeEstadoHtml = '<span class="badge-estado badge-vendido">VENDIDO</span>';
            } else if (v.estado === 'reservado') {
                badgeEstadoHtml = '<span class="badge-estado badge-reservado">RESERVADO</span>';
            }

            const card = document.createElement("div");
            card.className = "card-vehiculo";
            card.innerHTML = `
                ${badgeEstadoHtml}
                <div class="card-img-wrapper" onclick='abrirGaleria(${JSON.stringify(fotos)})'>
                    <img src="${v.imagen_url}" alt="${v.marca} ${v.modelo}" loading="lazy">
                    <span class="badge-fotos-count">📷 ${fotos.length} ${fotos.length === 1 ? 'foto' : 'fotos'}</span>
                </div>
                <div class="card-body">
                    <h3>${v.marca} ${v.modelo}</h3>
                    <p style="color: var(--red-parra); font-size: 1.4rem; font-weight: bold; margin: 0.2rem 0;">${v.precio.toLocaleString()} €</p>
                    <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0.5rem;">${v.anio} | ${v.kilometros.toLocaleString()} km | ${v.combustible}</p>
                    <p style="font-size: 0.9rem; color: #d1d5db; margin-bottom: 1rem; flex: 1;">${v.descripcion || ''}</p>
                    <button class="btn-parra btn-block" onclick='abrirGaleria(${JSON.stringify(fotos)})'>Ver Galería Completa</button>
                </div>
            `;
            contenedor.appendChild(card);
        });
    } catch (err) {
        console.error("Error cargando vehículos:", err);
    }
}

// --- FUNCIONES DEL VISOR DE GALERÍA (LIGHTBOX) ---
function abrirGaleria(listaFotos) {
    if (!listaFotos || listaFotos.length === 0) return;
    galeriaActual = listaFotos;
    indiceFotoActual = 0;
    actualizarFotoModal();
    
    const modal = document.getElementById("modalGaleria");
    if (modal) {
        modal.classList.add("activo");
        document.body.style.overflow = "hidden"; // Evita scroll de fondo
    }
}

function cerrarGaleria() {
    const modal = document.getElementById("modalGaleria");
    if (modal) {
        modal.classList.remove("activo");
        document.body.style.overflow = "auto";
    }
}

function cambiarFoto(direccion) {
    if (galeriaActual.length === 0) return;
    
    indiceFotoActual += direccion;
    
    // Navegación cíclica (al llegar al final, vuelve a la primera)
    if (indiceFotoActual < 0) {
        indiceFotoActual = galeriaActual.length - 1;
    } else if (indiceFotoActual >= galeriaActual.length) {
        indiceFotoActual = 0;
    }
    
    actualizarFotoModal();
}

function actualizarFotoModal() {
    const imgElement = document.getElementById("imgModalPrincipal");
    const contadorElement = document.getElementById("contadorFotos");
    
    if (imgElement) imgElement.src = galeriaActual[indiceFotoActual];
    if (contadorElement) contadorElement.innerText = `${indiceFotoActual + 1} / ${galeriaActual.length}`;
}