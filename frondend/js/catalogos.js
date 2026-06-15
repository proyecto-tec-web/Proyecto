
function iniciarVistaCatalogos() {
    const btnMaterias = document.getElementById('btn-cat-materias');
    const btnSalones = document.getElementById('btn-cat-salones');
    const btnCarreras = document.getElementById('btn-cat-carreras');
    const contenedor = document.getElementById('contenedor-catalogos');
    const tituloTabla = document.getElementById('titulo-tabla-catalogo');

    // Función para desplegar la tabla expansible abajo
    function desplegarTabla(titulo, tipo) {
        tituloTabla.innerText = "Catálogo de " + titulo;
        contenedor.style.display = 'block'; 
        
        // Efecto visual de scroll suave para enfocar el contenedor
        contenedor.scrollIntoView({ behavior: 'smooth', block: 'start' });

        cargarDatosCatalogo(tipo);
    }

    // Conexión de los eventos de clic a las tarjetas
    if (btnMaterias) btnMaterias.addEventListener('click', () => desplegarTabla('Materias', 'materias'));
    if (btnSalones) btnSalones.addEventListener('click', () => desplegarTabla('Salones y Edificios', 'salones'));
    if (btnCarreras) btnCarreras.addEventListener('click', () => desplegarTabla('Carreras', 'carreras'));
}

