//PEMDIENTE DE REVISAR SI SE DEBE ELIMINAR TAMBIEN LAS INSCRIPCIONES ASOCIADAS AL EXAMEN, SI ES ASI, SE DEBE HACER EN UNA TRANSACCION PARA EVITAR INCONSISTENCIAS EN LA BASE DE DATOS.
<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);
header("Content-Type: application/json; charset=UTF-8");
session_start();
require_once '../config/db.php'; 

if (!isset($_SESSION['id_usuario']) || (strtolower(trim($_SESSION['usuario_rol'])) !== 'admin' )) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit();
}
if (!isset($conexion) || !($conexion instanceof PDO)) {
    echo json_encode(["status" => "error", "message" => "No hay conexión a la base de datos."]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);
$id_examen = $input['id_examen'] ?? null;

if (!$id_examen) {
    echo json_encode(["status" => "error", "message" => "ID de examen no proporcionado."]);
    exit;
}

try {
    $conexion->beginTransaction();

    $stmtInscripciones = $conexion->prepare("DELETE FROM inscripcion_examen WHERE id_examen = ?");
    $stmtInscripciones->execute([$id_examen]);

    $stmtExamen = $conexion->prepare("DELETE FROM examen WHERE id_examen = ?");
    $stmtExamen->execute([$id_examen]);

    $conexion->commit();

    echo json_encode(["status" => "success", "message" => "Examen y sus inscripciones eliminados correctamente."]);

} catch (PDOException $e) {
    $conexion->rollBack();
    echo json_encode(["status" => "error", "message" => "Error de BD: " . $e->getMessage()]);
}
?>