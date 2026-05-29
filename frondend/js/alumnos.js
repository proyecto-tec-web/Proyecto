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
                const selectCarrera = document.getElementById('alum-carrera');
                if (selectCarrera) {
                    selectCarrera.innerHTML = '<option value="" selected disabled>Selecciona una carrera...</option>';
                    data.carreras.forEach(c => {
                        selectCarrera.innerHTML += `<option value="${c.id_carrera}">${c.acronimo} - ${c.nombre}</option>`;
                    });
                }
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
                let badgeSit = (al.situacion_academica === 'Regular') ? 'success' : 'danger';
                tbody.innerHTML += `
                    <tr>
                        <td class="ps-4 fw-bold text-secondary">${al.boleta}</td>
                        <td>${al.apellido_paterno} ${al.apellido_materno} ${al.nombre}</td>
                        <td>${al.carrera}</td>
                        <td><span class="badge bg-${badgeSit}">${al.situacion_academica}</span></td>
                        <td class="pe-4 text-end">
                            <button class="btn btn-sm btn-outline-info me-1" title="Ver Kardex"><i class="bi bi-card-list"></i> Kardex</button>
                            <button class="btn btn-sm btn-outline-primary me-1" title="Editar"><i class="bi bi-pencil"></i></button>
                        </td>
                    </tr>
                `;
            });
        })
        .catch(err => {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Fallo al conectar con el servidor.</td></tr>`;
            console.error(err);
        });
}

function configurarEventosAlumnos() {
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
                    bootstrap.Modal.getInstance(document.getElementById('modalNuevoAlumno')).hide();
                    document.getElementById('form-nuevo-alumno').reset();
                    alert("Alumno y cuenta de usuario creados con éxito.");
                    cargarTablaAlumnos();
                } else {
                    alert("Error: " + respuesta.message);
                }
                btnGuardar.disabled = false;
                btnGuardar.innerText = "Finalizar Inscripción";
            });
        });
    }
}