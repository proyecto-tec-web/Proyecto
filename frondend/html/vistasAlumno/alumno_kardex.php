<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
if (!isset($_SESSION['id_usuario']) || strtolower(trim($_SESSION['usuario_rol'])) !== 'alumno') {
    echo "<script>window.location.href = '../../../php/endpoints/login.php';</script>";
    exit();
}

// Conexión a la base de datos (ajusta la ruta según tu proyecto)
require_once __DIR__ . '/../../../php/config/db.php';

$id_usuario = $_SESSION['id_usuario'];

$sql_alumno = "SELECT id_alumno FROM alumno WHERE id_usuario = ?";
$stmt_alumno = $conexion->prepare($sql_alumno);
$stmt_alumno->execute([$id_usuario]);
$alumno = $stmt_alumno->fetch(PDO::FETCH_ASSOC);
$id_alumno = $alumno['id_alumno'] ?? null;
?>

<style>
    /* Ocultar el encabezado oficial en la pantalla de la computadora */
    .encabezado-oficial-print {
        display: none;
    }

    /* =========================================
       ESTILOS EXCLUSIVOS PARA IMPRESIÓN (Ctrl + P)
       ========================================= */
    @media print {
        /* 1. Ocultar todo lo innecesario (botones, menús, footer y el título original) */
        .btn-group, .btn-outline-dark, button, footer, nav, aside, .navbar,
        h1, h2, h3, h5, .page-title {
            display: none !important;
        }

        /* 2. Mostrar el encabezado oficial del IPN */
        .encabezado-oficial-print {
            display: block !important;
            text-align: center;
            margin-bottom: 25px;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
        }

        /* Darle formato formal a las letras del IPN */
        .encabezado-oficial-print h2.ipn-titulo {
            display: block !important;
            font-size: 22px !important;
            font-weight: bold !important;
            color: #000 !important;
            margin: 0 !important;
        }
        
        .encabezado-oficial-print h4.escom-titulo {
            display: block !important;
            font-size: 16px !important;
            color: #333 !important;
            margin: 5px 0 !important;
        }

        /* 3. Limpiar sombras y ajustar la tabla */
        .card {
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
        }
        .container-fluid {
            padding: 0 !important;
        }
        .table {
            width: 100% !important;
            border-collapse: collapse !important;
        }
        .table th {
            background-color: #f1f3f5 !important; 
            -webkit-print-color-adjust: exact !important; 
            color-adjust: exact !important;
            color: #000 !important;
            border-bottom: 2px solid #000 !important;
        }
    }
</style>

<div class="encabezado-oficial-print">
    <h2 class="ipn-titulo">INSTITUTO POLITÉCNICO NACIONAL</h2>
    <h4 class="escom-titulo">ESCUELA SUPERIOR DE CÓMPUTO</h4>
    <h4 class="escom-titulo" style="margin-top: 15px !important; font-weight: bold !important;">KARDEX DE EVALUACIÓN OFICIAL</h4>
    <img src="../img/ipn.jpg" alt="Logo IPN" style="position: absolute; top: 15px; left: 15px; width: 60px; height: auto;">
    <img src="../img/escom.jpg" alt="Logo ESCOM" style="position: absolute; top: 15px; right: 15px; width: 100px; height: auto;">
</div>

<div class="container-fluid p-0">
    
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div class="btn-group" role="group" aria-label="Filtros de materias">
            <button type="button" class="btn btn-outline-secondary active" data-filtro="todas">Mostrar Todas</button>
            <button type="button" class="btn btn-outline-success" data-filtro="aprobadas">Aprobadas</button>
            <button type="button" class="btn btn-outline-danger" data-filtro="reprobadas">Reprobadas</button>
        </div>
        
        <button class="btn btn-outline-dark btn-sm">
            <i class="bi bi-printer"></i> Imprimir Kardex
        </button>
    </div>

    <div class="card border-0 shadow-sm rounded-3">
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light text-secondary">
                    <tr>
                        <th class="ps-4 py-3">Semestre</th>
                        <th class="py-3">Unidad de Aprendizaje (Materia)</th>
                        <th class="py-3">Calificación</th>
                        <th class="pe-4 py-3 text-center">Resultado</th>
                    </tr>
                </thead>
                <tbody id="tabla-kardex">
                    <?php if ($id_alumno): ?>
                        <?php
                        $sql = "SELECT 
                                    m.nombre AS materia,
                                    m.semestre,
                                    k.calificacion
                                FROM kardex k
                                INNER JOIN materia m ON k.id_materia = m.id_materia
                                WHERE k.id_alumno = ?
                                ORDER BY m.semestre ASC, m.nombre ASC";
                        
              $stmt = $conexion->prepare($sql);
$stmt->execute([$id_alumno]);

$resultado = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (count($resultado) > 0):
    foreach ($resultado as $fila):
        $calificacion = $fila['calificacion'];
        $aprobada = $calificacion >= 6;
        $semestre_texto = $fila['semestre'] . "° Semestre";
?>
        <tr data-estado="<?= $aprobada ? 'aprobada' : 'reprobada' ?>">
            <td class="ps-4 text-muted"><?= htmlspecialchars($semestre_texto) ?></td>
            <td class="fw-bold"><?= htmlspecialchars($fila['materia']) ?></td>
            <td class="<?= $aprobada ? '' : 'text-danger fw-bold' ?>">
                <?= number_format($calificacion, 1) ?>
            </td>
            <td class="text-center">
                <?php if ($aprobada): ?>
                    <span class="badge bg-success-subtle text-success">Aprobada</span>
                <?php else: ?>
                    <span class="badge bg-danger-subtle text-danger">Reprobada</span>
                <?php endif; ?>
            </td>
        </tr>
<?php
    endforeach;
else:
?>
        <tr>
            <td colspan="4" class="text-center text-muted py-4">
                No tienes materias registradas en tu kardex.
            </td>
        </tr>
<?php endif; ?>
                    <?php else: ?>
                        <tr>
                            <td colspan="4" class="text-center text-danger py-4">
                                Error: No se encontró el registro de alumno asociado a tu cuenta.
                            </td>
                        </tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>

    <footer class="mt-5 text-muted" style="font-size: 0.85rem;">
        © 2026 <strong>Sistema de Gestión Escolar</strong>. Portal del Alumno (ESCOM).
    </footer>
</div>

<script>
// Funcionalidad de los filtros
document.querySelectorAll('[data-filtro]').forEach(btn => {
    btn.addEventListener('click', function() {
        // Cambiar botón activo
        document.querySelectorAll('[data-filtro]').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        const filtro = this.dataset.filtro;
        const filas = document.querySelectorAll('#tabla-kardex tr[data-estado]');
        
        filas.forEach(fila => {
            if (filtro === 'todas') {
                fila.style.display = '';
            } else if (filtro === 'aprobadas') {
                fila.style.display = fila.dataset.estado === 'aprobada' ? '' : 'none';
            } else if (filtro === 'reprobadas') {
                fila.style.display = fila.dataset.estado === 'reprobada' ? '' : 'none';
            }
        });
    });
});
</script>
