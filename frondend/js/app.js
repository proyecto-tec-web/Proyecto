let chartInscripciones = null;

document.addEventListener("DOMContentLoaded", () => {
    const primerEnlace = document.querySelector('.menu-link');
    if (primerEnlace) {
        cargarVista('dashboard', primerEnlace);
    }
});

function cargarVista(nombreVista, elementoClick) {
    const contenedor = document.getElementById('view-container');
    
    contenedor.innerHTML = `
        <div class="text-center mt-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted">Consultando al servidor...</p>
        </div>`;

    // Ruta con destructor de caché integrado
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

            // Despierta los modales inyectados dinámicamente
            document.querySelectorAll('[data-bs-toggle="modal"]').forEach(btn => new bootstrap.Modal(document.querySelector(btn.getAttribute('data-bs-target'))));

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
    }

    // ==========================================
    // VISTA: EXÁMENES
    // ==========================================
    if (nombreVista === 'examenes') {
        cargarTablaExamenes();

        fetch('/php/endpoints/obtener_catalogos_ets.php')
            .then(res => res.json())
            .then(data => {
                console.log("👉 2. Datos recibidos del servidor:", data);
                
                if(data.status === 'success') {
                    const selectMateria = document.getElementById('select-materia');
                    if (selectMateria) {
                        selectMateria.innerHTML = '<option value="" selected disabled>Selecciona una materia...</option>';
                        data.materias.forEach(m => {
                            selectMateria.innerHTML += `<option value="${m.id_materia}">${m.nombre}</option>`;
                        });
                    }

                    const selectSinodal = document.getElementById('select-sinodal');
                    if (selectSinodal) {
                        selectSinodal.innerHTML = '<option value="" selected disabled>Asigna un sinodal...</option>';
                        data.profesores.forEach(p => {
                            selectSinodal.innerHTML += `<option value="${p.id_profesor}">${p.nombre}</option>`;
                        });
                    }

                    const selectSalon = document.getElementById('select-salon');
                    if (selectSalon) {
                        selectSalon.innerHTML = '<option value="" selected disabled>Selecciona un salón...</option>';
                        data.salones.forEach(s => {
                            selectSalon.innerHTML += `<option value="${s.id_salon}">${s.nombre}</option>`;
                        });
                    }
                    console.log("👉 3. Menús desplegables llenados con éxito.");
                } else {
                    console.error("❌ Error del servidor:", data.message);
                }
            })
            .catch(err => console.error("❌ Fallo de JavaScript al procesar catálogos:", err));

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
                    alert("Por favor, llena todos los campos del formulario.");
                    return;
                }

                btnGuardarETS.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';
                btnGuardarETS.disabled = true;

                const datosETS = { materia, sinodal, fecha, hora, salon, cupo };

                fetch('/php/endpoints/crear_ets.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datosETS)
                })
                .then(respuesta => respuesta.json())
                .then(datos => {
                    if (datos.status === 'success') {
                        // Ocultamos el modal
                        const modalElement = document.getElementById('modalNuevoETS');
                        if(modalElement) {
                            const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
                            modalInstance.hide();
                        }
                        
                        document.getElementById('form-nuevo-ets').reset();
                        btnGuardarETS.innerHTML = '<i class="bi bi-save me-1"></i> Guardar Examen';
                        btnGuardarETS.disabled = false;
                        alert("¡Examen programado con éxito!"); 
                    } else {
                        alert("Error: " + datos.message);
                        btnGuardarETS.innerHTML = '<i class="bi bi-save me-1"></i> Guardar Examen';
                        btnGuardarETS.disabled = false;
                    }
                })
                .catch(error => {
                    console.error("❌ Error guardando ETS:", error);
                    alert("Ocurrió un error al intentar comunicar con el servidor.");
                    btnGuardarETS.innerHTML = '<i class="bi bi-save me-1"></i> Guardar Examen';
                    btnGuardarETS.disabled = false;
                });
            });
        }
    }
}

