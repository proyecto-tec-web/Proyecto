<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
header('Content-Type: application/json; charset=utf-8');
require_once './../config/db.php';

// Seguridad: solo alumnos con sesión activa
if (!isset($_SESSION['id_usuario']) || strtolower(trim($_SESSION['usuario_rol'])) !== 'alumno') {
    echo json_encode(['status' => 'error', 'message' => 'Sesión no válida. Inicia sesión como alumno.']);
    exit;
}

try {
    // Obtener el id_alumno ligado al usuario en sesión
    $stmtAlumno = $conexion->prepare("SELECT id_alumno, situacion_academica FROM alumno WHERE id_usuario = :id_usuario");
    $stmtAlumno->execute([':id_usuario' => $_SESSION['id_usuario']]);
    $alumno = $stmtAlumno->fetch(PDO::FETCH_ASSOC);

    if (!$alumno) {
        echo json_encode(['status' => 'error', 'message' => 'Tu usuario no tiene un perfil de alumno asociado.']);
        exit;
    }

    $sql = "SELECT m.semestre, m.nombre AS materia, k.calificacion
            FROM kardex k
            INNER JOIN materia m ON k.id_materia = m.id_materia
            WHERE k.id_alumno = :id_alumno
            ORDER BY m.semestre ASC, m.nombre ASC";

    $stmt = $conexion->prepare($sql);
    $stmt->execute([':id_alumno' => $alumno['id_alumno']]);
    $materias = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'data' => $materias,
        'situacion' => $alumno['situacion_academica']
    ]);

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Fallo en la BD: ' . $e->getMessage()]);
}
$conexion = null;
?>
