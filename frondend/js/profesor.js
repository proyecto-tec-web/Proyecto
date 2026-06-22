// =================================================================
// MÓDULO PROFESOR: SISTEMA INTEGRAL (Dashboard, ETS, Revisiones)
// =================================================================
console.log('PROFESOR.JS CARGADO CORRECTAMENTE');

// ==========================================
// MÓDULO PROFESOR: DASHBOARD Y KPIs
// Vista: vistasProfesor/dashboard_profesor.php
// ==========================================

function cargarKPIsProfesor() {
    console.log("¡La función cargarKPIsProfesor sí se está ejecutando!"); 
    
    // --- NUEVO: Saludo Dinámico Personalizado al regresar a la vista ---
    setTimeout(() => {
        const tituloEl = document.getElementById('titulo-seccion');
        if (tituloEl) {
            const nombre = tituloEl.getAttribute('data-nombre') || 'Profesor';
            const hora = new Date().getHours();
            
            let saludo = "buenas noches";
            if (hora >= 5 && hora < 12) saludo = "buenos días";
            else if (hora >= 12 && hora < 19) saludo = "buenas tardes";
            
            // Construimos: ¡Bienvenido, Nombre! Buenos días.
            tituloEl.innerText = `¡Bienvenido, Profesor ${nombre}! ${saludo.charAt(0).toUpperCase() + saludo.slice(1)}.`;
        }
    }, 50); // El retraso de 50ms asegura que se ejecute después del enrutador de app.js

    fetch('/php/endpoints/obtener_kpis_profesor.php')
        .then(res => res.json())
        .then(datos => {
            console.log("Respuesta de la Base de Datos:", datos); 
            
            if (datos.status === 'success') {
                document.getElementById('kpi-examenes-prof').innerText = datos.data.total_examenes;
                document.getElementById('kpi-alumnos-prof').innerText = datos.data.total_alumnos;
                document.getElementById('kpi-pendientes-prof').innerText = datos.data.examenes_calificados;
            } else {
                console.error("Error del servidor:", datos.message);
                // Si hay error, quitamos los spinners y ponemos un aviso
                document.getElementById('kpi-examenes-prof').innerText = "Error";
                document.getElementById('kpi-alumnos-prof').innerText = "Error";
                document.getElementById('kpi-pendientes-prof').innerText = "Error";
            }
            pintarGraficaRendimiento(); // Pintamos la gráfica aquí para asegurarnos de que los datos ya estén cargados
        }).catch(err => console.error("Error de conexión:", err));
}

// ==========================================
// MÓDULO PROFESOR: MIS EXÁMENES ETS
// Vista: vistasProfesor/mis_examenes.php
// ==========================================

