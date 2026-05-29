<?php
// Desactivamos la salida de errores en HTML para mantener el formato JSON limpio
ini_set('display_errors', 0);
error_reporting(E_ALL);

header("Content-Type: application/json; charset=UTF-8");

// Manejador para capturar fallos inesperados en formato JSON
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error !== null && ($error['type'] === E_ERROR || $error['type'] === E_CORE_ERROR || $error['type'] === E_COMPILE_ERROR)) {
        echo json_encode([
            "status" => "error",
            "message" => "Fallo crítico en PHP: " . $error['message']
        ]);
    }
});

// 🎯 CARGAMOS EL ARCHIVO REAL DESDE LA CARPETA CONFIG
require_once '../config/db.php'; 

$input = json_decode(file_get_contents("php://input"), true);
$id_examen = $input['id_examen'] ?? null;

if (!$id_examen) {
    echo json_encode(["status" => "error", "message" => "ID de examen no proporcionado."]);
    exit;
}

try {
    // 🎯 CAMBIAMOS 'examenes' POR 'examen' QUE ES EL NOMBRE REAL EN TU BD
    $query = "DELETE FROM examen WHERE id_examen = :id"; 
    $stmt = $conexion->prepare($query);
    
    $resultado = $stmt->execute([':id' => $id_examen]);
    
    if ($resultado) {
        echo json_encode(["status" => "success", "message" => "Examen eliminado correctamente."]);
    } else {
        echo json_encode(["status" => "error", "message" => "La consulta se ejecutó pero no afectó filas."]);
    }

} catch (PDOException $e) {
}
?>