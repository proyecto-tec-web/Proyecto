<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once '../config/db.php';

if (!isset($_SESSION['id_usuario']) || (strtolower(trim($_SESSION['usuario_rol'])) !== 'admin' )) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit();
}
if (!isset($conexion) || !($conexion instanceof PDO)) {
    echo json_encode(["status" => "error", "message" => "No hay conexión a la base de datos."]);
    exit;
}

//Recibir los datos del formulario
$nombre = isset($_POST['nombre']) ? trim($_POST['nombre']) : '';
$semestre = isset($_POST['semestre']) ? trim($_POST['semestre']) : '';
$id_carrera = isset($_POST['id_carrera']) ? trim($_POST['id_carrera']) : '';
$id_area = isset($_POST['id_area']) ? trim($_POST['id_area']) : '';

//Validación de campos vacíos en el servidor
if (empty($nombre) || empty($semestre) || empty($id_carrera) || empty($id_area)) {
    echo json_encode(['status' => 'error', 'message' => 'Todos los campos son obligatorios.']);
    exit();
}
if (!is_numeric($semestre) || $semestre < 1 || $semestre > 10) {
    echo json_encode(['status' => 'error', 'message' => 'Seguridad: El semestre debe ser un valor entre 1 y 10.']);
    exit();
}

try {
    //Verificar que el ID de la Carrera exista
    $stmtC = $conexion->prepare("SELECT id_carrera FROM carrera WHERE id_carrera = ?");
    $stmtC->execute([$id_carrera]);
    if ($stmtC->rowCount() === 0) {
        echo json_encode(['status' => 'error', 'message' => 'El ID de Carrera ingresado no existe.']);
        exit();
    }

    //Verificar que el ID del Área exista
    $stmtA = $conexion->prepare("SELECT id_area FROM area WHERE id_area = ?");
    $stmtA->execute([$id_area]);
    if ($stmtA->rowCount() === 0) {
        echo json_encode(['status' => 'error', 'message' => 'El ID de Área ingresado no existe.']);
        exit();
    }

    //Guardamos la Materia
    $sqlInsert = "INSERT INTO materia (nombre, semestre, id_carrera, id_area) VALUES (?, ?, ?, ?)";
    $stmtInsert = $conexion->prepare($sqlInsert);
    $stmtInsert->execute([$nombre, $semestre, $id_carrera, $id_area]);

    echo json_encode(['status' => 'success', 'message' => 'Materia registrada con éxito.']);

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
}

$conexion = null;
?>