function cargarMisExamenes() {
    console.log("¡La función cargarMisExamenes sí se está ejecutando!");
    const tbodyActivos = document.getElementById('tbody-examenes-activos');
    const tbodyHistorial = document.getElementById('tbody-examenes-historial');
    
    // Si no estamos en esta vista, no hacemos nada
    if (!tbodyActivos || !tbodyHistorial) return;

    tbodyActivos.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4"><div class="spinner-border spinner-border-sm me-2"></div>Cargando exámenes...</td></tr>`;
    tbodyHistorial.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4"><div class="spinner-border spinner-border-sm me-2"></div>Cargando historial...</td></tr>`;

    fetch('/php/endpoints/obtener_examenes_profesor.php')
        .then(res => res.json())
        .then(datos => {
            if (datos.status === 'success') {
                tbodyActivos.innerHTML = '';
                tbodyHistorial.innerHTML = '';

                let conteoActivos = 0;
                let conteoHistorial = 0;

                datos.data.forEach(ex => {
                    let colorBadge = (ex.estado === 'Programado') ? 'primary' : 
                                     (ex.estado === 'Abierto' ? 'success' : 
                                     (ex.estado === 'Calificado' ? 'info' : 'secondary'));
                    
                    let botonAccion = ''; 
                    let botonImprimir = '';
                    let botonCalendar = ''; 

                    // --- INICIO MAGIA GOOGLE CALENDAR ---
                    let fechaLimpia = ex.fecha.replace(/-/g, ''); 
                    let hrInicio = ex.hora_inicio.replace(/:/g, '').substring(0, 6); 
                    let hrFin = ex.hora_fin.replace(/:/g, '').substring(0, 6);
                    
                    if(hrInicio.length === 4) hrInicio += '00';
                    if(hrFin.length === 4) hrFin += '00';
                    
                    let datesCal = `${fechaLimpia}T${hrInicio}/${fechaLimpia}T${hrFin}`;
                    let titleCal = encodeURIComponent(`Examen ETS: ${ex.materia}`);
                    let descCal = encodeURIComponent(`Evaluación oficial a Título de Suficiencia.\nID Examen: #${ex.id_examen}`);
                    let locCal = encodeURIComponent(ex.salon);
                    let urlCal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titleCal}&dates=${datesCal}&details=${descCal}&location=${locCal}`;

                    botonCalendar = `<a href="${urlCal}" target="_blank" class="btn btn-outline-success btn-sm rounded-pill px-3 ms-2 shadow-sm" title="Agendar en Google Calendar"><i class="bi bi-calendar-plus"></i></a>`;
                    // --- FIN MAGIA GOOGLE CALENDAR ---

                    if (ex.estado === 'Abierto' || ex.estado === 'Cerrado' || ex.estado === 'Calificado') {
                        let textoBtn = '<i class="bi bi-list-check me-1"></i> Ver Lista';
                        let claseBtn = 'btn-outline-primary';
                        
                        if (ex.estado === 'Cerrado') {
                            textoBtn = '<i class="bi bi-pencil-square me-1"></i> Calificar';
                            claseBtn = 'btn-primary';
                        } else if (ex.estado === 'Calificado') {
                            textoBtn = '<i class="bi bi-check-circle me-1"></i> Ver Acta';
                            claseBtn = 'btn-info text-white fw-bold';
                        }
                        
                        let btnPrincipal = `<button class="btn ${claseBtn} btn-sm rounded-pill px-3" onclick="abrirModalCalificar(${ex.id_examen}, '${ex.materia}', '${ex.estado}')">${textoBtn}</button>`;
                        botonImprimir = `<button class="btn btn-outline-dark btn-sm rounded-pill px-3 ms-2 shadow-sm" onclick="imprimirPaseDeLista(${ex.id_examen})" title="Imprimir Pase de Lista Físico"><i class="bi bi-printer"></i></button>`;
                        
                        // Si el examen ya está 'Calificado', quitamos el botón de Calendar
                        let mostrarCalendar = (ex.estado === 'Calificado') ? '' : ` ${botonCalendar}`;
                        
                        botonAccion = `<div class="d-flex justify-content-end align-items-center">${btnPrincipal} ${botonImprimir}${mostrarCalendar}</div>`;
                    
                    } else if (ex.estado === 'Programado') {
                        botonAccion = `<div class="d-flex justify-content-end align-items-center"><span class="text-muted small me-3 fw-bold">Próximamente</span> ${botonCalendar}</div>`;
                    } else {
                        botonAccion = `<small class="text-muted">Espera a que abra</small>`;
                    }

                    let filaHTML = `
                        <tr>
                            <td class="fw-bold text-secondary">#${ex.id_examen}</td>
                            <td class="fw-semibold">${ex.materia}</td>
                            <td>
                                <div>${ex.fecha}</div>
                                <small class="text-muted">${ex.hora_inicio} - ${ex.hora_fin}</small>
                            </td>
                            <td>${ex.salon}</td>
                            <td><span class="badge bg-${colorBadge} bg-opacity-10 text-${colorBadge} border border-${colorBadge}-subtle px-3 py-2 rounded-pill">${ex.estado}</span></td>
                            <td class="text-end">${botonAccion}</td>
                        </tr>
                    `;

                    if (ex.estado === 'Calificado') {
                        tbodyHistorial.innerHTML += filaHTML;
                        conteoHistorial++;
                    } else {
                        tbodyActivos.innerHTML += filaHTML;
                        conteoActivos++;
                    }
                });

                if (conteoActivos === 0) {
                    tbodyActivos.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No tienes exámenes pendientes.</td></tr>`;
                }
                if (conteoHistorial === 0) {
                    tbodyHistorial.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Aún no tienes exámenes calificados en tu historial.</td></tr>`;
                }

            } else {
                tbodyActivos.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">${datos.message}</td></tr>`;
                tbodyHistorial.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">${datos.message}</td></tr>`;
            }
        })
        .catch(err => {
            console.error(err);
            let errorMsg = `<tr><td colspan="6" class="text-center text-danger py-4">Error al conectar con el servidor.</td></tr>`;
            tbodyActivos.innerHTML = errorMsg;
            tbodyHistorial.innerHTML = errorMsg;
        });
}

// ==========================================
// MÓDULO PROFESOR: LISTA DE ALUMNOS (MODAL)
// Vista: vistasProfesor/mis_examenes.php (Modal)
// ==========================================

let idExamenActual = null;
let materiaActual = null;

function abrirModalCalificar(idExamen, materia, estado) {
    console.log("1. Botón clickeado. ID Examen:", idExamen);
    
    idExamenActual = idExamen;
    materiaActual = materia;
    
    const modalLabel = document.getElementById('modalCalificarLabel');
    const tbodyAlumnos = document.getElementById('tbody-alumnos-examen');
    const btnGuardar = document.getElementById('btn-guardar-calificaciones');
    const modalEl = document.getElementById('modalCalificar');

    // Validación por si no encuentra el HTML
    if (!modalEl || !tbodyAlumnos) {
        console.error("2. ¡ERROR! No encuentro el código HTML del modal (modalCalificar) en la página.");
        alert("Falta el código HTML del modal en la vista.");
        return;
    }

    modalLabel.innerText = `Lista de Alumnos: ${materia}`;
    
    // Si está Abierto o ya fue Calificado, ocultamos el botón de guardar
    if (estado === 'Abierto' || estado === 'Calificado') {
        btnGuardar.style.display = 'none';
    } else {
        btnGuardar.style.display = 'block';
    }

    tbodyAlumnos.innerHTML = `<tr><td colspan="3" class="text-center py-3"><span class="spinner-border spinner-border-sm text-primary"></span> Cargando lista...</td></tr>`;

    console.log("3. Buscando a los alumnos en el servidor...");
    
    fetch(`/php/endpoints/obtener_alumnos_examen.php?id_examen=${idExamen}`)
        .then(res => {
            console.log("4. Servidor respondió con HTTP:", res.status);
            return res.json();
        })
        .then(datos => {
            console.log("5. Datos recibidos de la base de datos:", datos);
            
            if (datos.status === 'success') {
                tbodyAlumnos.innerHTML = '';
                if (datos.data.length === 0) {
                    tbodyAlumnos.innerHTML = `<tr><td colspan="3" class="text-center py-3 text-muted">No hay alumnos inscritos/aprobados para este examen.</td></tr>`;
                } else {
                    datos.data.forEach(al => {
                        let califActual = al.calificacion !== null ? al.calificacion : '';
                        let disabledAttr = (estado === 'Abierto') ? 'disabled' : '';

                        tbodyAlumnos.innerHTML += `
                            <tr>
                                <td class="fw-bold">${al.boleta}</td>
                                <td>${al.apellido_paterno} ${al.apellido_materno} ${al.nombre}</td>
                                <td>
                                    <input type="number" class="form-control form-control-sm input-calificacion" 
                                        data-id-inscripcion="${al.id_inscripcion}" 
                                        value="${califActual}" 
                                        min="0" max="10" step="0.1" 
                                        placeholder="-" ${disabledAttr}>
                                </td>
                            </tr>
                        `;
                    });
                }
                // ¡AQUÍ ABRIMOS LA VENTANA!
                new bootstrap.Modal(modalEl).show();
                console.log("6. Modal abierto con éxito.");
                
            } else {
                // SI PHP NOS MANDA UN ERROR, LO MOSTRAMOS EN PANTALLA
                alert("El servidor devolvió un error: " + datos.message);
                console.error("Error interno del servidor:", datos);
            }
        })
        .catch(err => {
            // SI EL ARCHIVO PHP NO EXISTE O TIENE ERRORES DE SINTAXIS
            alert("Error crítico al procesar la respuesta. Mira la consola para más detalles.");
            console.error("6. Error crítico en el Fetch:", err);
        });
}

// ==========================================
// MÓDULO PROFESOR: PETICIONES DE REVISIÓN
// Vista: vistasProfesor/revisiones.php
// ==========================================

let validadorAgendarCita = null;
let validadorEjecutarRevision = null;

function inicializarJustValidateRevisiones() {
    console.log("Inicializando validadores de JustValidate para Revisiones...");
    // 1. Validador para el Modal de Agendar Cita
    const formCita = document.getElementById('form-agendar-cita');
    if (formCita) {
        if (validadorAgendarCita) validadorAgendarCita.destroy();
        
        validadorAgendarCita = new JustValidate('#form-agendar-cita', { validateBeforeSubmitting: true });
        validadorAgendarCita
            .addField('#cita-fecha', [{ rule: 'required', errorMessage: 'La fecha es obligatoria.' }])
            .addField('#cita-lugar', [{ rule: 'required', errorMessage: 'El lugar es obligatorio.' }])
            .onSuccess((event) => {
                event.preventDefault();
                
                // AQUÍ DECLARAMOS LAS VARIABLES CORRECTAMENTE PARA QUE NO DE ERROR
                const idPeticion = document.getElementById('cita-id-peticion').value;
                const fecha = document.getElementById('cita-fecha').value.replace('T', ' ') + ':00';
                const lugar = document.getElementById('cita-lugar').value.trim();

                fetch('/php/endpoints/agendar_cita_revision.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_peticion: idPeticion, fecha_cita: fecha, lugar_cita: lugar })
                })
                .then(res => res.json())
                .then(data => {
                    if(data.status === 'success') {
                        Swal.fire('¡Cita Agendada!', 'El alumno ha sido notificado.', 'success');
                        bootstrap.Modal.getInstance(document.getElementById('modalAgendarCita')).hide();
                        cargarRevisiones(); // Recarga la tabla en tiempo real
                    } else {
                        Swal.fire('Error', data.message, 'error');
                    }
                });
            });
    }

    // 2. Validador para el Modal de Ejecutar Revisión y Calificar
    const formRevision = document.getElementById('form-ejecutar-revision');
    if (formRevision) {
        if (validadorEjecutarRevision) validadorEjecutarRevision.destroy();

        validadorEjecutarRevision = new JustValidate('#form-ejecutar-revision', { validateBeforeSubmitting: true });
        validadorEjecutarRevision
            .addField('#rev-calif-nueva', [
                { rule: 'required', errorMessage: 'La calificación es obligatoria.' },
                { rule: 'minNumber', value: 0, errorMessage: 'Mínimo 0.' },
                { rule: 'maxNumber', value: 10, errorMessage: 'Máximo 10.' }
            ])
            .addField('#rev-notas', [
                { rule: 'required', errorMessage: 'Debes justificar el cambio.' },
                { rule: 'minLength', value: 15, errorMessage: 'Escribe al menos 15 caracteres.' }
            ])
            .onSuccess((event) => {
                event.preventDefault();
                
                const idPeticion = document.getElementById('rev-id-peticion').value;
                const califNueva = document.getElementById('rev-calif-nueva').value.trim();
                const notas = document.getElementById('rev-notas').value.trim();

                Swal.fire({
                    title: '¿Confirmar modificación?',
                    text: "Se alterará el Acta Oficial del alumno.",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#ffc107',
                    confirmButtonText: 'Sí, autorizo'
                }).then((result) => {
                    if (result.isConfirmed) {
                        fetch('/php/endpoints/ejecutar_revision.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id_peticion: idPeticion, calificacion_nueva: parseFloat(califNueva), notas: notas })
                        })
                        .then(res => res.json())
                        .then(data => {
                            if(data.status === 'success') {
                                Swal.fire('¡Acta Actualizada!', 'La modificación fue guardada.', 'success');
                                bootstrap.Modal.getInstance(document.getElementById('modalEjecutarRevision')).hide();
                                cargarRevisiones(); // Recarga la tabla en tiempo real
                            } else {
                                Swal.fire('Error', data.message, 'error');
                            }
                        });
                    }
                });
            });
    }
}

