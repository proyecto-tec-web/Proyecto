<?php
session_start();
// Ajusta la ruta de db.php si tu carpeta config está en otro lado
require_once '../config/db.php'; 

// 1. Verificamos que sea el administrador
if (!isset($_SESSION['id_usuario']) || (strtolower(trim($_SESSION['usuario_rol'])) !== 'admin' )) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit();
}

// 2. Leemos los datos que nos mandó app.js
$datos = json_decode(file_get_contents("php://input"), true);

// Atrapamos el ID (buscamos 'id_examen' o 'id' por si acaso)
$id_examen = isset($datos['id_examen']) ? $datos['id_examen'] : (isset($datos['id']) ? $datos['id'] : null);

if (!$id_examen) {
    echo json_encode(["status" => "error", "message" => "No se recibió el ID del examen."]);
    exit();
}

try {
    // 3. Intentamos borrar el examen
    $sql = "DELETE FROM examen WHERE id_examen = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->execute([$id_examen]);

    // Verificamos si realmente se borró algo
    if ($stmt->rowCount() > 0) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => "El examen no existe o ya fue eliminado."]);
    }

} catch (PDOException $e) {
    // 4. Si la base de datos se queja (ej. alumnos ya inscritos), mandamos el error real
    // El código 23000 es el error de llave foránea (Foreign Key) en SQL
    if ($e->getCode() == '23000') {
        echo json_encode(["status" => "error", "message" => "No se puede eliminar. El examen ya tiene alumnos inscritos o actas relacionadas."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error técnico: " . $e->getMessage()]);
    }
}
?>
