let chartInscripciones = null;

document.addEventListener("DOMContentLoaded", () => {
    const primerEnlace = document.querySelector('.menu-link');
    if (primerEnlace) primerEnlace.click();
});

function cargarVista(nombreVista, elementoClick) {
    const contenedor = document.getElementById('view-container');
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    document.body.classList.remove('modal-open');
    document.body.style.paddingRight = '';
    
    contenedor.innerHTML = `<div class="text-center mt-5"><div class="spinner-border text-primary" role="status"></div><p class="mt-2 text-muted">Consultando al servidor...</p></div>`;

    const vistasDelProfesor = ['dashboard_profesor', 'mis_examenes', 'revisiones'];
    const vistasDelAlumno = ['dashboard_alumno', 'alumno_inscripcion', 'alumno_kardex', 'inscripcion_ets']; 
    let carpetaDefinitiva = 'vistas'; 

    if (vistasDelProfesor.includes(nombreVista)) carpetaDefinitiva = 'vistasProfesor';
    else if (vistasDelAlumno.includes(nombreVista)) carpetaDefinitiva = 'vistasAlumno';

    fetch(`${carpetaDefinitiva}/${nombreVista}.php?v=${Date.now()}`)
        .then(respuesta => {
            if (!respuesta.ok) throw new Error(`Error al cargar ${carpetaDefinitiva}/${nombreVista}.php`);
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
                if (tituloSeccion) tituloSeccion.innerText = elementoClick.innerText.trim();
            }

            let bsOffcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('sidebarMenu'));
            if (bsOffcanvas && window.innerWidth < 768) bsOffcanvas.hide();

            inicializarLogicaVista(nombreVista);
        })
        .catch(error => {
            contenedor.innerHTML = `<div class="alert alert-danger shadow-sm border-0 border-start border-danger border-4 rounded-3"><i class="bi bi-exclamation-triangle-fill me-2"></i><strong>Fallo de conexión:</strong> ${error.message}</div>`;
        });
}

