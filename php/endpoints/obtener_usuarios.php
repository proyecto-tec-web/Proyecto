<?php
header('Content-Type: application/json'); // Le decimos al navegador que devolveremos JSON
require_once './../config/db.php';


try {
    $stmt = $conexion->prepare("SELECT id_usuario, correo, rol FROM usuario ORDER BY id_usuario ASC");
    $stmt->execute();
    
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Imprimimos el arreglo de PHP convertido a formato JSON
    echo json_encode(["status" => "success", "data" => $usuarios]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>