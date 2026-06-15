//tablas expandibles para cada categoria
function iniciarVistaCatalogos() {
    const btnMaterias = document.getElementById('btn-cat-materias');
    const btnSalones = document.getElementById('btn-cat-salones');
    const btnCarreras = document.getElementById('btn-cat-carreras');
    const contenedor = document.getElementById('contenedor-catalogos');
    const tituloTabla = document.getElementById('titulo-tabla-catalogo');

    // Función para desplegar la tabla
    function desplegarTabla(titulo, tipo) {
        tituloTabla.innerText = "Catálogo de " + titulo;
        contenedor.style.display = 'block'; 
        
        // Efecto visual para bajar la pantalla hasta la tabla
        contenedor.scrollIntoView({ behavior: 'smooth', block: 'start' });

        cargarDatosCatalogo(tipo);
    }

    // Conectamos los botones
    if (btnMaterias) btnMaterias.addEventListener('click', () => desplegarTabla('Materias', 'materias'));
    if (btnSalones) btnSalones.addEventListener('click', () => desplegarTabla('Salones y Edificios', 'salones'));
    if (btnCarreras) btnCarreras.addEventListener('click', () => desplegarTabla('Carreras', 'carreras'));
}

// Función que dibuja la tabla según el catálogo elegido
function cargarDatosCatalogo(tipo) {
    const thead = document.getElementById('thead-catalogo');
    const tbody = document.getElementById('tbody-catalogo');
    const btnNuevo = document.getElementById('btn-nuevo-registro');

    // Loader mientras cargan los datos
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted"><span class="spinner-border spinner-border-sm me-2"></span>Cargando datos...</td></tr>`;

    if (tipo === 'materias') {
        btnNuevo.innerHTML = '<i class="bi bi-plus-lg"></i> Nueva Materia';
        thead.innerHTML = `
            <tr>
                <th>ID</th>
                <th>Nombre de la Materia</th>
                <th>Semestre</th>
                <th>Carrera</th>
                <th class="text-end">Acciones</th>
            </tr>`;
        // Aquí conectaremos el fetch en el futuro...
        
    } else if (tipo === 'salones') {
        btnNuevo.innerHTML = '<i class="bi bi-plus-lg"></i> Nuevo Salón';
        thead.innerHTML = `
            <tr>
                <th>ID</th>
                <th>Nombre / Número</th>
                <th>Edificio</th>
                <th>Capacidad</th>
                <th class="text-end">Acciones</th>
            </tr>`;
        // Aquí conectaremos el fetch en el futuro...

    } else if (tipo === 'carreras') {
        btnNuevo.innerHTML = '<i class="bi bi-plus-lg"></i> Nueva Carrera';
        thead.innerHTML = `
            <tr>
                <th>ID</th>
                <th>Acrónimo</th>
                <th>Nombre Completo</th>
                <th>Plan</th>
                <th class="text-end">Acciones</th>
            </tr>`;
        // Aquí conectaremos el fetch en el futuro...
    }
}