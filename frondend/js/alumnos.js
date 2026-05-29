
function iniciarVistaAlumnos() {
    cargarTablaAlumnos();
    cargarCatalogosAlumnos();
    configurarEventosAlumnos();
}

function cargarCatalogosAlumnos() {
    fetch('/php/endpoints/obtener_catalogos_alumnos.php')
        .then(res => res.json())
        .then(data => {
            if(data.status === 'success') {
                const selectNuevo = document.getElementById('alum-carrera');
                const selectEdit = document.getElementById('edit-alum-carrera');
                
                let opcionesHTML = '<option value="" selected disabled>Selecciona una carrera...</option>';
                data.carreras.forEach(c => {
                    opcionesHTML += `<option value="${c.id_carrera}">${c.acronimo} - ${c.nombre}</option>`;
                });

                if (selectNuevo) selectNuevo.innerHTML = opcionesHTML;
                if (selectEdit) selectEdit.innerHTML = opcionesHTML;
            }
        });
}

function cargarTablaAlumnos() {
    const tbody = document.getElementById('tbody-alumnos');
    if(!tbody) return;

    fetch('/php/endpoints/obtener_alumnos.php')
        .then(res => res.json())
        .then(datos => {
            if (datos.status === 'error') {
                tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error: ${datos.message}</td></tr>`;
                return;
            }
            tbody.innerHTML = '';
            if (datos.data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No hay alumnos inscritos.</td></tr>`;
                return;
            }

            datos.data.forEach(al => {
                let badgeSit = (al.situacion_academica === 'Regular') ? 'success' : (al.situacion_academica === 'Irregular' ? 'warning' : 'danger');
                
                // 🛠️ AQUÍ INYECTAMOS LOS ID A LOS BOTONES
                tbody.innerHTML += `
                    <tr>
                        <td class="ps-4 fw-bold text-secondary">${al.boleta}</td>
                        <td>${al.apellido_paterno} ${al.apellido_materno} ${al.nombre}</td>
                        <td>${al.carrera}</td>
                        <td><span class="badge bg-${badgeSit}">${al.situacion_academica}</span></td>
                        <td class="pe-4 text-end">
                            <button class="btn btn-sm btn-outline-info me-1 btn-kardex" data-id="${al.id_alumno}" title="Ver Kardex">
                                <i class="bi bi-card-list"></i> Kardex
                            </button>
                            <button class="btn btn-sm btn-outline-primary me-1 btn-editar-alumno" data-id="${al.id_alumno}" title="Editar">
                                <i class="bi bi-pencil"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });

            // 1. Botón Editar
            tbody.querySelectorAll('.btn-editar-alumno').forEach(btn => {
                btn.addEventListener('click', function() {
                    const idAlumno = this.getAttribute('data-id');
                    
                    fetch(`/php/endpoints/obtener_alumno_id.php?id=${idAlumno}`)
                        .then(res => res.json())
                        .then(data => {
                            if(data.status === 'success') {
                                document.getElementById('edit-alum-id').value = data.alumno.id_alumno;
                                document.getElementById('edit-alum-boleta').value = data.alumno.boleta;
                                document.getElementById('edit-alum-carrera').value = data.alumno.id_carrera;
                                document.getElementById('edit-alum-situacion').value = data.alumno.situacion_academica;
                                document.getElementById('edit-alum-nombre').value = data.alumno.nombre;
                                document.getElementById('edit-alum-paterno').value = data.alumno.apellido_paterno;
                                document.getElementById('edit-alum-materno').value = data.alumno.apellido_materno;
                                
                                new bootstrap.Modal(document.getElementById('modalEditarAlumno')).show();
                            } else {
                                alert("Error: " + data.message);
                            }
                        });
                });
            });
            tbody.querySelectorAll('.btn-kardex').forEach(btn => {
                btn.addEventListener('click', function() {
                    const idAlumno = this.getAttribute('data-id');
                    const nombreAlumno = this.closest('tr').cells[1].innerText; // Sacamos el nombre de la tabla

                    document.getElementById('kardex-nombre-alumno').innerText = `Kardex: ${nombreAlumno}`;

                    fetch(`/php/endpoints/obtener_kardex.php?id=${idAlumno}`)
                        .then(res => res.json())
                        .then(data => {
                            if(data.status === 'success') {
                                const tbodyKardex = document.getElementById('tbody-kardex');
                                tbodyKardex.innerHTML = '';
                                
                                if(data.data.length === 0) {
                                    tbodyKardex.innerHTML = '<tr><td colspan="3" class="text-center text-muted py-4">Aún no tiene materias cursadas.</td></tr>';
                                } else {
                                    data.data.forEach(item => {
                                        let calif = parseFloat(item.calificacion);
                                        // Rojo si reprobó, verde si aprobó
                                        let claseColor = (calif < 6) ? 'text-danger fw-bold' : 'text-success fw-bold';
                                        
                                        tbodyKardex.innerHTML += `
                                            <tr>
                                                <td class="text-center">${item.semestre}</td>
                                                <td>${item.materia}</td>
                                                <td class="text-center ${claseColor}">${calif.toFixed(2)}</td>
                                            </tr>
                                        `;
                                    });
                                }
                                
                                new bootstrap.Modal(document.getElementById('modalKardex')).show();
                                
                                // Refrescamos la tabla azul de atrás por si su situación académica cambió al abrir el Kardex
                                cargarTablaAlumnos(); 
                            } else {
                                alert("Error al cargar Kardex: " + data.message);
                            }
                        });
                });
            });

        })
        .catch(err => {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Fallo al conectar con el servidor.</td></tr>`;
            console.error(err);
        });
}

function configurarEventosAlumnos() {
    
    // CREAR ALUMNO
    const btnGuardar = document.getElementById('btn-guardar-alumno');
    if(btnGuardar) {
        btnGuardar.addEventListener('click', () => {
            const datos = {
                boleta: document.getElementById('alum-boleta').value,
                carrera: document.getElementById('alum-carrera').value,
                nombre: document.getElementById('alum-nombre').value,
                paterno: document.getElementById('alum-paterno').value,
                materno: document.getElementById('alum-materno').value,
                correo: document.getElementById('alum-correo').value
            };

            if(!datos.boleta || !datos.carrera || !datos.nombre || !datos.correo) {
                alert("Completa los campos principales."); return;
            }

            btnGuardar.disabled = true;
            btnGuardar.innerText = "Inscribiendo...";

            fetch('/php/endpoints/crear_alumno.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            })
            .then(res => res.json())
            .then(respuesta => {
                if(respuesta.status === 'success') {
                    const modalEl = document.getElementById('modalNuevoAlumno');
                    if(modalEl) bootstrap.Modal.getInstance(modalEl).hide();
                    document.getElementById('form-nuevo-alumno').reset();
                    alert("Alumno y cuenta de usuario creados con éxito.");
                    cargarTablaAlumnos();
                } else {
                    alert("Error: " + respuesta.message);
                }
                btnGuardar.disabled = false;
                btnGuardar.innerText = "Finalizar Inscripción";
            })
            .catch(err => {
                alert("Ocurrió un error de conexión.");
                btnGuardar.disabled = false;
                btnGuardar.innerText = "Finalizar Inscripción";
            });
        });
    }

    // ACTUALIZAR ALUMNO
    const btnActualizar = document.getElementById('btn-actualizar-alumno');
    if(btnActualizar) {
        btnActualizar.addEventListener('click', () => {
            const datos = {
                id: document.getElementById('edit-alum-id').value,
                boleta: document.getElementById('edit-alum-boleta').value,
                carrera: document.getElementById('edit-alum-carrera').value,
                situacion: document.getElementById('edit-alum-situacion').value,
                nombre: document.getElementById('edit-alum-nombre').value,
                paterno: document.getElementById('edit-alum-paterno').value,
                materno: document.getElementById('edit-alum-materno').value
            };

            btnActualizar.disabled = true;
            btnActualizar.innerText = "Guardando...";

            fetch('/php/endpoints/actualizar_alumno.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            })
            .then(res => res.json())
            .then(respuesta => {
                if(respuesta.status === 'success') {
                    const modalEl = document.getElementById('modalEditarAlumno');
                    if(modalEl) bootstrap.Modal.getInstance(modalEl).hide();
                    alert("Datos del alumno actualizados correctamente.");
                    cargarTablaAlumnos();
                } else {
                    alert("Error: " + respuesta.message);
                }
                btnActualizar.disabled = false;
                btnActualizar.innerText = "Guardar Cambios";
            });
        });
    }

    const buscador = document.getElementById('buscador-alumnos');
    const filtroSituacion = document.getElementById('filtro-situacion');

    function aplicarFiltros() {
        const textoBuscar = buscador ? buscador.value.toLowerCase() : '';
        const estadoBuscar = filtroSituacion ? filtroSituacion.value : 'Todos';
        
        const filas = document.querySelectorAll('#tbody-alumnos tr');
        
        filas.forEach(fila => {
            // Evitamos que oculte el mensaje de "Cargando..." o "Tabla vacía"
            if(fila.cells.length > 1) { 
                const textoFila = fila.innerText.toLowerCase();
                
                // La situación académica está en la 4ta columna (índice 3)
                const situacionFila = fila.cells[3].innerText.trim();
                
                // Revisamos si cumple con lo que el usuario escribió
                const pasaFiltroTexto = textoFila.includes(textoBuscar);
                
                // Revisamos si cumple con el selector (Regular/Irregular/Todos)
                const pasaFiltroEstado = (estadoBuscar === 'Todos') || (situacionFila === estadoBuscar);
                
                // Si pasa AMBAS pruebas, lo mostramos. Si no, lo escondemos.
                if (pasaFiltroTexto && pasaFiltroEstado) {
                    fila.style.display = '';
                } else {
                    fila.style.display = 'none';
                }
            }
        });
    }

    if (buscador) {
        buscador.addEventListener('keyup', aplicarFiltros);
    }
    if (filtroSituacion) {
        filtroSituacion.addEventListener('change', aplicarFiltros);
    }
}