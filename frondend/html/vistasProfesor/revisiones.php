<?php require_once '../../../php/endpoints/seguridad_profesor.php'; ?>

<div class="container-fluid p-0">
    <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-body p-4">
            <h5 class="card-title fw-bold text-primary mb-4" style="font-family: 'Montserrat', sans-serif;">
                <i class="bi bi-search me-2"></i> Peticiones de Revisión de Exámenes
            </h5>
            <p class="text-muted mb-4">Atiende las solicitudes de revisión agendadas. Las modificaciones aprobadas se reflejarán directamente en el kardex del alumno.</p>
            
            <div class="table-responsive">
                <table class="table table-hover align-middle">
                    <div class="row mb-3 mt-2">
                        <div class="col-md-6 col-lg-5">
                            <div class="input-group shadow-sm rounded-3">
                                <span class="input-group-text bg-white border-end-0">
                                    <i class="bi bi-search text-muted"></i>
                                </span>
                                <input type="text" id="buscadorRevisiones" onkeyup="filtrarRevisiones()" class="form-control border-start-0" placeholder="Buscar por folio, alumno, boleta, materia, horario o estado...">
                            </div>
                        </div>
                    </div>
                    <thead class="table-light">
                        <tr>
                            <th>Folio</th>
                            <th>Boleta y Alumno</th>
                            <th>Materia</th>
                            <th>Lugar y Horario</th>
                            <th>Estado</th>
                            <th class="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="tbody-revisiones">
                        <tr>
                            <td colspan="6" class="text-center py-4">
                                <span class="spinner-border spinner-border-sm text-primary"></span> Buscando peticiones...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="modalRevision" tabindex="-1" aria-labelledby="modalRevisionLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
            
            <div class="modal-header bg-warning text-dark">
                <h5 class="modal-title fw-bold" id="modalRevisionLabel">
                    <i class="bi bi-pencil-square me-2"></i> Ejecutar Revisión de Calificación
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            
            <form id="form-revision">
                <div class="modal-body p-4">
                    <div class="mb-3">
                        <label class="form-label fw-bold text-muted small">Alumno a evaluar</label>
                        <input type="text" class="form-control bg-light border-0" id="rev-alumno-nombre" readonly>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-6">
                            <label class="form-label fw-bold text-muted small">Calificación Actual</label>
                            <input type="text" class="form-control bg-light border-0 text-danger fw-bold" id="rev-calif-actual" readonly>
                        </div>
                        <div class="col-6">
                            <label class="form-label fw-bold text-muted small text-primary">Nueva Calificación</label>
                            <input type="number" class="form-control border-primary shadow-sm" id="rev-calif-nueva" step="0.1" placeholder="Ej. 8.5">
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label fw-bold text-muted small">Notas y Justificación del Cambio <span class="text-danger">*</span></label>
                        <textarea class="form-control shadow-sm" id="rev-notas" rows="3" placeholder="Explica detalladamente en qué falló la primera evaluación..."></textarea>
                    </div>
                    
                    <input type="hidden" id="rev-id-peticion">
                    <input type="hidden" id="rev-id-inscripcion">
                </div>
                
                <div class="modal-footer bg-light border-top-0">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="submit" class="btn btn-warning fw-bold text-dark shadow-sm">
                        <i class="bi bi-check-circle me-1"></i> Confirmar Modificación
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
