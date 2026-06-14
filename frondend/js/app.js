// Guardamos la instancia de la gráfica a nivel global para poder destruirla 
// cuando se recargue la vista y que no se encimen los datos.
let chartInscripciones = null;

// Cuando carga la página, forzamos un clic en el primer elemento del menú
// para que el usuario no vea la pantalla en blanco al entrar.
document.addEventListener("DOMContentLoaded", () => {
    const primerEnlace = document.querySelector('.menu-link');
    if (primerEnlace) {
        primerEnlace.click();
    }
});

// Función principal que hace que la página funcione como SPA 
function cargarVista(nombreVista, elementoClick) {
    const contenedor = document.getElementById('view-container');
    
    // Limpiamos basura de modales anteriores
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    document.body.classList.remove('modal-open');
    document.body.style.paddingRight = '';
    
    // Ponemos el spinner mientras esperamos que el servidor conteste
    contenedor.innerHTML = `
        <div class="text-center mt-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted">Consultando al servidor...</p>
        </div>`;

    // Definimos en qué carpeta está el archivo según el nombre de la vista
    const vistasDelProfesor = ['dashboard_profesor', 'mis_examenes', 'revisiones'];
    const vistasDelAlumno = ['dashboard_alumno', 'alumno_inscripcion', 'alumno_kardex', 'inscripcion_ets']; 
    
    let carpetaDefinitiva = 'vistas'; // Carpeta del admin por default

    if (vistasDelProfesor.includes(nombreVista)) {
        carpetaDefinitiva = 'vistasProfesor';
    } else if (vistasDelAlumno.includes(nombreVista)) {
        carpetaDefinitiva = 'vistasAlumno';
    }

    // Le pegamos al endpoint con un timestamp para evitar que el navegador use caché viejo
    fetch(`${carpetaDefinitiva}/${nombreVista}.php?v=${Date.now()}`)
        .then(respuesta => {
            if (!respuesta.ok) throw new Error(`Falló al cargar ${carpetaDefinitiva}/${nombreVista}.php`);
            return respuesta.text();
        })
        .then(html => {
            // Metemos el html crudo en la pantalla
            contenedor.innerHTML = html;
            
            // Remarcamos en el menú lateral en dónde estamos parados
            if (elementoClick) {
                document.querySelectorAll('.menu-link').forEach(enlace => {
                    enlace.classList.remove('active');
                    enlace.classList.add('link-body-emphasis');
                });
                elementoClick.classList.add('active');
                elementoClick.classList.remove('link-body-emphasis');
                
                // Actualizamos el título de arriba
                const tituloSeccion = document.getElementById('titulo-seccion');
                if (tituloSeccion) {
                    tituloSeccion.innerText = elementoClick.innerText.trim();
                }
            }

            // Si estamos en celular, escondemos el menú al hacer clic
            let bsOffcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('sidebarMenu'));
            if (bsOffcanvas && window.innerWidth < 768) {
                bsOffcanvas.hide();
            }

            // Llamamos al distribuidor para que active los scripts de esta vista
            inicializarLogicaVista(nombreVista);
        })
        .catch(error => {
            // Si algo truena en la red o no existe el archivo, mostramos alerta
            contenedor.innerHTML = `
                <div class="alert alert-danger shadow-sm border-0 border-start border-danger border-4 rounded-3">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    <strong>Fallo de conexión:</strong> ${error.message}
                </div>`;
        });
}

