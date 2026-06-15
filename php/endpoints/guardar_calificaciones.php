<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/db.php';

// 1. Validar que el usuario esté logueado
if (!isset($_SESSION['id_usuario'])) {
    echo json_encode(['status' => 'error', 'message' => 'Acceso denegado. Inicia sesión.']);
    exit;
}

// Obtenemos el rol de la sesión actual 
$rol_usuario = strtolower(trim($_SESSION['rol'] ?? $_SESSION['usuario_rol'] ?? ''));

$data = json_decode(file_get_contents("php://input"), true);
$id_examen = $data['id_examen'] ?? null;
$calificaciones = $data['calificaciones'] ?? []; 

if (!$id_examen || empty($calificaciones)) {
    echo json_encode(['status' => 'error', 'message' => 'Faltan datos para procesar la solicitud.']);
    exit;
}

try {
    // 2. Buscamos en qué estado se encuentra el examen en la base de datos
    $stmtExamen = $conexion->prepare("SELECT estado FROM examen WHERE id_examen = ?");
    $stmtExamen->execute([$id_examen]);
    $examen = $stmtExamen->fetch(PDO::FETCH_ASSOC);

    if (!$examen) {
        echo json_encode(['status' => 'error', 'message' => 'El examen no existe.']);
        exit;
    }

    $estado_actual = $examen['estado'];

    // ==========================================
    // 3. REGLAS DE NEGOCIO Y SEGURIDAD
    // ==========================================

    // REGLA A: No se puede calificar un examen que no esté Cerrado
    if ($estado_actual === 'Programado' || $estado_actual === 'Abierto') {
        echo json_encode(['status' => 'error', 'message' => 'El examen aún no está Cerrado. Aún no se pueden capturar calificaciones.']);
        exit;
    }

    // REGLA B: Si ya está calificado, SOLO EL ADMINISTRADOR puede cambiarlo
    // Validamos 'admin' y 'administrador' por si acaso
    if ($estado_actual === 'Calificado' && $rol_usuario !== 'admin' && $rol_usuario !== 'administrador') {
        echo json_encode(['status' => 'error', 'message' => 'Acceso Denegado: El acta ya fue cerrada. Solo un Administrador puede modificar calificaciones.']);
        exit;
    }

    // ==========================================

    // 4. Si pasó las reglas, iniciamos el guardado
    $conexion->beginTransaction();

    // SEGURIDAD AÑADIDA: Validamos que la inscripción corresponda al examen actual (Protección IDOR)
    $sql = "UPDATE inscripcion_examen SET calificacion = ? WHERE id_inscripcion = ? AND id_examen = ?";
    $stmt = $conexion->prepare($sql);

    foreach ($calificaciones as $item) {
        if (isset($item['calificacion']) && $item['calificacion'] !== "") {
            $cal = floatval($item['calificacion']);
            
            // Validar que la calificación sea del 0 al 10 en el servidor
            if ($cal < 0 || $cal > 10) {
                // Si alguien hizo trampa brincándose el JS, cancelamos TODO y mandamos error
                $conexion->rollBack();
                echo json_encode(['status' => 'error', 'message' => 'Seguridad: Una calificación detectada está fuera del rango permitido (0-10). Operación cancelada.']);
                exit;
            }
            
            // Pasamos la calificación, el ID de inscripción y el ID del examen
            $stmt->execute([$cal, $item['id_inscripcion'], $id_examen]);
        }
    } 

    // 5. Cambiamos el estado del examen a Calificado
    $sqlActualizarExamen = "UPDATE examen SET estado = 'Calificado' WHERE id_examen = ?";
    $stmtActualizarExamen = $conexion->prepare($sqlActualizarExamen);
    $stmtActualizarExamen->execute([$id_examen]);

    $conexion->commit();
    echo json_encode(['status' => 'success', 'message' => 'Calificaciones guardadas exitosamente.']);

} catch (PDOException $e) {
    $conexion->rollBack();
    echo json_encode(['status' => 'error', 'message' => 'Error de base de datos: ' . $e->getMessage()]);
}
?>