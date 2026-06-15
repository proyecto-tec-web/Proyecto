<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/seguridad_admin.php';
require_once __DIR__ . '/../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);
$boleta = $data['boleta'] ?? null;

if (!$boleta) {
    echo json_encode(['status' => 'error', 'message' => 'Falta la boleta del profesor.']);
    exit;
}

try {
    // 1. Buscamos el id_usuario asociado al profesor
    $stmtFind = $conexion->prepare("SELECT id_usuario FROM profesor WHERE boleta = ?");
    $stmtFind->execute([$boleta]);
    $profesor = $stmtFind->fetch(PDO::FETCH_ASSOC);

    if (!$profesor) {
        echo json_encode(['status' => 'error', 'message' => 'El profesor no existe.']);
        exit;
    }

    $id_usuario = $profesor['id_usuario'];

    // 2. Revisamos cuál es su estado actual
    $stmtStatus = $conexion->prepare("SELECT estado FROM usuario WHERE id_usuario = ?");
    $stmtStatus->execute([$id_usuario]);
    $user = $stmtStatus->fetch(PDO::FETCH_ASSOC);

    // 3. Alternamos el estado
    $nuevo_estado = ($user['estado'] === 'Activo') ? 'Inactivo' : 'Activo';
    
    $stmtUpdate = $conexion->prepare("UPDATE usuario SET estado = ? WHERE id_usuario = ?");
    $stmtUpdate->execute([$nuevo_estado, $id_usuario]);

    $mensaje = ($nuevo_estado === 'Inactivo') ? 'Profesor deshabilitado con éxito.' : 'Profesor habilitado nuevamente.';

    echo json_encode(['status' => 'success', 'message' => $mensaje]);

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error de base de datos: ' . $e->getMessage()]);
}
?>