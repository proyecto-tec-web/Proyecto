<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['id_usuario']) || strtolower(trim($_SESSION['usuario_rol'])) !== 'alumno') {
    echo "<script>window.location.href = '../../../php/endpoints/login.php';</script>";
    exit();
}
?>

<div class="tab-pane fade show active" id="pills-inicio" role="tabpanel">

    <div class="row g-3 mb-4">

        <div class="col-12 col-sm-6 col-xl-3">
            <div class="card shadow-sm border-0 h-100 rounded-3 border-start border-primary border-4">
                <div class="card-body">
                    <h6 class="text-muted small fw-semibold">Mis ETS Inscritos</h6>
                    <h3 id="total-ets" class="mb-0 fw-bold text-primary">0</h3>
                </div>
            </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
            <div class="card shadow-sm border-0 h-100 rounded-3 border-start border-success border-4">
                <div class="card-body">
                    <h6 class="text-muted small fw-semibold">Promedio General</h6>
                    <h3 id="promedio-general" class="mb-0 fw-bold text-success">0.0</h3>
                </div>
            </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
            <div class="card shadow-sm border-0 h-100 rounded-3 border-start border-danger border-4">
                <div class="card-body">
                    <h6 class="text-muted small fw-semibold">Materias Reprobadas</h6>
                    <h3 id="materias-reprobadas" class="mb-0 fw-bold text-danger">0</h3>
                </div>
            </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
            <div class="card shadow-sm border-0 h-100 rounded-3 border-start border-info border-4">
                <div class="card-body">
                    <h6 class="text-muted small fw-semibold">Estatus de Reinscripción</h6>
                    <h3 id="estatus-academico" class="mb-0 fw-bold text-info">
                        Cargando...
                    </h3>
                </div>
            </div>
        </div>

    </div>

    <div class="row g-3 mb-4">

        <div class="col-12 col-xl-8">
            <div class="card shadow-sm border-0 h-100 rounded-3">

                <div class="card-header bg-white border-bottom-0 pt-4 pb-2">
                    <h5 class="card-title fw-bold mb-0">Mis ETS Inscritos</h5>
                </div>

                <div class="card-body p-0">

                    <div class="table-responsive">

                        <table class="table table-hover align-middle mb-0">

                            <thead class="table-light">
                                <tr>
                                    <th class="ps-4">Materia</th>
                                    <th>Fecha</th>
                                    <th>Hora</th>
                                    <th>Salón / Edificio</th>
                                    <th class="pe-4">Estatus</th>
                                </tr>
                            </thead>

                            <tbody id="tabla-mis-ets">

                                <tr>
                                    <td colspan="5" class="text-center text-muted py-4">
                                        Cargando información...
                                    </td>
                                </tr>

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>
        </div>

        <div class="col-12 col-xl-4">
            <div class="card shadow-sm border-0 h-100 rounded-3">

                <div class="card-header bg-white border-bottom-0 pt-4 pb-2">
                    <h5 class="card-title fw-bold mb-0">Avisos y Fechas Límite</h5>
                </div>

                <div class="card-body">

                    <div class="d-flex mb-3 align-items-start p-2 rounded bg-primary bg-opacity-10">
                        <div class="text-primary px-1">
                            <i class="bi bi-info-circle-fill fs-5"></i>
                        </div>

                        <div class="ms-3">
                            <h6 class="mb-0 fw-bold text-dark small">
                                Comprobante de Pago
                            </h6>

                            <small class="text-muted">
                                Sube tu voucher antes de la fecha límite para validar tu examen.
                            </small>
                        </div>
                    </div>

                    <div class="d-flex align-items-start p-2 rounded bg-warning bg-opacity-10">
                        <div class="text-warning px-1">
                            <i class="bi bi-calendar-event-fill fs-5"></i>
                        </div>

                        <div class="ms-3">
                            <h6 class="mb-0 fw-bold text-dark small">
                                Cierre de Inscripciones
                            </h6>

                            <small class="text-muted">
                                El sistema de inscripción cerrará este viernes a las 23:59 hrs.
                            </small>
                        </div>
                    </div>

                </div>

            </div>
        </div>

    </div>

</div>
<footer class="mt-5 text-muted" style="font-size: 0.85rem;">
        © 2026 <strong>Sistema de Gestión Escolar</strong>. Portal del Alumno (ESCOM).
    </footer>
