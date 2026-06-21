<?php
// Validar sesión
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json; charset=utf-8');

// Validar que sea un alumno
if (!isset($_SESSION['id_usuario']) || strtolower(trim($_SESSION['usuario_rol'])) !== 'alumno') {
    echo json_encode(['status' => 'error', 'message' => 'Acceso Denegado']);
    exit();
}

require_once '../config/db.php';

try {
    $id_usuario = $_SESSION['id_usuario'];
    
    // Corregimos aquí: usando $conexion en lugar de $conn
    $query = "SELECT nombre, apellido_paterno, apellido_materno, boleta FROM alumno WHERE id_usuario = ?";
    $stmt = $conexion->prepare($query);
    $stmt->execute([$id_usuario]); // PDO usa execute con arreglo
    $fila = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($fila) {
        $nombre_completo = trim($fila['nombre'] . ' ' . $fila['apellido_paterno'] . ' ' . $fila['apellido_materno']);
        
        echo json_encode([
            'status' => 'success',
            'nombre' => $nombre_completo,
            'boleta' => $fila['boleta']
        ]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Datos del alumno no encontrados.']);
    }
    
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error en el servidor: ' . $e->getMessage()]);
}
$conexion = null;
?>