function cargarRevisiones() {
    console.log("Cargando peticiones de revisión para el profesor...");
    const tbody = document.getElementById('tbody-revisiones');
    if (!tbody) return;

    fetch('/php/endpoints/obtener_revisiones.php', { cache: 'no-store' })
        .then(res => res.json())
        .then(datos => {
            tbody.innerHTML = '';
            
            if (datos.status === 'error' || datos.data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No tienes peticiones de revisión.</td></tr>`;
                return;
            }

            datos.data.forEach(rev => {
                let badgeEstado = 'secondary';
                let botonAccion = '';

                // Limpiamos los datos para evitar que comillas rompan el HTML
                let califActual = rev.calificacion_actual !== null ? rev.calificacion_actual : 'S/C';
                let motivoSeguro = rev.motivo_alumno ? rev.motivo_alumno.replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/(\r\n|\n|\r)/gm, " ") : 'Sin motivo especificado';

                // Preparamos el HTML base del lugar y horario (Ya no le pegaremos el botón aquí)
                let htmlLugarHorario = `
                    <small><i class="bi bi-geo-alt-fill text-danger"></i> ${rev.salon || 'Por definir'}</small><br>
                    <small><i class="bi bi-clock-fill text-primary"></i> ${rev.horario || 'Por definir'}</small>
                `;

                if (rev.estado === 'Pendiente') {
                    badgeEstado = 'danger';
                    botonAccion = `<button class="btn btn-info btn-sm fw-bold shadow-sm text-dark" onclick="abrirModalAgendarCita(${rev.id_peticion}, '${rev.boleta} - ${rev.nombre}', '${califActual}', '${motivoSeguro}')"><i class="bi bi-calendar-event"></i> Agendar Cita</button>`;
                
                } else if (rev.estado === 'Agendada') {
                    
                    badgeEstado = 'warning';
                    
                    let btnCalificar = `<button class="btn btn-warning btn-sm fw-bold shadow-sm text-dark" onclick="abrirModalAsentarCalificacion(${rev.id_peticion}, ${rev.calificacion_actual})"><i class="bi bi-pencil-square"></i> Calificar</button>`;
                    let btnCalendar = '';
                
                    // --- INICIO MAGIA GOOGLE CALENDAR DOCENTE ---
                    if (rev.horario) {
                        let horarioLimpio = rev.horario.replace(' | ', ' ');
                        let partes = horarioLimpio.split(' ');
                        
                        if (partes.length >= 2) {
                            let fechaStr = partes[0]; 
                            let horaStr = partes[1];  

                            let anio, mes, dia;
                            if (fechaStr.includes('/')) {
                                let fPartes = fechaStr.split('/');
                                dia = fPartes[0].padStart(2, '0');
                                mes = fPartes[1].padStart(2, '0');
                                anio = fPartes[2];
                            } else {
                                let fPartes = fechaStr.split('-');
                                anio = fPartes[0];
                                mes = fPartes[1].padStart(2, '0');
                                dia = fPartes[2].padStart(2, '0');
                            }
                            let fechaLimpia = `${anio}${mes}${dia}`;

                            let hPartes = horaStr.split(':');
                            let hh = hPartes[0].padStart(2, '0');
                            let mm = hPartes[1].padStart(2, '0');
                            let ss = (hPartes[2] || '00').padStart(2, '0');
                            let hrInicio = `${hh}${mm}${ss}`;

                            let hrFinInt = parseInt(hh) + 1;
                            let hrFinStr = String(hrFinInt).padStart(2, '0');
                            if (hrFinInt >= 24) hrFinStr = "23"; 
                            let hrFin = `${hrFinStr}${mm}${ss}`;
                            
                            let datesCal = `${fechaLimpia}T${hrInicio}/${fechaLimpia}T${hrFin}`;
                            let titleCal = encodeURIComponent(`Revisión ETS: ${rev.materia} (${rev.boleta})`);
                            let descCal = encodeURIComponent(`Cita de revisión.\nAlumno: ${rev.nombre}\nBoleta: ${rev.boleta}\nFolio: #REV-${rev.id_peticion}`);
                            let locCal = encodeURIComponent(rev.salon || 'Por definir');
                            
                            let urlCal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titleCal}&dates=${datesCal}&details=${descCal}&location=${locCal}`;
                            
                            // Creamos el botón pero sin pegarlo al horario
                            btnCalendar = `<a href="${urlCal}" target="_blank" class="btn btn-outline-success btn-sm fw-bold shadow-sm" title="Agendar en mi Google Calendar"><i class="bi bi-calendar-plus"></i> Agendar</a>`;
                        }
                    }
                    // --- FIN MAGIA GOOGLE CALENDAR DOCENTE ---

                    // Agrupamos ambos botones en la columna de Acciones
                    if (btnCalendar !== '') {
                        botonAccion = `<div class="d-flex justify-content-end align-items-center gap-2">${btnCalendar} ${btnCalificar}</div>`;
                    } else {
                        botonAccion = btnCalificar;
                    }

                } else if (rev.estado === 'Completada') {
                    badgeEstado = 'success';
                    botonAccion = `<span class="text-success fw-bold"><i class="bi bi-check-all"></i> Resuelto</span>`;
                }

                tbody.innerHTML += `
                    <tr>
                        <td class="fw-bold text-secondary">#REV-${rev.id_peticion}</td>
                        <td>
                            <span class="fw-bold">${rev.boleta}</span><br>
                            <small class="text-muted">${rev.nombre}</small>
                        </td>
                        <td class="fw-semibold">${rev.materia}</td>
                        <td>
                            ${htmlLugarHorario}
                        </td>
                        <td><span class="badge bg-${badgeEstado}">${rev.estado}</span></td>
                        <td class="text-end">${botonAccion}</td>
                    </tr>
                `;
            });
        })
        .catch(err => {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Fallo al conectar con el servidor.</td></tr>`;
        });
        
    setTimeout(inicializarJustValidateRevisiones, 100);
}

