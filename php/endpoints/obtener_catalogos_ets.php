<?php
session_start();
require_once '../config/db.php';

if (!isset($_SESSION['id_usuario']) || (strtolower(trim($_SESSION['usuario_rol'])) !== 'admin' && strtolower(trim($_SESSION['usuario_rol'])) !== 'administrador')) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit();
}

try {
    $stmtMateria = $conexion->query("SELECT id_materia, nombre FROM materia");
    $materias = $stmtMateria->fetchAll(PDO::FETCH_ASSOC);
    $sqlProfesor = "
        SELECT p.id_profesor, CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', p.apellido_materno) AS nombre 
        FROM profesor p
        INNER JOIN usuario u ON p.id_usuario = u.id_usuario
        WHERE u.estado = 'Activo' OR u.estado IS NULL
    ";
    $stmtProfesor = $conexion->query($sqlProfesor);
    $profesores = $stmtProfesor->fetchAll(PDO::FETCH_ASSOC);


    $stmtSalon = $conexion->query("SELECT id_salon, CONCAT(edificio, ' - ', piso, ' - ', numero) AS nombre FROM salon");
    $salones = $stmtSalon->fetchAll(PDO::FETCH_ASSOC);

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