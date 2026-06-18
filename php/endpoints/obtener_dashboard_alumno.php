<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json; charset=utf-8');
require_once '../config/db.php';

if (!isset($conexion) || !($conexion instanceof PDO)) {
    echo json_encode([
        "status" => "error",
        "message" => "No hay conexión a la base de datos."
    ]);
    exit;
}

if (
    !isset($_SESSION['id_usuario']) ||
    strtolower(trim($_SESSION['usuario_rol'])) !== 'alumno'
) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Sesión no válida.'
    ]);
    exit;
}

try {

    // ==================================================
    // OBTENER ALUMNO
    // ==================================================

    $stmtAlumno = $conexion->prepare("
        SELECT
            id_alumno,
            situacion_academica
        FROM alumno
        WHERE id_usuario = :id_usuario
    ");

    $stmtAlumno->execute([
        ':id_usuario' => $_SESSION['id_usuario']
    ]);

    $alumno = $stmtAlumno->fetch(PDO::FETCH_ASSOC);

    if (!$alumno) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Alumno no encontrado.'
        ]);
        exit;
    }

    $id_alumno = $alumno['id_alumno'];

    // ==================================================
    // PROMEDIO GENERAL
    // ==================================================

    $stmtPromedio = $conexion->prepare("
        SELECT ROUND(AVG(calificacion), 2) AS promedio
        FROM kardex
        WHERE id_alumno = :id_alumno
    ");

    $stmtPromedio->execute([
        ':id_alumno' => $id_alumno
    ]);

    $promedio = $stmtPromedio->fetch(PDO::FETCH_ASSOC);

    // ==================================================
    // REPROBADAS
    // ==================================================

    $stmtReprobadas = $conexion->prepare("
        SELECT COUNT(*) AS total
        FROM kardex
        WHERE id_alumno = :id_alumno
        AND calificacion < 6
    ");

    $stmtReprobadas->execute([
        ':id_alumno' => $id_alumno
    ]);

    $reprobadas = $stmtReprobadas->fetch(PDO::FETCH_ASSOC);

    // ==================================================
    // ETS INSCRITOS
    // ==================================================

    $stmtETS = $conexion->prepare("
        SELECT COUNT(*) AS total
        FROM inscripcion_examen
        WHERE id_alumno = :id_alumno
    ");

    $stmtETS->execute([
        ':id_alumno' => $id_alumno
    ]);

    $etsInscritos = $stmtETS->fetch(PDO::FETCH_ASSOC);

    // ==================================================
    // TABLA DE ETS
    // ==================================================

    $stmtTabla = $conexion->prepare("
        SELECT
            m.nombre AS materia,

            DATE_FORMAT(
                e.fecha,
                '%d/%m/%Y'
            ) AS fecha,

            TIME_FORMAT(
                e.hora_inicio,
                '%h:%i %p'
            ) AS hora,

            s.numero AS salon,
            s.edificio,

            ie.estado_pago

        FROM inscripcion_examen ie

        INNER JOIN examen e
            ON ie.id_examen = e.id_examen

        INNER JOIN materia m
            ON e.id_materia = m.id_materia

        INNER JOIN salon s
            ON e.id_salon = s.id_salon

        WHERE ie.id_alumno = :id_alumno

        ORDER BY e.fecha DESC
    ");

    $stmtTabla->execute([
        ':id_alumno' => $id_alumno
    ]);

    $misETS = $stmtTabla->fetchAll(PDO::FETCH_ASSOC);

    // ==================================================
    // RESPUESTA
    // ==================================================

    echo json_encode([
        'status' => 'success',

        'resumen' => [

            'ets_inscritos' =>
                intval($etsInscritos['total'] ?? 0),

            'promedio' =>
                floatval($promedio['promedio'] ?? 0),

            'reprobadas' =>
                intval($reprobadas['total'] ?? 0),

            'situacion' =>
                $alumno['situacion_academica']

        ],

        'ets' => $misETS
    ]);

} catch (PDOException $e) {

    echo json_encode([
        'status' => 'error',
        'message' => 'Fallo en la BD: ' . $e->getMessage()
    ]);
}

$conexion = null;
?>