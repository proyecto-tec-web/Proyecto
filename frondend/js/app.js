let chartInscripciones = null;

// Cargar el dashboard apenas abres la página
document.addEventListener("DOMContentLoaded", () => {
    // Buscamos el primer enlace del menú para pasarlo como elemento activo
    const primerEnlace = document.querySelector('.menu-link');
    if (primerEnlace) {
        cargarVista('dashboard', primerEnlace);
    }
});

function cargarVista(nombreVista, elementoClick) {
    const contenedor = document.getElementById('view-container');
    
    // 1. Mostrar estado de carga
    contenedor.innerHTML = `
        <div class="text-center mt-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted">Consultando al servidor...</p>
        </div>`;

    // 2. Pedimos .php con anti-caché
    fetch(`vistas/${nombreVista}.html?v=${Date.now()}`)
        .then(respuesta => {
            if (!respuesta.ok) throw new Error(`El archivo vistas/${nombreVista}.html no existe.`);
            return respuesta.text();
        })
        .then(html => {
            // 3. Inyectar el HTML procesado
            contenedor.innerHTML = html;
            
            // 4. Actualizar título y colores del menú
            if (elementoClick) {
                document.querySelectorAll('.menu-link').forEach(enlace => {
                    enlace.classList.remove('active');
                    enlace.classList.add('link-body-emphasis');
                });
                elementoClick.classList.add('active');
                elementoClick.classList.remove('link-body-emphasis');
                
                // Actualizar el H1 de arriba
                const tituloSeccion = document.getElementById('titulo-seccion');
                if (tituloSeccion) {
                    tituloSeccion.innerText = elementoClick.innerText.trim();
                }
            }

            // 5. Cerrar menú en móviles
            let bsOffcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('sidebarMenu'));
            if (bsOffcanvas && window.innerWidth < 768) {
                bsOffcanvas.hide();
            }

            // 6. Ejecutar lógica específica de la vista
            inicializarLogicaVista(nombreVista);
        })
        .catch(error => {
            contenedor.innerHTML = `
                <div class="alert alert-danger shadow-sm border-0 border-start border-danger border-4 rounded-3">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    <strong>Error de carga:</strong> ${error.message}
                </div>`;
        });
}

// =========================================================================
// ¡AQUÍ ESTÁ LA FUNCIÓN QUE FALTABA!
// =========================================================================
function inicializarLogicaVista(nombreVista) {
    
    // ... (Aquí está tu código del dashboard y la gráfica) ...

    // NUEVA LÓGICA: Si entramos a la vista de usuarios
    if (nombreVista === 'usuarios') {
        cargarTablaUsuarios();
    }
}

// Nueva función para pedir los datos al servidor
function cargarTablaUsuarios() {
    const tbody = document.getElementById('cuerpo-tabla-usuarios');
    const alertaError = document.getElementById('alerta-error-usuarios');

    // 1. Llamamos a tu archivo PHP (API)
    fetch('/php/endpoints/obtener_usuarios.php')
        .then(respuesta => respuesta.json()) // Recibimos el JSON
        .then(datos => {
            
            if (datos.status === 'error') {
                alertaError.classList.remove('d-none');
                alertaError.innerText = "Error BD: " + datos.message;
                tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger py-4">Fallo la conexión.</td></tr>`;
                return;
            }

            // 2. Si todo salió bien, vaciamos la tabla y la llenamos
            tbody.innerHTML = ''; 
            
            if (datos.data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">No hay usuarios registrados.</td></tr>`;
                return;
            }

            // 3. Recorremos los datos y creamos el HTML fila por fila
            datos.data.forEach(user => {
                let colorBadge = (user.rol === 'Administrador') ? 'danger' : 'primary';
                
                let filaHTML = `
                    <tr>
                        <td class="ps-4 fw-bold text-secondary">#${user.id_usuario}</td>
                        <td>${user.correo}</td>
                        <td>
                            <span class="badge bg-${colorBadge} bg-opacity-10 text-${colorBadge} border border-${colorBadge}-subtle px-3 py-2 rounded-pill">
                                ${user.rol}
                            </span>
                        </td>
                        <td class="pe-4 text-end">
                            <button class="btn btn-sm btn-outline-secondary me-1"><i class="bi bi-pencil"></i></button>
                            <button class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += filaHTML; // Inyectamos la fila
            });
        })
        .catch(error => {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger py-4">Error al procesar los datos.</td></tr>`;
            console.error("Error:", error);
        });
}