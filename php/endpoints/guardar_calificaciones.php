<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/db.php';

// 1. Validar que exista una sesión
if (!isset($_SESSION['id_usuario'])) {
    echo json_encode(['status' => 'error', 'message' => 'Acceso denegado. Inicia sesión.']);
    exit;
}

$rol_usuario = strtolower(trim($_SESSION['rol'] ?? $_SESSION['usuario_rol'] ?? ''));

// 2. BLOQUEO ABSOLUTO A ALUMNOS
if ($rol_usuario === 'alumno') {
    echo json_encode(['status' => 'error', 'message' => 'Acceso denegado. Los alumnos no pueden calificar exámenes.']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$id_examen = $data['id_examen'] ?? null;
$calificaciones = $data['calificaciones'] ?? []; 

if (!$id_examen || empty($calificaciones)) {
    echo json_encode(['status' => 'error', 'message' => 'Faltan datos para procesar la solicitud.']);
    exit;
}

try {
    // 3. OBTENEMOS EL ESTADO Y EL DUEÑO (PROFESOR) DEL EXAMEN
    $stmtExamen = $conexion->prepare("SELECT estado, id_profesor FROM examen WHERE id_examen = ?");
    $stmtExamen->execute([$id_examen]);
    $examen = $stmtExamen->fetch(PDO::FETCH_ASSOC);

    if (!$examen) {
        echo json_encode(['status' => 'error', 'message' => 'El examen no existe.']);
        exit;
    }

    // 4. VERIFICAMOS PROPIEDAD SI ES UN PROFESOR
    if ($rol_usuario === 'profesor') {
        $stmtProf = $conexion->prepare("SELECT id_profesor FROM profesor WHERE id_usuario = ?");
        $stmtProf->execute([$_SESSION['id_usuario']]);
        $profesor = $stmtProf->fetch(PDO::FETCH_ASSOC);

        if (!$profesor || $examen['id_profesor'] != $profesor['id_profesor']) {
            echo json_encode(['status' => 'error', 'message' => 'Acceso denegado. No eres el titular de este examen.']);
            exit;
        }
    }

    $estado_actual = $examen['estado'];

    if ($estado_actual === 'Programado' || $estado_actual === 'Abierto') {
        echo json_encode(['status' => 'error', 'message' => 'El examen aún no está Cerrado. Aún no se pueden capturar calificaciones.']);
        exit;
    }

    if ($estado_actual === 'Calificado' && $rol_usuario !== 'admin') {
        echo json_encode(['status' => 'error', 'message' => 'Acceso Denegado: El acta ya fue cerrada. Solo un Administrador puede modificar calificaciones.']);
        exit;
    }

    $conexion->beginTransaction();

    $sql = "UPDATE inscripcion_examen SET calificacion = ? WHERE id_inscripcion = ? AND id_examen = ?";
    $stmt = $conexion->prepare($sql);

    $sqlInfo = "SELECT ie.id_alumno, e.id_materia 
                FROM inscripcion_examen ie
                INNER JOIN examen e ON ie.id_examen = e.id_examen 
                WHERE ie.id_inscripcion = ?";
    $stmtInfo = $conexion->prepare($sqlInfo);

    $sqlKardex = "INSERT INTO kardex (id_alumno, id_materia, calificacion) 
                  VALUES (?, ?, ?) 
                  ON DUPLICATE KEY UPDATE calificacion = ?";
    $stmtKardex = $conexion->prepare($sqlKardex);

    foreach ($calificaciones as $item) {
        if (isset($item['calificacion']) && $item['calificacion'] !== "") {
            $cal = floatval($item['calificacion']);
            
            if ($cal < 0 || $cal > 10) {
                $conexion->rollBack();
                echo json_encode(['status' => 'error', 'message' => 'Seguridad: Una calificación detectada está fuera del rango permitido (0-10). Operación cancelada.']);
                exit;
            }
            
            $stmt->execute([$cal, $item['id_inscripcion'], $id_examen]);

            $stmtInfo->execute([$item['id_inscripcion']]);
            $info = $stmtInfo->fetch(PDO::FETCH_ASSOC);

            if ($info) {
                $stmtKardex->execute([$info['id_alumno'], $info['id_materia'], $cal, $cal]);
            }
        }
    } 

    $sqlActualizarExamen = "UPDATE examen SET estado = 'Calificado' WHERE id_examen = ?";
    $stmtActualizarExamen = $conexion->prepare($sqlActualizarExamen);
    $stmtActualizarExamen->execute([$id_examen]);

    $conexion->commit();
    echo json_encode(['status' => 'success', 'message' => 'Calificaciones guardadas y Kardex actualizado exitosamente.']);

} catch (PDOException $e) {
    $conexion->rollBack();
    echo json_encode(['status' => 'error', 'message' => 'Error de base de datos: ' . $e->getMessage()]);
}
?>