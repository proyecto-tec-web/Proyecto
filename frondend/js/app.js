let chartInscripciones = null;

document.addEventListener("DOMContentLoaded", () => {
    const primerEnlace = document.querySelector('.menu-link');
    if (primerEnlace) {
        cargarVista('dashboard', primerEnlace);
    }
});

function cargarVista(nombreVista, elementoClick) {
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';

    const contenedor = document.getElementById('view-container');
    
    contenedor.innerHTML = `
        <div class="text-center mt-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted">Consultando al servidor...</p>
        </div>`;

    fetch(`vistas/${nombreVista}.php?v=${Date.now()}`)
        .then(respuesta => {
            if (!respuesta.ok) throw new Error(`El archivo vistas/${nombreVista}.php no respondió correctamente.`);
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
                if (tituloSeccion) {
                    tituloSeccion.innerText = elementoClick.innerText.trim();
                }
            }

            let bsOffcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('sidebarMenu'));
            if (bsOffcanvas && window.innerWidth < 768) {
                bsOffcanvas.hide();
            }

            document.querySelectorAll('[data-bs-toggle="modal"]').forEach(btn => {
                const targetAttr = btn.getAttribute('data-bs-target');
                if (targetAttr) {
                    const targetModal = document.querySelector(targetAttr);
                    if (targetModal) { 
                        new bootstrap.Modal(targetModal);
                    }
                }
            });

            inicializarLogicaVista(nombreVista);
        })
        .catch(error => {
            contenedor.innerHTML = `
                <div class="alert alert-danger shadow-sm border-0 border-start border-danger border-4 rounded-3">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    <strong>Fallo de conexión:</strong> ${error.message}
                </div>`;
        });
}

