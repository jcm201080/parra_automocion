document.addEventListener("DOMContentLoaded", cargarTablaAdmin);

// Array global para gestionar las fotos en tiempo real (Portada + Galería)
let listaFotosActuales = [];

async function subirFotosMovil(input) {
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    const preview = document.getElementById("previewFoto");
    
    // Indicador visual en la lista mientras sube
    const mensajeCarga = document.createElement("p");
    mensajeCarga.id = "mensajeSubiendo";
    mensajeCarga.style.cssText = "color: var(--text-muted); font-size: 0.85rem; width: 100%;";
    mensajeCarga.innerText = "Subiendo fotos al servidor...";
    preview.appendChild(mensajeCarga);

    const formData = new FormData();
    files.forEach(file => {
        formData.append("fotos", file);
    });

    try {
        const res = await fetch("/api/upload-multiple", {
            method: "POST",
            body: formData
        });

        const data = await res.json();
        if (res.ok && data.urls) {
            // Acumular las nuevas fotos recibidas
            listaFotosActuales = listaFotosActuales.concat(data.urls);
            sincronizarCamposFoto();
            renderizarVistaPreviaFotos();
        } else {
            alert(data.error || "Error al subir las imágenes");
        }
    } catch (err) {
        console.error("Error al subir fotos:", err);
        alert("Error de conexión al subir las imágenes");
    } finally {
        const msg = document.getElementById("mensajeSubiendo");
        if (msg) msg.remove();
        input.value = ""; // Limpiar input para permitir seleccionar el mismo archivo si se desea
    }
}

// Sincroniza el array con los inputs hidden que se envían a la base de datos
function sincronizarCamposFoto() {
    const fotoPrincipal = listaFotosActuales.length > 0 ? listaFotosActuales[0] : "";
    const fotosGaleria = listaFotosActuales.length > 1 ? listaFotosActuales.slice(1).join(",") : "";

    document.getElementById("imagen_url").value = fotoPrincipal;
    document.getElementById("imagenes_galeria").value = fotosGaleria;
}

// Renderiza las miniaturas con botón de borrar e insignia de Portada
function renderizarVistaPreviaFotos() {
    const preview = document.getElementById("previewFoto");
    preview.innerHTML = "";

    if (listaFotosActuales.length === 0) return;

    listaFotosActuales.forEach((url, idx) => {
        const container = document.createElement("div");
        container.style.cssText = "position: relative; display: inline-block; margin-right: 8px; margin-bottom: 8px;";

        const img = document.createElement("img");
        img.src = url;
        img.style.cssText = "width: 80px; height: 60px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border-color); display: block;";

        if (idx === 0) {
            img.style.border = "2px solid var(--red-parra)";
            const badge = document.createElement("span");
            badge.innerText = "Portada";
            badge.style.cssText = "position: absolute; bottom: 2px; left: 2px; background: var(--red-parra); color: #fff; font-size: 0.65rem; padding: 1px 4px; border-radius: 2px; font-weight: bold; pointer-events: none;";
            container.appendChild(badge);
        }

        // Botón "X" para eliminar esta foto específica
        const btnEliminarFoto = document.createElement("button");
        btnEliminarFoto.type = "button";
        btnEliminarFoto.innerHTML = "&times;";
        btnEliminarFoto.title = "Eliminar esta foto";
        btnEliminarFoto.style.cssText = "position: absolute; top: -6px; right: -6px; background: #dc2626; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 14px; line-height: 1; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.5);";
        
        btnEliminarFoto.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            eliminarFotoEspecifica(idx);
        };

        container.appendChild(img);
        container.appendChild(btnEliminarFoto);
        preview.appendChild(container);
    });
}

function eliminarFotoEspecifica(index) {
    listaFotosActuales.splice(index, 1);
    sincronizarCamposFoto();
    renderizarVistaPreviaFotos();
}

async function cargarTablaAdmin() {
    try {
        const res = await fetch('/api/vehiculos');
        const vehiculos = await res.json();
        const tbody = document.getElementById("tablaAdminBody");
        if (!tbody) return;
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
    } catch (err) {
        console.error("Error al cargar la tabla admin:", err);
    }
}

// Prepara el formulario con todos los datos y la galería completa
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
    document.getElementById("descripcion").value = v.descripcion || "";

    // Reconstruir lista completa de fotos (Portada + Galería)
    listaFotosActuales = [];
    if (v.imagen_url) listaFotosActuales.push(v.imagen_url);
    if (v.imagenes_galeria && Array.isArray(v.imagenes_galeria)) {
        v.imagenes_galeria.forEach(url => {
            if (url && !listaFotosActuales.includes(url)) {
                listaFotosActuales.push(url);
            }
        });
    }

    sincronizarCamposFoto();
    renderizarVistaPreviaFotos();

    document.getElementById("formTitulo").innerText = "Editar Vehículo";
    document.getElementById("btnGuardar").innerText = "Actualizar Vehículo";
}

async function guardarVehiculo(e) {
    e.preventDefault();
    const id = document.getElementById("vehiculoId").value;
    
    sincronizarCamposFoto();

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
        imagenes_galeria: document.getElementById("imagenes_galeria").value,
        descripcion: document.getElementById("descripcion").value
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/vehiculos/${id}` : '/api/vehiculos';

    try {
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
    } catch (err) {
        console.error("Error guardando vehículo:", err);
        alert("Error de conexión al guardar el vehículo.");
    }
}

function resetFormulario() {
    document.getElementById("formVehiculo").reset();
    document.getElementById("vehiculoId").value = "";
    listaFotosActuales = [];
    sincronizarCamposFoto();
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