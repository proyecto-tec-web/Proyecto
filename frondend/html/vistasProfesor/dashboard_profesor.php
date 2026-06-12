<?php require_once '../../../php/endpoints/seguridad_profesor.php'; ?>

<div class="row mb-4">
    <div class="col-12">
        <div class="card shadow-sm border-0 rounded-4 bg-primary text-white">
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
        <div class="card shadow-sm border-0 rounded-3 h-100 border-start border-primary border-4">
            <div class="card-body">
                <h6 class="text-muted fw-bold mb-2">MIS EXÁMENES ETS</h6>
                <h2 class="fw-bold text-dark mb-0" id="kpi-examenes-prof"><span class="spinner-border spinner-border-sm text-primary"></span></h2>
            </div>
        </div>
    </div>
    <div class="col-md-4 mb-3">
        <div class="card shadow-sm border-0 rounded-3 h-100 border-start border-success border-4">
            <div class="card-body">
                <h6 class="text-muted fw-bold mb-2">ALUMNOS A EVALUAR</h6>
                <h2 class="fw-bold text-dark mb-0" id="kpi-alumnos-prof"><span class="spinner-border spinner-border-sm text-success"></span></h2>
            </div>
        </div>
    </div>
    <div class="col-md-4 mb-3">
        <div class="card shadow-sm border-0 rounded-3 h-100 border-start border-warning border-4">
            <div class="card-body">
                <h6 class="text-muted fw-bold mb-2">EXÁMENES CALIFICADOS</h6>
                <h2 class="fw-bold text-dark mb-0" id="kpi-pendientes-prof"><span class="spinner-border spinner-border-sm text-warning"></span></h2>
            </div>
        </div>
    </div>
</div>
<div class="row mt-4">
    <div class="col-12 col-md-8 offset-md-2">
        <div class="card border-0 shadow-sm rounded-4">
            <div class="card-body p-4 text-center">
                <h6 class="fw-bold text-secondary mb-3" style="font-family: 'Montserrat', sans-serif;">
                    <i class="bi bi-pie-chart-fill me-2 text-primary"></i> Índice Global de Aprobación en ETS
                </h6>
                
                <div style="position: relative; height: 250px; width: 100%; display: flex; justify-content: center;">
                    <canvas id="graficaRendimiento"></canvas>
                </div>
                
            </div>
        </div>
    </div>
</div>