// Abre Modal 1 (Cita) - Recibe calificación y motivo
window.abrirModalAgendarCita = function(idPeticion, alumnoInfo, califActual, motivo) {
    console.log("Abriendo Modal de Agendar Cita para la petición ID:", idPeticion);
    document.getElementById('cita-id-peticion').value = idPeticion;
    document.getElementById('cita-alumno-nombre').value = alumnoInfo;
    
    // Inyectamos la calificación y el motivo que me pediste
    document.getElementById('cita-calif-actual').value = califActual;
    document.getElementById('cita-motivo').value = motivo;
    
    // Limpiamos los campos de fecha y lugar
    const inputFecha = document.getElementById('cita-fecha');
    inputFecha.value = '';
    inputFecha.min = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    document.getElementById('cita-lugar').value = '';

    new bootstrap.Modal(document.getElementById('modalAgendarCita')).show();
};

// Abre Modal 2 (Calificar)
window.abrirModalAsentarCalificacion = function(idPeticion, califActual) {
    console.log("Abriendo Modal de Ejecutar Revisión para la petición ID:", idPeticion);
    document.getElementById('rev-id-peticion').value = idPeticion;
    document.getElementById('rev-calif-actual').value = (califActual !== null && califActual !== 'null') ? califActual : '0.0';
    
    document.getElementById('rev-calif-nueva').value = '';
    document.getElementById('rev-notas').value = '';

    new bootstrap.Modal(document.getElementById('modalEjecutarRevision')).show();
};

