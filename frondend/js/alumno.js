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

    fetch('../../php/endpoints/obtener_ets_disponibles.php')
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

    fetch('../../php/endpoints/inscribir.php', {
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

    fetch('../../php/endpoints/obtener_mi_kardex.php')
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
// =================================================================
// MÓDULO ALUMNO: MI KARDEX (LÓGICA FALTANTE)
// =================================================================
function iniciarVistaKardex() {
    // 1. Capturamos los botones usando sus clases
    const btnTodas = document.querySelector('.btn-group .btn-outline-secondary');
    const btnAprobadas = document.querySelector('.btn-group .btn-outline-success');
    const btnReprobadas = document.querySelector('.btn-group .btn-outline-danger');
    const btnImprimir = document.querySelector('.bi-printer').closest('button');
    
    // 2. Capturamos todas las filas de la tabla
    const filas = document.querySelectorAll('.table tbody tr');

    // 3. Función maestra para filtrar
    function filtrarKardex(tipo, botonClickeado) {
        // Le quitamos el sombreado gris (active) a todos los botones
        [btnTodas, btnAprobadas, btnReprobadas].forEach(btn => btn.classList.remove('active'));
        // Se lo ponemos solo al que presionaste
        botonClickeado.classList.add('active');

        // Revisamos fila por fila
        filas.forEach(fila => {
            // Sacamos el texto de la última columna (Aprobada o Reprobada)
            const estadoMateria = fila.cells[4].innerText.trim().toLowerCase();
            
            if (tipo === 'todas') {
                fila.style.display = ''; // Mostrar todo
            } else if (tipo === 'aprobadas' && estadoMateria === 'aprobada') {
                fila.style.display = ''; // Mostrar solo aprobadas
            } else if (tipo === 'reprobadas' && estadoMateria === 'reprobada') {
                fila.style.display = ''; // Mostrar solo reprobadas
            } else {
                fila.style.display = 'none'; // Ocultar las demás
            }
        });
    }

    // 4. Conectamos los clics a los botones
    if (btnTodas) btnTodas.addEventListener('click', () => filtrarKardex('todas', btnTodas));
    if (btnAprobadas) btnAprobadas.addEventListener('click', () => filtrarKardex('aprobadas', btnAprobadas));
    if (btnReprobadas) btnReprobadas.addEventListener('click', () => filtrarKardex('reprobadas', btnReprobadas));

    // 5. Botón de Imprimir
    if (btnImprimir) {
        btnImprimir.addEventListener('click', () => {
            window.print();
        });
    }
}
// =================================================================
// MÓDULO ALUMNO: INSCRIBIR ETS (LÓGICA FALTANTE)
// =================================================================
function iniciarVistaInscripcionETS() {
    // 1. Lógica del Buscador y Botón Filtrar
    const inputBuscador = document.querySelector('input[placeholder="Buscar por materia o profesor..."]');
    const btnFiltrar = document.querySelector('.btn-primary'); // Asumiendo que "Filtrar" es el botón azul
    const filasExamenes = document.querySelectorAll('table tbody tr');

    function filtrarTablaExamenes() {
        if (!inputBuscador) return;
        
        const textoBusqueda = inputBuscador.value.toLowerCase();

        filasExamenes.forEach(fila => {
            // Buscamos en la columna de Materia (índice 0) y Profesor (índice 2)
            const materia = fila.cells[0].innerText.toLowerCase();
            const profesor = fila.cells[2].innerText.toLowerCase();

            // Si el texto coincide con la materia o el profesor, mostramos la fila
            if (materia.includes(textoBusqueda) || profesor.includes(textoBusqueda)) {
                fila.style.display = '';
            } else {
                fila.style.display = 'none';
            }
        });
    }

    // El buscador se activa tanto al escribir como al presionar el botón
    if (inputBuscador) {
        inputBuscador.addEventListener('keyup', filtrarTablaExamenes);
    }
    if (btnFiltrar) {
        btnFiltrar.addEventListener('click', (e) => {
            e.preventDefault(); // Evita que la página se recargue
            filtrarTablaExamenes();
        });
    }

    // 2. Lógica de los botones "Inscribirme"
    const botonesInscribir = document.querySelectorAll('table tbody .btn-success'); // Asumiendo que son los verdes

    botonesInscribir.forEach(btn => {
        btn.addEventListener('click', function() {
            // Sacamos los datos de la fila a la que pertenece el botón
            const fila = this.closest('tr');
            const materia = fila.cells[0].innerText.trim();
            const fecha = fila.cells[1].innerText.trim();

            // Preguntamos al usuario si está seguro
            if (confirm(`¿Estás seguro de que deseas inscribirte al ETS de ${materia} programado para el ${fecha}?`)) {
                
                // Cambiamos el estado del botón a "Cargando"
                const botonOriginal = this.innerHTML;
                this.disabled = true;
                this.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Procesando...';

                // Simulamos una petición al servidor (esto se conectará al PHP real después)
                setTimeout(() => {
                    alert(`¡Éxito! Has quedado inscrito en el ETS de ${materia}.`);
                    
                    // Cambiamos el botón para que ya no se pueda presionar de nuevo
                    this.className = 'btn btn-secondary btn-sm disabled';
                    this.innerText = 'Inscrito';
                }, 800); // Tarda menos de un segundo en responder
            }
        });
    });
}
