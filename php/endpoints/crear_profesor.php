<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/seguridad_admin.php';
require_once __DIR__ . '/../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

// Validamos que lleguen todos los datos
if (empty($data['boleta']) || empty($data['nombre']) || empty($data['paterno']) || empty($data['materno']) || empty($data['correo']) || empty($data['password'])) {
    echo json_encode(['status' => 'error', 'message' => 'Todos los campos son obligatorios.']);
    exit;
}

try {
    $conexion->beginTransaction();

    // 1. Crear el usuario primero
    $sqlUsuario = "INSERT INTO usuario (correo, contrasena_hash, rol, estado) VALUES (?, ?, 'profesor', 'Activo')";
    $stmtUsuario = $conexion->prepare($sqlUsuario);
    // NOTA: Como en tu setup.sql usas contraseñas planas ('profe123'), lo dejamos así. 
    // En un entorno real idealmente se usa password_hash().
    $stmtUsuario->execute([$data['correo'], $data['password']]);
    
    // Obtenemos el ID que la base de datos le acaba de asignar a ese usuario
    $id_usuario_nuevo = $conexion->lastInsertId();

    // 2. Crear al profesor enlazado a ese usuario
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
    // Validar si el error es por correo duplicado o boleta duplicada (Código 23000 de MySQL)
    if ($e->getCode() == 23000) {
        echo json_encode(['status' => 'error', 'message' => 'El correo o la boleta ya están registrados en el sistema.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Error al guardar: ' . $e->getMessage()]);
    }
}
?>