// =================================================================
// LÓGICA : VISTA INSCRIPCIONES
// =================================================================

function cargarTablaInscripciones() {
    const tbody = document.getElementById('tbody-inscripciones');
    if (!tbody) return;

    fetch('/php/endpoints/obtener_inscripciones.php')
        .then(respuesta => respuesta.json())
        .then(datos => {
            if (datos.status === 'error') {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Error: ${datos.message}</td></tr>`;
                return;
            }

            tbody.innerHTML = ''; 
            
            if (datos.data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">Aún no hay inscripciones registradas.</td></tr>`;
                return;
            }

            datos.data.forEach(ins => {
                // CORRECCIÓN DE COLORES: Adaptado a los estados reales de la Base de Datos
                let colorBadge = 'warning'; // Amarillo por defecto ('Pendiente')
                if (ins.estado === 'Aprobado' || ins.estado === 'Pagado') colorBadge = 'success'; // Verde
                if (ins.estado === 'Rechazado') colorBadge = 'danger'; // Rojo
                
                let filaHTML = `
                    <tr>
                        <td class="ps-4 fw-bold text-secondary">#${ins.id_inscripcion}</td>
                        <td class="fw-semibold">${ins.boleta}</td>
                        <td>${ins.alumno}</td>
                        <td>${ins.materia}</td>
                        <td>
                            <span class="badge bg-${colorBadge} bg-opacity-10 text-${colorBadge} border border-${colorBadge}-subtle px-3 py-2 rounded-pill">
                                ${ins.estado}
                            </span>
                        </td>
                        <td class="pe-4 text-end">
                            <button class="btn btn-sm btn-outline-success me-1" onclick="cambiarEstadoPago(${ins.id_inscripcion}, 'Pagado')" title="Aprobar Pago">
                                <i class="bi bi-check-lg"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger me-1" onclick="cambiarEstadoPago(${ins.id_inscripcion}, 'Rechazado')" title="Rechazar Pago">
                                <i class="bi bi-x-lg"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="eliminarInscripcionAlumno(${ins.id_inscripcion})" title="Eliminar Inscripción">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>`;
                tbody.innerHTML += filaHTML;
            });
            
            // Volver a aplicar filtros por si hay alguno activo al recargar la tabla
            aplicarFiltrosInscripciones();
        })
        .catch(error => {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Error de conexión al cargar la tabla.</td></tr>`;
        });
}

// DETECTAR EL MOMENTO EXACTO EN QUE SE ABRE EL MODAL ACTIVO
document.addEventListener('show.bs.modal', function (event) {
    if (event.target.id === 'modalInscribirAlumno') {
        const modalVisible = event.target;
        const select = modalVisible.querySelector('#select-examen-inscripcion');
        
        if (!select) return;

        select.options.length = 0;
        select.add(new Option('Cargando exámenes disponibles...', '', true, true));
        select.options[0].disabled = true;

        fetch('/php/endpoints/obtener_examenes_select.php')
            .then(res => res.json())
            .then(datos => {
                select.options.length = 0; 

                if (datos.status === 'success') {
                    if (datos.data.length === 0) {
                        select.add(new Option('No hay exámenes con estado "Abierto"', '', true, true));
                        select.options[0].disabled = true;
                    } else {
                        select.add(new Option('Selecciona el examen...', '', true, true));
                        select.options[0].disabled = true;

                        datos.data.forEach(ex => {
                            const texto = `${ex.materia} (Fecha: ${ex.fecha})`;
                            select.add(new Option(texto, ex.id_examen));
                        });
                    }
                } else {
                    select.add(new Option('Error: ' + datos.message, '', true, true));
                    select.options[0].disabled = true;
                }
            })
            .catch(err => {
                select.options.length = 0;
                select.add(new Option('Error de conexión', '', true, true));
                select.options[0].disabled = true;
            });
    }
});

function cargarExamenesParaSelect() {}
function manejarFormularioInscripcion() {}

// CAPTURADOR GLOBAL DEL FORMULARIO (Evita envíos duplicados)
document.addEventListener('submit', function(e) {
    if (e.target.id === 'form-inscribir-alumno') {
        e.preventDefault();

        const formActual = e.target;
        const boleta = formActual.querySelector('#input-boleta').value.trim();
        const selectExamen = formActual.querySelector('#select-examen-inscripcion');
        const idExamen = selectExamen.value;
        const btnActual = formActual.querySelector('#btn-guardar-inscripcion');

        if (!idExamen) {
            Swal.fire('Atención', 'Por favor, selecciona un examen válido.', 'warning');
            return;
        }

        btnActual.disabled = true;
        btnActual.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Procesando...';

        // PANTALLA DE CARGA SWEETALERT
        Swal.fire({ title: 'Inscribiendo alumno...', text: 'Por favor espera.', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); }});

        fetch('/php/endpoints/inscribir_alumno.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ boleta: boleta, id_examen: idExamen })
        })
        .then(res => res.json())
        .then(datos => {
            btnActual.disabled = false;
            btnActual.innerHTML = '<i class="bi bi-save me-1"></i> Confirmar Inscripción';

            if (datos.status === 'success') {
                Swal.fire('¡Éxito!', 'Alumno inscrito correctamente.', 'success');
                
                const modalElement = formActual.closest('.modal');
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                if (modalInstance) {
                    modalInstance.hide();
                }
                
                formActual.reset();
                cargarTablaInscripciones(); 
            } else {
                Swal.fire('Error', datos.message, 'error');
            }
        })
        .catch(err => {
            btnActual.disabled = false;
            btnActual.innerHTML = '<i class="bi bi-save me-1"></i> Confirmar Inscripción';
            Swal.fire('Error', 'Fallo la conexión con el servidor.', 'error');
        });
    }
});

function eliminarInscripcionAlumno(idInscripcion) {
    Swal.fire({
        title: `¿Eliminar permanentemente la inscripción #${idInscripcion}?`,
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // PANTALLA DE CARGA SWEETALERT
            Swal.fire({ title: 'Eliminando...', text: 'Por favor espera.', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); }});

            fetch('/php/endpoints/eliminar_inscripcion.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_inscripcion: idInscripcion })
            })
            .then(res => res.json())
            .then(datos => {
                if (datos.status === 'success') {
                    Swal.fire('¡Eliminada!', 'Inscripción eliminada correctamente.', 'success');
                    cargarTablaInscripciones();
                } else {
                    Swal.fire('Error', datos.message, 'error');
                }
            })
            .catch(err => {
                Swal.fire('Error', 'Fallo de conexión con el servidor.', 'error');
            });
        }
    });
}

