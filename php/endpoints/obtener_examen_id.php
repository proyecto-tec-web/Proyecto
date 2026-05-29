<?php
session_start();
require_once '../config/db.php';

if (!isset($_GET['id'])) {
    echo json_encode(["status" => "error", "message" => "Falta el ID"]);
    exit();
}

try {
    $stmt = $conexion->prepare("SELECT * FROM examen WHERE id_examen = ?");
    $stmt->execute([$_GET['id']]);
    $examen = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($examen) {
        echo json_encode(["status" => "success", "examen" => $examen]);
    } else {
        echo json_encode(["status" => "error", "message" => "Examen no encontrado"]);
    }
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>