function inicializarLogicaVista(nombreVista) {
    
    if (nombreVista === 'inscripciones') {
        if (typeof cargarTablaInscripciones === 'function') {
            cargarTablaInscripciones(); cargarExamenesParaSelect(); manejarFormularioInscripcion();
        }
    }
    
    if (nombreVista === 'dashboard') {
        const kpiExamenes = document.getElementById('kpi-examenes');
        const kpiInscritos = document.getElementById('kpi-inscritos');
        const kpiPagos = document.getElementById('kpi-pagos');
        const kpiActas = document.getElementById('kpi-actas');
        
        if(kpiExamenes) kpiExamenes.innerHTML = '<span class="spinner-border spinner-border-sm text-primary"></span>';
        if(kpiInscritos) kpiInscritos.innerHTML = '<span class="spinner-border spinner-border-sm text-success"></span>';
        if(kpiPagos) kpiPagos.innerHTML = '<span class="spinner-border spinner-border-sm text-warning"></span>';
        if(kpiActas) kpiActas.innerHTML = '<span class="spinner-border spinner-border-sm text-info"></span>';

        fetch('../../php/endpoints/obtener_dashboard_admin.php')
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    if(kpiExamenes) kpiExamenes.innerText = data.kpis.examenes;
                    if(kpiInscritos) kpiInscritos.innerText = data.kpis.inscritos;
                    if(kpiPagos) kpiPagos.innerText = data.kpis.pagos;
                    if(kpiActas) kpiActas.innerText = `${data.kpis.actas_capturadas} / ${data.kpis.total_examenes}`;

                    const canvas = document.getElementById('inscripcionesChart');
                    if (canvas) {
                        const ctx = canvas.getContext('2d');
                        if (chartInscripciones) chartInscripciones.destroy(); 
                        chartInscripciones = new Chart(ctx, {
                            type: 'bar',
                            data: {
                                labels: data.chart.labels.length > 0 ? data.chart.labels : ['Sin datos'],
                                datasets: [{ label: 'Alumnos inscritos', data: data.chart.data.length > 0 ? data.chart.data : [0], backgroundColor: 'rgba(13, 110, 253, 0.8)', borderRadius: 4 }]
                            },
                            options: { responsive: true, plugins: { legend: { display: false } } }
                        });
                    }
                    
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
                                contenedorActividad.innerHTML += `<div class="d-flex mb-3 border-bottom pb-2"><div class="flex-shrink-0 p-2 bg-${color} bg-opacity-10 rounded text-${color}"><i class="bi ${icono} fs-5"></i></div><div class="flex-grow-1 ms-3"><h6 class="mb-0">${titulo}</h6><small class="text-muted">Boleta ${act.boleta} - ${act.materia}</small></div></div>`;
                            });
                        }
                    }
                }
            });
    }

    if (nombreVista === 'calificaciones') {
        cargarSelectExamenesCalificar();
        document.getElementById('select-examen-calificar')?.addEventListener('change', (e) => cargarAlumnosParaCalificar(e.target.value));
        document.getElementById('btn-guardar-calificaciones')?.addEventListener('click', guardarCalificaciones);
        
        // CONECTAMOS EL BOTÓN DE EXPORTAR
        document.getElementById('btn-exportar-csv')?.addEventListener('click', exportarCalificacionesCSV);

        document.getElementById('buscador-examenes-calificar')?.addEventListener('keyup', function() {
            const texto = this.value.toLowerCase();
            const opciones = document.getElementById('select-examen-calificar').options;
            for (let i = 1; i < opciones.length; i++) {
                opciones[i].style.display = opciones[i].text.toLowerCase().includes(texto) ? '' : 'none';
            }
        });

        document.getElementById('buscador-alumnos-calificar')?.addEventListener('keyup', function() {
            const texto = this.value.toLowerCase();
            document.querySelectorAll('#tbody-calificaciones tr').forEach(fila => {
                if(fila.cells.length > 1) { 
                    fila.style.display = fila.innerText.toLowerCase().includes(texto) ? '' : 'none';
                }
            });
        });
    }

    if (nombreVista === 'profesores') {
        cargarTablaProfesoresAdmin();
        document.getElementById('buscador-profesores')?.addEventListener('keyup', aplicarFiltrosProfesor);
        document.getElementById('filtro-estado-profesor')?.addEventListener('change', aplicarFiltrosProfesor);
        document.getElementById('btn-guardar-profesor')?.addEventListener('click', guardarNuevoProfesor);
        document.getElementById('btn-actualizar-profesor')?.addEventListener('click', actualizarProfesor);
    }

    if (nombreVista === 'catalogos') {
        if (typeof iniciarVistaCatalogos === 'function') iniciarVistaCatalogos();
    }

    if (nombreVista === 'usuarios') {
        cargarTablaUsuarios();

        document.getElementById('buscador-usuarios')?.addEventListener('keyup', aplicarFiltrosUsuario);
        document.getElementById('filtro-rol-usuario')?.addEventListener('change', aplicarFiltrosUsuario);

        const btnGuardarUsuario = document.getElementById('btn-guardar-usuario');
        if (btnGuardarUsuario) {
            btnGuardarUsuario.addEventListener('click', () => {
                const correo = document.getElementById('input-correo').value;
                const password = document.getElementById('input-password').value;
                const rol = document.getElementById('select-rol').value;

                if (!correo || !password || !rol) { alert("Completa todos los campos"); return; }
                btnGuardarUsuario.disabled = true; btnGuardarUsuario.innerHTML = "Guardando...";

                fetch('../../php/endpoints/crear_usuario.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ correo, password, rol }) })
                .then(res => res.json()).then(datos => {
                    if (datos.status === 'success') {
                        const modal = bootstrap.Modal.getInstance(document.getElementById('modalNuevoUsuario'));
                        if(modal) modal.hide();
                        document.getElementById('form-nuevo-usuario').reset();
                        alert("Usuario creado con éxito.");
                        cargarTablaUsuarios();
                    } else { alert("Error: " + datos.message); }
                    btnGuardarUsuario.disabled = false; btnGuardarUsuario.innerHTML = "Guardar Usuario";
                });
            });
        }

        const btnActualizarUsuario = document.getElementById('btn-actualizar-usuario');
        if (btnActualizarUsuario) {
            btnActualizarUsuario.addEventListener('click', () => {
                const id = document.getElementById('edit-user-id').value;
                const correo = document.getElementById('edit-user-correo').value;
                const password = document.getElementById('edit-user-password').value;
                const rol = document.getElementById('edit-user-rol').value;

                btnActualizarUsuario.disabled = true; btnActualizarUsuario.innerHTML = "Actualizando...";

                fetch('../../php/endpoints/actualizar_usuario.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, correo, password, rol }) })
                .then(res => res.json()).then(datos => {
                    if (datos.status === 'success') {
                        const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarUsuario'));
                        if(modal) modal.hide();
                        alert("Usuario actualizado con éxito.");
                        cargarTablaUsuarios();
                    } else { alert("Error: " + datos.message); }
                    btnActualizarUsuario.disabled = false; btnActualizarUsuario.innerHTML = "Actualizar Usuario";
                });
            });
        }
    }
    
    if (nombreVista === 'examenes') {
        cargarTablaExamenes();

        fetch('../../php/endpoints/obtener_catalogos_ets.php')
            .then(res => res.json()).then(data => {
                if(data.status === 'success') {
                    const selectMateria = document.getElementById('select-materia');
                    if (selectMateria) {
                        selectMateria.innerHTML = '<option value="" selected disabled>Selecciona una materia...</option>';
                        data.materias.forEach(m => { selectMateria.innerHTML += `<option value="${m.id_materia}">${m.nombre}</option>`; });
                    }
                    const selectSinodal = document.getElementById('select-sinodal');
                    if (selectSinodal) {
                        selectSinodal.innerHTML = '<option value="" selected disabled>Asigna un sinodal...</option>';
                        data.profesores.forEach(p => { selectSinodal.innerHTML += `<option value="${p.id_profesor}">${p.nombre}</option>`; });
                    }
                    const selectSalon = document.getElementById('select-salon');
                    if (selectSalon) {
                        selectSalon.innerHTML = '<option value="" selected disabled>Selecciona un salón...</option>';
                        data.salones.forEach(s => { selectSalon.innerHTML += `<option value="${s.id_salon}">${s.nombre}</option>`; });
                    }
                }
            }).catch(err => console.error(err));

        const buscadorExamenes = document.getElementById('buscador-examenes');
        if (buscadorExamenes) {
            buscadorExamenes.addEventListener('keyup', function() {
                const textoBuscar = this.value.toLowerCase();
                const filas = document.querySelectorAll('#tbody-examenes tr');
                filas.forEach(fila => {
                    if(fila.cells.length > 1) fila.style.display = fila.innerText.toLowerCase().includes(textoBuscar) ? '' : 'none';
                });
            });
        }

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

                if(!materia || !sinodal || !fecha || !hora || !salon || !cupo) { alert("Llena todos los campos."); return; }

                nuevoBtnGuardar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';
                nuevoBtnGuardar.disabled = true;

                fetch('../../php/endpoints/crear_ets.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ materia, sinodal, fecha, hora, salon, cupo }) })
                .then(res => res.json()).then(datos => {
                    if (datos.status === 'success') {
                        const modal = bootstrap.Modal.getInstance(document.getElementById('modalNuevoETS'));
                        if(modal) modal.hide();
                        document.getElementById('form-nuevo-ets').reset();
                        alert("¡Examen programado con éxito!"); 
                        cargarTablaExamenes();
                    } else { alert("Error: " + datos.message); }
                    nuevoBtnGuardar.innerHTML = '<i class="bi bi-save me-1"></i> Guardar Examen'; nuevoBtnGuardar.disabled = false;
                }).catch(error => {
                    alert("Error de conexión."); nuevoBtnGuardar.innerHTML = '<i class="bi bi-save me-1"></i> Guardar Examen'; nuevoBtnGuardar.disabled = false;
                });
            });
        }
    }

    if (nombreVista === 'alumnos') { if (typeof iniciarVistaAlumnos === 'function') iniciarVistaAlumnos(); }
    if (nombreVista === 'dashboard_profesor' && typeof window.cargarKPIsProfesor === 'function') window.cargarKPIsProfesor();
    if (nombreVista === 'mis_examenes' && typeof window.cargarMisExamenes === 'function') window.cargarMisExamenes();
    if (nombreVista === 'revisiones' && typeof window.cargarRevisiones === 'function') window.cargarRevisiones();
}