// Distribuidor: Revisa qué vista se cargó y manda a llamar sus funciones específicas
function inicializarLogicaVista(nombreVista) {
    
    // Vista: Inscripciones
    if (nombreVista === 'inscripciones') {
        if (typeof cargarTablaInscripciones === 'function') {
            cargarTablaInscripciones();
            cargarExamenesParaSelect();
            manejarFormularioInscripcion();
        } else {
            console.error("Falta incluir inscripciones.js");
        }
    }
    
    // Vista: Dashboard de Administrador
    if (nombreVista === 'dashboard') {
        const kpiExamenes = document.getElementById('kpi-examenes');
        const kpiInscritos = document.getElementById('kpi-inscritos');
        const kpiPagos = document.getElementById('kpi-pagos');
        const kpiActas = document.getElementById('kpi-actas');
        
        // Spinners temporales en las tarjetitas
        if(kpiExamenes) kpiExamenes.innerHTML = '<span class="spinner-border spinner-border-sm text-primary"></span>';
        if(kpiInscritos) kpiInscritos.innerHTML = '<span class="spinner-border spinner-border-sm text-success"></span>';
        if(kpiPagos) kpiPagos.innerHTML = '<span class="spinner-border spinner-border-sm text-warning"></span>';
        if(kpiActas) kpiActas.innerHTML = '<span class="spinner-border spinner-border-sm text-info"></span>';

        fetch('/php/endpoints/obtener_dashboard_admin.php')
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    // Llenamos las tarjetas
                    if(kpiExamenes) kpiExamenes.innerText = data.kpis.examenes;
                    if(kpiInscritos) kpiInscritos.innerText = data.kpis.inscritos;
                    if(kpiPagos) kpiPagos.innerText = data.kpis.pagos;
                    if(kpiActas) kpiActas.innerText = `${data.kpis.actas_capturadas} / ${data.kpis.total_examenes}`;

                    // Dibujamos la gráfica de barras
                    const canvas = document.getElementById('inscripcionesChart');
                    if (canvas) {
                        const ctx = canvas.getContext('2d');
                        if (chartInscripciones) chartInscripciones.destroy(); 
                        
                        chartInscripciones = new Chart(ctx, {
                            type: 'bar',
                            data: {
                                labels: data.chart.labels.length > 0 ? data.chart.labels : ['Sin datos'],
                                datasets: [{
                                    label: 'Alumnos inscritos a ETS',
                                    data: data.chart.data.length > 0 ? data.chart.data : [0],
                                    backgroundColor: 'rgba(13, 110, 253, 0.8)',
                                    borderRadius: 4
                                }]
                            },
                            options: { responsive: true, plugins: { legend: { display: false } } }
                        });
                    }

                    // Llenamos la lista de la derecha (últimos movimientos)
                    const contenedorActividad = document.querySelector('.col-12.col-lg-4 .card-body');
                    if (contenedorActividad) {
                        contenedorActividad.innerHTML = ''; 
                        
                        if (data.actividad.length === 0) {
                            contenedorActividad.innerHTML = '<p class="text-muted text-center py-3">No hay actividad reciente</p>';
                        } else {
                            data.actividad.forEach(act => {
                                let icono = act.estado_pago === 'Pagado' ? 'bi-check-circle' : 'bi-clock-history';
                                let color = act.estado_pago === 'Pagado' ? 'success' : 'warning';
                                let titulo = act.estado_pago === 'Pagado' ? 'Inscripción validada' : 'Pago pendiente';
                                
                                contenedorActividad.innerHTML += `
                                    <div class="d-flex mb-3 border-bottom pb-2">
                                        <div class="flex-shrink-0 p-2 bg-${color} bg-opacity-10 rounded text-${color}">
                                            <i class="bi ${icono} fs-5"></i>
                                        </div>
                                        <div class="flex-grow-1 ms-3">
                                            <h6 class="mb-0">${titulo}</h6>
                                            <small class="text-muted">Boleta ${act.boleta} - ${act.materia}</small>
                                        </div>
                                    </div>
                                `;
                            });
                        }
                    }
                } else {
                    if(kpiExamenes) kpiExamenes.innerText = "Error";
                }
            })
            .catch(error => {
                if(kpiExamenes) kpiExamenes.innerText = "--";
                if(kpiInscritos) kpiInscritos.innerText = "--";
                if(kpiPagos) kpiPagos.innerText = "--";
                if(kpiActas) kpiActas.innerText = "-- / --";
            });
    }

    // Vista: Calificaciones Admin
    if (nombreVista === 'calificaciones') {
        cargarSelectExamenesCalificar();

        const selectExamen = document.getElementById('select-examen-calificar');
        if (selectExamen) {
            selectExamen.addEventListener('change', (e) => {
                cargarAlumnosParaCalificar(e.target.value);
            });
        }

        const btnGuardar = document.getElementById('btn-guardar-calificaciones');
        if (btnGuardar) {
            btnGuardar.addEventListener('click', guardarCalificaciones);
        }
    }

    // Vista: Control de Usuarios
    if (nombreVista === 'usuarios') {
        cargarTablaUsuarios();

        // Acción de crear usuario
        const btnGuardarUsuario = document.getElementById('btn-guardar-usuario');
        if (btnGuardarUsuario) {
            btnGuardarUsuario.addEventListener('click', () => {
                const correo = document.getElementById('input-correo').value;
                const password = document.getElementById('input-password').value;
                const rol = document.getElementById('select-rol').value;

                if (!correo || !password || !rol) {
                    alert("Completa todos los campos");
                    return;
                }

                btnGuardarUsuario.disabled = true;
                btnGuardarUsuario.innerHTML = "Guardando...";

                fetch('/php/endpoints/crear_usuario.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ correo, password, rol })
                })
                .then(res => res.json())
                .then(datos => {
                    if (datos.status === 'success') {
                        const modal = bootstrap.Modal.getInstance(document.getElementById('modalNuevoUsuario'));
                        if(modal) modal.hide();
                        document.getElementById('form-nuevo-usuario').reset();
                        alert("Usuario creado con éxito.");
                        cargarTablaUsuarios(); // Refrescamos la tabla
                    } else {
                        alert("Error: " + datos.message);
                    }
                    btnGuardarUsuario.disabled = false;
                    btnGuardarUsuario.innerHTML = "Guardar Usuario";
                });
            });
        }

        // Acción de editar usuario
        const btnActualizarUsuario = document.getElementById('btn-actualizar-usuario');
        if (btnActualizarUsuario) {
            btnActualizarUsuario.addEventListener('click', () => {
                const id = document.getElementById('edit-user-id').value;
                const correo = document.getElementById('edit-user-correo').value;
                const password = document.getElementById('edit-user-password').value;
                const rol = document.getElementById('edit-user-rol').value;

                btnActualizarUsuario.disabled = true;
                btnActualizarUsuario.innerHTML = "Actualizando...";

                fetch('/php/endpoints/actualizar_usuario.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, correo, password, rol })
                })
                .then(res => res.json())
                .then(datos => {
                    if (datos.status === 'success') {
                        const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarUsuario'));
                        if(modal) modal.hide();
                        alert("Usuario actualizado con éxito.");
                        cargarTablaUsuarios();
                    } else {
                        alert("Error: " + datos.message);
                    }
                    btnActualizarUsuario.disabled = false;
                    btnActualizarUsuario.innerHTML = "Actualizar Usuario";
                });
            });
        }
    }

    // Vista: Gestión de Exámenes
    if (nombreVista === 'examenes') {
        cargarTablaExamenes();

        // Traemos las listas para armar los selects del formulario de nuevo examen
        fetch('/php/endpoints/obtener_catalogos_ets.php')
            .then(res => res.json())
            .then(data => {
                if(data.status === 'success') {
                    const selectMateria = document.getElementById('select-materia');
                    if (selectMateria) {
                        selectMateria.innerHTML = '<option value="" selected disabled>Selecciona una materia...</option>';
                        data.materias.forEach(m => {
                            selectMateria.innerHTML += `<option value="${m.id_materia}">${m.nombre}</option>`;
                        });
                    }

                    const selectSinodal = document.getElementById('select-sinodal');
                    if (selectSinodal) {
                        selectSinodal.innerHTML = '<option value="" selected disabled>Asigna un sinodal...</option>';
                        data.profesores.forEach(p => {
                            selectSinodal.innerHTML += `<option value="${p.id_profesor}">${p.nombre}</option>`;
                        });
                    }

                    const selectSalon = document.getElementById('select-salon');
                    if (selectSalon) {
                        selectSalon.innerHTML = '<option value="" selected disabled>Selecciona un salón...</option>';
                        data.salones.forEach(s => {
                            selectSalon.innerHTML += `<option value="${s.id_salon}">${s.nombre}</option>`;
                        });
                    }
                }
            })
            .catch(err => console.error(err));

        // Buscador rápido (filtra las filas de la tabla ocultándolas en el DOM)
        const buscadorExamenes = document.getElementById('buscador-examenes');
        if (buscadorExamenes) {
            buscadorExamenes.addEventListener('keyup', function() {
                const textoBuscar = this.value.toLowerCase();
                const filas = document.querySelectorAll('#tbody-examenes tr');
                
                filas.forEach(fila => {
                    if(fila.cells.length > 1) { 
                        const textoFila = fila.innerText.toLowerCase();
                        fila.style.display = textoFila.includes(textoBuscar) ? '' : 'none';
                    }
                });
            });
        }

        // Crear nuevo ETS
        const btnGuardarETS = document.getElementById('btn-guardar-ets');
        if (btnGuardarETS) {
            const nuevoBtnGuardar = btnGuardarETS.cloneNode(true);
            btnGuardarETS.parentNode.replaceChild(nuevoBtnGuardar, btnGuardarETS);
            
            nuevoBtnGuardar.addEventListener('click', () => {
                const materia = document.getElementById('select-materia').value;
                const sinodal = document.getElementById('select-sinodal').value;
                const fecha = document.getElementById('input-fecha').value;
                const hora = document.getElementById('input-hora').value;
                const salon = document.getElementById('select-salon').value;
                const cupo = document.getElementById('input-cupo').value;

                if(!materia || !sinodal || !fecha || !hora || !salon || !cupo) {
                    alert("Por favor, llena todos los campos del formulario.");
                    return;
                }

                nuevoBtnGuardar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';
                nuevoBtnGuardar.disabled = true;

                const datosETS = { materia, sinodal, fecha, hora, salon, cupo };

                fetch('/php/endpoints/crear_ets.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datosETS)
                })
                .then(respuesta => respuesta.json())
                .then(datos => {
                    if (datos.status === 'success') {
                        const modalElement = document.getElementById('modalNuevoETS');
                        if(modalElement) {
                            const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
                            modalInstance.hide();
                        }
                        
                        document.getElementById('form-nuevo-ets').reset();
                        nuevoBtnGuardar.innerHTML = '<i class="bi bi-save me-1"></i> Guardar Examen';
                        nuevoBtnGuardar.disabled = false;
                        alert("¡Examen programado con éxito!"); 
                        cargarTablaExamenes();
                    } else {
                        alert("Error: " + datos.message);
                        nuevoBtnGuardar.innerHTML = '<i class="bi bi-save me-1"></i> Guardar Examen';
                        nuevoBtnGuardar.disabled = false;
                    }
                })
                .catch(error => {
                    alert("Ocurrió un error al intentar comunicar con el servidor.");
                    nuevoBtnGuardar.innerHTML = '<i class="bi bi-save me-1"></i> Guardar Examen';
                    nuevoBtnGuardar.disabled = false;
                });
            });
        }
    }
    
    // Vista: Alumnos
    if (nombreVista === 'alumnos') {
        if (typeof iniciarVistaAlumnos === 'function') {
            iniciarVistaAlumnos();
        } else {
            console.error("Falta cargar alumnos.js");
        }
    }

    // Vistas de Profesor (Llaman funciones globales en profesor.js)
    if (nombreVista === 'dashboard_profesor') {
        if (typeof window.cargarKPIsProfesor === 'function') {
            window.cargarKPIsProfesor();
        }
    }
    if (nombreVista === 'mis_examenes') {
        if (typeof window.cargarMisExamenes === 'function') {
            window.cargarMisExamenes();
        }
    }
    if (nombreVista === 'revisiones') {
        if (typeof window.cargarRevisiones === 'function') {
            window.cargarRevisiones();
        }
    }
}


