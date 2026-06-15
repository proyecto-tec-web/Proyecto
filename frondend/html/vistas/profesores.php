<?php require_once '../../../php/endpoints/seguridad_admin.php'; ?>

<div class="row mb-3">
    <div class="col-12 col-md-8 mb-2 mb-md-0">
        <div class="alert alert-info border-0 shadow-sm rounded-3 d-flex align-items-center mb-0 h-100">
            <i class="bi bi-search me-3 fs-4"></i>
            <input type="text" id="buscador-profesores" class="form-control border-0 bg-transparent shadow-none" placeholder="Buscar por nombre o boleta...">
        </div>
    </div>
    <div class="col-12 col-md-4">
        <select id="filtro-estado-profesor" class="form-select shadow-sm h-100 border-0 text-secondary bg-white">
            <option value="Todos">Mostrar Todos</option>
            <option value="Activo">Solo Activos</option>
            <option value="Inactivo">Solo Inactivos (Deshabilitados)</option>
        </select>
    </div>
</div>

<div class="d-flex justify-content-end mb-3">
    <button class="btn btn-success shadow-sm" data-bs-toggle="modal" data-bs-target="#modalNuevoProfesor">
        <i class="bi bi-person-plus me-2"></i>Dar de alta Profesor
    </button>
</div>

<div class="card shadow-sm border-0 rounded-3">
    <div class="card-body p-0">
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th class="ps-4">No. Empleado</th>
                        <th>Nombre Completo</th>
                        <th>Correo (Usuario)</th>
                        <th>Estado</th>
                        <th class="pe-4 text-end">Acciones</th>
                    </tr>
                </thead>
                <tbody id="tbody-profesores">
                    <tr><td colspan="5" class="text-center py-4 text-muted"><span class="spinner-border spinner-border-sm text-primary me-2"></span>Cargando profesores...</td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<div class="modal fade" id="modalNuevoProfesor" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content border-0 shadow">
            <div class="modal-header bg-light border-0">
                <h5 class="modal-title fw-bold text-success"><i class="bi bi-person-plus me-2"></i>Nuevo Profesor</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form id="form-nuevo-profesor">
                    <h6 class="text-muted mb-3 border-bottom pb-2">Datos Personales</h6>
                    <div class="row g-3">
                        <div class="col-12"><label class="form-label">No. Empleado (Boleta)</label><input type="text" class="form-control" id="prof-boleta" required></div>
                        <div class="col-12"><label class="form-label">Nombre(s)</label><input type="text" class="form-control" id="prof-nombre" required></div>
                        <div class="col-6"><label class="form-label">Apellido Paterno</label><input type="text" class="form-control" id="prof-paterno" required></div>
                        <div class="col-6"><label class="form-label">Apellido Materno</label><input type="text" class="form-control" id="prof-materno" required></div>
                    </div>
                    <h6 class="text-muted mt-4 mb-3 border-bottom pb-2">Datos de Cuenta</h6>
                    <div class="row g-3">
                        <div class="col-12"><label class="form-label">Correo Institucional</label><input type="email" class="form-control" id="prof-correo" placeholder="ejemplo@ipn.mx" required></div>
                        <div class="col-12"><label class="form-label">Contraseña Temporal</label><input type="text" class="form-control" id="prof-password" value="IPN2026" required></div>
                    </div>
                </form>
            </div>
            <div class="modal-footer border-0 bg-light">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-success" id="btn-guardar-profesor">Guardar Profesor</button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="modalEditarProfesor" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content border-0 shadow">
            <div class="modal-header bg-light border-0">
                <h5 class="modal-title fw-bold text-primary"><i class="bi bi-pencil-square me-2"></i>Editar Profesor</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form id="form-editar-profesor">
                    <input type="hidden" id="edit-prof-boleta-actual">
                    <div class="row g-3">
                        <div class="col-12"><label class="form-label">No. Empleado (Boleta)</label><input type="text" class="form-control" id="edit-prof-boleta" required></div>
                        <div class="col-12"><label class="form-label">Nombre(s)</label><input type="text" class="form-control" id="edit-prof-nombre" required></div>
                        <div class="col-6"><label class="form-label">Apellido Paterno</label><input type="text" class="form-control" id="edit-prof-paterno" required></div>
                        <div class="col-6"><label class="form-label">Apellido Materno</label><input type="text" class="form-control" id="edit-prof-materno" required></div>
                    </div>
                    <small class="text-muted mt-3 d-block"><i class="bi bi-info-circle me-1"></i>Nota: El correo y contraseña se gestionan desde la pestaña de Usuarios.</small>
                </form>
            </div>
            <div class="modal-footer border-0 bg-light">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-primary" id="btn-actualizar-profesor">Actualizar Profesor</button>
            </div>
        </div>
    </div>
</div>