// FUNCIÓN PARA APROBAR / RECHAZAR PAGOS
window.cambiarEstadoPago = function(idInscripcion, nuevoEstado) {
    let accion = nuevoEstado === 'Pagado' ? 'aprobar' : 'rechazar';
    let iconType = nuevoEstado === 'Pagado' ? 'question' : 'warning';
    let btnColor = nuevoEstado === 'Pagado' ? '#198754' : '#d33';
    
    Swal.fire({
        title: `¿Estás seguro de que deseas ${accion} el pago?`,
        text: `Inscripción #${idInscripcion}`,
        icon: iconType,
        showCancelButton: true,
        confirmButtonColor: btnColor,
        cancelButtonColor: '#6c757d',
        confirmButtonText: `Sí, ${accion}`,
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // PANTALLA DE CARGA SWEETALERT
            Swal.fire({ title: 'Actualizando estado...', text: 'Por favor espera.', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); }});

            fetch('/php/endpoints/actualizar_estado_pago.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id_inscripcion: idInscripcion, 
                    estado: nuevoEstado 
                })
            })
            .then(res => res.json())
            .then(datos => {
                if (datos.status === 'success') {
                    cargarTablaInscripciones();
                    if (nuevoEstado === 'Rechazado') {
                        Swal.fire('Pago rechazado', 'Esta boleta sigue manteniendo su cupo hasta que la borres.', 'info');
                    } else {
                        Swal.fire('¡Aprobado!', 'El pago ha sido registrado correctamente.', 'success');
                    }
                } else {
                    Swal.fire('Error', datos.message, 'error');
                }
            })
            .catch(err => {
                console.error("Fallo de red:", err);
                Swal.fire('Error', 'Fallo la conexión con el servidor.', 'error');
            });
        }
    });
};

// =======================================================================
// NUEVO SISTEMA DE FILTROS (REEMPLAZA AL ANTIGUO BUSCADOR DE BOLETAS)
// =======================================================================
function aplicarFiltrosInscripciones() {
    const texto = document.getElementById('buscador-inscripciones')?.value.toLowerCase() || '';
    const estadoFiltro = document.getElementById('filtro-estado-pago')?.value.toLowerCase() || 'todos';

    const filas = document.querySelectorAll('#tbody-inscripciones tr');

    filas.forEach(fila => {
        if(fila.cells.length > 1) { 
            const contenidoFila = fila.innerText.toLowerCase();
            let coincideTexto = contenidoFila.includes(texto);
            let coincideEstado = (estadoFiltro === 'todos') || contenidoFila.includes(estadoFiltro);
            
            fila.style.display = (coincideTexto && coincideEstado) ? '' : 'none';
        }
    });
}

// Escuchamos el buscador de texto
document.addEventListener('keyup', function(e) {
    if (e.target && e.target.id === 'buscador-inscripciones') {
        aplicarFiltrosInscripciones();
    }
});

// Escuchamos el select de estado de pago
document.addEventListener('change', function(e) {
    if (e.target && e.target.id === 'filtro-estado-pago') {
        aplicarFiltrosInscripciones();
    }
});

// EXPORTAR TABLA A CSV (EXCEL)
window.exportarCSV = function() {
    let csv = [];
    
    let headers = [];
    let celdasEncabezado = document.querySelectorAll('.table thead th');
    for (let i = 0; i < celdasEncabezado.length - 1; i++) {
        headers.push(celdasEncabezado[i].innerText.trim());
    }
    csv.push(headers.join(','));

    let filas = document.querySelectorAll('#tbody-inscripciones tr');
    
    filas.forEach(fila => {
        if (fila.style.display !== 'none' && fila.cells.length > 1) {
            let datosFila = [];
            for (let i = 0; i < fila.cells.length - 1; i++) {
                let textoCelda = fila.cells[i].innerText.replace(/,/g, '').trim();
                datosFila.push(`"${textoCelda}"`); 
            }
            csv.push(datosFila.join(','));
        }
    });

    let csvString = "\uFEFF" + csv.join('\n');
    let blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    
    let link = document.createElement("a");
    let url = URL.createObjectURL(blob);
    
    let fechaHoy = new Date().toISOString().split('T')[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `Inscripciones_ETS_${fechaHoy}.csv`);
    
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // NUEVO: SWEETALERT PARA CONFIRMAR LA EXPORTACIÓN
    Swal.fire('¡Exportado!', 'El archivo Excel (.csv) se ha descargado correctamente.', 'success');
};