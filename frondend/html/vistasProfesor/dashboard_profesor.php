<?php require_once '../../../php/endpoints/seguridad_profesor.php'; ?>

<div class="row mb-4">
    <div class="col-12">
        <div class="card shadow-sm border-0 rounded-4 escom-blue">
            <div class="card-body p-4 p-md-5 d-flex align-items-center">
                <i class="bi bi-person-workspace display-4 me-4 opacity-75"></i>
                <div>
                    <h2 class="fw-bold" style="font-family: 'Montserrat', sans-serif;">Panel de Control Docente</h2>
                    <p class="mb-0 fs-5 opacity-75">Gestiona tus Exámenes a Título de Suficiencia, pasa lista y asienta calificaciones.</p>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-md-4 mb-3">
        <div class="card shadow-sm rounded-3 h-100 border border-4" style="background-color: #F8F4F8; border-color: #800020 !important;">
            <div class="card-body">
                <h6 class="text-dark fw-bold mb-2">MIS EXÁMENES ETS</h6>
                <h2 class="fw-bold text-dark mb-0" id="kpi-examenes-prof">
                    <span class="spinner-border spinner-border-sm" style="color: #800020 !important;"></span>
                </h2>
            </div>
        </div>
    </div>
    
    <div class="col-md-4 mb-3">
        <div class="card shadow-sm rounded-3 h-100 border border-4" style="background-color: #FFF8F2; border-color: #ffa200 !important;">
            <div class="card-body">
                <h6 class="text-dark fw-bold mb-2">ALUMNOS A EVALUAR</h6>
                <h2 class="fw-bold text-dark mb-0" id="kpi-alumnos-prof">
                    <span class="spinner-border spinner-border-sm" style="color: #ffa200 !important;"></span>
                </h2>
            </div>
        </div>
    </div>
    
    <div class="col-md-4 mb-3">
        <div class="card shadow-sm rounded-3 h-100 border border-4" style="background-color: #F5F4FC; border-color: #b254ff !important;">
            <div class="card-body">
                <h6 class="text-dark fw-bold mb-2">EXÁMENES CALIFICADOS</h6>
                <h2 class="fw-bold text-dark mb-0" id="kpi-pendientes-prof">
                    <span class="spinner-border spinner-border-sm" style="color: #b254ff !important;"></span>
                </h2>
            </div>
        </div>
    </div>
</div>

<div class="row mt-4">
    <div class="col-12">
        <div class="card border-0 shadow-sm rounded-4">
            <div class="card-body p-4">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h6 class="fw-bold text-secondary mb-0" style="font-family: 'Montserrat', sans-serif;">
                        <i class="bi bi-bar-chart-fill me-2 text-primary"></i> Rendimiento por Materia
                    </h6>
                    <h5 class="fw-bold mb-0 text-dark border px-3 py-1 rounded bg-light">
                        Promedio Global: <span id="promedioGlobalValor" class="text-primary">0.0</span>
                    </h5>
                </div>
                
                <div style="position: relative; height: 300px; width: 100%;">
                    <canvas id="graficaRendimiento"></canvas>
                </div>
                
                <div id="promediosPorMateria" class="d-flex justify-content-center flex-wrap gap-3 mt-4">
                    </div>
                
            </div>
        </div>
    </div>
</div>
