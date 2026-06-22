<?php require_once '../../../php/endpoints/seguridad_profesor.php'; ?>

<div class="container-fluid p-0">
    <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-body p-4">
            <h5 class="card-title fw-bold text-primary mb-4" style="font-family: 'Montserrat', sans-serif;">
                <i class="bi bi-search me-2"></i> Peticiones de Revisión de Exámenes
            </h5>
            <p class="text-muted mb-4">Atiende las solicitudes de revisión agendadas. Las modificaciones aprobadas se reflejarán directamente en el kardex del alumno.</p>
            
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

            <div class="table-responsive">
                <table class="table table-hover align-middle border">
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

<div class="modal fade" id="modalAgendarCita" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
            <div class="modal-header bg-info text-dark">
                <h5 class="modal-title fw-bold"><i class="bi bi-calendar-event me-2"></i> Agendar Cita de Revisión</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="form-agendar-cita">
                <div class="modal-body p-4">
                    <p class="text-muted small mb-3">Revisa el motivo del alumno y establece el lugar y hora para atenderlo.</p>
                    
                    <div class="mb-3">
                        <label class="form-label fw-bold text-muted small">Alumno</label>
                        <input type="text" class="form-control bg-light border-0 fw-semibold" id="cita-alumno-nombre" readonly>
                    </div>

                    <div class="row mb-3">
                        <div class="col-md-4">
                            <label class="form-label fw-bold text-muted small">Calificación</label>
                            <input type="text" class="form-control bg-light border-0 text-danger fw-bold text-center" id="cita-calif-actual" readonly>
                        </div>
                        <div class="col-md-8">
                            <label class="form-label fw-bold text-muted small">Motivo del Alumno</label>
                            <textarea class="form-control bg-light border-0 text-muted small" id="cita-motivo" rows="2" readonly></textarea>
                        </div>
                    </div>
                    
                    <hr class="text-muted">

                    <div class="row mb-3">
                        <div class="col-md-7 mb-3 mb-md-0">
                            <label class="form-label fw-bold text-muted small">Fecha y hora <span class="text-danger">*</span></label>
                            <input type="datetime-local" class="form-control shadow-sm" id="cita-fecha" required>
                        </div>
                        <div class="col-md-5">
                            <label class="form-label fw-bold text-muted small">Lugar <span class="text-danger">*</span></label>
                            <input type="text" class="form-control shadow-sm" id="cita-lugar" placeholder="Ej. Edificio 2 (201)" required>
                        </div>
                    </div>
                    <input type="hidden" id="cita-id-peticion">
                </div>
                <div class="modal-footer bg-light border-top-0">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="submit" class="btn btn-info fw-bold text-dark shadow-sm">Confirmar Cita</button>
                </div>
            </form>
        </div>
    </div>
</div>

<div class="modal fade" id="modalEjecutarRevision" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
            <div class="modal-header bg-warning text-dark">
                <h5 class="modal-title fw-bold"><i class="bi bi-pencil-square me-2"></i> Asentar Nueva Calificación</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="form-ejecutar-revision">
                <div class="modal-body p-4">
                    <p class="text-muted small mb-3">Solo llena esto <strong>después</strong> de haber atendido al alumno presencialmente.</p>
                    
                    <div class="row mb-3">
                        <div class="col-6">
                            <label class="form-label fw-bold text-muted small">Calificación Actual</label>
                            <input type="text" class="form-control bg-light border-0 text-danger fw-bold" id="rev-calif-actual" readonly>
                        </div>
                        <div class="col-6">
                            <label class="form-label fw-bold text-muted small text-primary">Nueva Calificación</label>
                            <input type="number" class="form-control border-primary shadow-sm" id="rev-calif-nueva" step="0.1" placeholder="Ej. 8.5" required>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label fw-bold text-muted small">Notas y Justificación del Cambio <span class="text-danger">*</span></label>
                        <textarea class="form-control shadow-sm" id="rev-notas" rows="3" placeholder="Ej. Se corrigió la suma del reactivo 3. Calificación sube a 8.5" required></textarea>
                    </div>
                    <input type="hidden" id="rev-id-peticion">
                </div>
                <div class="modal-footer bg-light border-top-0">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="submit" class="btn btn-warning fw-bold text-dark shadow-sm">Guardar Calificación</button>
                </div>
            </form>
        </div>
    </div>
</div>