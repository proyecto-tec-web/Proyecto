// =================================================================
// MÓDULO: PANEL DEL PROFESOR
// =================================================================

function cargarKPIsProfesor() {
    console.log("¡La función cargarKPIsProfesor sí se está ejecutando!"); // Pista 1
    // --- NUEVO: Saludo Dinámico al regresar a la vista ---
    setTimeout(() => {
        const tituloEl = document.getElementById('titulo-seccion');
        if (tituloEl) {
            const hora = new Date().getHours();
            let saludo = "buenas noches";
            if (hora >= 5 && hora < 12) saludo = "buenos días";
            else if (hora >= 12 && hora < 19) saludo = "buenas tardes";
            tituloEl.innerText = `¡Hola, ${saludo}!`;
        }
    }, 50); // El retraso de 50ms asegura que se ejecute después del enrutador de app.js

    fetch('/php/endpoints/obtener_kpis_profesor.php')
        .then(res => res.json())
        .then(datos => {
            console.log("Respuesta de la Base de Datos:", datos); // Pista 2
            
            if (datos.status === 'success') {
                document.getElementById('kpi-examenes-prof').innerText = datos.data.total_examenes;
                document.getElementById('kpi-alumnos-prof').innerText = datos.data.total_alumnos;
                document.getElementById('kpi-pendientes-prof').innerText = datos.data.pendientes_calificar;
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

function cargarMisExamenes() {
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
                        botonAccion = `<div class="d-flex justify-content-end align-items-center">${btnPrincipal} ${botonImprimir}</div>`;
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

                    // Filtramos: Si está calificado va al historial, si no, a pendientes
                    if (ex.estado === 'Calificado') {
                        tbodyHistorial.innerHTML += filaHTML;
                        conteoHistorial++;
                    } else {
                        tbodyActivos.innerHTML += filaHTML;
                        conteoActivos++;
                    }
                });

                // Mensajes por si las tablas están vacías
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
// LÓGICA DE CALIFICACIONES Y LISTAS
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

// Variable global para que no se duplique la validación si abrimos y cerramos la vista
let validadorRevision = null;

function inicializarJustValidateRevisiones() {
    const formRevision = document.getElementById('form-revision');
    if (!formRevision) return;

    // Limpiamos instancias anteriores
    if (validadorRevision) {
        validadorRevision.destroy();
    }

    // Inicializamos JustValidate
    validadorRevision = new JustValidate('#form-revision', {
        validateBeforeSubmitting: true,
    });

    // Definimos las reglas
    validadorRevision
        .addField('#rev-calif-nueva', [
            { rule: 'required', errorMessage: 'La calificación es obligatoria.' },
            { rule: 'minNumber', value: 0, errorMessage: 'La calificación mínima es 0.' },
            { rule: 'maxNumber', value: 10, errorMessage: 'La calificación máxima es 10.' }
        ])
        .addField('#rev-notas', [
            { rule: 'required', errorMessage: 'Debes justificar el cambio.' },
            { rule: 'minLength', value: 15, errorMessage: 'Escribe al menos 15 caracteres.' }
        ])
        .onSuccess((event) => {
            // Si JustValidate da luz verde, interceptamos el envío del form y lanzamos SweetAlert2
            event.preventDefault();

            const idPeticion = document.getElementById('rev-id-peticion').value;
            const idInscripcion = document.getElementById('rev-id-inscripcion').value;
            const califNueva = document.getElementById('rev-calif-nueva').value.trim();
            const notas = document.getElementById('rev-notas').value.trim();

            Swal.fire({
                title: '¿Confirmar modificación de Acta?',
                text: "Estás a punto de alterar una calificación oficial de forma irreversible.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ffc107',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, autorizo el cambio'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Petición al backend
                    fetch('/php/endpoints/ejecutar_revision.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_peticion: idPeticion,
                            id_inscripcion: idInscripcion,
                            calificacion_nueva: parseFloat(califNueva),
                            notas: notas
                        })
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.status === 'success') {
                            Swal.fire('¡Acta Actualizada!', 'La justificación fue guardada.', 'success');
                            bootstrap.Modal.getInstance(document.getElementById('modalRevision')).hide();
                            cargarRevisiones(); 
                        } else {
                            Swal.fire('Error del servidor', data.message, 'error');
                        }
                    });
                }
            });
        });
}
// --- MÓDULO REVISIONES ---
function cargarRevisiones() {
    console.log("¡Ejecutando cargarRevisiones!");
    const tbody = document.getElementById('tbody-revisiones');
    if (!tbody) return;

    // Iremos a buscar las revisiones a la base de datos
    fetch('/php/endpoints/obtener_revisiones.php')
        .then(res => res.json())
        .then(datos => {
            tbody.innerHTML = '';
            
            if (datos.status === 'error' || datos.data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No tienes peticiones de revisión pendientes.</td></tr>`;
                return;
            }

            datos.data.forEach(rev => {
                let badgeEstado = rev.estado === 'Completada' ? 'success' : 'warning';
                let botonAccion = '';

                if (rev.estado === 'Completada') {
                    botonAccion = `<span class="text-success fw-bold"><i class="bi bi-check-all"></i> Modificado</span>`;
                } else {
                    botonAccion = `<button class="btn btn-warning btn-sm fw-bold shadow-sm text-dark" onclick="abrirModalRevision(${rev.id_peticion}, ${rev.id_inscripcion}, '${rev.boleta} - ${rev.nombre}', ${rev.calificacion_actual})"><i class="bi bi-pencil-square"></i> Revisar</button>`;
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
                            <small><i class="bi bi-geo-alt-fill text-danger"></i> ${rev.salon}</small><br>
                            <small><i class="bi bi-clock-fill text-primary"></i> ${rev.horario}</small>
                        </td>
                        <td><span class="badge bg-${badgeEstado} text-dark">${rev.estado}</span></td>
                        <td class="text-end">${botonAccion}</td>
                    </tr>
                `;
            });
        })
        .catch(err => {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Fallo al conectar con el servidor.</td></tr>`;
        });
        // Activar JustValidate al cargar la vista
    setTimeout(inicializarJustValidateRevisiones, 100);
}

// Función que pasa los datos de la tabla a la ventana emergente (Modal)
window.abrirModalRevision = function(idPeticion, idInscripcion, alumnoInfo, califActual) {
    document.getElementById('rev-id-peticion').value = idPeticion;
    document.getElementById('rev-id-inscripcion').value = idInscripcion;
    document.getElementById('rev-alumno-nombre').value = alumnoInfo;
    document.getElementById('rev-calif-actual').value = califActual;
    
    // Limpiamos los campos editables por si tenían datos de una revisión anterior
    document.getElementById('rev-calif-nueva').value = '';
    document.getElementById('rev-notas').value = '';

    const modal = new bootstrap.Modal(document.getElementById('modalRevision'));
    modal.show();
};
// Función para abrir la nueva pestaña de impresión
window.imprimirPaseDeLista = function(idExamen) {
    window.open(`/php/endpoints/generar_pase_lista.php?id_examen=${idExamen}`, '_blank');
};
// Variable global para evitar que Chart.js se vuelva loco si recargamos la página muchas veces
let miGraficaRendimiento = null;

function pintarGraficaRendimiento() {
    const canvas = document.getElementById('graficaRendimiento');
    if (!canvas) return; // Si estamos en otra vista que no es 'Inicio', ignoramos esto.

    fetch('/php/endpoints/obtener_estadisticas_profesor.php')
        .then(res => res.json())
        .then(datos => {
            if (datos.status !== 'success') return;

            const ctx = canvas.getContext('2d');
            
            // Destruimos la gráfica anterior si existía para dibujar la nueva limpia
            if (miGraficaRendimiento) {
                miGraficaRendimiento.destroy();
            }

            // Si no tiene a nadie calificado aún, mostramos colores grises
            let total = datos.data.aprobados + datos.data.reprobados;
            let valores = total === 0 ? [1] : [datos.data.aprobados, datos.data.reprobados];
            let colores = total === 0 ? ['#e9ecef'] : ['#198754', '#dc3545']; // Verde y Rojo Bootstrap
            let etiquetas = total === 0 ? ['Sin datos aún'] : ['Aprobados (6.0 - 10)', 'Reprobados (0 - 5.9)'];

            // Creamos la gráfica
            miGraficaRendimiento = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: etiquetas,
                    datasets: [{
                        data: valores,
                        backgroundColor: colores,
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '75%', // Hace que la dona sea más delgada y elegante
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
        })
        .catch(err => console.error("Error al cargar la gráfica:", err));
}// ==========================================
// LÓGICA DE FIRMA Y GUARDADO FINAL
// ==========================================

// 1. La Función Escudo (Pide el NIP)
function solicitarNIPParaGuardar(idExamen) {
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

// 2. La Función Original de Guardado (Que se ejecuta tras firmar)
function ejecutarGuardadoFinal(idExamen) {
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
// EXPORTACIÓN DE DOCUMENTOS
// ==========================================

window.exportarActaCSV = function() {
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
// BUSCADOR EN TIEMPO REAL PARA EXÁMENES
// ==========================================
function filtrarExamenes() {
    // 1. Obtenemos lo que el usuario escribió y lo pasamos a minúsculas
    const input = document.getElementById("buscadorExamenes");
    const filtro = input.value.toLowerCase();
    
    // 2. Buscamos el cuerpo de la tabla que está visible en pantalla
    const tabla = document.querySelector("table tbody"); 
    if (!tabla) return; // Si por alguna razón no hay tabla, no hace nada

    // 3. Obtenemos todas las filas (tr) de la tabla
    const filas = tabla.getElementsByTagName("tr");

    // 4. Recorremos fila por fila para ver si coincide con la búsqueda
    for (let i = 0; i < filas.length; i++) {
        // La columna 0 es el ID y la columna 1 es la Materia
        const celdaId = filas[i].getElementsByTagName("td")[0];
        const celdaMateria = filas[i].getElementsByTagName("td")[1];

        // Si la fila tiene columnas (es decir, no es el mensaje de "No hay datos")
        if (celdaId && celdaMateria) {
            const textoId = celdaId.textContent || celdaId.innerText;
            const textoMateria = celdaMateria.textContent || celdaMateria.innerText;

            // Si el texto escrito está en el ID o en la Materia, mostramos la fila
            if (textoId.toLowerCase().includes(filtro) || textoMateria.toLowerCase().includes(filtro)) {
                filas[i].style.display = ""; 
            } else {
                // Si no coincide, la ocultamos
                filas[i].style.display = "none"; 
            }
        }
    }
}
// ==========================================
// BUSCADOR EN TIEMPO REAL PARA REVISIONES
// ==========================================
function filtrarRevisiones() {
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
// EXPORTAR TABLA DE EXÁMENES A EXCEL (.CSV)
// ==========================================
function exportarExamenesAExcel() {
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