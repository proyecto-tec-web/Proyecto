let chartInscripciones = null;

// Cargar el dashboard apenas abres la página
document.addEventListener("DOMContentLoaded", () => {
    // Buscamos el primer enlace del menú para pasarlo como elemento activo
    const primerEnlace = document.querySelector('.menu-link');
    cargarVista('dashboard', primerEnlace);
});

function cargarVista(nombreVista, elementoClick) {
    const contenedor = document.getElementById('view-container');
    
    // 1. Mostrar estado de carga
    contenedor.innerHTML = `
        <div class="text-center mt-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted">Cargando módulo...</p>
        </div>`;

    // 2. Traer el archivo HTML de la carpeta vistas
    fetch(`vistas/${nombreVista}.html`)
        .then(respuesta => {
            if (!respuesta.ok) throw new Error('Vista no encontrada');
            return respuesta.text();
        })
        .then(html => {
            // 3. Inyectar el HTML
            contenedor.innerHTML = html;
            
            // 4. Actualizar título y colores del menú
            if (elementoClick) {
                document.querySelectorAll('.menu-link').forEach(enlace => {
                    enlace.classList.remove('active');
                    enlace.classList.add('link-body-emphasis');
                });
                elementoClick.classList.add('active');
                elementoClick.classList.remove('link-body-emphasis');
                
                // Actualizar el H1 de arriba
                document.getElementById('titulo-seccion').innerText = elementoClick.innerText.trim();
            }

            // 5. Cerrar menú en móviles automáticamente
            let bsOffcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('sidebarMenu'));
            if (bsOffcanvas && window.innerWidth < 768) {
                bsOffcanvas.hide();
            }

            // 6. Ejecutar lógica específica de la vista (Ej. cargar gráficas o llamar a PHP)
            inicializarLogicaVista(nombreVista);
        })
        .catch(error => {
            contenedor.innerHTML = `<div class="alert alert-danger shadow-sm">Error al cargar la vista: ${nombreVista}.html asegúrate de usar un servidor local (XAMPP/Live Server).</div>`;
        });
}

function inicializarLogicaVista(nombreVista) {
    // Si entramos al dashboard, pintamos la gráfica y los números
    if (nombreVista === 'dashboard') {
        
        // Simulación de datos que vendrán de PHP
        document.getElementById('kpi-examenes').innerText = "24";
        document.getElementById('kpi-inscritos').innerText = "342";
        document.getElementById('kpi-pagos').innerText = "45";
        document.getElementById('kpi-actas').innerText = "8 / 24";

        const ctx = document.getElementById('inscripcionesChart').getContext('2d');
        if (chartInscripciones) chartInscripciones.destroy(); // Evitar duplicados
        
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

    // Aquí agregarás los fetch('api/get_examenes.php') para las otras vistas en el futuro
}