<?php require_once '../../../php/endpoints/seguridad_admin.php'; ?>

<div class="container-fluid p-4">
    <h2 class="mb-4 text-primary"><i class="bi bi-journal-check me-2"></i>Capturar Calificaciones</h2>

    <div class="alert alert-info border-0 shadow-sm rounded-3">
        <i class="bi bi-info-circle me-2"></i><strong>Importante:</strong> Como administrador tienes la "llave maestra" para asentar calificaciones. Verifica los datos antes de cerrar el acta.
    </div>

    <div class="row bg-white p-3 rounded-3 shadow-sm mb-4 align-items-end border">
        <div class="col-12 col-md-5 mb-3 mb-md-0">
            <label class="form-label fw-bold text-secondary"><i class="bi bi-search me-1"></i>Buscar Examen:</label>
            <input type="text" id="buscador-examenes-calificar" class="form-control" placeholder="Ej. #12, Cálculo o 2026-06-25...">
        </div>
        <div class="col-12 col-md-7">
            <label class="form-label fw-bold text-secondary">Selecciona el Examen para calificar:</label>
            <select class="form-select border-primary shadow-sm" id="select-examen-calificar">
                <option selected disabled>Cargando exámenes...</option>
            </select>
        </div>
    </div>

    <div class="card shadow-sm border-0 rounded-3 mt-2">
        <div class="card-header bg-white pt-3 pb-2 border-bottom d-flex justify-content-between align-items-center flex-wrap">
            <h5 class="card-title fw-bold mb-2 mb-md-0">Acta de Calificaciones</h5>
            
            <div class="d-flex align-items-center bg-light rounded-pill px-3 py-1 border" style="max-width: 350px; width: 100%;">
                <i class="bi bi-search text-muted me-2"></i>
                <input type="text" id="buscador-alumnos-calificar" class="form-control form-control-sm border-0 bg-transparent shadow-none" placeholder="Buscar alumno por boleta o nombre...">
            </div>
        </div>
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th class="ps-4">Boleta</th>
                            <th>Nombre del Alumno</th>
                            <th class="pe-4" style="width: 200px;">Calificación (0-10)</th>
                        </tr>
                    </thead>
                    <tbody id="tbody-calificaciones">
                        <tr><td colspan="3" class="text-center py-4 text-muted">Seleccione un examen arriba para ver la lista de alumnos.</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="card-footer bg-light text-end py-3 d-flex justify-content-end align-items-center">
            <button class="btn btn-outline-success px-3 me-2" id="btn-exportar-csv" style="display: none;">
                <i class="bi bi-file-earmark-excel me-2"></i>Exportar a Excel (CSV)
            </button>
            <button class="btn btn-primary px-4" id="btn-guardar-calificaciones" disabled>
                <i class="bi bi-save me-2"></i>Cerrar Acta
            </button>
        </div>
    </div>
</div>