// =======================================================
// FUNCIONES GLOBALES 
// =======================================================

function cargarTablaUsuarios() {
    const tbody = document.getElementById('cuerpo-tabla-usuarios');
    if(!tbody) return;

    fetch('../../php/endpoints/obtener_usuarios.php')
        .then(respuesta => respuesta.json())
        .then(datos => {
            if (datos.status === 'error') { tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger py-4">Error al cargar.</td></tr>`; return; }
            tbody.innerHTML = ''; 
            if (datos.data && datos.data.length === 0) { tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">No hay usuarios.</td></tr>`; return; }
            if(datos.data){
                datos.data.forEach(user => {
                    let colorBadge = (user.rol === 'Administrador' || user.rol === 'admin') ? 'danger' : (user.rol === 'profesor' ? 'success' : 'primary');
                    let rolNormalizado = user.rol.toLowerCase();

                    let filaHTML = `
                        <tr data-rol="${rolNormalizado}">
                            <td class="ps-4 fw-bold text-secondary">#${user.id_usuario}</td>
                            <td>${user.correo}</td>
                            <td><span class="badge bg-${colorBadge} bg-opacity-10 text-${colorBadge} border border-${colorBadge}-subtle px-3 py-2 rounded-pill">${user.rol}</span></td>
                            <td class="pe-4 text-end">
                                <button class="btn btn-sm btn-outline-secondary me-1 btn-editar-usuario" data-id="${user.id_usuario}" data-correo="${user.correo}" data-rol="${user.rol}"><i class="bi bi-pencil"></i></button>
                                <button class="btn btn-sm btn-outline-danger btn-eliminar-usuario" data-id="${user.id_usuario}"><i class="bi bi-trash"></i></button>
                            </td>
                        </tr>`;
                    tbody.innerHTML += filaHTML;
                });

                tbody.querySelectorAll('.btn-editar-usuario').forEach(btn => {
                    btn.addEventListener('click', function() {
                        document.getElementById('edit-user-id').value = this.getAttribute('data-id');
                        document.getElementById('edit-user-correo').value = this.getAttribute('data-correo');
                        document.getElementById('edit-user-rol').value = this.getAttribute('data-rol');
                        new bootstrap.Modal(document.getElementById('modalEditarUsuario')).show();
                    });
                });

                tbody.querySelectorAll('.btn-eliminar-usuario').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const id = this.getAttribute('data-id');
                        if (confirm('¿Eliminar este usuario definitivamente?')) {
                            fetch('../../php/endpoints/eliminar_usuario.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id_usuario: id }) })
                            .then(res => res.json()).then(data => { if(data.status === 'success') { cargarTablaUsuarios(); } else { alert("Error: " + data.message); } });
                        }
                    });
                });

                aplicarFiltrosUsuario();
            }
        })
        .catch(() => { tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger py-4">Error de conexión.</td></tr>`; });
}

function aplicarFiltrosUsuario() {
    const texto = document.getElementById('buscador-usuarios')?.value.toLowerCase() || '';
    const rolFiltro = document.getElementById('filtro-rol-usuario')?.value.toLowerCase() || 'todos';

    document.querySelectorAll('#cuerpo-tabla-usuarios tr').forEach(fila => {
        if(fila.cells.length > 1) { 
            const contenido = fila.innerText.toLowerCase();
            const rolFila = fila.getAttribute('data-rol') || '';
            let coincideTexto = contenido.includes(texto);
            let coincideRol = (rolFiltro === 'todos') || (rolFila.includes(rolFiltro)) || (rolFiltro === 'admin' && rolFila.includes('administrador'));
            fila.style.display = (coincideTexto && coincideRol) ? '' : 'none';
        }
    });
}

function cargarTablaExamenes() {
    const tbody = document.getElementById('tbody-examenes');
    if(!tbody) return;

    fetch('../../php/endpoints/obtener_examenes.php')
        .then(respuesta => respuesta.json())
        .then(datos => {
            tbody.innerHTML = ''; 
            if (datos.status === 'error' || datos.data.length === 0) { tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">Aún no hay exámenes.</td></tr>`; return; }
            datos.data.forEach(ex => {
                let colorBadge = (ex.estado === 'Programado') ? 'primary' : (ex.estado === 'Abierto' ? 'success' : 'secondary');
                let btnAbrirHTML = ex.estado === 'Programado' ? `<button class="btn btn-outline-success btn-sm rounded-pill px-2 py-1 btn-abrir-ets" data-id="${ex.id_examen}" title="Abrir Inscripciones"><i class="bi bi-unlock-fill me-1"></i>Abrir</button>` : '';

                tbody.innerHTML += `
                    <tr>
                        <td class="ps-4 fw-bold text-secondary">#${ex.id_examen}</td>
                        <td class="fw-semibold">${ex.materia}</td>
                        <td><div>${ex.fecha}</div><small class="text-muted">${ex.hora_inicio} - ${ex.hora_fin}</small></td>
                        <td>${ex.sinodal}</td>
                        <td>${ex.salon}</td>
                        <td>${ex.cupo} alumnos</td>
                        <td><span class="badge bg-${colorBadge} bg-opacity-10 text-${colorBadge} border border-${colorBadge}-subtle px-3 py-2 rounded-pill">${ex.estado}</span></td>
                        <td class="text-center">
                            <div class="d-flex justify-content-center align-items-center gap-1">
                                ${btnAbrirHTML}
                                <button class="btn btn-outline-primary btn-sm rounded-pill px-2 py-1 btn-modificar-ets" data-id="${ex.id_examen}"><i class="bi bi-pencil-square"></i></button>
                                <button class="btn btn-outline-danger btn-sm rounded-pill px-2 py-1 btn-eliminar-ets" data-id="${ex.id_examen}"><i class="bi bi-trash3"></i></button>
                            </div>
                        </td>
                    </tr>`;
            });

            tbody.querySelectorAll('.btn-abrir-ets').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    if (confirm("¿ABRIR inscripciones para este examen?")) {
                        fetch('../../php/endpoints/abrir_examen.php', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ id_examen: id }) })
                        .then(res => res.json()).then(data => { if(data.status==='success') cargarTablaExamenes(); else alert("Error: "+data.message); });
                    }
                });
            });

            tbody.querySelectorAll('.btn-eliminar-ets').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    if (confirm(`¿Eliminar examen #${id}?`)) {
                        fetch('../../php/endpoints/eliminar_ets.php', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ id_examen: id }) })
                        .then(res => res.json()).then(data => { if(data.status==='success') cargarTablaExamenes(); else alert(data.message); });
                    }
                });
            });

            tbody.querySelectorAll('.btn-modificar-ets').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    fetch(`../../php/endpoints/obtener_examen_id.php?id=${id}`)
                        .then(res => res.json()).then(data => {
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

function cargarSelectExamenesCalificar() {
    const select = document.getElementById('select-examen-calificar');
    if (!select) return;
    fetch('../../php/endpoints/obtener_examenes.php').then(res => res.json()).then(data => {
        if (data.status === 'success') {
            select.innerHTML = '<option value="" selected disabled>Selecciona un examen...</option>';
            data.data.filter(ex => ex.estado === 'Cerrado' || ex.estado === 'Calificado').forEach(ex => {
                select.innerHTML += `<option value="${ex.id_examen}">${ex.estado === 'Calificado' ? '✅' : '📝'} #${ex.id_examen} - ${ex.materia} | ${ex.fecha}</option>`;
            });
        }
    });
}

function cargarAlumnosParaCalificar(idExamen) {
    const tbody = document.getElementById('tbody-calificaciones');
    const btnGuardar = document.getElementById('btn-guardar-calificaciones');
    const btnExportar = document.getElementById('btn-exportar-csv'); // Referencia al botón exportar
    
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="3" class="text-center py-4"><span class="spinner-border spinner-border-sm text-primary"></span></td></tr>';
    btnGuardar.disabled = true;
    if(btnExportar) btnExportar.style.display = 'none'; // Lo ocultamos hasta ver si hay datos

    fetch(`../../php/endpoints/obtener_alumnos_examen.php?id_examen=${idExamen}`).then(res => res.json()).then(data => {
        tbody.innerHTML = '';
        if (data.status === 'error' || data.data.length === 0) { 
            tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No hay alumnos en este examen.</td></tr>'; 
            return; 
        }
        
        // Si hay datos, activamos los botones
        btnGuardar.disabled = false;
        if(btnExportar) btnExportar.style.display = 'inline-block';

        data.data.forEach(al => {
            tbody.innerHTML += `<tr><td class="ps-4 fw-bold text-secondary">${al.boleta}</td><td>${al.apellido_paterno} ${al.apellido_materno} ${al.nombre}</td>
                <td class="pe-4"><input type="number" class="form-control input-calificacion" data-id="${al.id_inscripcion}" value="${al.calificacion ?? ''}" min="0" max="10" step="0.1"></td></tr>`;
        });
    });
}

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
    fetch('../../php/endpoints/guardar_calificaciones.php', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ id_examen: idExamen, calificaciones: lista }) })
    .then(res => res.json()).then(data => { if (data.status === 'success') { alert("¡Guardado!"); cargarSelectExamenesCalificar(); } else alert(data.message); });
}