// =======================================================
// FUNCIONES QUE CONSTRUYEN LAS TABLAS (Usuarios y Exámenes)
// =======================================================

// Arma la tabla de cuentas del sistema
function cargarTablaUsuarios() {
    const tbody = document.getElementById('cuerpo-tabla-usuarios');
    if(!tbody) return;

    fetch('/php/endpoints/obtener_usuarios.php')
        .then(respuesta => respuesta.json())
        .then(datos => {
            if (datos.status === 'error') {
                tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger py-4">Fallo la conexión.</td></tr>`;
                return;
            }
            tbody.innerHTML = ''; 
            if (datos.data && datos.data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">No hay usuarios registrados.</td></tr>`;
                return;
            }
            if(datos.data){
                datos.data.forEach(user => {
                    let colorBadge = (user.rol === 'Administrador' || user.rol === 'admin') ? 'danger' : 'primary';
                    let filaHTML = `
                        <tr>
                            <td class="ps-4 fw-bold text-secondary">#${user.id_usuario}</td>
                            <td>${user.correo}</td>
                            <td><span class="badge bg-${colorBadge} bg-opacity-10 text-${colorBadge} border border-${colorBadge}-subtle px-3 py-2 rounded-pill">${user.rol}</span></td>
                            <td class="pe-4 text-end">
                                <button class="btn btn-sm btn-outline-secondary me-1"><i class="bi bi-pencil"></i></button>
                                <button class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                            </td>
                        </tr>`;
                    tbody.innerHTML += filaHTML;
                });
            }
        })
        .catch(error => {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger py-4">Error al procesar los datos.</td></tr>`;
        });
}

