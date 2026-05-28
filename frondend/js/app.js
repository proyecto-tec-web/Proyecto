let chartInscripciones = null;

document.addEventListener("DOMContentLoaded", () => {
    const primerEnlace = document.querySelector('.menu-link');
    if (primerEnlace) {
        cargarVista('dashboard', primerEnlace);
    }
});

function cargarVista(nombreVista, elementoClick) {
    const contenedor = document.getElementById('view-container');
    
    contenedor.innerHTML = `
        <div class="text-center mt-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted">Consultando al servidor...</p>
        </div>`;

    fetch(`/frondend/html/vistas/${nombreVista}.php?v=${Date.now()}`)
        .then(respuesta => {
            if (!respuesta.ok) throw new Error(`No se encontró el archivo en: /frondend/html/vistas/${nombreVista}.php`);
            return respuesta.text();
        })
        .then(html => {
            contenedor.innerHTML = html;
            
            if (elementoClick) {
                document.querySelectorAll('.menu-link').forEach(enlace => {
                    enlace.classList.remove('active');
                    enlace.classList.add('link-body-emphasis');
                });
                elementoClick.classList.add('active');
                elementoClick.classList.remove('link-body-emphasis');
                
                const tituloSeccion = document.getElementById('titulo-seccion');
                if (tituloSeccion) {
                    tituloSeccion.innerText = elementoClick.innerText.trim();
                }
            }

            let bsOffcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('sidebarMenu'));
            if (bsOffcanvas && window.innerWidth < 768) {
                bsOffcanvas.hide();
            }

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

function inicializarLogicaVista(nombreVista) {
    if (nombreVista === 'dashboard') {
        const kpiExamenes = document.getElementById('kpi-examenes');
        const kpiInscritos = document.getElementById('kpi-inscritos');
        const kpiPagos = document.getElementById('kpi-pagos');
        const kpiActas = document.getElementById('kpi-actas');

        if(kpiExamenes) kpiExamenes.innerText = "24";
        if(kpiInscritos) kpiInscritos.innerText = "342";
        if(kpiPagos) kpiPagos.innerText = "45";
        if(kpiActas) kpiActas.innerText = "8 / 24";

        const canvas = document.getElementById('inscripcionesChart');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (chartInscripciones) chartInscripciones.destroy(); 
            
            chartInscripciones = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Cálculo Dif.', 'Física Clásica', 'Álgebra', 'Química', 'Programación'],
                    datasets: [{
                        label: 'Alumnos inscritos a ETS',
                        data: [120, 95, 80, 65, 45],
                        backgroundColor: 'rgba(13, 110, 253, 0.8)',
                        borderRadius: 4
                    }]
                },
                options: { responsive: true, plugins: { legend: { display: false } } }
            });
        }
    }

    if (nombreVista === 'usuarios') {
        cargarTablaUsuarios();
    }
}

function cargarTablaUsuarios() {
    const tbody = document.getElementById('cuerpo-tabla-usuarios');
    const alertaError = document.getElementById('alerta-error-usuarios');

    fetch('/php/endpoints/obtener_usuarios.php')
        .then(respuesta => respuesta.json())
        .then(datos => {
            if (datos.status === 'error') {
                alertaError.classList.remove('d-none');
                alertaError.innerText = "Error BD: " + datos.message;
                tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger py-4">Fallo la conexión.</td></tr>`;
                return;
            }

            tbody.innerHTML = ''; 
            
            if (datos.data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">No hay usuarios registrados.</td></tr>`;
                return;
            }

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
                tbody.innerHTML += filaHTML;
            });
        })
        .catch(error => {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger py-4">Error al procesar los datos.</td></tr>`;
            console.error("Error:", error);
        });
}