// --- NUEVA FUNCIÓN PARA EXPORTAR A CSV ---
function exportarCalificacionesCSV() {
    const selector = document.getElementById('select-examen-calificar');
    const idExamen = selector.value;
    
    // Sacamos el nombre del examen limpiando los emojis y caracteres raros
    const nombreExamen = selector.options[selector.selectedIndex].text.replace(/[^a-zA-Z0-9 -]/g, "").trim();

    const filas = document.querySelectorAll('#tbody-calificaciones tr');
    if (filas.length === 0 || (filas.length === 1 && filas[0].cells.length === 1)) {
        alert("No hay datos para exportar.");
        return;
    }

    // Le agregamos el BOM (\uFEFF) para que Excel (que es medio especial) lea bien los acentos
    let csvContent = "\uFEFFBoleta,Nombre del Alumno,Calificacion\n";

    filas.forEach(fila => {
        if (fila.cells.length >= 3) {
            const boleta = fila.cells[0].innerText.trim();
            const nombre = fila.cells[1].innerText.trim();
            
            // La calificación vive dentro de un input, la sacamos de ahí
            const inputCalif = fila.cells[2].querySelector('input');
            const calif = inputCalif ? inputCalif.value : '';
            
            // Envolvemos el nombre en comillas por si tiene comas
            csvContent += `${boleta},"${nombre}",${calif}\n`;
        }
    });

    // Magia para descargar el archivo sin ir al backend
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Acta_${nombreExamen.replace(/ /g,"_")}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function cargarTablaProfesoresAdmin() {
    const tbody = document.getElementById('tbody-profesores');
    if (!tbody) return;
    fetch('../../php/endpoints/obtener_profesores.php').then(res => res.json()).then(data => {
        tbody.innerHTML = '';
        if (data.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">No hay profesores registrados.</td></tr>';
            return;
        }
        data.data.forEach(p => {
            let colorBadge = p.estado === 'Activo' ? 'success' : 'secondary';
            let btnIcono = p.estado === 'Activo' ? '<i class="bi bi-person-dash"></i>' : '<i class="bi bi-person-check"></i>';
            let btnColor = p.estado === 'Activo' ? 'outline-danger' : 'outline-success';
            let btnTitle = p.estado === 'Activo' ? 'Deshabilitar' : 'Habilitar';

            tbody.innerHTML += `
                <tr data-estado="${p.estado}">
                    <td class="ps-4 fw-bold text-secondary">${p.boleta}</td>
                    <td>${p.apellido_paterno} ${p.apellido_materno} ${p.nombre}</td>
                    <td>${p.correo}</td>
                    <td><span class="badge bg-${colorBadge} bg-opacity-10 text-${colorBadge} border border-${colorBadge}-subtle px-3 py-2 rounded-pill">${p.estado}</span></td>
                    <td class="pe-4 text-end">
                        <button class="btn btn-sm btn-outline-primary btn-editar-profe me-1" 
                            data-boleta="${p.boleta}" data-nombre="${p.nombre}" data-paterno="${p.apellido_paterno}" data-materno="${p.apellido_materno}" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-${btnColor} btn-estado-profe" data-boleta="${p.boleta}" data-estado="${p.estado}" title="${btnTitle}">
                            ${btnIcono}
                        </button>
                    </td>
                </tr>`;
        });

        tbody.querySelectorAll('.btn-editar-profe').forEach(btn => {
            btn.onclick = function() {
                document.getElementById('edit-prof-boleta-actual').value = this.dataset.boleta;
                document.getElementById('edit-prof-boleta').value = this.dataset.boleta;
                document.getElementById('edit-prof-nombre').value = this.dataset.nombre;
                document.getElementById('edit-prof-paterno').value = this.dataset.paterno;
                document.getElementById('edit-prof-materno').value = this.dataset.materno;
                new bootstrap.Modal(document.getElementById('modalEditarProfesor')).show();
            }
        });

        tbody.querySelectorAll('.btn-estado-profe').forEach(btn => {
            btn.onclick = function() {
                let accion = this.dataset.estado === 'Activo' ? 'deshabilitar' : 'habilitar';
                if(confirm(`¿Estás seguro de ${accion} a este profesor?`)) {
                    fetch('../../php/endpoints/eliminar_profesor.php', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ boleta: this.dataset.boleta }) })
                    .then(res => res.json()).then(data => {
                        if(data.status === 'success') { cargarTablaProfesoresAdmin(); }
                        else { alert("❌ " + data.message); }
                    });
                }
            }
        });

        aplicarFiltrosProfesor(); 
    });
}