// ==========================================
// MÓDULO PROFESOR: GENERACIÓN DE DOCUMENTOS
// Vista: vistasProfesor/mis_examenes.php
// ==========================================

window.imprimirPaseDeLista = function(idExamen) {
    console.log("Generando pase de lista para el examen:", idExamen);
    window.open(`/php/endpoints/generar_pase_lista.php?id_examen=${idExamen}`, '_blank');
};

// ==========================================
// MÓDULO PROFESOR: GRÁFICAS DE RENDIMIENTO
// Vista: vistasProfesor/dashboard_profesor.php
// ==========================================

let miGraficaRendimiento = null;

function pintarGraficaRendimiento() {
    console.log("Pintando gráfica de rendimiento del profesor...");
    const canvas = document.getElementById('graficaRendimiento');
    if (!canvas) return; 

    fetch('/php/endpoints/obtener_estadisticas_profesor.php')
        .then(res => res.json())
        .then(datos => {
            if (datos.status !== 'success') return;

            const ctx = canvas.getContext('2d');
            
            // Inyectamos el promedio global en el HTML
            document.getElementById('promedioGlobalValor').textContent = datos.data.promedio_global;

            // Preparamos los arreglos para la gráfica
            const nombresMaterias = [];
            const porcentajesAprobados = [];
            const porcentajesReprobados = [];
            const contenedorPromedios = document.getElementById('promediosPorMateria');
            
            contenedorPromedios.innerHTML = ''; // Limpiamos contenedor

            // Si no hay materias calificadas aún
            if (datos.data.materias.length === 0) {
                nombresMaterias.push("Sin datos");
                porcentajesAprobados.push(0);
                porcentajesReprobados.push(0);
                contenedorPromedios.innerHTML = `<span class="text-muted">Empieza a calificar exámenes para ver tus estadísticas.</span>`;
            } else {
                // Procesamos cada materia
                datos.data.materias.forEach(mat => {
                    nombresMaterias.push(mat.materia);
                    
                    // Calculamos el porcentaje
                    let pctAprobado = 0;
                    let pctReprobado = 0;
                    if (mat.total_evaluados > 0) {
                        pctAprobado = ((mat.aprobados / mat.total_evaluados) * 100).toFixed(1);
                        pctReprobado = ((mat.reprobados / mat.total_evaluados) * 100).toFixed(1);
                    }
                    
                    porcentajesAprobados.push(pctAprobado);
                    porcentajesReprobados.push(pctReprobado);

                    // Agregamos el badge de promedio debajo de la gráfica
                    contenedorPromedios.innerHTML += `
                        <span class="badge bg-white text-dark border shadow-sm px-3 py-2 fs-6">
                            ${mat.materia}: <strong class="text-primary">${mat.promedio_materia}</strong>
                        </span>
                    `;
                });
            }

            // Destruimos la gráfica anterior si existía
            if (miGraficaRendimiento) {
                miGraficaRendimiento.destroy();
                console.log("Gráfica anterior destruida para evitar superposición.");
            }

            // Creamos la nueva gráfica de barras
            miGraficaRendimiento = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: nombresMaterias,
                    datasets: [
                        {
                            label: '% Aprobados',
                            data: porcentajesAprobados,
                            backgroundColor: '#198754', // Verde Bootstrap
                            borderRadius: 4
                        },
                        {
                            label: '% Reprobados',
                            data: porcentajesReprobados,
                            backgroundColor: '#dc3545', // Rojo Bootstrap
                            borderRadius: 4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100, // Fijamos la altura al 100%
                            ticks: {
                                callback: function(value) { return value + '%' }
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.dataset.label + ': ' + context.parsed.y + '%';
                                }
                            }
                        },
                        legend: { position: 'bottom' }
                    }
                }
            });
        })
        .catch(err => console.error("Error al cargar la gráfica:", err));
}

