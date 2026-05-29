<?php require_once './../../../php/endpoints/seguridad_admin.php'; ?>

<div class="alert alert-info border-0 shadow-sm rounded-3">
    <i class="bi bi-info-circle me-2"></i><strong>Buscador rápido:</strong> Ingresa una boleta para ver el Kardex completo y situación académica del alumno.
</div>

<div class="d-flex justify-content-between align-items-center mb-4">
    <div class="d-flex w-75 gap-3">
        <div class="input-group shadow-sm w-50">
            <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
            <input type="text" class="form-control border-start-0" id="buscador-alumnos" placeholder="Busca boleta, nombre o carrera...">
        </div>
        <select class="form-select shadow-sm w-25" id="filtro-situacion">
            <option value="Todos">Todos los estados</option>
            <option value="Regular">Solo Regulares</option>
            <option value="Irregular">Solo Irregulares</option>
        </select>
    </div>
    
    <button class="btn btn-success shadow-sm fw-bold" data-bs-toggle="modal" data-bs-target="#modalNuevoAlumno">
        <i class="bi bi-person-plus-fill me-2"></i>Inscribir Alumno
    </button>
</div>

<div class="card shadow-sm border-0 rounded-3">
    <div class="card-body p-0">
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th class="ps-4">Boleta</th>
                        <th>Nombre Completo</th>
                        <th>Carrera</th>
                        <th>Situación</th>
                        <th class="pe-4 text-end">Acciones</th>
                    </tr>
                </thead>
                <tbody id="tbody-alumnos">
                    <tr><td colspan="5" class="text-center py-4 text-muted">Cargando alumnos...</td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<div class="modal fade" id="modalNuevoAlumno" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow">
            <div class="modal-header bg-success text-white border-bottom-0">
                <h5 class="modal-title fw-bold"><i class="bi bi-person-vcard me-2"></i>Inscripción de Nuevo Ingreso</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body p-4">
                <form id="form-nuevo-alumno">
                    <h6 class="text-muted border-bottom pb-2 mb-3">Datos Escolares</h6>
                    <div class="row g-3 mb-3">
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Boleta</label>
                            <input type="text" class="form-control" id="alum-boleta" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Carrera</label>
                            <select class="form-select" id="alum-carrera" required>
                                <option value="" selected disabled>Cargando carreras...</option>
                            </select>
                        </div>
                    </div>
                    <h6 class="text-muted border-bottom pb-2 mb-3 mt-4">Datos Personales y Sistema</h6>
                    <div class="row g-3 mb-3">
                        <div class="col-md-4">
                            <label class="form-label fw-semibold">Nombre(s)</label>
                            <input type="text" class="form-control" id="alum-nombre" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label fw-semibold">Apellido Paterno</label>
                            <input type="text" class="form-control" id="alum-paterno" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label fw-semibold">Apellido Materno</label>
                            <input type="text" class="form-control" id="alum-materno" required>
                        </div>
                    </div>
                    <div class="row g-3">
                        <div class="col-md-12">
                            <label class="form-label fw-semibold">Correo Electrónico Institucional</label>
                            <input type="email" class="form-control" id="alum-correo" placeholder="ejemplo@alumno.ipn.mx" required>
                            <small class="text-muted">Se generará su cuenta de usuario con la contraseña por defecto: <strong>ipn123</strong></small>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer bg-light border-top-0">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-success fw-bold" id="btn-guardar-alumno">Finalizar Inscripción</button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="modalEditarAlumno" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow">
            <div class="modal-header bg-primary text-white border-bottom-0">
                <h5 class="modal-title fw-bold"><i class="bi bi-pencil-square me-2"></i>Modificar Datos del Alumno</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body p-4">
                <form id="form-editar-alumno">
                    <input type="hidden" id="edit-alum-id">
                    
                    <h6 class="text-muted border-bottom pb-2 mb-3">Datos Escolares</h6>
                    <div class="row g-3 mb-3">
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Boleta</label>
                            <input type="text" class="form-control" id="edit-alum-boleta" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Carrera</label>
                            <select class="form-select" id="edit-alum-carrera" required>
                                <option value="" selected disabled>Cargando carreras...</option>
                            </select>
                        </div>
                    </div>
                    
                    <h6 class="text-muted border-bottom pb-2 mb-3 mt-4">Datos Personales</h6>
                    <div class="row g-3 mb-3">
                        <div class="col-md-4">
                            <label class="form-label fw-semibold">Nombre(s)</label>
                            <input type="text" class="form-control" id="edit-alum-nombre" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label fw-semibold">Apellido Paterno</label>
                            <input type="text" class="form-control" id="edit-alum-paterno" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label fw-semibold">Apellido Materno</label>
                            <input type="text" class="form-control" id="edit-alum-materno" required>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer bg-light border-top-0">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-primary fw-bold" id="btn-actualizar-alumno">Guardar Cambios</button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="modalKardex" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow">
            <div class="modal-header bg-info text-white border-bottom-0">
                <h5 class="modal-title fw-bold"><i class="bi bi-card-list me-2"></i>Kardex de Calificaciones</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body p-4">
                <h5 id="kardex-nombre-alumno" class="fw-bold text-secondary mb-3">Nombre del Alumno</h5>
                
                <div class="table-responsive border rounded">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th class="text-center">Semestre</th>
                                <th>Materia</th>
                                <th class="text-center">Calificación Final</th>
                            </tr>
                        </thead>
                        <tbody id="tbody-kardex">
                            </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>