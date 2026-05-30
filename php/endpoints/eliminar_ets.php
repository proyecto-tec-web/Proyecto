<?php
// Desactivamos la salida de errores en HTML para mantener el formato JSON limpio
ini_set('display_errors', 0);
error_reporting(E_ALL);

header("Content-Type: application/json; charset=UTF-8");

session_start();

// Manejador para capturar fallos inesperados
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error !== null && ($error['type'] === E_ERROR || $error['type'] === E_CORE_ERROR || $error['type'] === E_COMPILE_ERROR)) {
        echo json_encode(["status" => "error", "message" => "Fallo crítico en PHP: " . $error['message']]);
    }
});

require_once '../config/db.php'; 

// Validar que sea administrador
if (!isset($_SESSION['id_usuario']) || (strtolower(trim($_SESSION['usuario_rol'])) !== 'admin' && strtolower(trim($_SESSION['usuario_rol'])) !== 'administrador')) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit();
}

$input = json_decode(file_get_contents("php://input"), true);
$id_examen = $input['id_examen'] ?? null;

if (!$id_examen) {
    echo json_encode(["status" => "error", "message" => "ID de examen no proporcionado."]);
    exit;
}

try {
    // 🚀 INICIAMOS LA TRANSACCIÓN (El borrado en dos pasos)
    $conexion->beginTransaction();

    // 1. Primero limpiamos los "tickets" de los alumnos inscritos a este examen
    $stmtInscripciones = $conexion->prepare("DELETE FROM inscripcion_examen WHERE id_examen = ?");
    $stmtInscripciones->execute([$id_examen]);

    // 2. Ahora sí, borramos el examen de forma segura
    $stmtExamen = $conexion->prepare("DELETE FROM examen WHERE id_examen = ?");
    $stmtExamen->execute([$id_examen]);

    // Guardamos los cambios
    $conexion->commit();

    echo json_encode(["status" => "success", "message" => "Examen y sus inscripciones eliminados correctamente."]);

} catch (PDOException $e) {
    // ⚠️ Ahora sí atrapamos el error y cancelamos si algo sale mal
    $conexion->rollBack();
    echo json_encode(["status" => "error", "message" => "Error de BD: " . $e->getMessage()]);
}
?>