// Arma la tabla completa de exámenes y les conecta los botones de acciones
function cargarTablaExamenes() {
    const tbody = document.getElementById('tbody-examenes');
    if(!tbody) return;

    fetch('/php/endpoints/obtener_examenes.php')
        .then(respuesta => respuesta.json())
        .then(datos => {
            if (datos.status === 'error') {
                tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">Error: ${datos.message}</td></tr>`;
                return;
            }
            tbody.innerHTML = ''; 
            if (datos.data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">Aún no hay exámenes programados.</td></tr>`;
                return;
            }

            // Pintamos cada examen en la tabla
            datos.data.forEach(ex => {
                let colorBadge = (ex.estado === 'Programado') ? 'primary' : (ex.estado === 'Abierto' ? 'success' : 'secondary');
                
                let btnAbrirHTML = '';
                if (ex.estado === 'Programado') {
                    btnAbrirHTML = `
                        <button class="btn btn-outline-success btn-sm rounded-pill px-2 py-1 btn-abrir-ets" data-id="${ex.id_examen}" title="Abrir Inscripciones">
                            <i class="bi bi-unlock-fill me-1"></i>Abrir
                        </button>`;
                }

                let filaHTML = `
                    <tr>
                        <td class="ps-4 fw-bold text-secondary">#${ex.id_examen}</td>
                        <td class="fw-semibold">${ex.materia}</td>
                        <td><div>${ex.fecha}</div><small class="text-muted">${ex.hora_inicio} - ${ex.hora_fin}</small></td>
                        <td>${ex.sinodal}</td>
                        <td>${ex.salon}</td>
                        <td>${ex.cupo} alumnos</td>
                        <td><span class="badge bg-${colorBadge} bg-opacity-10 text-${colorBadge} border border-${colorBadge}-subtle px-3 py-2 rounded-pill">${ex.estado}</span></td>
                        <td class="text-center" style="width: 1%; white-space: nowrap;">
                            <div class="d-flex justify-content-center align-items-center gap-1">
                                ${btnAbrirHTML}
                                <button class="btn btn-outline-primary btn-sm rounded-pill px-2 py-1 btn-modificar-ets" data-id="${ex.id_examen}" title="Modificar">
                                    <i class="bi bi-pencil-square"></i>
                                </button>
                                <button class="btn btn-outline-danger btn-sm rounded-pill px-2 py-1 btn-eliminar-ets" data-id="${ex.id_examen}" title="Eliminar">
                                    <i class="bi bi-trash3"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += filaHTML;
            });

            // Conectamos el botón para abrir inscripciones
            tbody.querySelectorAll('.btn-abrir-ets').forEach(btn => {
                btn.addEventListener('click', function() {
                    const idExamen = this.getAttribute('data-id');
                    if (confirm("¿Estás seguro de ABRIR las inscripciones para este examen? Los alumnos ya podrán registrarse.")) {
                        fetch('/php/endpoints/abrir_examen.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id_examen: idExamen })
                        })
                        .then(res => res.json())
                        .then(data => {
                            if (data.status === 'success') {
                                cargarTablaExamenes(); // Refrescamos tabla para ver el cambio
                            } else {
                                alert("Error: " + data.message);
                            }
                        });
                    }
                });
            });

            // Conectamos el botón de borrar
            tbody.querySelectorAll('.btn-eliminar-ets').forEach(btn => {
                btn.addEventListener('click', function() {
                    const idExamen = this.getAttribute('data-id');
                    if (confirm(`¿Eliminar el examen #${idExamen}?`)) {
                        fetch('/php/endpoints/eliminar_ets.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id_examen: idExamen })
                        })
                        .then(res => res.json())
                        .then(data => {
                            if (data.status === 'success') cargarTablaExamenes();
                            else alert("Error: " + data.message);
                        });
                    }
                });
            });

            // Conectamos el botón de editar (carga el examen y abre el modal)
            tbody.querySelectorAll('.btn-modificar-ets').forEach(btn => {
                btn.addEventListener('click', function() {
                    const idExamen = this.getAttribute('data-id');
                    fetch(`/php/endpoints/obtener_examen_id.php?id=${idExamen}`)
                        .then(res => res.json())
                        .then(data => {
                            if (data.status === 'success') {
                                document.getElementById('edit-id').value = data.examen.id_examen;
                                document.getElementById('edit-materia').value = data.examen.id_materia;
                                document.getElementById('edit-sinodal').value = data.examen.id_profesor;
                                document.getElementById('edit-fecha').value = data.examen.fecha;
                                document.getElementById('edit-hora').value = data.examen.hora_inicio;
                                document.getElementById('edit-salon').value = data.examen.id_salon;
                                document.getElementById('edit-cupo').value = data.examen.cupo;
                                new bootstrap.Modal(document.getElementById('modalEditarETS')).show();
                            }
                        });
                });
            });
        });
}


