// ==========================================
// MÓDULO ALUMNO: INSCRIPCIÓN A ETS
// Vista: vistasAlumno/alumno_inscripcion.php
// ==========================================

// Carga la tabla de ETS disponibles desde la BD
function cargarETSDisponibles() {
    const tbody = document.getElementById('tbody-ets-alumno');
    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center py-4 text-muted">
                <div class="spinner-border spinner-border-sm me-2"></div> Cargando exámenes disponibles...
            </td>
        </tr>`;

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

                // Badge de cupo
                const badgeCupo = sinCupo
                    ? `<span class="badge bg-danger-subtle text-danger">Lleno</span>`
                    : `<span class="badge bg-success-subtle text-success">${ets.cupo} disp.</span>`;

                // Botón de acción
                let btnAccion;
                if (yaInscrito) {
                    btnAccion = `<button class="btn btn-outline-success btn-sm rounded-pill px-3" disabled><i class="bi bi-check-circle me-1"></i>Inscrito</button>`;
                } else if (sinCupo) {
                    btnAccion = `<button class="btn btn-secondary btn-sm rounded-pill px-3" disabled>Agotado</button>`;
                } else {
                    btnAccion = `
                        <button class="btn btn-success btn-sm rounded-pill px-3 btn-inscribir-ets"
                                data-id="${ets.id_examen}" data-materia="${ets.materia}">
                            Inscribirme
                        </button>`;
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

            // Eventos de los botones "Inscribirme"
            tbody.querySelectorAll('.btn-inscribir-ets').forEach(btn => {
                btn.addEventListener('click', function () {
                    inscribirAlumnoETS(this);
                });
            });
        })
        .catch(() => {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">No se pudo conectar con el servidor.</td></tr>`;
        });
}

// Envía la solicitud de inscripción al servidor
function inscribirAlumnoETS(boton) {
    const idExamen = boton.getAttribute('data-id');
    const materia = boton.getAttribute('data-materia');

    if (!confirm(`¿Confirmas tu inscripción al ETS de "${materia}"?\nDespués deberás subir tu comprobante de pago.`)) {
        return;
    }

    const htmlOriginal = boton.innerHTML;
    boton.disabled = true;
    boton.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Inscribiendo...';

    fetch('/php/endpoints/inscribir.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_examen: idExamen })
    })
        .then(res => res.json())
        .then(datos => {
            if (datos.status === 'success') {
                alert("✅ " + (datos.message || "¡Inscripción registrada con éxito!"));
                cargarETSDisponibles(); // Refrescar tabla (cupo y estado del botón)
            } else {
                alert("⚠️ " + datos.message);
                boton.disabled = false;
                boton.innerHTML = htmlOriginal;
            }
        })
        .catch(() => {
            alert("Ocurrió un error al comunicar con el servidor.");
            boton.disabled = false;
            boton.innerHTML = htmlOriginal;
        });
}

// Buscador / filtro por materia, academia o profesor
function inicializarFiltroETS() {
    const input = document.getElementById('buscador-ets');
    const btnFiltrar = document.getElementById('btn-filtrar-ets');
    if (!input) return;

    const filtrar = () => {
        const texto = input.value.toLowerCase().trim();
        document.querySelectorAll('#tbody-ets-alumno tr').forEach(fila => {
            if (fila.cells.length > 1) {
                fila.style.display = fila.innerText.toLowerCase().includes(texto) ? '' : 'none';
            }
        });
    };

    input.addEventListener('keyup', filtrar);
    if (btnFiltrar) btnFiltrar.addEventListener('click', filtrar);
}

// Punto de entrada de la vista (llamado desde app.js)
function iniciarVistaInscripcionETS() {
    cargarETSDisponibles();
    inicializarFiltroETS();
}

// ==========================================
// MÓDULO ALUMNO: MI KARDEX
// Vista: vistasAlumno/alumno_kardex.php
// ==========================================

// Convierte el número de semestre a etiqueta legible
function etiquetaSemestre(n) {
    n = parseInt(n);
    const sufijos = { 1: '1er', 2: '2do', 3: '3er' };
    return (sufijos[n] || `${n}º`) + ' Semestre';
}

// Carga el kardex del alumno en sesión
function cargarMiKardex() {
    const tbody = document.getElementById('tbody-kardex-alumno');
    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="5" class="text-center py-4 text-muted">
                <div class="spinner-border spinner-border-sm me-2"></div> Cargando tu kardex...
            </td>
        </tr>`;

    fetch('/php/endpoints/obtener_mi_kardex.php')
        .then(res => res.json())
        .then(datos => {
            if (datos.status !== 'success') {
                tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">Error: ${datos.message}</td></tr>`;
                return;
            }

            if (datos.data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">Aún no tienes materias registradas en tu kardex.</td></tr>`;
                return;
            }

            tbody.innerHTML = '';
            datos.data.forEach(mat => {
                const calif = mat.calificacion === null ? null : parseFloat(mat.calificacion);
                const aprobada = calif !== null && calif >= 6.0;
                const textoCalif = calif === null ? 'NP' : (Number.isInteger(calif) ? calif : calif.toFixed(1));

                const celdaCalif = aprobada
                    ? `<td>${textoCalif}</td>`
                    : `<td class="text-danger fw-bold">${textoCalif}</td>`;

                const badge = aprobada
                    ? `<span class="badge bg-success-subtle text-success">Aprobada</span>`
                    : `<span class="badge bg-danger-subtle text-danger">Reprobada</span>`;

                tbody.innerHTML += `
                    <tr data-resultado="${aprobada ? 'aprobada' : 'reprobada'}">
                        <td class="ps-4 text-muted">${etiquetaSemestre(mat.semestre)}</td>
                        <td class="fw-bold">${mat.materia}</td>
                        ${celdaCalif}
                        <td>Ordinario</td>
                        <td class="text-center">${badge}</td>
                    </tr>`;
            });
        })
        .catch(() => {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">No se pudo conectar con el servidor.</td></tr>`;
        });
}

// Filtros: Mostrar Todas / Aprobadas / Reprobadas
function inicializarFiltrosKardex() {
    const botones = document.querySelectorAll('.btn-filtro-kardex');

    botones.forEach(btn => {
        btn.addEventListener('click', function () {
            // Estado visual del grupo de botones
            botones.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Filtrar filas según data-resultado
            const filtro = this.getAttribute('data-filtro');
            document.querySelectorAll('#tbody-kardex-alumno tr').forEach(fila => {
                if (fila.cells.length <= 1) return; // filas de mensaje/carga
                const resultado = fila.getAttribute('data-resultado');
                fila.style.display = (filtro === 'todas' || resultado === filtro) ? '' : 'none';
            });
        });
    });
}

// Punto de entrada de la vista (llamado desde app.js)
function iniciarVistaKardex() {
    cargarMiKardex();
    inicializarFiltrosKardex();
    // Nota: el botón "Imprimir Kardex" (#btn-imprimir-kardex) queda deshabilitado
    // a propósito; su diseño está pendiente de definirse.
}
