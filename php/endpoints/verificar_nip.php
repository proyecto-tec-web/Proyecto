<?php
/*
//Esto se utilizará cuando la base de datos tenga la columna 'nip' en la tabla 'profesor'. Por ahora, como el líder no la ha agregado, dejaremos un NIP fijo (1234) para simular la validación de la firma.
// Esto se tenrá que poner en la base de datos: ALTER TABLE profesor ADD COLUMN nip VARCHAR(4) NOT NULL DEFAULT '1234';
// Despues de ello podemos hacerlo para cada profesor, y quitar el modo simulación de este endpoint.
session_start();
require_once '../config/db.php';

if (!isset($_SESSION['id_usuario'])) {
    echo json_encode(["status" => "error", "message" => "Sesión no válida"]);
    exit();
}

// Recibimos el NIP enviado por JavaScript
$data = json_decode(file_get_contents("php://input"), true);
$nip_ingresado = $data['nip'] ?? '';

if (empty($nip_ingresado)) {
    echo json_encode(["status" => "error", "message" => "El NIP está vacío."]);
    exit();
}

try {
    // Buscamos el NIP real del profesor que tiene la sesión abierta
    $stmt = $conexion->prepare("SELECT nip FROM profesor WHERE id_usuario = ?");
    $stmt->execute([$_SESSION['id_usuario']]);
    $profesor = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($profesor && $profesor['nip'] === $nip_ingresado) {
        echo json_encode(["status" => "success", "message" => "Firma validada."]);
    } else {
        echo json_encode(["status" => "error", "message" => "NIP incorrecto."]);
    }

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Error de BD."]);
}
*/
session_start();
// require_once '../config/db.php'; // No necesitamos la BD por ahora

if (!isset($_SESSION['id_usuario'])) {
    echo json_encode(["status" => "error", "message" => "Sesión no válida"]);
    exit();
}

// Recibimos el NIP enviado por el JavaScript de SweetAlert
$data = json_decode(file_get_contents("php://input"), true);
$nip_ingresado = $data['nip'] ?? '';

if (empty($nip_ingresado)) {
    echo json_encode(["status" => "error", "message" => "El NIP está vacío."]);
    exit();
}

// =====================================================================
// 🚧 MODO SIMULACIÓN (MOCK) ACTIVADO 🚧
// Como el líder aún no agrega la columna 'nip', usaremos '1234' por defecto.
// =====================================================================

if ($nip_ingresado === '1234') {
    // Si el profe teclea 1234, lo dejamos pasar
    echo json_encode(["status" => "success", "message" => "Firma validada."]);
} else {
    // Si teclea cualquier otra cosa, lo rebotamos
    echo json_encode(["status" => "error", "message" => "NIP incorrecto."]);
}
?>
