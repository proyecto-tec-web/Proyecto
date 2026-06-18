// =================================================================
// MÓDULO ALUMNO: SISTEMA INTEGRAL (Dashboard, ETS, Kardex, Revisiones)
// =================================================================
console.log('ALUMNO.JS CARGADO CORRECTAMENTE');

// ==========================================
// 1. MÓDULO: DASHBOARD (INICIO)
// ==========================================
function iniciarDashboardAlumno() {
    fetch('/php/endpoints/obtener_dashboard_alumno.php')
    .then(response => response.json())
    .then(resultado => {
        if (resultado.status !== 'success') {
            console.error(resultado.message);
            return;
        }

        const resumen = resultado.resumen;
        document.getElementById('total-ets').textContent = resumen.ets_inscritos;
        document.getElementById('promedio-general').textContent = resumen.promedio;
        document.getElementById('materias-reprobadas').textContent = resumen.reprobadas;
        document.getElementById('estatus-academico').textContent = resumen.situacion;

        const tbody = document.getElementById('tabla-mis-ets');
        if (!tbody) return;

        if (resultado.ets.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No tienes ETS inscritos.</td></tr>`;
            return;
        }

        tbody.innerHTML = '';
        resultado.ets.forEach(ets => {
            let color = 'warning';
            if (ets.estado_pago === 'Pagado' || ets.estado_pago === 'Validado' || ets.estado_pago === 'Aprobado') {
                color = 'success';
            }

            tbody.innerHTML += `
                <tr>
                    <td class="ps-4 fw-semibold">${ets.materia}</td>
                    <td><span class="badge bg-light text-dark border">${ets.fecha}</span></td>
                    <td>${ets.hora}</td>
                    <td>
                        <span class="text-primary">${ets.salon}</span>
                        <small class="text-muted">(${ets.edificio})</small>
                    </td>
                    <td><span class="badge bg-${color} bg-opacity-10 text-${color}">${ets.estado_pago}</span></td>
                </tr>
            `;
        });
    })
    .catch(error => console.error(error));
}

// ==========================================
// 2. MÓDULO: INSCRIPCIÓN A ETS
// ==========================================
function cargarETSDisponibles() {
    const tbody = document.getElementById('tbody-ets-alumno');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted"><div class="spinner-border spinner-border-sm me-2"></div> Cargando exámenes disponibles...</td></tr>`;

    fetch('/php/endpoints/obtener_ets_disponibles.php')
        .then(res => res.json())
        .then(datos => {
            if (datos.status !== 'success') {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Error: ${datos.message}</td></tr>`;
                return;
            }

            if (datos.data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">Por el momento no hay exámenes de ETS abiertos.</td></tr>`;
                return;
            }

            tbody.innerHTML = '';
            datos.data.forEach(ets => {
                const sinCupo = parseInt(ets.cupo) <= 0;
                const yaInscrito = parseInt(ets.ya_inscrito) > 0;

                const badgeCupo = sinCupo ? `<span class="badge bg-danger-subtle text-danger">Lleno</span>` : `<span class="badge bg-success-subtle text-success">${ets.cupo} disp.</span>`;

                let btnAccion;
                if (yaInscrito) {
                    btnAccion = `<button class="btn btn-outline-success btn-sm rounded-pill px-3" disabled><i class="bi bi-check-circle me-1"></i>Inscrito</button>`;
                } else if (sinCupo) {
                    btnAccion = `<button class="btn btn-secondary btn-sm rounded-pill px-3" disabled>Agotado</button>`;
                } else {
                    btnAccion = `<button class="btn btn-success btn-sm rounded-pill px-3 btn-inscribir-ets" data-id="${ets.id_examen}" data-materia="${ets.materia}">Inscribirme</button>`;
                }

                tbody.innerHTML += `
                    <tr>
                        <td class="ps-4 fw-bold">${ets.materia}<small class="text-muted d-block fw-normal">${ets.academia}</small></td>
                        <td>${ets.fecha} - ${ets.hora}</td>
                        <td>${ets.profesor}</td>
                        <td><span class="text-primary fw-medium">${ets.salon}</span><small class="text-muted d-block">${ets.edificio}</small></td>
                        <td>${badgeCupo}</td>
                        <td class="pe-4 text-center">${btnAccion}</td>
                    </tr>`;
            });

            tbody.querySelectorAll('.btn-inscribir-ets').forEach(btn => {
                btn.addEventListener('click', function () { inscribirAlumnoETS(this); });
            });
        })
        .catch(() => { tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">No se pudo conectar con el servidor.</td></tr>`; });
}

// Envía la solicitud de inscripción al servidor
function inscribirAlumnoETS(boton) {
    const idExamen = boton.getAttribute('data-id');
    const materia = boton.getAttribute('data-materia');

    // 1. Reemplazamos el confirm() feo por un Swal.fire elegante
    Swal.fire({
        title: '¿Confirmar inscripción?',
        html: `Estás a punto de inscribirte al ETS de <b>${materia}</b>.<br><br><small>Después deberás subir tu comprobante de pago.</small>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#198754', // Color verde (success) de Bootstrap
        cancelButtonColor: '#6c757d',  // Color gris (secondary)
        confirmButtonText: '<i class="bi bi-check-circle"></i> Sí, inscribirme',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        // 2. Si el alumno dice que SÍ, ejecutamos el código de inscripción
        if (result.isConfirmed) {
            
            const htmlOriginal = boton.innerHTML;
            boton.disabled = true;
            boton.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Inscribiendo...';

            fetch('../../php/endpoints/inscribir.php', {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ id_examen: idExamen })
            })
            .then(res => res.json())
            .then(datos => {
                if (datos.status === 'success') {
                    // Alerta bonita de Éxito
                    Swal.fire({
                        title: '¡Inscrito!',
                        text: datos.message || "Tu inscripción ha sido registrada con éxito.",
                        icon: 'success',
                        confirmButtonColor: '#0d6efd' // Azul para combinar con tu panel
                    });
                    cargarETSDisponibles(); // Refrescamos la tabla
                } else {
                    // Alerta bonita de Advertencia
                    Swal.fire('Atención', datos.message, 'warning');
                    boton.disabled = false; 
                    boton.innerHTML = htmlOriginal;
                }
            })
            .catch(() => { 
                // Alerta bonita de Error
                Swal.fire('Error', 'Ocurrió un error al comunicar con el servidor.', 'error');
                boton.disabled = false; 
                boton.innerHTML = htmlOriginal; 
            });
        }
    });
}

function iniciarVistaInscripcionETS() {
    cargarETSDisponibles();
    inicializarFiltroETS(); // ¡Esta función no existía! Ya la agregamos abajo
}

// NUEVA FUNCIÓN: Buscador de ETS para el alumno
function inicializarFiltroETS() {
    const buscador = document.getElementById('buscador-ets');
    if (!buscador) return;

    buscador.addEventListener('keyup', function() {
        const texto = this.value.toLowerCase();
        const filas = document.querySelectorAll('#tbody-ets-alumno tr');

        filas.forEach(fila => {
            // Validamos que no oculte la fila de "Cargando..." o "No hay exámenes"
            if (fila.cells.length > 1) { 
                const contenido = fila.innerText.toLowerCase();
                fila.style.display = contenido.includes(texto) ? '' : 'none';
            }
        });
    });
}

// ==========================================
// 3. MÓDULO: MI KARDEX
// ==========================================
function etiquetaSemestre(n) {
    n = parseInt(n);
    const sufijos = { 1: '1er', 2: '2do', 3: '3er' };
    return (sufijos[n] || `${n}º`) + ' Semestre';
}

function cargarMiKardex() {
    const tbody = document.getElementById('tbody-kardex-alumno');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted"><div class="spinner-border spinner-border-sm me-2"></div> Cargando tu kardex...</td></tr>`;

    fetch('../../php/endpoints/obtener_mi_kardex.php')
        .then(res => res.json())
        .then(datos => {
            if (datos.status !== 'success') { tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">Error: ${datos.message}</td></tr>`; return; }
            if (datos.data.length === 0) { tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">Aún no tienes materias registradas en tu kardex.</td></tr>`; return; }

            tbody.innerHTML = '';
            datos.data.forEach(mat => {
                const calif = mat.calificacion === null ? null : parseFloat(mat.calificacion);
                const aprobada = calif !== null && calif >= 6.0;
                const textoCalif = calif === null ? 'NP' : (Number.isInteger(calif) ? calif : calif.toFixed(1));

                const celdaCalif = aprobada ? `<td>${textoCalif}</td>` : `<td class="text-danger fw-bold">${textoCalif}</td>`;
                const badge = aprobada ? `<span class="badge bg-success-subtle text-success">Aprobada</span>` : `<span class="badge bg-danger-subtle text-danger">Reprobada</span>`;

                tbody.innerHTML += `
                    <tr data-resultado="${aprobada ? 'aprobada' : 'reprobada'}">
                        <td class="ps-4 text-muted">${etiquetaSemestre(mat.semestre)}</td>
                        <td class="fw-bold">${mat.materia}</td>
                        ${celdaCalif}
                        <td>Ordinario</td>
                        <td class="text-center">${badge}</td>
                    </tr>`;
            });
        }).catch(() => { tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">No se pudo conectar con el servidor.</td></tr>`; });
}

function inicializarFiltrosKardex() {
    const botones = document.querySelectorAll('.btn-filtro-kardex');
    botones.forEach(btn => {
        btn.addEventListener('click', function () {
            botones.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const filtro = this.getAttribute('data-filtro');
            document.querySelectorAll('#tbody-kardex-alumno tr').forEach(fila => {
                if (fila.cells.length <= 1) return; 
                const resultado = fila.getAttribute('data-resultado');
                fila.style.display = (filtro === 'todas' || resultado === filtro) ? '' : 'none';
            });
        });
    });
}

function iniciarVistaKardex() {
    if (typeof cargarMiKardex === 'function') cargarMiKardex();
    if (typeof inicializarFiltrosKardex === 'function') inicializarFiltrosKardex();

    const btnTodas = document.querySelector('.btn-group .btn-outline-secondary');
    const btnAprobadas = document.querySelector('.btn-group .btn-outline-success');
    const btnReprobadas = document.querySelector('.btn-group .btn-outline-danger');
    const btnImprimir = document.querySelector('.btn-outline-dark');
    const filas = document.querySelectorAll('#tabla-kardex tr[data-estado]');

    function filtrarKardex(tipo, botonClickeado) {
        [btnTodas, btnAprobadas, btnReprobadas].filter(btn => btn).forEach(btn => btn.classList.remove('active'));
        if (botonClickeado) botonClickeado.classList.add('active');

        filas.forEach(fila => {
            const estadoMateria = fila.dataset.estado;
            if (tipo === 'todas' || (tipo === 'aprobadas' && estadoMateria === 'aprobada') || (tipo === 'reprobadas' && estadoMateria === 'reprobada')) {
                fila.style.display = '';
            } else {
                fila.style.display = 'none';
            }
        });
    }

    if (btnTodas) btnTodas.addEventListener('click', () => filtrarKardex('todas', btnTodas));
    if (btnAprobadas) btnAprobadas.addEventListener('click', () => filtrarKardex('aprobadas', btnAprobadas));
    if (btnReprobadas) btnReprobadas.addEventListener('click', () => filtrarKardex('reprobadas', btnReprobadas));
    if (btnImprimir) btnImprimir.addEventListener('click', () => window.print());
}

// ==========================================
// 4. MÓDULO: PETICIONES DE REVISIÓN
// ==========================================
function iniciarVistaRevisionesAlumno() {
    cargarHistorialRevisiones();
    cargarExamenesParaRevision();
}

function cargarHistorialRevisiones() {
    const tbody = document.getElementById('tbody-mis-revisiones');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4"><div class="spinner-border spinner-border-sm me-2"></div>Cargando historial...</td></tr>`;

    fetch('/php/endpoints/obtener_revisiones_alumno.php')
        .then(res => res.json())
        .then(datos => {
            tbody.innerHTML = '';
            if (datos.status !== 'success' || datos.data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Aún no has solicitado ninguna revisión de examen.</td></tr>`;
                return;
            }

            datos.data.forEach(rev => {
                let badgeEstado = '';
                let infoCita = '<span class="text-muted small fst-italic">Por definir</span>';
                
                // 1. Preparamos el HTML de la Justificación del Alumno con botón "Leer completo"
                // Usamos encodeURIComponent para evitar que saltos de línea rompan el HTML
                const motivoCodificado = encodeURIComponent(rev.motivo_alumno || '');
                let htmlMotivo = `
                    <div style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="Haz clic en Leer completo para ver más">
                        ${rev.motivo_alumno}
                    </div>
                    <button class="btn btn-link btn-sm p-0 text-decoration-none fw-bold" style="font-size: 0.8rem;" onclick="mostrarDetalleTexto('Mi Justificación', '${motivoCodificado}')">
                        <i class="bi bi-eye"></i> Leer completo
                    </button>
                `;

                // 2. Preparamos las notas del profesor por defecto
                let htmlNotas = '<span class="text-muted small fst-italic">En espera...</span>';

                if (rev.estado === 'Pendiente') {
                    badgeEstado = `<span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle"><i class="bi bi-hourglass-split me-1"></i> Pendiente</span>`;
                } else if (rev.estado === 'Agendada') {
                    badgeEstado = `<span class="badge bg-info-subtle text-info border border-info-subtle"><i class="bi bi-calendar-event me-1"></i> Cita Agendada</span>`;
                    infoCita = `<strong>${rev.fecha_cita}</strong><br><small class="text-muted"><i class="bi bi-geo-alt-fill text-danger"></i> ${rev.lugar_cita}</small>`;
                } else if (rev.estado === 'Completada') {
                    badgeEstado = `<span class="badge bg-success-subtle text-success border border-success-subtle"><i class="bi bi-check-circle me-1"></i> Resuelto</span>`;
                    infoCita = `<strong>${rev.fecha_cita || '-'}</strong><br><small class="text-muted">${rev.lugar_cita || '-'}</small>`;
                    
                    // Si está completada, mostramos las notas con el botón
                    const notasCodificadas = encodeURIComponent(rev.notas_profesor || '');
                    htmlNotas = `
                        <div style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="Haz clic en Leer completo para ver más">
                            ${rev.notas_profesor}
                        </div>
                        <button class="btn btn-link btn-sm p-0 text-decoration-none fw-bold text-success" style="font-size: 0.8rem;" onclick="mostrarDetalleTexto('Notas del Profesor', '${notasCodificadas}')">
                            <i class="bi bi-eye"></i> Leer completo
                        </button>
                    `;
                }

                tbody.innerHTML += `
                    <tr>
                        <td class="fw-bold text-secondary ps-4">#REV-${rev.id_peticion}</td>
                        <td class="fw-semibold">${rev.materia}</td>
                        <td class="text-muted small">${htmlMotivo}</td>
                        <td>${infoCita}</td>
                        <td>${htmlNotas}</td>
                        <td class="text-center">${badgeEstado}</td>
                    </tr>
                `;
            });
        })
        .catch(() => { tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Error al conectar con el servidor.</td></tr>`; });
}

function cargarExamenesParaRevision() {
    const select = document.getElementById('select-examen-revision');
    if (!select) return;

    fetch('/php/endpoints/obtener_examenes_recientes_alumno.php')
        .then(res => res.json())
        .then(datos => {
            select.innerHTML = '<option value="" selected disabled>Selecciona el examen a revisar...</option>';
            if (datos.status === 'success' && datos.data.length > 0) {
                datos.data.forEach(ex => {
                    select.innerHTML += `<option value="${ex.id_inscripcion}">${ex.materia} (Calificación: ${ex.calificacion || 'Sin asentar'})</option>`;
                });
            } else {
                select.innerHTML = '<option value="" disabled>No tienes exámenes recientes disponibles para revisión</option>';
            }
        });
}

function enviarPeticionRevision() {
    const idInscripcion = document.getElementById('select-examen-revision').value;
    const motivo = document.getElementById('motivo-revision').value.trim();

    if (!idInscripcion || motivo.length < 15) {
        alert("⚠️ Por favor selecciona un examen y redacta una justificación de al menos 15 caracteres.");
        return;
    }

    const btn = document.getElementById('btn-enviar-revision');
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Enviando...`;

    fetch('/php/endpoints/crear_peticion_revision_alumno.php', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id_inscripcion: idInscripcion, motivo: motivo })
    })
    .then(res => res.json())
    .then(datos => {
        if (datos.status === 'success') {
            alert("✅ Petición enviada correctamente. Tu profesor la revisará a la brevedad.");
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalNuevaRevision'));
            if(modal) modal.hide();
            document.getElementById('form-nueva-revision').reset();
            cargarHistorialRevisiones(); 
            cargarExamenesParaRevision(); 
        } else {
            alert("Error: " + datos.message);
        }
        btn.disabled = false; btn.innerHTML = `<i class="bi bi-send me-1"></i> Enviar Petición`;
    })
    .catch(() => { alert("Ocurrió un error de conexión."); btn.disabled = false; btn.innerHTML = `<i class="bi bi-send me-1"></i> Enviar Petición`; });
}
// ==========================================
// FUNCIÓN AUXILIAR: VER TEXTOS LARGOS EN MODAL
// ==========================================
window.mostrarDetalleTexto = function(titulo, textoCodificado) {
    // Decodificamos el texto para recuperar los espacios, acentos y saltos de línea
    const textoReal = decodeURIComponent(textoCodificado);
    
    Swal.fire({
        title: titulo,
        html: `
            <div class="text-start bg-light p-3 rounded border mt-3" 
                 style="max-height: 300px; overflow-y: auto; white-space: pre-wrap; font-size: 15px; color: #333;">
                ${textoReal}
            </div>
        `,
        icon: 'info',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#0d6efd'
    });
};
