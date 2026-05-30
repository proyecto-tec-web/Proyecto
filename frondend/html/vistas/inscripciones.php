<?php require_once '../../../php/endpoints/seguridad_admin.php'; ?>

<div class="alert alert-info border-0 shadow-sm rounded-3">
    <i class="bi bi-info-circle me-2"></i><strong>Control de Inscripciones:</strong> Registra alumnos a exámenes de ETS vigentes o elimina registros existentes.
</div>

<div class="card shadow-sm border-0 rounded-3">
    <div class="card-header bg-white pt-4 pb-2 border-bottom d-flex justify-content-between align-items-center">
        <h5 class="card-title fw-bold mb-0">Pagos y Asignaciones</h5>
        <div>
            <button class="btn btn-primary btn-sm me-2" data-bs-toggle="modal" data-bs-target="#modalInscribirAlumno">
                <i class="bi bi-plus-circle"></i> Nueva Inscripción
            </button>
            <button class="btn btn-outline-primary btn-sm"><i class="bi bi-download"></i> Exportar Lista</button>
        </div>
    </div>
    <div class="card-body p-0">
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th class="ps-4">ID Inscripción</th>
                        <th>Boleta</th>
                        <th>Alumno</th>
                        <th>Materia (Examen)</th>
                        <th>Estado Pago</th>
                        <th class="pe-4 text-end">Acciones</th>
                    </tr>
                </thead>
                <tbody id="tbody-inscripciones">
                    <tr><td colspan="6" class="text-center py-4 text-muted">Esperando datos de inscripciones...</td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<div class="modal fade" id="modalInscribirAlumno" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title fw-bold">Nueva Inscripción a ETS</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form id="form-inscribir-alumno">
                    <div class="mb-3">
                        <label for="input-boleta" class="form-label fw-semibold">Boleta del Alumno</label>
                        <input type="text" class="form-control" id="input-boleta" placeholder="Ej. 2026123456" maxlength="10" inputmode="numeric" pattern="[0-9]*" required>
                    </div>
                    <div class="mb-4">
                        <label for="select-examen-inscripcion" class="form-label fw-semibold">Seleccionar Examen</label>
                        <select class="form-select" id="select-examen-inscripcion" required>
                            <option value="" selected disabled>Cargando exámenes...</option>
                        </select>
                    </div>
                    <div class="d-grid">
                        <button type="submit" class="btn btn-primary" id="btn-guardar-inscripcion">
                            <i class="bi bi-save me-1"></i> Confirmar Inscripción
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>