function inicializarLogicaVista(nombreVista) {
    
    // ==========================================
    // VISTA: DASHBOARD
    // ==========================================
    if (nombreVista === 'dashboard') {
        const kpiExamenes = document.getElementById('kpi-examenes');
        const kpiInscritos = document.getElementById('kpi-inscritos');
        const kpiPagos = document.getElementById('kpi-pagos');
        const kpiActas = document.getElementById('kpi-actas');

        if(kpiExamenes) kpiExamenes.innerText = "24";
        if(kpiInscritos) kpiInscritos.innerText = "342";
        if(kpiPagos) kpiPagos.innerText = "45";
        if(kpiActas) kpiActas.innerText = "8 / 24";

        const canvas = document.getElementById('inscripcionesChart');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (chartInscripciones) chartInscripciones.destroy(); 
            
            chartInscripciones = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Cálculo Dif.', 'Física Clásica', 'Álgebra', 'Química', 'Programación'],
                    datasets: [{
                        label: 'Alumnos inscritos a ETS',
                        data: [120, 95, 80, 65, 45],
                        backgroundColor: 'rgba(13, 110, 253, 0.8)',
                        borderRadius: 4
                    }]
                },
                options: { responsive: true, plugins: { legend: { display: false } } }
            });
        }
    }

    // ==========================================
    // VISTA: USUARIOS
    // ==========================================
    if (nombreVista === 'usuarios') {
        cargarTablaUsuarios();

        // Guardar Nuevo Usuario
        const btnGuardarUsuario = document.getElementById('btn-guardar-usuario');
        if (btnGuardarUsuario) {
            btnGuardarUsuario.addEventListener('click', () => {
                const correo = document.getElementById('input-correo').value;
                const password = document.getElementById('input-password').value;
                const rol = document.getElementById('select-rol').value;

                if (!correo || !password || !rol) {
                    alert("Completa todos los campos");
                    return;
                }

                btnGuardarUsuario.disabled = true;
                btnGuardarUsuario.innerHTML = "Guardando...";

                fetch('/php/endpoints/crear_usuario.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ correo, password, rol })
                })
                .then(res => res.json())
                .then(datos => {
                    if (datos.status === 'success') {
                        const modal = bootstrap.Modal.getInstance(document.getElementById('modalNuevoUsuario'));
                        if(modal) modal.hide();
                        document.getElementById('form-nuevo-usuario').reset();
                        alert("Usuario creado con éxito.");
                        cargarTablaUsuarios();
                    } else {
                        alert("Error: " + datos.message);
                    }
                    btnGuardarUsuario.disabled = false;
                    btnGuardarUsuario.innerHTML = "Guardar Usuario";
                });
            });
        }

        // Actualizar Usuario Editado
        const btnActualizarUsuario = document.getElementById('btn-actualizar-usuario');
        if (btnActualizarUsuario) {
            btnActualizarUsuario.addEventListener('click', () => {
                const id = document.getElementById('edit-user-id').value;
                const correo = document.getElementById('edit-user-correo').value;
                const password = document.getElementById('edit-user-password').value;
                const rol = document.getElementById('edit-user-rol').value;

                btnActualizarUsuario.disabled = true;
                btnActualizarUsuario.innerHTML = "Actualizando...";

                fetch('/php/endpoints/actualizar_usuario.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, correo, password, rol })
                })
                .then(res => res.json())
                .then(datos => {
                    if (datos.status === 'success') {
                        const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarUsuario'));
                        if(modal) modal.hide();
                        alert("Usuario actualizado con éxito.");
                        cargarTablaUsuarios();
                    } else {
                        alert("Error: " + datos.message);
                    }
                    btnActualizarUsuario.disabled = false;
                    btnActualizarUsuario.innerHTML = "Actualizar Usuario";
                });
            });
        }
    }

    // ==========================================
    // VISTA: EXÁMENES (Con Apertura Manual y Buscador)
    // ==========================================
    if (nombreVista === 'examenes') {
        cargarTablaExamenes();

        fetch('/php/endpoints/obtener_catalogos_ets.php')
            .then(res => res.json())
            .then(data => {
                if(data.status === 'success') {
                    const mapas = {
                        'select-materia': 'materias', 'select-sinodal': 'profesores', 'select-salon': 'salones',
                        'edit-materia': 'materias', 'edit-sinodal': 'profesores', 'edit-salon': 'salones'
                    };
                    for(let id in mapas) {
                        let select = document.getElementById(id);
                        if(select) {
                            select.innerHTML = '<option value="" selected disabled>Seleccione...</option>';
                            data[mapas[id]].forEach(item => {
                                select.innerHTML += `<option value="${item.id_materia || item.id_profesor || item.id_salon}">${item.nombre}</option>`;
                            });
                        }
                    }
                }
            });

        // Magia del buscador de Exámenes en tiempo real
        const buscadorExamenes = document.getElementById('buscador-examenes');
        if (buscadorExamenes) {
            buscadorExamenes.addEventListener('keyup', function() {
                const textoBuscar = this.value.toLowerCase();
                const filas = document.querySelectorAll('#tbody-examenes tr');
                
                filas.forEach(fila => {
                    if(fila.cells.length > 1) { 
                        const textoFila = fila.innerText.toLowerCase();
                        fila.style.display = textoFila.includes(textoBuscar) ? '' : 'none';
                    }
                });
            });
        }

        const btnGuardarETS = document.getElementById('btn-guardar-ets');
        if (btnGuardarETS) {
            btnGuardarETS.addEventListener('click', () => {
                const materia = document.getElementById('select-materia').value;
                const sinodal = document.getElementById('select-sinodal').value;
                const fecha = document.getElementById('input-fecha').value;
                const hora = document.getElementById('input-hora').value;
                const salon = document.getElementById('select-salon').value;
                const cupo = document.getElementById('input-cupo').value;

                if(!materia || !sinodal || !fecha || !hora || !salon || !cupo) {
                    alert("Por favor, llena todos los campos.");
                    return;
                }

                btnGuardarETS.disabled = true;
                fetch('/php/endpoints/crear_ets.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ materia, sinodal, fecha, hora, salon, cupo })
                })
                .then(respuesta => respuesta.json())
                .then(datos => {
                    if (datos.status === 'success') {
                        const modalElement = document.getElementById('modalNuevoETS');
                        if(modalElement) {
                            const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
                            modalInstance.hide();
                            document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
                            document.body.classList.remove('modal-open');
                            document.body.style = '';
                        }
                        document.getElementById('form-nuevo-ets').reset();
                        cargarTablaExamenes(); 
                    } else {
                        alert("Error: " + datos.message);
                    }
                    btnGuardarETS.disabled = false;
                });
            });
        }

        const btnActualizarETS = document.getElementById('btn-actualizar-ets');
        if (btnActualizarETS) {
            btnActualizarETS.addEventListener('click', () => {
                const datosEdit = {
                    id: document.getElementById('edit-id').value,
                    materia: document.getElementById('edit-materia').value,
                    sinodal: document.getElementById('edit-sinodal').value,
                    fecha: document.getElementById('edit-fecha').value,
                    hora: document.getElementById('edit-hora').value,
                    salon: document.getElementById('edit-salon').value,
                    cupo: document.getElementById('edit-cupo').value
                };

                btnActualizarETS.disabled = true;
                fetch('/php/endpoints/actualizar_ets.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datosEdit)
                })
                .then(res => res.json())
                .then(datos => {
                    if (datos.status === 'success') {
                        const modalEdit = document.getElementById('modalEditarETS');
                        if(modalEdit) {
                            const modalInstance = bootstrap.Modal.getInstance(modalEdit) || new bootstrap.Modal(modalEdit);
                            modalInstance.hide();
                            document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
                            document.body.classList.remove('modal-open');
                            document.body.style = '';
                        }
                        cargarTablaExamenes();
                    } else {
                        alert("Error: " + datos.message);
                    }
                    btnActualizarETS.disabled = false;
                });
            });
        }
    }
    
    if (nombreVista === 'alumnos') {
        if (typeof iniciarVistaAlumnos === 'function') {
            iniciarVistaAlumnos();
        } else {
            console.error("El archivo alumnos.js no está cargado correctamente.");
        }
    }
}

