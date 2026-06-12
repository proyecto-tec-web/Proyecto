<?php require_once '../../../php/endpoints/seguridad_profesor.php'; ?>

<div class="card-body p-4">
    <ul class="nav nav-tabs mb-4" id="examenesTab" role="tablist">
        <li class="nav-item" role="presentation">
            <button class="nav-link active fw-bold text-primary" id="activos-tab" data-bs-toggle="tab" data-bs-target="#activos" type="button" role="tab">
                <i class="bi bi-calendar-event me-2"></i>Exámenes Pendientes
            </button>
        </li>

        <li class="nav-item" role="presentation">
            <button class="nav-link fw-bold text-secondary" id="historial-tab" data-bs-toggle="tab" data-bs-target="#historial" type="button" role="tab">
                <i class="bi bi-archive me-2"></i>Historial (Calificados)
            </button>
        </li>
    </ul>

    <div class="tab-content" id="examenesTabContent">
        
        <div class="tab-pane fade show active" id="activos" role="tabpanel">
            <div class="table-responsive">
                <table class="table table-hover align-middle">
                    <div class="row mb-4 mt-2 align-items-center">
                        <div class="col-md-7 col-lg-6 mb-2 mb-md-0">
                            <div class="input-group shadow-sm rounded-3">
                                <span class="input-group-text bg-white border-end-0">
                                    <i class="bi bi-search text-muted"></i>
                                </span>
                                <input type="text" id="buscadorExamenes" onkeyup="filtrarExamenes()" class="form-control border-start-0" placeholder="Buscar por ID, nombre de la Materia, salón, fecha o estado...">
                            </div>
                        </div>
                    <div class="col-md-5 col-lg-6 text-end mb-3">
                        <button onclick="exportarExamenesAExcel()" class="btn btn-success shadow-sm d-inline-flex align-items-center gap-2 px-3 rounded-3 fw-bold">
                            <i class="bi bi-download fs-5"></i> Exportar a Excel
                        </button>
                    </div>
                    </div>
                    <thead class="table-light">
                        <tr>
                            <th>ID</th><th>Materia</th><th>Fecha y Hora</th><th>Salón</th><th>Estado</th><th class="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="tbody-examenes-activos">
                        </tbody>
                </table>
            </div>
        </div>

        <div class="tab-pane fade" id="historial" role="tabpanel">
            <div class="table-responsive">
                <table class="table table-hover align-middle">
                    <div class="row mb-4 mt-2 align-items-center">
    <div class="col-md-7 col-lg-6 mb-2 mb-md-0">
        <div class="input-group shadow-sm rounded-3">
            <span class="input-group-text bg-white border-end-0">
                <i class="bi bi-search text-muted"></i>
            </span>
            <input type="text" id="buscadorExamenes" onkeyup="filtrarExamenes()" class="form-control border-start-0" placeholder="Buscar por materia, salón, fecha, estado o ID...">
        </div>
    </div>
    
    <div class="col-md-5 col-lg-6 text-md-end">
        <button onclick="exportarExamenesAExcel()" class="btn btn-success shadow-sm d-inline-flex align-items-center gap-2 px-3 py-2 rounded-3 fw-bold">
            <i class="bi bi-download fs-5"></i> Exportar a Excel
        </button>
    </div>
</div>
                    <thead class="table-light">
                        <tr>
                            <th>ID</th><th>Materia</th><th>Fecha y Hora</th><th>Salón</th><th>Estado</th><th class="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="tbody-examenes-historial">
                        </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="modalCalificar" aria-labelledby="modalCalificarLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content border-0 shadow">
            <div class="modal-header bg-primary text-white">
                <h5 class="modal-title fw-bold" id="modalCalificarLabel">Lista de Alumnos</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <p class="text-muted mb-0">Captura las calificaciones (0 a 10). Los alumnos no aprobados tendrán el campo vacío.</p>
                    <button class="btn btn-outline-success btn-sm" id="btn-exportar-acta" onclick="exportarActaCSV()">
                        <i class="bi bi-download fs-5"></i> Exportar Acta CSV
                    </button>
                </div>
                <div class="table-responsive">
                    <table class="table table-bordered align-middle">
                        <thead class="table-light">
                            <tr>
                                <th>Boleta</th>
                                <th>Nombre del Alumno</th>
                                <th style="width: 150px;">Calificación</th>
                            </tr>
                        </thead>
                        <tbody id="tbody-alumnos-examen">
                            </tbody>
                    </table>
                </div>
            </div>
            <div class="modal-footer bg-light">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                <button type="button" class="btn btn-primary fw-bold" id="btn-guardar-calificaciones" onclick="solicitarNIPParaGuardar(idExamenActual)">
                    <i class="bi bi-save me-1"></i> Guardar y Firmar Acta
                </button>
            </div>
        </div>
    </div>
</div>
