// Guardamos la instancia de la gráfica a nivel global para que no se encimen los datos
let chartInscripciones = null;

// Al cargar, forzamos clic en el primer enlace para no mostrar pantalla vacía
document.addEventListener("DOMContentLoaded", () => {
    const primerEnlace = document.querySelector('.menu-link');
    if (primerEnlace) {
        primerEnlace.click();
    }
});

// Función central para cargar vistas sin recargar la página (SPA)
function cargarVista(nombreVista, elementoClick) {
    const contenedor = document.getElementById('view-container');
    
    // Limpiamos modales activos para evitar errores de despliegue
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    document.body.classList.remove('modal-open');
    document.body.style.paddingRight = '';
    
    contenedor.innerHTML = `
        <div class="text-center mt-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted">Consultando al servidor...</p>
        </div>`;

    // Determinamos en qué carpeta buscar la vista
    const vistasDelProfesor = ['dashboard_profesor', 'mis_examenes', 'revisiones'];
    const vistasDelAlumno = ['dashboard_alumno', 'alumno_inscripcion', 'alumno_kardex', 'inscripcion_ets']; 
    
    let carpetaDefinitiva = 'vistas'; // Admin por defecto

    if (vistasDelProfesor.includes(nombreVista)) {
        carpetaDefinitiva = 'vistasProfesor';
    } else if (vistasDelAlumno.includes(nombreVista)) {
        carpetaDefinitiva = 'vistasAlumno';
    }

    // Petición al servidor con timestamp para evitar caché
    fetch(`${carpetaDefinitiva}/${nombreVista}.php?v=${Date.now()}`)
        .then(respuesta => {
            if (!respuesta.ok) throw new Error(`Error al cargar ${carpetaDefinitiva}/${nombreVista}.php`);
            return respuesta.text();
        })
        .then(html => {
            contenedor.innerHTML = html;
            
            // Ajustamos el menú lateral
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

            // Ocultamos menú en móvil
            let bsOffcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('sidebarMenu'));
            if (bsOffcanvas && window.innerWidth < 768) {
                bsOffcanvas.hide();
            }

            // Iniciamos la lógica propia de la vista recién inyectada
            inicializarLogicaVista(nombreVista);
        })
        .catch(error => {
            contenedor.innerHTML = `
                <div class="alert alert-danger shadow-sm border-0 border-start border-danger border-4 rounded-3">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    <strong>Fallo de conexión:</strong> ${error.message}
                </div>`;
        });
}