// ==========================================
// RENDERIZADO DE TABLAS
// ==========================================

function cargarTablaUsuarios() {
    const tbody = document.getElementById('cuerpo-tabla-usuarios');
    if(!tbody) return;

    fetch('/php/endpoints/obtener_usuarios.php')
        .then(respuesta => respuesta.json())
        .then(datos => {
            if (datos.status === 'error') {
                tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger py-4">Error BD: ${datos.message}</td></tr>`;
                return;
            }
            tbody.innerHTML = ''; 
            if (datos.data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">No hay usuarios.</td></tr>`;
                return;
            }

            datos.data.forEach(user => {
                let colorBadge = (user.rol === 'Administrador' || user.rol === 'admin') ? 'danger' : 'primary';
                let filaHTML = `
                    <tr>
                        <td class="ps-4 fw-bold text-secondary">#${user.id_usuario}</td>
                        <td>${user.correo}</td>
                        <td><span class="badge bg-${colorBadge} bg-opacity-10 text-${colorBadge} border border-${colorBadge}-subtle px-3 py-2 rounded-pill">${user.rol}</span></td>
                        <td class="pe-4 text-end" style="width: 1%; white-space: nowrap;">
                            <div class="d-flex justify-content-end align-items-center gap-1">
                                <button class="btn btn-outline-primary btn-sm rounded-pill px-2 py-1 btn-modificar-user" data-id="${user.id_usuario}">
                                    <i class="bi bi-pencil-square me-1"></i>Modificar
                                </button>
                                <button class="btn btn-outline-danger btn-sm rounded-pill px-2 py-1 btn-eliminar-user" data-id="${user.id_usuario}">
                                    <i class="bi bi-trash3 me-1"></i>Eliminar
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += filaHTML;
            });

            // Eventos Modificar Usuario
            tbody.querySelectorAll('.btn-modificar-user').forEach(btn => {
                btn.addEventListener('click', function() {
                    const idUser = this.getAttribute('data-id');
                    fetch(`/php/endpoints/obtener_usuario_id.php?id=${idUser}`)
                        .then(res => res.json())
                        .then(data => {
                            if (data.status === 'success') {
                                document.getElementById('edit-user-id').value = data.usuario.id_usuario;
                                document.getElementById('edit-user-correo').value = data.usuario.correo;
                                document.getElementById('edit-user-password').value = ""; // Vacio por seguridad
                                document.getElementById('edit-user-rol').value = data.usuario.rol;
                                new bootstrap.Modal(document.getElementById('modalEditarUsuario')).show();
                            }
                        });
                });
            });

            // Eventos Eliminar Usuario
            tbody.querySelectorAll('.btn-eliminar-user').forEach(btn => {
                btn.addEventListener('click', function() {
                    const idUser = this.getAttribute('data-id');
                    if (confirm(`¿Eliminar al usuario #${idUser}?`)) {
                        fetch('/php/endpoints/eliminar_usuario.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id_usuario: idUser })
                        })
                        .then(res => res.json())
                        .then(data => {
                            if (data.status === 'success') cargarTablaUsuarios();
                            else alert("Error: " + data.message);
                        });
                    }
                });
            });
        });
}

