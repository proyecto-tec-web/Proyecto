// ==========================================
// LÓGICA EXCLUSIVA: VISTA INSCRIPCIONES
// ==========================================

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
                let colorBadge = 'warning'; 
                if (ins.estado === 'Aprobado') colorBadge = 'success'; 
                if (ins.estado === 'Rechazado') colorBadge = 'danger'; 
                
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
                            <button class="btn btn-sm btn-outline-success me-1" onclick="cambiarEstadoPago(${ins.id_inscripcion}, 'Aprobado')" title="Aprobar Pago">
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
        })
        .catch(error => {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">Error de conexión al cargar la tabla.</td></tr>`;
        });
}

// =========================================================================
// EL SECRETO: DETECTAR EL MOMENTO EXACTO EN QUE SE ABRE EL MODAL ACTIVO
// =========================================================================
document.addEventListener('show.bs.modal', function (event) {
    // Verificamos que el modal que se está abriendo sea el de inscripciones
    if (event.target.id === 'modalInscribirAlumno') {
        const modalVisible = event.target;
        // Buscamos el select ÚNICAMENTE dentro del modal que se está abriendo
        const select = modalVisible.querySelector('#select-examen-inscripcion');
        
        if (!select) return;

        // Limpieza con método nativo seguro
        select.options.length = 0;
        select.add(new Option('Cargando exámenes disponibles...', '', true, true));
        select.options[0].disabled = true;

        fetch('/php/endpoints/obtener_examenes_select.php')
            .then(res => res.json())
            .then(datos => {
                select.options.length = 0; // Vaciamos el mensaje de carga

                if (datos.status === 'success') {
                    if (datos.data.length === 0) {
                        select.add(new Option('No hay exámenes con estado "Abierto"', '', true, true));
                        select.options[0].disabled = true;
                    } else {
                        select.add(new Option('Selecciona el examen...', '', true, true));
                        select.options[0].disabled = true;

                        // Insertamos las opciones en el modal visible de la pantalla
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

// Funciones de compatibilidad vacías para que tu app.js no tire error al llamarlas
function cargarExamenesParaSelect() {}
function manejarFormularioInscripcion() {}

// =========================================================================
// CAPTURADOR GLOBAL DEL FORMULARIO (Evita envíos duplicados)
// =========================================================================
document.addEventListener('submit', function(e) {
    if (e.target.id === 'form-inscribir-alumno') {
        e.preventDefault();

        const formActual = e.target;
        const boleta = formActual.querySelector('#input-boleta').value.trim();
        const selectExamen = formActual.querySelector('#select-examen-inscripcion');
        const idExamen = selectExamen.value;
        const btnActual = formActual.querySelector('#btn-guardar-inscripcion');

        if (!idExamen) {
            alert("Por favor, selecciona un examen válido.");
            return;
        }

        btnActual.disabled = true;
        btnActual.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Procesando...';

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
                alert("¡Alumno inscrito correctamente!");
                
                // Cerramos el modal activo donde se hizo click
                const modalElement = formActual.closest('.modal');
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                if (modalInstance) {
                    modalInstance.hide();
                }
                
                formActual.reset();
                cargarTablaInscripciones(); 
            } else {
                alert("Error: " + datos.message);
            }
        })
        .catch(err => {
            btnActual.disabled = false;
            btnActual.innerHTML = '<i class="bi bi-save me-1"></i> Confirmar Inscripción';
            alert('Fallo la conexión con el servidor.');
        });
    }
});

function eliminarInscripcionAlumno(idInscripcion) {
    if (!confirm(`¿Estás completamente seguro de que deseas eliminar permanentemente la inscripción #${idInscripcion}?`)) return;

    fetch('/php/endpoints/eliminar_inscripcion.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_inscripcion: idInscripcion })
    })
    .then(res => res.json())
    .then(datos => {
        if (datos.status === 'success') {
            alert("Inscripción eliminada correctamente.");
            cargarTablaInscripciones();
        } else {
            alert("Error: " + datos.message);
        }
    })
    .catch(err => {
        alert("Fallo de conexión con el servidor.");
    });
}

// =========================================================================
// FUNCIÓN PARA APROBAR / RECHAZAR PAGOS
// =========================================================================
window.cambiarEstadoPago = function(idInscripcion, nuevoEstado) {
    // Definimos la palabra para la alerta según el botón que presionen
    let accion = nuevoEstado === 'Aprobado' ? 'aprobar' : 'rechazar';
    
    // Pedimos confirmación para evitar clics por accidente
    if (!confirm(`¿Estás seguro de que deseas ${accion} el pago de la inscripción #${idInscripcion}?`)) {
        return;
    }

    // Enviamos los datos al nuevo archivo PHP
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
            // Si todo salió bien, recargamos la tabla para que cambie el color del badge
            cargarTablaInscripciones();
        } else {
            alert("Error: " + datos.message);
        }
    })
    .catch(err => {
        console.error("Fallo de red:", err);
        alert("Fallo la conexión con el servidor.");
    });
};