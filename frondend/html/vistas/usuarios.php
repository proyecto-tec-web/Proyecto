<?php require_once '../../../php/endpoints/seguridad_admin.php'; ?>

<div class="row mb-3">
    <div class="col-12 col-md-8 mb-2 mb-md-0">
        <div class="alert alert-info border-0 shadow-sm rounded-3 d-flex align-items-center mb-0 h-100">
            <i class="bi bi-search me-3 fs-4"></i>
            <input type="text" id="buscador-usuarios" class="form-control border-0 bg-transparent shadow-none" placeholder="Buscar por correo electrónico o ID...">
        </div>
    </div>
    <div class="col-12 col-md-4">
        <select id="filtro-rol-usuario" class="form-select shadow-sm h-100 border-0 text-secondary bg-white">
            <option value="Todos">Todos los Roles</option>
            <option value="admin">Solo Administradores</option>
            <option value="profesor">Solo Profesores</option>
            <option value="alumno">Solo Alumnos</option>
        </select>
    </div>
</div>

<div class="d-flex justify-content-end mb-3">
    <button class="btn btn-primary shadow-sm" data-bs-toggle="modal" data-bs-target="#modalNuevoUsuario">
        <i class="bi bi-person-plus me-2"></i>Crear Nuevo Usuario
    </button>
</div>

<div class="card shadow-sm border-0 rounded-3">
    <div class="card-body p-0">
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th class="ps-4">ID</th>
                        <th>Correo Electrónico</th>
                        <th>Rol del Sistema</th>
                        <th class="pe-4 text-end">Acciones</th>
                    </tr>
                </thead>
                <tbody id="cuerpo-tabla-usuarios">
                    <tr><td colspan="4" class="text-center py-4 text-muted"><span class="spinner-border spinner-border-sm text-primary me-2"></span>Cargando usuarios...</td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<div class="modal fade" id="modalNuevoUsuario" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content border-0 shadow">
            <div class="modal-header bg-light border-0">
                <h5 class="modal-title fw-bold text-primary"><i class="bi bi-person-plus me-2"></i>Nuevo Usuario</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form id="form-nuevo-usuario">
                    <div class="mb-3">
                        <label class="form-label">Correo Electrónico</label>
                        <input type="email" class="form-control" id="input-correo" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Contraseña</label>
                        <input type="text" class="form-control" id="input-password" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Rol del Sistema</label>
                        <select class="form-select" id="select-rol">
                            <option value="admin">Administrador</option>
                            <option value="profesor">Profesor</option>
                            <option value="alumno">Alumno</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer border-0 bg-light">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-primary" id="btn-guardar-usuario">Guardar Usuario</button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="modalEditarUsuario" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content border-0 shadow">
            <div class="modal-header bg-light border-0">
                <h5 class="modal-title fw-bold text-primary"><i class="bi bi-pencil-square me-2"></i>Editar Usuario</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form id="form-editar-usuario">
                    <input type="hidden" id="edit-user-id">
                    <div class="mb-3">
                        <label class="form-label">Correo Electrónico</label>
                        <input type="email" class="form-control" id="edit-user-correo" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Nueva Contraseña <small class="text-muted">(Opcional)</small></label>
                        <input type="text" class="form-control" id="edit-user-password" placeholder="Dejar en blanco para no cambiarla">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Rol del Sistema</label>
                        <select class="form-select" id="edit-user-rol">
                            <option value="admin">Administrador</option>
                            <option value="profesor">Profesor</option>
                            <option value="alumno">Alumno</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer border-0 bg-light">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-primary" id="btn-actualizar-usuario">Actualizar Usuario</button>
            </div>
        </div>
    </div>
</div>