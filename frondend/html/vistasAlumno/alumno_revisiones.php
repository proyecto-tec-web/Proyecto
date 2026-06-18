<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
if (!isset($_SESSION['id_usuario']) || strtolower(trim($_SESSION['usuario_rol'])) !== 'alumno') {

    echo "<script>window.location.href = '../../../php/endpoints/login.php';</script>";
    exit();
}
?>

<div class="container-fluid p-0">
    <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <div>
                    <h5 class="card-title fw-bold text-primary mb-1" style="font-family: 'Montserrat', sans-serif;">
                        <i class="bi bi-search me-2"></i> Mis Peticiones de Revisión
                    </h5>
                    <p class="text-muted mb-0 small">Consulta el estado de tus solicitudes de aclaración o genera una nueva petición si consideras que hay un error en tu evaluación.</p>
                </div>
                <button class="btn btn-success shadow-sm rounded-pill px-4 fw-bold" data-bs-toggle="modal" data-bs-target="#modalNuevaRevision">
                    <i class="bi bi-plus-circle me-1"></i> Nueva Solicitud
                </button>
            </div>

            <div class="table-responsive">
                <table class="table table-hover align-middle">
                    <thead class="table-light">
                        <tr>
                        <th class="ps-4">Folio</th>
                        <th>Materia Evaluada</th>
                        <th>Mi Justificación</th>
                        <th>Cita (Lugar y Hora)</th> <th>Notas del Profesor</th> <th class="text-center">Estado</th>
                        </tr>
                    </thead>
                    <tbody id="tbody-mis-revisiones">
                        <tr>
                            <td colspan="5" class="text-center py-4">
                                <span class="spinner-border spinner-border-sm text-success"></span> Cargando tus peticiones...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="modalNuevaRevision" tabindex="-1" aria-labelledby="modalNuevaRevisionLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow rounded-4">
            <div class="modal-header bg-success text-white border-0 rounded-top-4">
                <h5 class="modal-title fw-bold" id="modalNuevaRevisionLabel">
                    <i class="bi bi-file-earmark-plus me-2"></i> Solicitar Revisión de ETS
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            
            <form id="form-nueva-revision" onsubmit="event.preventDefault(); enviarPeticionRevision();">
                <div class="modal-body p-4">
                    <div class="mb-3">
                        <label class="form-label fw-bold text-muted small">1. Selecciona el examen calificado</label>
                        <select class="form-select border-2" id="select-examen-revision" required>
                            <option value="" selected disabled>Cargando exámenes disponibles...</option>
                        </select>
                        <div class="form-text">Solo se muestran los exámenes que ya cuentan con una calificación asentada por el docente.</div>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label fw-bold text-muted small">2. Motivo e Impugnación Académica <span class="text-danger">*</span></label>
                        <textarea class="form-control border-2" id="motivo-revision" rows="4" placeholder="Explica detalladamente por qué solicitas la revisión (Ej: error en la suma de puntos, revisión de ejercicio 3...)" required minlength="15"></textarea>
                        <div class="form-text text-end text-muted small">Mínimo 15 caracteres.</div>
                    </div>
                </div>
                
                <div class="modal-footer bg-light border-top-0 rounded-bottom-4">
                    <button type="button" class="btn btn-secondary rounded-pill px-3" data-bs-dismiss="modal">Cancelar</button>
                    <button type="submit" class="btn btn-success fw-bold rounded-pill px-4 shadow-sm" id="btn-enviar-revision">
                        <i class="bi bi-send me-1"></i> Enviar Petición
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
    <footer class="mt-5 text-muted" style="font-size: 0.85rem;">
        © 2026 <strong>Sistema de Gestión Escolar</strong>. Portal del Alumno (ESCOM).
    </footer>
<script>
    // Disparador automático para enganchar con las funciones de alumno.js al cargar la vista
    if (typeof iniciarVistaRevisionesAlumno === 'function') {
        iniciarVistaRevisionesAlumno();
    }
</script>
