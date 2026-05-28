<?php require_once '../../../php/endpoints/seguridad_admin.php'; ?>

<div class="alert alert-info border-0 shadow-sm rounded-3">
    <i class="bi bi-info-circle me-2"></i><strong>Buscador rápido:</strong>...
</div>

<div class="card shadow-sm border-0 rounded-3">
    <div class="card-header bg-white pt-4 pb-2 border-bottom d-flex justify-content-between align-items-center">
        <h5 class="card-title fw-bold mb-0">Pagos y Asignaciones</h5>
        <button class="btn btn-outline-primary btn-sm"><i class="bi bi-download"></i> Exportar Lista</button>
    </div>
    <div class="card-body p-0"><div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
                <tr><th class="ps-4">ID Inscripción</th><th>Boleta</th><th>Alumno</th><th>Materia (Examen)</th><th class="pe-4">Estado Pago</th></tr>
            </thead>
            <tbody id="tbody-inscripciones">
                <tr><td colspan="5" class="text-center py-4 text-muted">Esperando datos de inscripciones...</td></tr>
            </tbody>
        </table>
    </div></div>
</div>