// =======================================================
// FUNCIONES DE LA "LLAVE MAESTRA" DE CALIFICACIONES
// =======================================================

// Llena el <select> con los exámenes que ya pasaron la etapa de planeación
function cargarSelectExamenesCalificar() {
    const select = document.getElementById('select-examen-calificar');
    if (!select) return;

    fetch('../../php/endpoints/obtener_examenes.php')
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                select.innerHTML = '<option value="" selected disabled>Selecciona un examen...</option>';
                
                // Ocultamos los programados porque ahí todavía no hay lista de alumnos definitiva
                // Mostrar SOLO los exámenes Cerrados (listos para calificar) y los Calificados (para poder modificarlos)
                const examenesValidos = data.data.filter(ex => ex.estado === 'Cerrado' || ex.estado === 'Calificado');
                
                examenesValidos.forEach(ex => {
                    let icono = ex.estado === 'Calificado' ? '✅' : '📝';
                    select.innerHTML += `<option value="${ex.id_examen}">${icono} #${ex.id_examen} - ${ex.materia} (${ex.estado})</option>`;
                });
            }
        });
}

// Al seleccionar un examen, traemos a sus alumnos para pintarlos con su input de calificación
function cargarAlumnosParaCalificar(idExamen) {
    const tbody = document.getElementById('tbody-calificaciones');
    const btnGuardar = document.getElementById('btn-guardar-calificaciones');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="3" class="text-center py-4"><span class="spinner-border spinner-border-sm text-primary me-2"></span> Buscando alumnos...</td></tr>';
    btnGuardar.disabled = true;

    fetch(`../../php/endpoints/obtener_alumnos_examen.php?id_examen=${idExamen}`)
        .then(res => res.json())
        .then(data => {
            tbody.innerHTML = '';
            
            // Si nadie pagó o no hay inscritos, no hay nada que calificar
            if (data.status === 'error' || data.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted py-4">No hay alumnos con pago validado para este examen.</td></tr>';
                return;
            }

            btnGuardar.disabled = false;
            
            // Creamos las filas inyectando el valor previo (si ya estaba calificado)
            data.data.forEach(al => {
                let califActual = al.calificacion !== null ? al.calificacion : '';
                tbody.innerHTML += `
                    <tr>
                        <td class="ps-4 fw-bold text-secondary">${al.boleta}</td>
                        <td>${al.apellido_paterno} ${al.apellido_materno} ${al.nombre}</td>
                        <td class="pe-4">
                            <input type="number" class="form-control input-calificacion" 
                                data-id="${al.id_inscripcion}" 
                                value="${califActual}" 
                                min="0" max="10" step="0.1" placeholder="Ej. 8.5">
                        </td>
                    </tr>
                `;
            });
        })
        .catch(() => {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center text-danger py-4">Error de conexión al servidor.</td></tr>';
        });
}