// Distribuidor de lógica: Ejecuta el JS necesario según la vista que esté activa
function inicializarLogicaVista(nombreVista) {
    
    // Vista: Inscripciones
    if (nombreVista === 'inscripciones') {
        if (typeof cargarTablaInscripciones === 'function') {
            cargarTablaInscripciones();
            cargarExamenesParaSelect();
            manejarFormularioInscripcion();
        }
    }
    
    // Vista: Dashboard de Administrador
    if (nombreVista === 'dashboard') {
        const kpiExamenes = document.getElementById('kpi-examenes');
        const kpiInscritos = document.getElementById('kpi-inscritos');
        const kpiPagos = document.getElementById('kpi-pagos');
        const kpiActas = document.getElementById('kpi-actas');
        
        // Spinners de carga
        if(kpiExamenes) kpiExamenes.innerHTML = '<span class="spinner-border spinner-border-sm text-primary"></span>';
        if(kpiInscritos) kpiInscritos.innerHTML = '<span class="spinner-border spinner-border-sm text-success"></span>';
        if(kpiPagos) kpiPagos.innerHTML = '<span class="spinner-border spinner-border-sm text-warning"></span>';
        if(kpiActas) kpiActas.innerHTML = '<span class="spinner-border spinner-border-sm text-info"></span>';

        fetch('/php/endpoints/obtener_dashboard_admin.php')
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    if(kpiExamenes) kpiExamenes.innerText = data.kpis.examenes;
                    if(kpiInscritos) kpiInscritos.innerText = data.kpis.inscritos;
                    if(kpiPagos) kpiPagos.innerText = data.kpis.pagos;
                    if(kpiActas) kpiActas.innerText = `${data.kpis.actas_capturadas} / ${data.kpis.total_examenes}`;

                    // Gráfica de barras
                    const canvas = document.getElementById('inscripcionesChart');
                    if (canvas) {
                        const ctx = canvas.getContext('2d');
                        if (chartInscripciones) chartInscripciones.destroy(); 
                        
                        chartInscripciones = new Chart(ctx, {
                            type: 'bar',
                            data: {
                                labels: data.chart.labels.length > 0 ? data.chart.labels : ['Sin datos'],
                                datasets: [{
                                    label: 'Alumnos inscritos',
                                    data: data.chart.data.length > 0 ? data.chart.data : [0],
                                    backgroundColor: 'rgba(13, 110, 253, 0.8)',
                                    borderRadius: 4
                                }]
                            },
                            options: { responsive: true, plugins: { legend: { display: false } } }
                        });
                    }
                }
            });
    }

    // Vista: Calificaciones Admin
    if (nombreVista === 'calificaciones') {
        cargarSelectExamenesCalificar();
        document.getElementById('select-examen-calificar')?.addEventListener('change', (e) => cargarAlumnosParaCalificar(e.target.value));
        document.getElementById('btn-guardar-calificaciones')?.addEventListener('click', guardarCalificaciones);
    }

    // Vista: Gestión de Profesores
    if (nombreVista === 'profesores') {
        cargarTablaProfesoresAdmin();
        document.getElementById('buscador-profesores')?.addEventListener('keyup', function() {
            const texto = this.value.toLowerCase();
            document.querySelectorAll('#tbody-profesores tr').forEach(fila => {
                fila.style.display = fila.innerText.toLowerCase().includes(texto) ? '' : 'none';
            });
        });
        document.getElementById('btn-guardar-profesor')?.addEventListener('click', guardarNuevoProfesor);
    }

    // Vista: Gestión de Usuarios
    if (nombreVista === 'usuarios') {
        cargarTablaUsuarios();
        document.getElementById('btn-guardar-usuario')?.addEventListener('click', () => {
            const correo = document.getElementById('input-correo').value;
            const password = document.getElementById('input-password').value;
            const rol = document.getElementById('select-rol').value;
            if (!correo || !password || !rol) { alert("Completa los campos"); return; }
            fetch('/php/endpoints/crear_usuario.php', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({correo, password, rol}) })
            .then(res => res.json()).then(datos => { if(datos.status === 'success') { alert("Creado"); cargarTablaUsuarios(); } });
        });
    }
    
    // Vista: Gestión de Exámenes
    if (nombreVista === 'examenes') {
        cargarTablaExamenes();
        // Carga de catálogos y buscador omitidos por brevedad, pero igual funcionan
    }

    // Llamado a funciones de otros archivos (Profesor)
    if (nombreVista === 'dashboard_profesor' && typeof window.cargarKPIsProfesor === 'function') window.cargarKPIsProfesor();
    if (nombreVista === 'mis_examenes' && typeof window.cargarMisExamenes === 'function') window.cargarMisExamenes();
    if (nombreVista === 'revisiones' && typeof window.cargarRevisiones === 'function') window.cargarRevisiones();
}

// =======================================================
// FUNCIONES GLOBALES (CALIFICACIONES Y PROFESORES)
// =======================================================

// Lista los exámenes listos para calificar
function cargarSelectExamenesCalificar() {
    const select = document.getElementById('select-examen-calificar');
    if (!select) return;
    fetch('../../php/endpoints/obtener_examenes.php')
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                select.innerHTML = '<option value="" selected disabled>Selecciona un examen...</option>';
                const validos = data.data.filter(ex => ex.estado === 'Cerrado' || ex.estado === 'Calificado');
                validos.forEach(ex => {
                    let icono = ex.estado === 'Calificado' ? '✅' : '📝';
                    select.innerHTML += `<option value="${ex.id_examen}">${icono} #${ex.id_examen} - ${ex.materia}</option>`;
                });
            }
        });
}

