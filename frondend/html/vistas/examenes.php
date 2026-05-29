<?php require_once '../../../php/endpoints/seguridad_admin.php'; ?>

<div class="alert alert-info border-0 shadow-sm rounded-3">
    <i class="bi bi-info-circle me-2"></i><strong>Gestión de ETS:</strong> Programa nuevos exámenes extraordinarios, asigna sinodales y define el cupo máximo por salón.
</div>

<div class="d-flex justify-content-between mb-3">
    <input type="text" class="form-control w-25 shadow-sm" placeholder="Buscar materia o profesor...">
    <button class="btn btn-success fw-bold shadow-sm" data-bs-toggle="modal" data-bs-target="#modalNuevoETS">
        <i class="bi bi-plus-lg me-2"></i> Nuevo Examen
    </button>
</div>

<div class="card shadow-sm border-0 rounded-3">
    <div class="card-body p-0">
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th class="ps-4">ID</th>
                        <th>Materia</th>
                        <th>Fecha y Hora</th>
                        <th>Sinodal</th>
                        <th>Salón</th>
                        <th>Cupo</th>
                        <th>Estado</th>
                        <th class="pe-4 text-end">Acciones</th>
                    </tr>
                </thead>
                <tbody id="tbody-examenes">
                    <tr><td colspan="7" class="text-center py-4 text-muted">Aún no hay exámenes programados.</td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<div class="modal fade" id="modalNuevoETS" tabindex="-1" aria-labelledby="modalNuevoETSLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow">
            
            <div class="modal-header bg-success text-white border-bottom-0">
                <h5 class="modal-title fw-bold" id="modalNuevoETSLabel">
                    <i class="bi bi-calendar-plus me-2"></i>Programar Nuevo ETS
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            
            <div class="modal-body p-4">
                <form id="form-nuevo-ets">
                    
                    <div class="row g-3 mb-3">
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Materia a Evaluar</label>
                            <select class="form-select" id="select-materia" required>
                                <option value="" selected disabled>Cargando materias...</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Profesor (Sinodal)</label>
                            <select class="form-select" id="select-sinodal" required>
                                <option value="" selected disabled>Cargando profesores...</option>
                            </select>
                        </div>
                    </div>

                    <div class="row g-3 mb-3">
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Fecha del Examen</label>
                            <input type="date" class="form-control" id="input-fecha" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Hora de Aplicación</label>
                            <input type="time" class="form-control" id="input-hora" required>
                        </div>
                    </div>

                    <div class="row g-3">
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Salón Asignado</label>
                            <select class="form-select" id="select-salon" required>
                                <option value="" selected disabled>Cargando salones...</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Cupo Máximo</label>
                            <input type="number" class="form-control" id="input-cupo" placeholder="Ej. 40" min="1" required>
                        </div>
                    </div>
                    
                </form>
            </div>
            
            <div class="modal-footer bg-light border-top-0">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-success fw-bold" id="btn-guardar-ets">
                    <i class="bi bi-save me-1"></i> Guardar Examen
                </button>
            </div>
            
        </div>
    </div>
</div>

<div class="modal fade" id="modalEditarETS" tabindex="-1" aria-labelledby="modalEditarETSLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow">
            
            <div class="modal-header bg-warning text-dark border-bottom-0">
                <h5 class="modal-title fw-bold" id="modalEditarETSLabel">
                    <i class="bi bi-pencil-square me-2"></i>Editar Examen Programado
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            
            <div class="modal-body p-4">
                <form id="form-editar-ets">
                    <input type="hidden" id="edit-id">
                    
                    <div class="row g-3 mb-3">
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Materia a Evaluar</label>
                            <select class="form-select" id="edit-materia" required>
                                <option value="" selected disabled>Cargando materias...</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Profesor (Sinodal)</label>
                            <select class="form-select" id="edit-sinodal" required>
                                <option value="" selected disabled>Cargando profesores...</option>
                            </select>
                        </div>
                    </div>

                    <div class="row g-3 mb-3">
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Fecha del Examen</label>
                            <input type="date" class="form-control" id="edit-fecha" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Hora de Aplicación</label>
                            <input type="time" class="form-control" id="edit-hora" required>
                        </div>
                    </div>

                    <div class="row g-3">
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Salón Asignado</label>
                            <select class="form-select" id="edit-salon" required>
                                <option value="" selected disabled>Cargando salones...</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Cupo Máximo</label>
                            <input type="number" class="form-control" id="edit-cupo" min="1" required>
                        </div>
                    </div>
                </form>
            </div>
            
            <div class="modal-footer bg-light border-top-0">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-warning fw-bold text-dark" id="btn-actualizar-ets">
                    <i class="bi bi-arrow-clockwise me-1"></i> Actualizar Examen
                </button>
            </div>
            
        </div>
    </div>
</div>