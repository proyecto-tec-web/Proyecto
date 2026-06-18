<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (
    !isset($_SESSION['id_usuario']) ||
    strtolower(trim($_SESSION['usuario_rol'])) !== 'alumno'
) {
    echo "<script>window.location.href='../../../php/endpoints/login.php';</script>";
    exit();
}
?>

<div class="container-fluid p-0">

    <div class="alert alert-info mb-4" role="alert">
        <strong>Proceso de Inscripción:</strong>
        Selecciona el ETS que deseas presentar de la lista de exámenes disponibles.
    </div>

    <div class="card border-0 shadow-sm rounded-3 mb-4">
        <div class="card-body p-3">
            <div class="row g-2 align-items-center">

                <div class="col">
                    <input
                        type="text"
                        id="buscador-ets"
                        class="form-control"
                        placeholder="Buscar por materia o profesor...">
                </div>

                <div class="col-auto">
                    <button
                        type="button"
                        id="btn-filtrar-ets"
                        class="btn btn-primary px-4 fw-semibold">
                        Filtrar
                    </button>
                </div>

            </div>
        </div>
    </div>

    <div class="card border-0 shadow-sm rounded-3">
        <div class="table-responsive">

            <table class="table table-hover align-middle mb-0">

                <thead class="table-light text-secondary">
                    <tr>
                        <th class="ps-4 py-3">Materia</th>
                        <th class="py-3">Fecha y Hora</th>
                        <th class="py-3">Profesor / Sinodal</th>
                        <th class="py-3">Salón</th>
                        <th class="py-3">Cupo</th>
                        <th class="pe-4 text-center py-3">Acción</th>
                    </tr>
                </thead>

                <tbody id="tbody-ets-alumno">
                    <tr>
                        <td colspan="6" class="text-center py-4 text-muted">
                            <div class="spinner-border spinner-border-sm me-2"></div>
                            Cargando ETS disponibles...
                        </td>
                    </tr>
                </tbody>

            </table>

        </div>
    </div>

</div>
<footer class="mt-5 text-muted" style="font-size: 0.85rem;">
        © 2026 <strong>Sistema de Gestión Escolar</strong>. Portal del Alumno (ESCOM).
    </footer>