function cargarTablaExamenes() {
    const tbody = document.getElementById('tbody-examenes');
    if(!tbody) return;

    fetch('/php/endpoints/obtener_examenes.php')
        .then(respuesta => respuesta.json())
        .then(datos => {
            if (datos.status === 'error') {
                tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger py-4">Error: ${datos.message}</td></tr>`;
                return;
            }
            tbody.innerHTML = ''; 
            if (datos.data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">Aún no hay exámenes programados.</td></tr>`;
                return;
            }

            datos.data.forEach(ex => {
                let colorBadge = (ex.estado === 'Programado') ? 'primary' : (ex.estado === 'Abierto' ? 'success' : 'secondary');
                
                // Botón dinámico: Solo aparece si está "Programado"
                let btnAbrirHTML = '';
                if (ex.estado === 'Programado') {
                    btnAbrirHTML = `
                        <button class="btn btn-outline-success btn-sm rounded-pill px-2 py-1 btn-abrir-ets" data-id="${ex.id_examen}" title="Abrir Inscripciones">
                            <i class="bi bi-unlock-fill me-1"></i>Abrir
                        </button>`;
                }

                let filaHTML = `
                    <tr>
                        <td class="ps-4 fw-bold text-secondary">#${ex.id_examen}</td>
                        <td class="fw-semibold">${ex.materia}</td>
                        <td><div>${ex.fecha}</div><small class="text-muted">${ex.hora_inicio} - ${ex.hora_fin}</small></td>
                        <td>${ex.sinodal}</td>
                        <td>${ex.salon}</td>
                        <td>${ex.cupo} alumnos</td>
                        <td><span class="badge bg-${colorBadge} bg-opacity-10 text-${colorBadge} border border-${colorBadge}-subtle px-3 py-2 rounded-pill">${ex.estado}</span></td>
                        <td class="text-center" style="width: 1%; white-space: nowrap;">
                            <div class="d-flex justify-content-center align-items-center gap-1">
                                ${btnAbrirHTML}
                                <button class="btn btn-outline-primary btn-sm rounded-pill px-2 py-1 btn-modificar-ets" data-id="${ex.id_examen}" title="Modificar">
                                    <i class="bi bi-pencil-square"></i>
                                </button>
                                <button class="btn btn-outline-danger btn-sm rounded-pill px-2 py-1 btn-eliminar-ets" data-id="${ex.id_examen}" title="Eliminar">
                                    <i class="bi bi-trash3"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += filaHTML;
            });

            // 1. Evento Abrir ETS (El nuevo botón manual)
            tbody.querySelectorAll('.btn-abrir-ets').forEach(btn => {
                btn.addEventListener('click', function() {
                    const idExamen = this.getAttribute('data-id');
                    if (confirm("¿Estás seguro de ABRIR las inscripciones para este examen? Los alumnos ya podrán registrarse.")) {
                        fetch('/php/endpoints/abrir_examen.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id_examen: idExamen })
                        })
                        .then(res => res.json())
                        .then(data => {
                            if (data.status === 'success') {
                                cargarTablaExamenes();
                            } else {
                                alert("Error: " + data.message);
                            }
                        });
                    }
                });
            });

            // 2. Eventos Eliminar ETS
            tbody.querySelectorAll('.btn-eliminar-ets').forEach(btn => {
                btn.addEventListener('click', function() {
                    const idExamen = this.getAttribute('data-id');
                    if (confirm(`¿Eliminar el examen #${idExamen}?`)) {
                        fetch('/php/endpoints/eliminar_ets.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id_examen: idExamen })
                        })
                        .then(res => res.json())
                        .then(data => {
                            if (data.status === 'success') cargarTablaExamenes();
                            else alert("Error: " + data.message);
                        });
                    }
                });
            });

            // 3. Eventos Modificar ETS
            tbody.querySelectorAll('.btn-modificar-ets').forEach(btn => {
                btn.addEventListener('click', function() {
                    const idExamen = this.getAttribute('data-id');
                    fetch(`/php/endpoints/obtener_examen_id.php?id=${idExamen}`)
                        .then(res => res.json())
                        .then(data => {
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