// ==========================================
// MÓDULO PROFESOR: FIRMA Y GUARDADO FINAL
// Vista: vistasProfesor/mis_examenes.php (Modal)
// ==========================================

function solicitarNIPParaGuardar(idExamen) {
    console.log("Solicitando NIP para guardar calificaciones del examen ID:", idExamen);
    Swal.fire({
        title: '<h3 style="font-family: \'Montserrat\', sans-serif; font-weight: bold; color: #004ec2;">Firma Electrónica</h3>',
        html: 'Por seguridad, ingresa tu <b>NIP de 4 dígitos</b> para asentar esta acta de forma definitiva.',
        input: 'password',
        // ¡LA MAGIA SUCEDE AQUÍ! Le decimos que se ancle al modal de calificaciones
        target: document.getElementById('modalCalificar'),
        inputAttributes: {
            maxlength: 4,
            autocapitalize: 'off',
            autocorrect: 'off',
            pattern: '[0-9]*',
            style: 'text-align: center; font-size: 24px; letter-spacing: 10px;'
        },
        showCancelButton: true,
        confirmButtonText: '<i class="bi bi-pen-fill me-1"></i> Firmar Acta',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#198754',
        showLoaderOnConfirm: true,
        preConfirm: (nip) => {
            if (!nip || nip.length !== 4) {
                Swal.showValidationMessage('El NIP debe ser de exactamente 4 dígitos');
                return false;
            }
            
            return fetch('/php/endpoints/verificar_nip.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nip: nip })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status !== 'success') {
                    throw new Error(data.message);
                }
                return true; 
            })
            .catch(error => {
                Swal.showValidationMessage(`Firma rechazada: ${error.message}`);
            });
        },
        allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
        if (result.isConfirmed) {
            // ¡Si la firma es correcta, ejecutamos el guardado real!
            ejecutarGuardadoFinal(idExamen);
        }
    });
}