function cargarTablaUsuarios() {
    const tbody = document.getElementById('cuerpo-tabla-usuarios');
    const alertaError = document.getElementById('alerta-error-usuarios');
    
    if(!tbody) return;

    fetch('/php/endpoints/obtener_usuarios.php')
        .then(respuesta => respuesta.json())
        .then(datos => {
            if (datos.status === 'error') {
                if(alertaError){
                    alertaError.classList.remove('d-none');
                    alertaError.innerText = "Error BD: " + datos.message;
                }
                tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger py-4">Fallo la conexión.</td></tr>`;
                return;
            }

            tbody.innerHTML = ''; 
            
            if (datos.data && datos.data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">No hay usuarios registrados.</td></tr>`;
                return;
            }

            if(datos.data){
                datos.data.forEach(user => {
                    let colorBadge = (user.rol === 'Administrador' || user.rol === 'admin') ? 'danger' : 'primary';
                    
                    let filaHTML = `
                        <tr>
                            <td class="ps-4 fw-bold text-secondary">#${user.id_usuario}</td>
                            <td>${user.correo}</td>
                            <td>
                                <span class="badge bg-${colorBadge} bg-opacity-10 text-${colorBadge} border border-${colorBadge}-subtle px-3 py-2 rounded-pill">
                                    ${user.rol}
                                </span>
                            </td>
                            <td class="pe-4 text-end">
                                <button class="btn btn-sm btn-outline-secondary me-1"><i class="bi bi-pencil"></i></button>
                                <button class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                            </td>
                        </tr>
                    `;
                    tbody.innerHTML += filaHTML;
                });
            }
        })
        .catch(error => {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger py-4">Error al procesar los datos.</td></tr>`;
            console.error("Error:", error);
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

            tbody.innerHTML = ''; // Limpiamos la tabla
            
            if (datos.data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">Aún no hay exámenes programados.</td></tr>`;
                return;
            }

            // Pintamos cada examen en la tabla
            datos.data.forEach(ex => {
                // Le damos color al estado (verde si está Abierto, azul si está Programado)
                let colorBadge = (ex.estado === 'Programado') ? 'primary' : (ex.estado === 'Abierto' ? 'success' : 'secondary');
                
                let filaHTML = `
                    <tr>
                        <td class="ps-4 fw-bold text-secondary">#${ex.id_examen}</td>
                        <td class="fw-semibold">${ex.materia}</td>
                        <td>
                            <div>${ex.fecha}</div>
                            <small class="text-muted">${ex.hora_inicio} - ${ex.hora_fin}</small>
                        </td>
                        <td>${ex.sinodal}</td>
                        <td>${ex.salon}</td>
                        <td>${ex.cupo} alumnos</td>
                        <td>
                            <span class="badge bg-${colorBadge} bg-opacity-10 text-${colorBadge} border border-${colorBadge}-subtle px-3 py-2 rounded-pill">
                                ${ex.estado}
                            </span>
                        </td>
                        
                        <td class="text-center" style="width: 1%; white-space: nowrap;">
    <div class="d-flex justify-content-center align-items-center gap-1">
        <button class="btn btn-outline-primary btn-sm rounded-pill px-2 py-1 btn-modificar" data-id="${ex.id_examen}" title="Modificar examen" style="font-size: 0.85rem;">
            <i class="bi bi-pencil-square me-1"></i>Modificar
        </button>
        <button class="btn btn-outline-danger btn-sm rounded-pill px-2 py-1 btn-eliminar" data-id="${ex.id_examen}" title="Eliminar examen" style="font-size: 0.85rem;">
            <i class="bi bi-trash3 me-1"></i>Eliminar
        </button>
    </div>
</td>
                    </tr>
                `;
                tbody.innerHTML += filaHTML;
            });
            // ... Aquí termina tu datos.data.forEach ...

// 🎯 CAPTURA DE EVENTOS DINÁMICOS (Pon esto justo abajo del bucle de la tabla)
const botonesEliminar = tbody.querySelectorAll('.btn-eliminar');
botonesEliminar.forEach(boton => {
    boton.addEventListener('click', function() {
        const idExamen = this.getAttribute('data-id');
        
        // Ejecutamos la confirmación y la petición PDO
        if (confirm(`¿Estás seguro de que deseas eliminar el examen #${idExamen}? Esta acción no se puede deshacer.`)) {
            
            fetch('/php/endpoints/eliminar_ets.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_examen: idExamen })
            })
            .then(respuesta => respuesta.json())
            .then(datos => {
                if (datos.status === 'success') {
                    alert("¡Examen eliminado con éxito!");
                    cargarTablaExamenes(); // Recargamos la tabla al instante
                } else {
                    alert("Error al eliminar: " + datos.message);
                }
            })
            .catch(error => {
                console.error("❌ Error en la petición:", error);
                alert("Ocurrió un error al intentar conectar con el servidor.");
            });

        }
    });
});
        })
        .catch(error => {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger py-4">Error de conexión al cargar la tabla.</td></tr>`;
            console.error("Error cargando tabla de exámenes:", error);
        });




        function confirmarEliminarExamen(idExamen) {
    // 1. Una confirmación nativa para evitar clicks por accidente
 // Aseguramos que pertenezca al objeto global window
// Declaración explícita en el entorno global
function confirmarEliminarExamen(idExamen) {
    ejecutarFlujoEliminacion(idExamen);
}

// Mapeo directo al objeto Window para el atributo onclick del HTML
window.confirmarEliminarExamen = confirmarEliminarExamen;
// 🌍 HACEMOS LA FUNCIÓN GLOBAL PARA QUE EL ONCLICK DEL HTML LA ENCUENTRE
window.confirmarEliminarExamen = function(idExamen) {
    
    if (confirm(`¿Estás seguro de que deseas eliminar el examen #${idExamen}? Esta acción no se puede deshacer.`)) {
        
        fetch('/php/endpoints/eliminar_ets.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_examen: idExamen })
        })
        .then(respuesta => respuesta.json())
        .then(datos => {
            if (datos.status === 'success') {
                alert("¡Examen eliminado con éxito!");
                
                // Ejecutamos la recarga de la tabla (asegúrate de que esta función también sea accesible)
                if (typeof cargarTablaExamenes === 'function') {
                    cargarTablaExamenes();
                } else if (window.cargarTablaExamenes) {
                    window.cargarTablaExamenes();
                }
            } else {
                alert("Error al eliminar: " + datos.message);
            }
        })
        .catch(error => {
            console.error("❌ Error en la petición:", error);
            alert("Ocurrió un error al intentar conectar con el servidor.");
        });
    }
};
}



}