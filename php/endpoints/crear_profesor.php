<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/db.php';

if (!isset($_SESSION['id_usuario']) || (strtolower(trim($_SESSION['usuario_rol'])) !== 'admin' )) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit();
}
if (!isset($conexion) || !($conexion instanceof PDO)) {
    echo json_encode(["status" => "error", "message" => "No hay conexión a la base de datos."]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['boleta']) || empty($data['nombre']) || empty($data['paterno']) || empty($data['materno']) || empty($data['correo']) || empty($data['password'])) {
    echo json_encode(['status' => 'error', 'message' => 'Todos los campos son obligatorios.']);
    exit;
}

try {
    $conexion->beginTransaction();

    //Crear el usuario primero
    $sqlUsuario = "INSERT INTO usuario (correo, contrasena_hash, rol, estado) VALUES (?, ?, 'profesor', 'Activo')";
    $stmtUsuario = $conexion->prepare($sqlUsuario);

    $stmtUsuario->execute([$data['correo'], $data['password']]);
    
    $id_usuario_nuevo = $conexion->lastInsertId();

    //Crear al profesor enlazado a ese usuario
    $sqlProfesor = "INSERT INTO profesor (nombre, apellido_paterno, apellido_materno, boleta, id_usuario) VALUES (?, ?, ?, ?, ?)";
    $stmtProfesor = $conexion->prepare($sqlProfesor);
    $stmtProfesor->execute([
        $data['nombre'], 
        $data['paterno'], 
        $data['materno'], 
        $data['boleta'], 
        $id_usuario_nuevo
    ]);

    $conexion->commit();
    echo json_encode(['status' => 'success', 'message' => 'Profesor registrado exitosamente.']);

} catch (PDOException $e) {
    $conexion->rollBack();
    if ($e->getCode() == 23000) {
        echo json_encode(['status' => 'error', 'message' => 'El correo o la boleta ya están registrados en el sistema.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Error al guardar: ' . $e->getMessage()]);
    }
}
?>