function aplicarFiltrosProfesor() {
    const texto = document.getElementById('buscador-profesores')?.value.toLowerCase() || '';
    const estado = document.getElementById('filtro-estado-profesor')?.value || 'Todos';

    document.querySelectorAll('#tbody-profesores tr').forEach(fila => {
        if(fila.cells.length > 1) { 
            const contenido = fila.innerText.toLowerCase();
            const estadoFila = fila.getAttribute('data-estado');
            let coincideTexto = contenido.includes(texto);
            let coincideEstado = (estado === 'Todos') || (estado === estadoFila);
            fila.style.display = (coincideTexto && coincideEstado) ? '' : 'none';
        }
    });
}

function guardarNuevoProfesor() {
    const datos = {
        boleta: document.getElementById('prof-boleta').value, nombre: document.getElementById('prof-nombre').value,
        paterno: document.getElementById('prof-paterno').value, materno: document.getElementById('prof-materno').value,
        correo: document.getElementById('prof-correo').value, password: document.getElementById('prof-password').value
    };
    if (!datos.boleta || !datos.nombre || !datos.paterno || !datos.materno || !datos.correo || !datos.password) { alert("Llena todos los campos."); return; }

    const btn = document.getElementById('btn-guardar-profesor');
    btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

    fetch('../../php/endpoints/crear_profesor.php', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(datos) })
    .then(res => res.json()).then(data => {
        btn.disabled = false; btn.innerHTML = 'Guardar Profesor';
        if(data.status === 'success') { 
            const mod = bootstrap.Modal.getInstance(document.getElementById('modalNuevoProfesor'));
            if(mod) mod.hide();
            cargarTablaProfesoresAdmin(); 
            document.getElementById('form-nuevo-profesor').reset();
        } else alert(data.message);
    });
}

function actualizarProfesor() {
    const datos = {
        boleta_actual: document.getElementById('edit-prof-boleta-actual').value,
        boleta_nueva: document.getElementById('edit-prof-boleta').value.trim(),
        nombre: document.getElementById('edit-prof-nombre').value.trim(),
        paterno: document.getElementById('edit-prof-paterno').value.trim(),
        materno: document.getElementById('edit-prof-materno').value.trim()
    };

    if (!datos.boleta_nueva || !datos.nombre || !datos.paterno || !datos.materno) { alert("Llena todos los campos."); return; }

    const btn = document.getElementById('btn-actualizar-profesor');
    btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

    fetch('../../php/endpoints/actualizar_profesor.php', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(datos) })
    .then(res => res.json()).then(data => {
        btn.disabled = false; btn.innerHTML = 'Actualizar Profesor';
        if (data.status === 'success') {
            const mod = bootstrap.Modal.getInstance(document.getElementById('modalEditarProfesor'));
            if(mod) mod.hide();
            cargarTablaProfesoresAdmin();
            alert("✅ " + data.message);
        } else {
            alert("❌ " + data.message);
        }
    });
}