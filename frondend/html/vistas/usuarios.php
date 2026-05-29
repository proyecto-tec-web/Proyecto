<?php require_once '../../../php/endpoints/seguridad_admin.php'; ?>

<div class="alert alert-info border-0 shadow-sm rounded-3">
    <i class="bi bi-info-circle me-2"></i><strong>Buscador rápido:</strong>...
</div>

<div class="d-flex justify-content-between align-items-center mb-4">
    <div class="alert alert-warning border-0 shadow-sm rounded-3 mb-0 flex-grow-1 me-3">
        <i class="bi bi-shield-exclamation me-2"></i><strong>Seguridad:</strong> Control de accesos al sistema.
    </div>
    <button class="btn btn-primary shadow-sm text-nowrap py-2 px-3 fw-bold" data-bs-toggle="modal" data-bs-target="#modalNuevoUsuario">
        <i class="bi bi-person-plus-fill me-2"></i>Nuevo Usuario
    </button>
</div>

<div id="alerta-error-usuarios" class="d-none alert alert-danger border-0 shadow-sm rounded-3"></div>

<div class="card shadow-sm border-0 rounded-3">
    <div class="card-body p-0">
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th class="ps-4 py-3">ID Usuario</th>
                        <th>Correo Electrónico</th>
                        <th>Rol en el Sistema</th>
                        <th class="pe-4 text-end">Acciones</th>
                    </tr>
                </thead>
                <tbody id="cuerpo-tabla-usuarios">
                    <tr><td colspan="4" class="text-center py-4 text-muted spinner-border text-primary" role="status"></td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
<div class="modal fade" id="modalNuevoUsuario" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
            <div class="modal-header bg-primary text-white border-bottom-0">
                <h5 class="modal-title fw-bold"><i class="bi bi-person-plus me-2"></i>Registrar Usuario</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body p-4">
                <form id="form-nuevo-usuario">
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Correo Electrónico</label>
                        <input type="email" class="form-control" id="input-correo" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Contraseña</label>
                        <input type="password" class="form-control" id="input-password" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Rol en el Sistema</label>
                        <select class="form-select" id="select-rol" required>
                            <option value="" selected disabled>Selecciona un rol...</option>
                            <option value="Administrador">Administrador</option>
                            <option value="Profesor">Profesor</option>
                            <option value="Alumno">Alumno</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer bg-light border-top-0">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-primary fw-bold" id="btn-guardar-usuario">Guardar Usuario</button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="modalEditarUsuario" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
            <div class="modal-header bg-warning text-dark border-bottom-0">
                <h5 class="modal-title fw-bold"><i class="bi bi-pencil-square me-2"></i>Editar Usuario</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body p-4">
                <form id="form-editar-usuario">
                    <input type="hidden" id="edit-user-id">
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Correo Electrónico</label>
                        <input type="email" class="form-control" id="edit-user-correo" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Nueva Contraseña <small class="text-muted">(Dejar en blanco para no cambiar)</small></label>
                        <input type="password" class="form-control" id="edit-user-password">
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Rol en el Sistema</label>
                        <select class="form-select" id="edit-user-rol" required>
                            <option value="Administrador">Administrador</option>
                            <option value="Profesor">Profesor</option>
                            <option value="Alumno">Alumno</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer bg-light border-top-0">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-warning fw-bold text-dark" id="btn-actualizar-usuario">Actualizar Usuario</button>
            </div>
        </div>
    </div>
</div>