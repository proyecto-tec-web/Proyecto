<?php
session_start();
require_once '../config/db.php';

if (!isset($_SESSION['id_usuario']) || (strtolower(trim($_SESSION['usuario_rol'])) !== 'admin' && strtolower(trim($_SESSION['usuario_rol'])) !== 'administrador')) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit();
}

try {
    // 1. Materias (Solo pedimos el ID y el Nombre, sin asteriscos)
    $stmtMateria = $conexion->query("SELECT id_materia, nombre FROM materia");
    $materias = $stmtMateria->fetchAll(PDO::FETCH_ASSOC);

    // 2. Profesores (Pedimos el ID y construimos el Nombre completo)
    $stmtProfesor = $conexion->query("SELECT id_profesor, CONCAT(nombre, ' ', apellido_paterno, ' ', apellido_materno) AS nombre FROM profesor");
    $profesores = $stmtProfesor->fetchAll(PDO::FETCH_ASSOC);

    // 3. Salones (Pedimos el ID y construimos el Nombre del salón)
    $stmtSalon = $conexion->query("SELECT id_salon, CONCAT(edificio, ' - ', piso, ' - ', numero) AS nombre FROM salon");
    $salones = $stmtSalon->fetchAll(PDO::FETCH_ASSOC);

    // Si todo sale bien, empaquetamos el JSON limpio
    echo json_encode([
        "status" => "success",
        "materias" => $materias,
        "profesores" => $profesores,
        "salones" => $salones
    ]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Error de BD: " . $e->getMessage()]);
}
?>