// Función maestra que consulta al servidor y dibuja la tabla elegida
function cargarDatosCatalogo(tipo) {
    const thead = document.getElementById('thead-catalogo');
    const tbody = document.getElementById('tbody-catalogo');
    const btnNuevo = document.getElementById('btn-nuevo-registro');

    // Loader animado mientras responde el servidor
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted"><span class="spinner-border spinner-border-sm me-2"></span>Consultando base de datos...</td></tr>`;

    // -----------------------------------------------------------------
    // CASO: MATERIAS
    if (tipo === 'materias') {
        btnNuevo.innerHTML = '<i class="bi bi-plus-lg"></i> Nueva Materia';
        btnNuevo.onclick = () => abrirModalNuevo('materias'); 

        thead.innerHTML = `
            <tr>
                <th>ID</th>
                <th>Nombre de la Materia</th>
                <th class="text-center">Semestre</th>
                <th>Carrera / Plan</th>
                <th class="text-end">Acciones</th>
            </tr>`;

        fetch('../../php/endpoints/obtener_materias.php')
            .then(res => res.json())
            .then(datos => {
                tbody.innerHTML = '';
                if (datos.status === 'success') {
                    if (datos.data.length === 0) {
                        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No hay materias registradas en el sistema.</td></tr>`;
                    } else {
                        datos.data.forEach(m => {
                            tbody.innerHTML += `
                                <tr>
                                    <td class="fw-bold text-secondary">#${m.id_materia}</td>
                                    <td class="fw-semibold text-dark">${m.nombre}</td>
                                    <td class="text-center">
                                        <span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary-subtle px-2 py-1">${m.semestre}° Semestre</span>
                                    </td>
                                    <td>
                                        <span class="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle px-3 py-1 rounded-pill fw-bold">${m.carrera}</span>
                                    </td>
                                    <td class="text-end">
                                        <button class="btn btn-sm btn-outline-primary me-1" onclick="editarMateria(${m.id_materia})" title="Editar Materia"><i class="bi bi-pencil-square"></i></button>
                                        <button class="btn btn-sm btn-outline-danger" onclick="eliminarMateria(${m.id_materia})" title="Eliminar Materia"><i class="bi bi-trash3"></i></button>
                                    </td>
                                </tr>`;
                        });
                    }
                } else {
                    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">Error: ${datos.message}</td></tr>`;
                }
            })
            .catch(err => {
                console.error("Error atrapado por JS (Materias):", err);
                tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">Fallo la conexión con el servidor.</td></tr>`;
            });

    // -----------------------------------------------------------------
    // CASO: SALONES Y EDIFICIOS
    } else if (tipo === 'salones') {
        btnNuevo.innerHTML = '<i class="bi bi-plus-lg"></i> Nuevo Salón';
        btnNuevo.onclick = () => abrirModalNuevo('salones'); 

        thead.innerHTML = `
            <tr>
                <th>ID</th>
                <th>Ubicación / Edificio</th>
                <th>Piso / Planta</th>
                <th>Aula / Laboratorio</th>
                <th class="text-end">Acciones</th>
            </tr>`;

        fetch('../../php/endpoints/obtener_salones.php')
            .then(res => res.json())
            .then(datos => {
                tbody.innerHTML = '';
                if (datos.status === 'success') {
                    if (datos.data.length === 0) {
                        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No hay salones registrados en el sistema.</td></tr>`;
                    } else {
                        datos.data.forEach(s => {
                            tbody.innerHTML += `
                                <tr>
                                    <td class="fw-bold text-secondary">#${s.id_salon}</td>
                                    <td class="fw-semibold text-dark"><i class="bi bi-building me-2 text-success"></i>${s.edificio}</td>
                                    <td>${s.piso}</td>
                                    <td>
                                        <span class="badge bg-success bg-opacity-10 text-success border border-success-subtle px-3 py-1 fw-bold fs-6">${s.numero}</span>
                                    </td>
                                    <td class="text-end">
                                        <button class="btn btn-sm btn-outline-primary me-1" onclick="editarSalon(${s.id_salon})" title="Editar Salón"><i class="bi bi-pencil-square"></i></button>
                                        <button class="btn btn-sm btn-outline-danger" onclick="eliminarSalon(${s.id_salon})" title="Eliminar Salón"><i class="bi bi-trash3"></i></button>
                                    </td>
                                </tr>`;
                        });
                    }
                } else {
                    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">Error: ${datos.message}</td></tr>`;
                }
            })
            .catch(err => {
                console.error("Error atrapado por JS (Salones):", err);
                tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">Fallo la conexión con el servidor.</td></tr>`;
            });

    // -----------------------------------------------------------------
    // CASO: CARRERAS
    } else if (tipo === 'carreras') {
        btnNuevo.innerHTML = '<i class="bi bi-plus-lg"></i> Nueva Carrera';
        btnNuevo.onclick = () => abrirModalNuevo('carreras'); 

        thead.innerHTML = `
            <tr>
                <th>ID</th>
                <th>Acrónimo</th>
                <th>Nombre de la Carrera</th>
                <th class="text-end">Acciones</th>
            </tr>`;

        fetch('../../php/endpoints/obtener_carreras.php')
            .then(res => res.json())
            .then(datos => {
                tbody.innerHTML = '';
                if (datos.status === 'success') {
                    if (datos.data.length === 0) {
                        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">No hay carreras registradas en el sistema.</td></tr>`;
                    } else {
                        datos.data.forEach(c => {
                            tbody.innerHTML += `
                                <tr>
                                    <td class="fw-bold text-secondary">#${c.id_carrera}</td>
                                    <td>
                                        <span class="badge bg-warning bg-opacity-10 text-warning-emphasis border border-warning-subtle px-3 py-1 fw-bold">${c.acronimo}</span>
                                    </td>
                                    <td class="fw-semibold text-dark">${c.nombre}</td>
                                    <td class="text-end">
                                        <button class="btn btn-sm btn-outline-primary me-1" onclick="editarCarrera(${c.id_carrera})" title="Editar Carrera"><i class="bi bi-pencil-square"></i></button>
                                        <button class="btn btn-sm btn-outline-danger" onclick="eliminarCarrera(${c.id_carrera})" title="Eliminar Carrera"><i class="bi bi-trash3"></i></button>
                                    </td>
                                </tr>`;
                        });
                    }
                } else {
                    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger py-4">Error: ${datos.message}</td></tr>`;
                }
            })
            .catch(err => {
                console.error("Error atrapado por JS (Carreras):", err);
                tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger py-4">Fallo la conexión con el servidor.</td></tr>`;
            });
    }
}

// =========================================================================
// CONTROL DE VENTANA FLOTANTE (MODAL) PARA NUEVOS REGISTROS Y EDICIÓN
let modalActual; 
let tipoModalActual = ''; 
let idRegistroEditando = null; // <-- NUEVA VARIABLE: Guarda el ID del registro a editar

// Le agregamos un segundo parámetro (datosEdicion) que solo se usará cuando vayamos a editar
function abrirModalNuevo(tipo, datosEdicion = null) {
    // Si nos pasan datos, estamos editando. Si no, estamos creando.
    tipoModalActual = datosEdicion ? 'editar_' + tipo : tipo; 
    
    const titulo = document.getElementById('titulo-modal');
    const cuerpo = document.getElementById('cuerpo-modal');

    if (tipo === 'carreras') {
        titulo.innerText = datosEdicion ? 'Editar Carrera' : 'Agregar Nueva Carrera';
        // (Aquí iría el HTML del formulario carreras...)
    } else if (tipo === 'salones') {
        titulo.innerText = datosEdicion ? 'Editar Salón' : 'Agregar Nuevo Salón';
        // (Aquí iría el HTML del formulario salones...)
    } else if (tipo === 'materias') {
        titulo.innerText = datosEdicion ? 'Editar Materia' : 'Agregar Nueva Materia';
        cuerpo.innerHTML = `
            <form id="form-nuevo-catalogo" novalidate>
                <div class="mb-3">
                    <label class="form-label fw-bold text-secondary">Nombre de la Materia</label>
                    <input type="text" class="form-control" id="input-materia-nombre" placeholder="Ej. Redes de Computadoras">
                    <div class="invalid-feedback">Por favor, ingresa el nombre de la materia.</div>
                </div>
                <div class="mb-3">
                    <label class="form-label fw-bold text-secondary">Semestre (1 al 10)</label>
                    <input type="number" class="form-control" id="input-materia-semestre" placeholder="Ej. 5">
                    <div class="invalid-feedback">Debe ser un número válido entre 1 y 10.</div>
                </div>
                <div class="row">
                    <div class="col-6 mb-3">
                        <label class="form-label fw-bold text-secondary">ID Carrera</label>
                        <input type="number" class="form-control" id="input-materia-carrera" placeholder="Ej. 1">
                        <div class="invalid-feedback">Campo requerido.</div>
                    </div>
                    <div class="col-6 mb-3">
                        <label class="form-label fw-bold text-secondary">ID Área</label>
                        <input type="number" class="form-control" id="input-materia-area" placeholder="Ej. 2">
                        <div class="invalid-feedback">Campo requerido.</div>
                    </div>
                </div>
                <div id="alerta-servidor" class="alert alert-danger d-none mt-2" role="alert"></div>
            </form>
        `;
    }

    const modalElement = document.getElementById('modalCatalogo');
    modalActual = new bootstrap.Modal(modalElement);
    modalActual.show();

    // Si estamos editando, llenamos los campos con los datos de la BD
    if (datosEdicion && tipo === 'materias') {
        document.getElementById('input-materia-nombre').value = datosEdicion.nombre;
        document.getElementById('input-materia-semestre').value = datosEdicion.semestre;
        document.getElementById('input-materia-carrera').value = datosEdicion.id_carrera;
        document.getElementById('input-materia-area').value = datosEdicion.id_area;
        idRegistroEditando = datosEdicion.id_materia; // Guardamos el ID en secreto para actualizarlo luego
    }
}

function guardarNuevoRegistro() {
    // Aceptamos tanto 'materias' (crear) como 'editar_materias' (actualizar)
    if (tipoModalActual === 'materias' || tipoModalActual === 'editar_materias') {
        const inputNombre = document.getElementById('input-materia-nombre');
        const inputSemestre = document.getElementById('input-materia-semestre');
        const inputCarrera = document.getElementById('input-materia-carrera');
        const inputArea = document.getElementById('input-materia-area');
        const alertaServidor = document.getElementById('alerta-servidor');

        [inputNombre, inputSemestre, inputCarrera, inputArea].forEach(input => input.classList.remove('is-invalid'));
        alertaServidor.classList.add('d-none'); 

        let hayErrores = false; 

        if (!inputNombre.value.trim()) { inputNombre.classList.add('is-invalid'); hayErrores = true; }
        const numSemestre = parseInt(inputSemestre.value.trim());
        if (isNaN(numSemestre) || numSemestre < 1 || numSemestre > 10) { inputSemestre.classList.add('is-invalid'); hayErrores = true; }
        if (!inputCarrera.value.trim()) { inputCarrera.classList.add('is-invalid'); hayErrores = true; }
        if (!inputArea.value.trim()) { inputArea.classList.add('is-invalid'); hayErrores = true; }

        if (hayErrores) return; 

        const formData = new FormData();
        formData.append('nombre', inputNombre.value.trim());
        formData.append('semestre', inputSemestre.value.trim());
        formData.append('id_carrera', inputCarrera.value.trim());
        formData.append('id_area', inputArea.value.trim());

        // Si estamos editando, le agregamos el ID al paquete y cambiamos la ruta
        let rutaFecth = '../../php/endpoints/crear_materia.php';
        if (tipoModalActual === 'editar_materias') {
            formData.append('id_materia', idRegistroEditando);
            rutaFecth = '../../php/endpoints/actualizar_materia.php';
        }

        fetch(rutaFecth, { method: 'POST', body: formData })
        .then(res => res.json())
        .then(datos => {
            if (datos.status === 'success') {
                alert(datos.message); 
                modalActual.hide(); 
                cargarDatosCatalogo('materias'); 
            } else {
                alertaServidor.innerText = datos.message;
                alertaServidor.classList.remove('d-none'); 
            }
        })
        .catch(err => {
            console.error("Error al guardar:", err);
            alertaServidor.innerText = "Fallo la conexión con el servidor.";
            alertaServidor.classList.remove('d-none');
        });
    }
}

// =========================================================================
// FUNCIONES REALES DE EDICIÓN Y ELIMINACIÓN
function eliminarMateria(id) {
    if (confirm("¿Estás seguro de que deseas eliminar la materia #" + id + "? Esta acción no se puede deshacer.")) {
        const formData = new FormData();
        formData.append('id_materia', id);

        fetch('../../php/endpoints/eliminar_materia.php', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(datos => {
            if (datos.status === 'success') {
                alert(datos.message);
                cargarDatosCatalogo('materias'); // Refresca la tabla automáticamente
            } else {
                alert("Error: " + datos.message); // Avisa si está conectada a KARDEX, por ejemplo
            }
        })
        .catch(err => console.error("Error al eliminar:", err));
    }
}

function editarMateria(id) {
    // 1. Vamos al backend a buscar los datos actuales de la materia
    fetch('../../php/endpoints/obtener_materia.php?id=' + id)
    .then(res => res.json())
    .then(datos => {
        if (datos.status === 'success') {
            // 2. Si encontramos la materia, abrimos el modal pasándole los datos
            abrirModalNuevo('materias', datos.data);
        } else {
            alert("Error: " + datos.message);
        }
    })
    .catch(err => console.error("Error al obtener materia:", err));
}

// (Pendientes para Salones y Carreras)
function editarSalon(id) { console.log("Editar salon:", id); }
function eliminarSalon(id) { console.log("Eliminar salon:", id); }
function editarCarrera(id) { console.log("Editar carrera:", id); }
function eliminarCarrera(id) { console.log("Eliminar carrera:", id); }