// ==========================================
// MÓDULO PROFESOR: Guardar Calificaciones Definitivas
// Vista: vistasProfesor/mis_examenes.php
// ==========================================

function ejecutarGuardadoFinal(idExamen) {
    console.log("Ejecutando guardado final de calificaciones para el examen ID:", idExamen);
    const inputs = document.querySelectorAll('.input-calificacion');
    let calificaciones = [];

    inputs.forEach(input => {
        if (input.value.trim() !== '') {
            calificaciones.push({
                id_inscripcion: input.getAttribute('data-id-inscripcion'),
                calificacion: parseFloat(input.value)
            });
        }
    });

    if (calificaciones.length === 0) {
        Swal.fire('Advertencia', 'No has ingresado ninguna calificación', 'warning');
        return;
    }

    Swal.fire({
        title: 'Asentando Acta...',
        text: 'Guardando calificaciones definitivas.',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
    });

    fetch('/php/endpoints/guardar_calificaciones.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id_examen: idExamen,
            calificaciones: calificaciones
        })
    })
    .then(res => res.json())
    .then(datos => {
        if (datos.status === 'success') {
            Swal.fire({
                title: '¡Acta Cerrada!',
                text: 'Las calificaciones han sido registradas. ¿Deseas descargar tu acuse?',
                icon: 'success',
                showCancelButton: true,
                confirmButtonText: 'Descargar PDF',
                cancelButtonText: 'Cerrar',
                confirmButtonColor: '#004ec2'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Abrimos el generador de PDF en una nueva pestaña
                    window.open(`/php/endpoints/generar_acuse.php?id_examen=${idExamen}`, '_blank');
                }
                // Cerramos el modal y actualizamos tablas
                bootstrap.Modal.getInstance(document.getElementById('modalCalificar')).hide();
                cargarMisExamenes();
                cargarKPIsProfesor();
            });
        } else {
            Swal.fire('Error', datos.message, 'error');
        }
    })
    .catch(err => {
        console.error("Error al guardar:", err);
        Swal.fire('Error de conexión', 'Detalles: ' + err.message, 'error');
    });
}

// ==========================================
// MÓDULO PROFESOR: EXPORTACIÓN DE ACTAS CSV
// Vista: vistasProfesor/mis_examenes.php
// ==========================================

window.exportarActaCSV = function() {
    console.log("Iniciando exportación de acta a CSV para el examen ID:", idExamenActual);
    const filas = document.querySelectorAll('#tbody-alumnos-examen tr');
    
    // Si la tabla está vacía o solo tiene el mensaje de "No hay alumnos"
    if(filas.length === 0 || filas[0].cells.length === 1) {
        Swal.fire('Sin datos', 'No hay datos para exportar.', 'info');
        return;
    }

    // Agregamos BOM para acentos, título del acta, la materia y saltos de línea
    let csvContent = "\uFEFFACTA DE EXAMEN A TÍTULO DE SUFICIENCIA\n";
    csvContent += `Materia:, "${materiaActual}"\n\n`; 
    csvContent += "Boleta,Nombre Completo,Calificacion\n";

    filas.forEach(fila => {
        let boleta = fila.cells[0].innerText;
        let nombre = fila.cells[1].innerText;
        // Buscamos el input de la calificación. Si está vacío, ponemos 'S/C'
        let inputCalif = fila.cells[2].querySelector('input');
        let calificacion = (inputCalif && inputCalif.value.trim() !== '') ? inputCalif.value : 'S/C';
        
        csvContent += `"${boleta}","${nombre}","${calificacion}"\n`;
    });

    // Crear y descargar el archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    
    // Nombre del archivo dinámico reemplazando espacios por guiones bajos
    let nombreArchivoLimpio = materiaActual ? materiaActual.replace(/\s+/g, '_') : 'Materia';
    a.download = `Acta_${nombreArchivoLimpio}_ETS.csv`;
    
    a.click();
    URL.revokeObjectURL(url);
};

// ==========================================
// MÓDULO PROFESOR: BUSCADORES EN TIEMPO REAL
// Vista: vistasProfesor/mis_examenes.php
// ==========================================

