
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
        thead.innerHTML = `
            <tr>
                <th>ID</th>
                <th>Nombre de la Materia</th>
                <th class="text-center">Semestre</th>
                <th>Carrera / Plan</th>
                <th class="text-end">Acciones</th>
            </tr>`;

        // RUTA CORRECTA: 2 saltos hacia atrás
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
        thead.innerHTML = `
            <tr>
                <th>ID</th>
                <th>Ubicación / Edificio</th>
                <th>Piso / Planta</th>
                <th>Aula / Laboratorio</th>
                <th class="text-end">Acciones</th>
            </tr>`;

        // RUTA CORRECTA: 2 saltos hacia atrás
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
        thead.innerHTML = `
            <tr>
                <th>ID</th>
                <th>Acrónimo</th>
                <th>Nombre de la Carrera</th>
                <th class="text-end">Acciones</th>
            </tr>`;

        // RUTA CORRECTA: 2 saltos hacia atrás
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

// Funciones temporales para evitar errores de clic
function editarMateria(id) { console.log("Editar materia:", id); }
function eliminarMateria(id) { console.log("Eliminar materia:", id); }
function editarSalon(id) { console.log("Editar salon:", id); }
function eliminarSalon(id) { console.log("Eliminar salon:", id); }
function editarCarrera(id) { console.log("Editar carrera:", id); }
function eliminarCarrera(id) { console.log("Eliminar carrera:", id); }