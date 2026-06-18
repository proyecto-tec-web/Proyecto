// =================================================================
// MÓDULO INDEPENDIENTE: GESTIÓN DE ALUMNOS Y KARDEX
// =================================================================
console.log('ALUMNO.JS CARGADO');

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
                // 1. CONFIGURAR EL COLOR Y EL TEXTO EXACTO DEL ESTADO
                let badgeSit = 'success';
                let textoEstado = '';
                let btnBaja = '';

                if (al.situacion_academica === 'Regular') {
                    badgeSit = 'success';
                    textoEstado = 'Regular (Activo)';
                } else if (al.situacion_academica === 'Irregular') {
                    badgeSit = 'warning text-dark';
                    textoEstado = 'Irregular (Activo)';
                } else if (al.situacion_academica === 'Baja') {
                    badgeSit = 'secondary'; // Color gris para que parezca inactivo
                    textoEstado = 'Baja (Inactivo)';
                }

                // 2. CONFIGURAR EL BOTÓN DE BAJA (Si ya está de baja, lo bloqueamos)
                if (al.situacion_academica !== 'Baja') {
                    btnBaja = `<button class="btn btn-sm btn-outline-danger me-1 btn-eliminar-alumno" data-id="${al.id_alumno}" title="Dar de Baja">
                                    <i class="bi bi-person-dash"></i>
                               </button>`;
                } else {
                    // Botón bloqueado indicando que ya está inactivo
                    btnBaja = `<button class="btn btn-sm btn-secondary me-1 disabled" title="Alumno Inactivo">
                                    <i class="bi bi-person-fill-slash"></i> Baja
                               </button>`;
                }

                tbody.innerHTML += `
                    <tr>
                        <td class="ps-4 fw-bold ${al.situacion_academica === 'Baja' ? 'text-muted text-decoration-line-through' : 'text-secondary'}">${al.boleta}</td>
                        <td class="${al.situacion_academica === 'Baja' ? 'text-muted' : ''}">${al.apellido_paterno} ${al.apellido_materno} ${al.nombre}</td>
                        <td class="${al.situacion_academica === 'Baja' ? 'text-muted' : ''}">${al.carrera}</td>
                        
                        <td><span class="badge bg-${badgeSit}">${textoEstado}</span></td>
                        
                        <td class="pe-4 text-end">
                            <button class="btn btn-sm btn-outline-info me-1 btn-kardex" data-id="${al.id_alumno}" title="Ver Kardex">
                                <i class="bi bi-card-list"></i> Kardex
                            </button>
                            <button class="btn btn-sm btn-outline-primary me-1 btn-editar-alumno" data-id="${al.id_alumno}" title="Editar">
                                <i class="bi bi-pencil"></i>
                            </button>
                            ${btnBaja}
                        </td>
                    </tr>
                `;
            });

            // ==========================================
            // EVENTOS DE LOS BOTONES DE LA TABLA
            // ==========================================
            
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
                                document.getElementById('edit-alum-nombre').value = data.alumno.nombre;
                                document.getElementById('edit-alum-paterno').value = data.alumno.apellido_paterno;
                                document.getElementById('edit-alum-materno').value = data.alumno.apellido_materno;
                                
                                new bootstrap.Modal(document.getElementById('modalEditarAlumno')).show();
                            } else {
                                Swal.fire('Error', data.message, 'error');
                            }
                        });
                });
            });

            // 2. Botón Kardex
            tbody.querySelectorAll('.btn-kardex').forEach(btn => {
                btn.addEventListener('click', function() {
                    const idAlumno = this.getAttribute('data-id');
                    const nombreAlumno = this.closest('tr').cells[1].innerText;

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
                            } else {
                                Swal.fire('Error', 'Error al cargar Kardex: ' + data.message, 'error');
                            }
                        });
                });
            });

            // 3. Botón Dar de Baja
            tbody.querySelectorAll('.btn-eliminar-alumno').forEach(btn => {
                btn.addEventListener('click', function() {
                    const idAlumno = this.getAttribute('data-id');
                    const nombreAlumno = this.closest('tr').cells[1].innerText; 

                    Swal.fire({
                        title: `¿Dar de baja a ${nombreAlumno}?`,
                        text: "El alumno pasará a estado inactivo y ya no podrá iniciar sesión en el sistema. Su historial se conservará.",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#d33',
                        cancelButtonColor: '#6c757d',
                        confirmButtonText: 'Sí, dar de baja',
                        cancelButtonText: 'Cancelar'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            Swal.fire({ title: 'Procesando...', text: 'Por favor espera.', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); }});

                            fetch('/php/endpoints/eliminar_alumno.php', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id_alumno: idAlumno })
                            })
                            .then(res => res.json())
                            .then(data => {
                                if (data.status === 'success') {
                                    Swal.fire('¡Baja exitosa!', data.message, 'success');
                                    cargarTablaAlumnos(); // Refrescar la tabla para ver el cambio a Inactivo
                                } else {
                                    Swal.fire('Error', data.message, 'error');
                                }
                            })
                            .catch(err => {
                                console.error(err);
                                Swal.fire('Error', 'Fallo de conexión con el servidor.', 'error');
                            });
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
    
    let btnGuardar = document.getElementById('btn-guardar-alumno');
    if(btnGuardar) {
        // Destrucción de listeners duplicados
        let nuevoBtnGuardar = btnGuardar.cloneNode(true);
        btnGuardar.parentNode.replaceChild(nuevoBtnGuardar, btnGuardar);
        btnGuardar = nuevoBtnGuardar;

        btnGuardar.addEventListener('click', () => {
            // 1. OBTENER Y LIMPIAR (trim) LOS DATOS DE ENTRADA
            const datos = {
                boleta: document.getElementById('alum-boleta').value.trim(),
                carrera: document.getElementById('alum-carrera').value,
                nombre: document.getElementById('alum-nombre').value.trim(),
                paterno: document.getElementById('alum-paterno').value.trim(),
                materno: document.getElementById('alum-materno').value.trim(),
                correo: document.getElementById('alum-correo').value.trim()
            };

            // 2. EXPRESIONES REGULARES (Filtros)
            const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
            const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const regexBoleta = /^[0-9]{10}$/; // Asume 10 números exactos

            // 3. VALIDACIONES
            // A. Campos principales vacíos
            if(!datos.boleta || !datos.carrera || !datos.nombre || !datos.paterno || !datos.correo) {
                alert("Por favor, completa todos los campos obligatorios."); 
                return;
            }

            // B. Validar formato de nombres y apellidos (solo letras)
            if(!regexNombre.test(datos.nombre) || !regexNombre.test(datos.paterno) || (datos.materno !== "" && !regexNombre.test(datos.materno))) {
                alert("El nombre y los apellidos solo deben contener letras y espacios.");
                return;
            }

            // C. Validar Boleta (Solo 10 números)
            if(!regexBoleta.test(datos.boleta)) {
                alert("La boleta debe contener exactamente 10 números (sin espacios ni letras).");
                return;
            }

            // D. Validar formato de Correo Electrónico
            if(!regexCorreo.test(datos.correo)) {
                alert("Por favor, ingresa un correo electrónico válido (ejemplo@dominio.com).");
                return;
            }

            // 4. SI TODO PASA, ENVIAR AL SERVIDOR
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
                console.error(err);
            });
        });
    }

    // ACTUALIZAR ALUMNO
    let btnActualizar = document.getElementById('btn-actualizar-alumno');
    if(btnActualizar) {
        // Destrucción de listeners duplicados
        let nuevoBtnActualizar = btnActualizar.cloneNode(true);
        btnActualizar.parentNode.replaceChild(nuevoBtnActualizar, btnActualizar);
        btnActualizar = nuevoBtnActualizar;

        btnActualizar.addEventListener('click', () => {
            const datos = {
                id: document.getElementById('edit-alum-id').value,
                boleta: document.getElementById('edit-alum-boleta').value,
                carrera: document.getElementById('edit-alum-carrera').value,
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

    // MAGIA DEL BUSCADOR COMBINADO
    const buscador = document.getElementById('buscador-alumnos');
    const filtroSituacion = document.getElementById('filtro-situacion');

    function aplicarFiltros() {
        const textoBuscar = buscador ? buscador.value.toLowerCase() : '';
        const estadoBuscar = filtroSituacion ? filtroSituacion.value : 'Todos';
        
        const filas = document.querySelectorAll('#tbody-alumnos tr');
        
        filas.forEach(fila => {
            if(fila.cells.length > 1) { 
                const textoFila = fila.innerText.toLowerCase();
                const situacionFila = fila.cells[3].innerText.trim();
                
                const pasaFiltroTexto = textoFila.includes(textoBuscar);
                const pasaFiltroEstado = (estadoBuscar === 'Todos') || (situacionFila === estadoBuscar);
                
                if (pasaFiltroTexto && pasaFiltroEstado) {
                    fila.style.display = '';
                } else {
                    fila.style.display = 'none';
                }
            }
        });
    }

    // Los inputs de búsqueda no requieren clonación porque no ejecutan inserciones SQL
    // y la función aplicarFiltros no tiene efectos secundarios asíncronos.
    if (buscador) buscador.addEventListener('keyup', aplicarFiltros);
    if (filtroSituacion) filtroSituacion.addEventListener('change', aplicarFiltros);
}
