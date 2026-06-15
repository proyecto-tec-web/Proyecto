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
    // 1. Buscamos el id_usuario asociado a este profesor antes de borrarlo
    $stmtFind = $conexion->prepare("SELECT id_usuario FROM profesor WHERE boleta = ?");
    $stmtFind->execute([$boleta]);
    $profesor = $stmtFind->fetch(PDO::FETCH_ASSOC);

    if (!$profesor) {
        echo json_encode(['status' => 'error', 'message' => 'El profesor no existe en la base de datos.']);
        exit;
    }

    $id_usuario = $profesor['id_usuario'];

    $conexion->beginTransaction();

    // 2. Borramos al profesor (por restricciones de llave foránea, debe ser primero el hijo)
    $stmtProf = $conexion->prepare("DELETE FROM profesor WHERE boleta = ?");
    $stmtProf->execute([$boleta]);

    // 3. Borramos su cuenta de usuario (el padre)
    if ($id_usuario) {
        $stmtUser = $conexion->prepare("DELETE FROM usuario WHERE id_usuario = ?");
        $stmtUser->execute([$id_usuario]);
    }

    $conexion->commit();
    echo json_encode(['status' => 'success', 'message' => 'Profesor y su cuenta de acceso eliminados correctamente.']);

} catch (PDOException $e) {
    $conexion->rollBack();
    // Error 23000 de PDO = Violación de restricción de llave foránea (Integridad referencial)
    if ($e->getCode() == '23000') {
        echo json_encode(['status' => 'error', 'message' => 'No se puede eliminar: El profesor ya tiene exámenes asignados o historial en el sistema.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Error de base de datos: ' . $e->getMessage()]);
    }
}
?>