// Agarra todos los números que teclearon, los empaqueta y los manda a guardar
// Agarra todos los números que teclearon, valida que no hagan trampa y los manda a guardar
function guardarCalificaciones() {
    const idExamen = document.getElementById('select-examen-calificar').value;
    if (!idExamen) {
        alert("Primero selecciona un examen.");
        return;
    }

    const inputs = document.querySelectorAll('.input-calificacion');
    let listaCalificaciones = []; 
    let faltanDatos = false;
    let hayNumerosInvalidos = false; // Nuestro detector de trampa

    // Recorremos cada fila para extraer la inscripción y validar su nota
    inputs.forEach(input => {
        let valor = input.value;
        
        if (valor === "") {
            faltanDatos = true;
        } else {
            let calificacionNum = parseFloat(valor);
            // Validamos que el número esté estrictamente entre 0 y 10
            if (calificacionNum < 0 || calificacionNum > 10) {
                hayNumerosInvalidos = true;
                // Pintamos la cajita de rojo para que el usuario vea dónde se equivocó
                input.classList.add('is-invalid'); 
            } else {
                input.classList.remove('is-invalid');
            }
        }

        listaCalificaciones.push({
            id_inscripcion: input.getAttribute('data-id'),
            calificacion: valor
        });
    });

    // REGLA 1: Si metieron un 21 o algo raro, abortamos la misión
    if (hayNumerosInvalidos) {
        alert("❌ Error: Las calificaciones deben estar estrictamente entre 0 y 10. Corrige las casillas marcadas en rojo.");
        return;
    }

    // REGLA 2: Validamos que el profe no deje a nadie en blanco por error
    if (faltanDatos) {
        if (!confirm("⚠️ Faltan alumnos por calificar. ¿Estás seguro de cerrar el acta incompleta?")) return;
    }

    // Bloqueamos el botón para evitar doble clic accidental
    const btn = document.getElementById('btn-guardar-calificaciones');
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';
    btn.disabled = true;

    // Mandamos el JSON al PHP
    fetch('../../php/endpoints/guardar_calificaciones.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            id_examen: idExamen, 
            calificaciones: listaCalificaciones 
        })
    })
    .then(res => res.json())
    .then(data => {
        btn.innerHTML = '<i class="bi bi-save me-2"></i>Cerrar Acta';
        btn.disabled = false;
        
        if (data.status === 'success') {
            alert("✅ ¡Calificaciones guardadas exitosamente!");
            cargarSelectExamenesCalificar(); 
            document.getElementById('tbody-calificaciones').innerHTML = '<tr><td colspan="3" class="text-center text-muted py-4">Seleccione un examen arriba para ver la lista de alumnos.</td></tr>';
            btn.disabled = true;
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(() => {
        alert("Ocurrió un error de red al intentar guardar.");
        btn.innerHTML = '<i class="bi bi-save me-2"></i>Cerrar Acta';
        btn.disabled = false;
    });
}