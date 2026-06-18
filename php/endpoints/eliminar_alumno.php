<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

require_once '../config/db.php';

// Validar que sea un administrador
if (!isset($_SESSION['id_usuario']) || (strtolower(trim($_SESSION['usuario_rol'])) !== 'admin')) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit();
}

$datos = json_decode(file_get_contents("php://input"), true);

if (empty($datos['id_alumno'])) {
    echo json_encode(["status" => "error", "message" => "ID de alumno no proporcionado."]);
    exit();
}

try {
    $conexion->beginTransaction();

    $id_alumno = $datos['id_alumno'];

    // 1. Obtener el id_usuario asociado al alumno
    $stmtBusqueda = $conexion->prepare("SELECT id_usuario FROM alumno WHERE id_alumno = ?");
    $stmtBusqueda->execute([$id_alumno]);
    $alumno = $stmtBusqueda->fetch(PDO::FETCH_ASSOC);

    if (!$alumno) {
        throw new Exception("El alumno no existe en la base de datos.");
    }

    $id_usuario = $alumno['id_usuario'];

    // 2. DAR DE BAJA AL ALUMNO (Cambiar su situación académica en vez de borrarlo)
    $stmtBajaAlumno = $conexion->prepare("UPDATE alumno SET situacion_academica = 'Baja' WHERE id_alumno = ?");
    $stmtBajaAlumno->execute([$id_alumno]);

    // 3. DESHABILITAR SU CUENTA DE LOGIN (Para que ya no pueda entrar al sistema)
    if ($id_usuario) {
        $stmtBajaUsuario = $conexion->prepare("UPDATE usuario SET estado = 'Inactivo' WHERE id_usuario = ?");
        $stmtBajaUsuario->execute([$id_usuario]);
    }

    $conexion->commit();
    echo json_encode(["status" => "success", "message" => "El alumno ha sido dado de baja correctamente."]);

} catch (Exception $e) {
    $conexion->rollBack();
    echo json_encode(["status" => "error", "message" => "Error al procesar la baja: " . $e->getMessage()]);
}
?>