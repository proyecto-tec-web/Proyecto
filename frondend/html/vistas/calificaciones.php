<?php require_once '../../../php/endpoints/seguridad_admin.php'; ?>

<div class="alert alert-info border-0 shadow-sm rounded-3">
    <i class="bi bi-info-circle me-2"></i><strong>Buscador rápido:</strong>...
</div>

<div class="row">
    <div class="col-12 col-md-5 mb-3">
        <label class="form-label fw-bold">Selecciona el Examen para calificar:</label>
        <select class="form-select">
            <option selected disabled>Seleccione un examen...</option>
            <option>101 - Cálculo Diferencial (Prof. Pérez Gómez)</option>
            <option>102 - Física Clásica (Prof. López Martínez)</option>
        </select>
    </div>
</div>
<div class="card shadow-sm border-0 rounded-3 mt-2">
    <div class="card-header bg-white pt-3 pb-2 border-bottom">
        <h5 class="card-title fw-bold mb-0">Acta de Calificaciones</h5>
    </div>
    <div class="card-body p-0"><div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
                <tr><th class="ps-4">Boleta</th><th>Alumno</th><th>Asistencia</th><th class="pe-4" style="width: 200px;">Calificación (0-10)</th></tr>
            </thead>
            <tbody>
                <tr><td colspan="4" class="text-center py-4 text-muted">Seleccione un examen arriba para ver la lista de alumnos.</td></tr>
            </tbody>
        </table>
    </div></div>
    <div class="card-footer bg-light text-end py-3">
        <button class="btn btn-secondary me-2">Guardar Borrador</button>
        <button class="btn btn-primary" disabled>Cerrar Acta</button>
    </div>
</div>