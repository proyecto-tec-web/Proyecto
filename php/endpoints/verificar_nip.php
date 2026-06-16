<?php
session_start();

//AUN INCOMPLETO, POR AHORA SOLO USEN NIP 1234

if (!isset($_SESSION['id_usuario'])) {
    echo json_encode(["status" => "error", "message" => "Sesión no válida"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$nip_ingresado = $data['nip'] ?? '';

if (empty($nip_ingresado)) {
    echo json_encode(["status" => "error", "message" => "El NIP está vacío."]);
    exit();
}

if ($nip_ingresado === '1234') {
    echo json_encode(["status" => "success", "message" => "Firma validada."]);
} else {
    echo json_encode(["status" => "error", "message" => "NIP incorrecto."]);
}
?>
