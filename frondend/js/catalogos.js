function iniciarVistaCatalogos() {
    const btnMaterias = document.getElementById('btn-cat-materias');
    const btnSalones = document.getElementById('btn-cat-salones');
    const btnCarreras = document.getElementById('btn-cat-carreras');
    const contenedor = document.getElementById('contenedor-catalogos');
    const tituloTabla = document.getElementById('titulo-tabla-catalogo');

    function desplegarTabla(titulo, tipo) {
        tituloTabla.innerText = "Catálogo de " + titulo;
        contenedor.style.display = 'block'; 
        contenedor.scrollIntoView({ behavior: 'smooth', block: 'start' });
        cargarDatosCatalogo(tipo);
    }

    if (btnMaterias) btnMaterias.addEventListener('click', () => desplegarTabla('Materias', 'materias'));
    if (btnSalones) btnSalones.addEventListener('click', () => desplegarTabla('Salones y Edificios', 'salones'));
    if (btnCarreras) btnCarreras.addEventListener('click', () => desplegarTabla('Carreras', 'carreras'));
}

function cargarDatosCatalogo(tipo) {
    const thead = document.getElementById('thead-catalogo');
    const tbody = document.getElementById('tbody-catalogo');
    const btnNuevo = document.getElementById('btn-nuevo-registro');

    // Definimos el texto exacto del buscador según el catálogo abierto
    let textoFondo = '';
    if (tipo === 'materias') {
        textoFondo = 'Buscar por nombre, semestre o carrera...';
    } else if (tipo === 'salones') {
        textoFondo = 'Buscar por edificio, piso o aula/laboratorio...';
    } else if (tipo === 'carreras') {
        textoFondo = 'Buscar por nombre o acrónimo...';
    }

    // BUSCADOR: Lo creamos o lo actualizamos dinámicamente
    const tablaPadre = tbody.closest('table');
    let buscador = document.getElementById('buscador-catalogo');
    
    if (!buscador) {
        // Insertamos el HTML del buscador inyectando nuestra variable de texto
        const buscadorHTML = `
            <div class="row mb-3 mt-3" id="contenedor-buscador">
                <div class="col-12 col-md-6 col-lg-5">
                    <div class="input-group shadow-sm">
                        <span class="input-group-text bg-white text-primary border-primary"><i class="bi bi-search"></i></span>
                        <input type="text" class="form-control border-primary" id="buscador-catalogo" placeholder="${textoFondo}">
                    </div>
                </div>
            </div>
        `;
        tablaPadre.insertAdjacentHTML('beforebegin', buscadorHTML);
        
        // Conectamos el motor de filtrado en tiempo real
        buscador = document.getElementById('buscador-catalogo');
        buscador.addEventListener('input', function() {
            const textoBusqueda = this.value.toLowerCase();
            const filas = document.querySelectorAll('#tbody-catalogo tr');
            
            filas.forEach(fila => {
                if (fila.cells.length === 1) return; 
                const contenidoFila = fila.textContent.toLowerCase();
                fila.style.display = contenidoFila.includes(textoBusqueda) ? '' : 'none';
            });
        });
    } else {
        // Si el buscador ya existe, lo limpiamos Y actualizamos su texto de fondo
        buscador.value = '';
        buscador.placeholder = textoFondo;
        // Restauramos todas las filas por si habían quedado ocultas de la búsqueda anterior
        const filas = document.querySelectorAll('#tbody-catalogo tr');
        filas.forEach(fila => fila.style.display = '');
    }

    // Loader animado mientras responde el servidor
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted"><span class="spinner-border spinner-border-sm me-2"></span>Consultando base de datos...</td></tr>`;

    // -----------------------------------------------------------------
    // TABLA: MATERIAS
    if (tipo === 'materias') {
        btnNuevo.innerHTML = '<i class="bi bi-plus-lg"></i> Nueva Materia';
        btnNuevo.onclick = () => abrirModalNuevo('materias'); 
        thead.innerHTML = `<tr><th>ID</th><th>Nombre de la Materia</th><th class="text-center">Semestre</th><th>Carrera / Plan</th><th class="text-end">Acciones</th></tr>`;

        fetch('../../php/endpoints/obtener_materias.php')
            .then(res => res.json())
            .then(datos => {
                tbody.innerHTML = '';
                if (datos.status === 'success') {
                    if (datos.data.length === 0) tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No hay materias registradas.</td></tr>`;
                    else {
                        datos.data.forEach(m => {
                            tbody.innerHTML += `
                                <tr>
                                    <td class="fw-bold text-secondary">#${m.id_materia}</td>
                                    <td class="fw-semibold text-dark">${m.nombre}</td>
                                    <td class="text-center"><span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary-subtle px-2 py-1">${m.semestre}° Semestre</span></td>
                                    <td><span class="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle px-3 py-1 rounded-pill fw-bold">${m.carrera}</span></td>
                                    <td class="text-end">
                                        <button class="btn btn-sm btn-outline-primary me-1" onclick="editarMateria(${m.id_materia})" title="Editar Materia"><i class="bi bi-pencil-square"></i></button>
                                        <button class="btn btn-sm btn-outline-danger" onclick="eliminarMateria(${m.id_materia})" title="Eliminar Materia"><i class="bi bi-trash3"></i></button>
                                    </td>
                                </tr>`;
                        });
                    }
                } else tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">Error: ${datos.message}</td></tr>`;
            }).catch(err => { tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">Fallo la conexión con el servidor.</td></tr>`; });

    // -----------------------------------------------------------------
    // TABLA: SALONES
    } else if (tipo === 'salones') {
        btnNuevo.innerHTML = '<i class="bi bi-plus-lg"></i> Nuevo Salón';
        btnNuevo.onclick = () => abrirModalNuevo('salones'); 
        thead.innerHTML = `<tr><th>ID</th><th>Ubicación / Edificio</th><th>Piso / Planta</th><th>Aula / Laboratorio</th><th class="text-end">Acciones</th></tr>`;

        fetch('../../php/endpoints/obtener_salones.php')
            .then(res => res.json())
            .then(datos => {
                tbody.innerHTML = '';
                if (datos.status === 'success') {
                    if (datos.data.length === 0) tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No hay salones registrados.</td></tr>`;
                    else {
                        datos.data.forEach(s => {
                            tbody.innerHTML += `
                                <tr>
                                    <td class="fw-bold text-secondary">#${s.id_salon}</td>
                                    <td class="fw-semibold text-dark"><i class="bi bi-building me-2 text-success"></i>${s.edificio}</td>
                                    <td>${s.piso}</td>
                                    <td><span class="badge bg-success bg-opacity-10 text-success border border-success-subtle px-3 py-1 fw-bold fs-6">${s.numero}</span></td>
                                    <td class="text-end">
                                        <button class="btn btn-sm btn-outline-primary me-1" onclick="editarSalon(${s.id_salon})" title="Editar Salón"><i class="bi bi-pencil-square"></i></button>
                                        <button class="btn btn-sm btn-outline-danger" onclick="eliminarSalon(${s.id_salon})" title="Eliminar Salón"><i class="bi bi-trash3"></i></button>
                                    </td>
                                </tr>`;
                        });
                    }
                } else tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">Error: ${datos.message}</td></tr>`;
            }).catch(err => { tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">Fallo la conexión con el servidor.</td></tr>`; });

    // -----------------------------------------------------------------
    // TABLA: CARRERAS
    } else if (tipo === 'carreras') {
        btnNuevo.innerHTML = '<i class="bi bi-plus-lg"></i> Nueva Carrera';
        btnNuevo.onclick = () => abrirModalNuevo('carreras'); 
        thead.innerHTML = `<tr><th>ID</th><th>Acrónimo</th><th>Nombre de la Carrera</th><th class="text-end">Acciones</th></tr>`;

        fetch('../../php/endpoints/obtener_carreras.php')
            .then(res => res.json())
            .then(datos => {
                tbody.innerHTML = '';
                if (datos.status === 'success') {
                    if (datos.data.length === 0) tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">No hay carreras registradas.</td></tr>`;
                    else {
                        datos.data.forEach(c => {
                            tbody.innerHTML += `
                                <tr>
                                    <td class="fw-bold text-secondary">#${c.id_carrera}</td>
                                    <td><span class="badge bg-warning bg-opacity-10 text-warning-emphasis border border-warning-subtle px-3 py-1 fw-bold">${c.acronimo}</span></td>
                                    <td class="fw-semibold text-dark">${c.nombre}</td>
                                    <td class="text-end">
                                        <button class="btn btn-sm btn-outline-primary me-1" onclick="editarCarrera(${c.id_carrera})" title="Editar Carrera"><i class="bi bi-pencil-square"></i></button>
                                        <button class="btn btn-sm btn-outline-danger" onclick="eliminarCarrera(${c.id_carrera})" title="Eliminar Carrera"><i class="bi bi-trash3"></i></button>
                                    </td>
                                </tr>`;
                        });
                    }
                } else tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger py-4">Error: ${datos.message}</td></tr>`;
            }).catch(err => { tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger py-4">Fallo la conexión con el servidor.</td></tr>`; });
    }
}

// ================================================
// VENTANA FLOTANTE (MODAL): FORMULARIOS DINÁMICOS
let modalActual; 
let tipoModalActual = ''; 
let idRegistroEditando = null; 

function abrirModalNuevo(tipo, datosEdicion = null) {
    tipoModalActual = datosEdicion ? 'editar_' + tipo : tipo; 
    
    const titulo = document.getElementById('titulo-modal');
    const cuerpo = document.getElementById('cuerpo-modal');

    // FORMULARIO: CARRERAS
    if (tipo === 'carreras') {
        titulo.innerText = datosEdicion ? 'Editar Carrera' : 'Agregar Nueva Carrera';
        cuerpo.innerHTML = `
            <form id="form-nuevo-catalogo" novalidate>
                <div class="mb-3">
                    <label class="form-label fw-bold text-secondary">Nombre de la Carrera</label>
                    <input type="text" class="form-control" id="input-carrera-nombre" placeholder="Ej. Ingeniería en Sistemas Computacionales">
                    <div class="invalid-feedback">Por favor, ingresa el nombre completo de la carrera.</div>
                </div>
                <div class="mb-3">
                    <label class="form-label fw-bold text-secondary">Acrónimo</label>
                    <input type="text" class="form-control" id="input-carrera-acronimo" placeholder="Ej. ISC">
                    <div class="invalid-feedback">Por favor, ingresa el acrónimo.</div>
                </div>
                <div id="alerta-servidor" class="alert alert-danger d-none mt-2" role="alert"></div>
            </form>
        `;

    // FORMULARIO: SALONES
    } else if (tipo === 'salones') {
        titulo.innerText = datosEdicion ? 'Editar Salón' : 'Agregar Nuevo Salón';
        cuerpo.innerHTML = `
            <form id="form-nuevo-catalogo" novalidate>
                <div class="mb-3">
                    <label class="form-label fw-bold text-secondary"><i class="bi bi-building me-2"></i>Ubicación / Edificio</label>
                    <input type="text" class="form-control" id="input-salon-edificio" placeholder="Ej. Edificio 1">
                    <div class="invalid-feedback">Por favor, ingresa el nombre del edificio.</div>
                </div>
                <div class="row">
                    <div class="col-6 mb-3">
                        <label class="form-label fw-bold text-secondary">Piso / Planta</label>
                        <input type="text" class="form-control" id="input-salon-piso" placeholder="Ej. Planta Baja">
                        <div class="invalid-feedback">Por favor, ingresa el piso.</div>
                    </div>
                    <div class="col-6 mb-3">
                        <label class="form-label fw-bold text-secondary">Aula / Laboratorio</label>
                        <input type="text" class="form-control" id="input-salon-numero" placeholder="Ej. 101">
                        <div class="invalid-feedback">Por favor, ingresa el número o nombre del aula.</div>
                    </div>
                </div>
                <div id="alerta-servidor" class="alert alert-danger d-none mt-2" role="alert"></div>
            </form>
        `;

    // FORMULARIO: MATERIAS
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

    // AUTO-LLENAR SI ES EDICIÓN
    if (datosEdicion) {
        if (tipo === 'materias') {
            document.getElementById('input-materia-nombre').value = datosEdicion.nombre;
            document.getElementById('input-materia-semestre').value = datosEdicion.semestre;
            document.getElementById('input-materia-carrera').value = datosEdicion.id_carrera;
            document.getElementById('input-materia-area').value = datosEdicion.id_area;
            idRegistroEditando = datosEdicion.id_materia;
        } else if (tipo === 'salones') {
            document.getElementById('input-salon-edificio').value = datosEdicion.edificio;
            document.getElementById('input-salon-piso').value = datosEdicion.piso;
            document.getElementById('input-salon-numero').value = datosEdicion.numero;
            idRegistroEditando = datosEdicion.id_salon;
        } else if (tipo === 'carreras') {
            document.getElementById('input-carrera-nombre').value = datosEdicion.nombre;
            document.getElementById('input-carrera-acronimo').value = datosEdicion.acronimo;
            idRegistroEditando = datosEdicion.id_carrera;
        }
    }
}

// ===============================
// GUARDAR / ACTUALIZAR REGISTROS
function guardarNuevoRegistro() {
    const alertaServidor = document.getElementById('alerta-servidor');
    alertaServidor.classList.add('d-none');
    let hayErrores = false;
    const formData = new FormData();
    let rutaFecth = '';

    // GUARDAR MATERIAS
    if (tipoModalActual === 'materias' || tipoModalActual === 'editar_materias') {
        const inputs = ['input-materia-nombre', 'input-materia-semestre', 'input-materia-carrera', 'input-materia-area'].map(id => document.getElementById(id));
        inputs.forEach(input => input.classList.remove('is-invalid'));

        if (!inputs[0].value.trim()) { inputs[0].classList.add('is-invalid'); hayErrores = true; }
        const numSem = parseInt(inputs[1].value.trim());
        if (isNaN(numSem) || numSem < 1 || numSem > 10) { inputs[1].classList.add('is-invalid'); hayErrores = true; }
        if (!inputs[2].value.trim()) { inputs[2].classList.add('is-invalid'); hayErrores = true; }
        if (!inputs[3].value.trim()) { inputs[3].classList.add('is-invalid'); hayErrores = true; }

        if (hayErrores) return;
        formData.append('nombre', inputs[0].value.trim()); 
        formData.append('semestre', inputs[1].value.trim());
        formData.append('id_carrera', inputs[2].value.trim()); 
        formData.append('id_area', inputs[3].value.trim());

        rutaFecth = tipoModalActual === 'editar_materias' ? '../../php/endpoints/actualizar_materia.php' : '../../php/endpoints/crear_materia.php';
        if (tipoModalActual === 'editar_materias') formData.append('id_materia', idRegistroEditando);

    // GUARDAR SALONES
    } else if (tipoModalActual === 'salones' || tipoModalActual === 'editar_salones') {
        const inputs = ['input-salon-edificio', 'input-salon-piso', 'input-salon-numero'].map(id => document.getElementById(id));
        inputs.forEach(input => input.classList.remove('is-invalid'));

        inputs.forEach(input => { if (!input.value.trim()) { input.classList.add('is-invalid'); hayErrores = true; } });
        if (hayErrores) return;

        formData.append('edificio', inputs[0].value.trim()); 
        formData.append('piso', inputs[1].value.trim()); 
        formData.append('numero', inputs[2].value.trim());
        
        rutaFecth = tipoModalActual === 'editar_salones' ? '../../php/endpoints/actualizar_salon.php' : '../../php/endpoints/crear_salon.php';
        if (tipoModalActual === 'editar_salones') formData.append('id_salon', idRegistroEditando);

    // GUARDAR CARRERAS
    } else if (tipoModalActual === 'carreras' || tipoModalActual === 'editar_carreras') {
        const inputs = ['input-carrera-nombre', 'input-carrera-acronimo'].map(id => document.getElementById(id));
        inputs.forEach(input => input.classList.remove('is-invalid'));

        inputs.forEach(input => { if (!input.value.trim()) { input.classList.add('is-invalid'); hayErrores = true; } });
        if (hayErrores) return;

        formData.append('nombre', inputs[0].value.trim()); 
        formData.append('acronimo', inputs[1].value.trim());
        
        rutaFecth = tipoModalActual === 'editar_carreras' ? '../../php/endpoints/actualizar_carrera.php' : '../../php/endpoints/crear_carrera.php';
        if (tipoModalActual === 'editar_carreras') formData.append('id_carrera', idRegistroEditando);
    }

    // ENVÍO AL SERVIDOR
    fetch(rutaFecth, { method: 'POST', body: formData })
    .then(res => res.json())
    .then(datos => {
        if (datos.status === 'success') {
            Swal.fire('¡Éxito!', datos.message, 'success'); 
            modalActual.hide(); 
            cargarDatosCatalogo(tipoModalActual.replace('editar_', '')); 
        } else {
            alertaServidor.innerText = datos.message;
            alertaServidor.classList.remove('d-none'); 
        }
    })
    .catch(err => {
        alertaServidor.innerText = "Fallo la conexión con el servidor.";
        alertaServidor.classList.remove('d-none');
    });
}

// ============================
// ELIMINAR Y EDITAR REGISTROS

// --- MATERIAS ---
function eliminarMateria(id) {
    Swal.fire({
        title: `¿Seguro que deseas eliminar la materia #${id}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            const fd = new FormData(); fd.append('id_materia', id);
            fetch('../../php/endpoints/eliminar_materia.php', { method: 'POST', body: fd })
            .then(res => res.json()).then(d => { 
                if(d.status === 'success') {
                    Swal.fire('¡Eliminada!', d.message, 'success');
                    cargarDatosCatalogo('materias'); 
                } else {
                    Swal.fire('Error', d.message, 'error');
                }
            });
        }
    });
}

function editarMateria(id) {
    fetch('../../php/endpoints/obtener_materia.php?id=' + id)
    .then(res => res.json()).then(d => { 
        if(d.status === 'success') {
            abrirModalNuevo('materias', d.data); 
        } else {
            Swal.fire('Error', d.message, 'error');
        } 
    });
}

// --- SALONES ---
function eliminarSalon(id) {
    Swal.fire({
        title: `¿Seguro que deseas eliminar el salón #${id}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            const fd = new FormData(); fd.append('id_salon', id);
            fetch('../../php/endpoints/eliminar_salon.php', { method: 'POST', body: fd })
            .then(res => res.json()).then(d => { 
                if(d.status === 'success') {
                    Swal.fire('¡Eliminado!', d.message, 'success');
                    cargarDatosCatalogo('salones'); 
                } else {
                    Swal.fire('Error', d.message, 'error');
                }
            });
        }
    });
}

function editarSalon(id) {
    fetch('../../php/endpoints/obtener_salon.php?id=' + id)
    .then(res => res.json()).then(d => { 
        if(d.status === 'success') {
            abrirModalNuevo('salones', d.data); 
        } else {
            Swal.fire('Error', d.message, 'error');
        } 
    });
}

// --- CARRERAS ---
function eliminarCarrera(id) {
    Swal.fire({
        title: `¿Seguro que deseas eliminar la carrera #${id}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            const fd = new FormData(); fd.append('id_carrera', id);
            fetch('../../php/endpoints/eliminar_carrera.php', { method: 'POST', body: fd })
            .then(res => res.json()).then(d => { 
                if(d.status === 'success') {
                    Swal.fire('¡Eliminada!', d.message, 'success');
                    cargarDatosCatalogo('carreras'); 
                } else {
                    Swal.fire('Error', d.message, 'error');
                }
            });
        }
    });
}

function editarCarrera(id) {
    fetch('../../php/endpoints/obtener_carrera.php?id=' + id)
    .then(res => res.json()).then(d => { 
        if(d.status === 'success') {
            abrirModalNuevo('carreras', d.data); 
        } else {
            Swal.fire('Error', d.message, 'error');
        } 
    });
}