<?php
require_once './../config/db.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $correo = $_POST['correo'];
    $nueva_pass = $_POST['nueva_password'];

    try {
        $password_hasheada = password_hash($nueva_pass, PASSWORD_DEFAULT);

        $sql = "UPDATE usuario SET contrasena_hash = ? WHERE correo = ?";
        $stmt = $conexion->prepare($sql);
        
        $stmt->execute([$password_hasheada, $correo]);

        if ($stmt->rowCount() > 0) {
            echo "Contraseña actualizada exitosamente.";
        } else {
            echo "No se encontró al usuario o la contraseña ya era la misma.";
        }

    } catch (PDOException $e) {
        echo "Error: " . $e->getMessage();
    }
}
?>