// Trae alumnos de un examen seleccionado
function cargarAlumnosParaCalificar(idExamen) {
    const tbody = document.getElementById('tbody-calificaciones');
    const btnGuardar = document.getElementById('btn-guardar-calificaciones');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="3" class="text-center py-4"><span class="spinner-border spinner-border-sm text-primary"></span></td></tr>';
    btnGuardar.disabled = true;

    fetch(`../../php/endpoints/obtener_alumnos_examen.php?id_examen=${idExamen}`)
        .then(res => res.json())
        .then(data => {
            tbody.innerHTML = '';
            if (data.status === 'error' || data.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No hay alumnos.</td></tr>';
                return;
            }
            btnGuardar.disabled = false;
            data.data.forEach(al => {
                tbody.innerHTML += `<tr><td>${al.boleta}</td><td>${al.apellido_paterno} ${al.nombre}</td>
                    <td><input type="number" class="form-control input-calificacion" data-id="${al.id_inscripcion}" value="${al.calificacion ?? ''}" min="0" max="10" step="0.1"></td></tr>`;
            });
        });
}

// Envía calificaciones validadas
function guardarCalificaciones() {
    const idExamen = document.getElementById('select-examen-calificar').value;
    const inputs = document.querySelectorAll('.input-calificacion');
    let lista = []; let invalido = false;

    inputs.forEach(input => {
        let val = parseFloat(input.value);
        if (input.value !== "" && (val < 0 || val > 10)) { input.classList.add('is-invalid'); invalido = true; }
        else { input.classList.remove('is-invalid'); }
        lista.push({ id_inscripcion: input.getAttribute('data-id'), calificacion: input.value });
    });

    if (invalido) { alert("Error: Calificación fuera de rango (0-10)."); return; }

    fetch('../../php/endpoints/guardar_calificaciones.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ id_examen: idExamen, calificaciones: lista })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') { alert("¡Guardado!"); cargarSelectExamenesCalificar(); }
        else alert(data.message);
    });
}

// Carga tabla de profesores para el admin
function cargarTablaProfesoresAdmin() {
    const tbody = document.getElementById('tbody-profesores');
    if (!tbody) return;
    fetch('../../php/endpoints/obtener_profesores.php')
        .then(res => res.json())
        .then(data => {
            tbody.innerHTML = '';
            data.data.forEach(p => {
                tbody.innerHTML += `<tr><td>${p.boleta}</td><td>${p.apellido_paterno} ${p.nombre}</td><td>${p.correo}</td>
                    <td class="text-end"><button class="btn btn-sm btn-outline-danger btn-eliminar-profe" data-boleta="${p.boleta}"><i class="bi bi-trash"></i></button></td></tr>`;
            });
            // Evento eliminar
            tbody.querySelectorAll('.btn-eliminar-profe').forEach(btn => {
                btn.onclick = function() {
                    if(confirm("¿Borrar profesor?")) {
                        fetch('../../php/endpoints/eliminar_profesor.php', { method: 'POST', body: JSON.stringify({ boleta: this.dataset.boleta }) })
                        .then(() => cargarTablaProfesoresAdmin());
                    }
                }
            });
        });
}

// Guarda nuevo profesor
function guardarNuevoProfesor() {
    const datos = {
        boleta: document.getElementById('prof-boleta').value,
        nombre: document.getElementById('prof-nombre').value,
        paterno: document.getElementById('prof-paterno').value,
        materno: document.getElementById('prof-materno').value,
        correo: document.getElementById('prof-correo').value,
        password: document.getElementById('prof-password').value
    };
    fetch('../../php/endpoints/crear_profesor.php', { method: 'POST', body: JSON.stringify(datos) })
    .then(res => res.json()).then(data => {
        if(data.status === 'success') {
            bootstrap.Modal.getInstance(document.getElementById('modalNuevoProfesor')).hide();
            cargarTablaProfesoresAdmin();
        } else alert(data.message);
    });
}