function filtrarExamenes() {
    console.log("Ejecutando función de filtrado de exámenes en tiempo real...");
    // 1. Buscamos todas las barras de búsqueda en la vista
    const buscadores = document.querySelectorAll("#buscadorExamenes");
    let filtro = "";

    // 2. Revisamos cuál de las barras está visible en la pantalla actual
    buscadores.forEach(input => {
        // offsetParent !== null es un truco para saber si el elemento es visible
        if (input.offsetParent !== null) {
            filtro = input.value.toLowerCase();
        }
    });

    // 3. Obtenemos ambos cuerpos de tabla
    const tbodyActivos = document.getElementById("tbody-examenes-activos");
    const tbodyHistorial = document.getElementById("tbody-examenes-historial");
    
    const tablas = [];
    if (tbodyActivos) tablas.push(tbodyActivos);
    if (tbodyHistorial) tablas.push(tbodyHistorial);

    // 4. Aplicamos el filtro
    tablas.forEach(tbody => {
        const filas = tbody.getElementsByTagName("tr");

        for (let i = 0; i < filas.length; i++) {
            // Evitamos buscar en la fila vacía de "No tienes exámenes..."
            if (filas[i].getElementsByTagName("td").length > 1) {
                
                const contenidoFila = filas[i].textContent || filas[i].innerText;

                // Mostramos u ocultamos la fila según la búsqueda
                if (contenidoFila.toLowerCase().includes(filtro)) {
                    filas[i].style.display = ""; 
                } else {
                    filas[i].style.display = "none"; 
                }
            }
        }
    });
}

// ==========================================
// MÓDULO PROFESOR: BUSCADOR DE REVISIONES
// Vista: vistasProfesor/revisiones.php
// ==========================================

function filtrarRevisiones() {
    console.log("Ejecutando función de filtrado de revisiones en tiempo real...");
    const input = document.getElementById("buscadorRevisiones");
    if (!input) return; // Si no encuentra el buscador, se detiene
    
    const filtro = input.value.toLowerCase();
    const tabla = document.querySelector("table tbody"); 
    if (!tabla) return; 

    const filas = tabla.getElementsByTagName("tr");

    for (let i = 0; i < filas.length; i++) {
        const celdas = filas[i].getElementsByTagName("td");

        // Verificamos que la fila tenga al menos 5 columnas para evitar errores
        if (celdas.length >= 5) {
            // Extraemos el texto de las columnas de revisiones
            const folio = celdas[0].textContent || celdas[0].innerText;
            const alumno = celdas[1].textContent || celdas[1].innerText;
            const materia = celdas[2].textContent || celdas[2].innerText;
            const lugarHorario = celdas[3].textContent || celdas[3].innerText;
            const estado = celdas[4].textContent || celdas[4].innerText;

            // Unimos todo en un solo bloque de texto
            const contenidoFila = `${folio} ${alumno} ${materia} ${lugarHorario} ${estado}`.toLowerCase();

            // Evaluamos si coincide con la búsqueda
            if (contenidoFila.includes(filtro)) {
                filas[i].style.display = ""; 
            } else {
                filas[i].style.display = "none"; 
            }
        }
    }
}

// ==========================================
// MÓDULO PROFESOR: EXPORTAR TABLA A EXCEL
// Vista: vistasProfesor/mis_examenes.php
// ==========================================

function exportarExamenesAExcel() {
    console.log("Iniciando exportación de tabla a Excel...");
    const tabla = document.querySelector("table");
    if (!tabla) return;

    let filasCsv = [];
    
    // TRUCO PRO: Añadimos el BOM UTF-8 para que Excel reconozca los acentos (á, é, í...)
    const BOM = "\uFEFF";
    
    const filas = tabla.querySelectorAll("tr");
    
    for (let i = 0; i < filas.length; i++) {
        // REGLA 1: Si la fila está oculta por el buscador, NO la exportamos
        if (filas[i].style.display === "none") continue;
        
        const columnas = filas[i].querySelectorAll("th, td");
        let datosFila = [];
        
        // REGLA 2: Recorremos las columnas EXCEPTO la última (la de "Acciones")
        for (let j = 0; j < columnas.length - 1; j++) {
            let textoCelda = columnas[j].innerText.trim().replace(/(\r\n|\n|\r)/gm, " ");
            textoCelda = textoCelda.replace(/"/g, '""');
            datosFila.push(`"${textoCelda}"`);
        }
        
        // EL FIX: Cambiamos el ";" por "," para que tu Excel lo divida en columnas perfectas
        filasCsv.push(datosFila.join(","));
    }
    
    const contenidoCsv = BOM + filasCsv.join("\n");
    
    const blob = new Blob([contenidoCsv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", "Mis_Examenes_ETS_Docente.csv");
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
