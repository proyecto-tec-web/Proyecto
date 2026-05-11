<?php

$host = getenv('DB_HOST'); 
$nombre_db = getenv('DB_NAME'); 
$usuario = getenv('DB_USER'); 
$password = getenv('DB_PASSWORD');



try {

    $conexion = new PDO("mysql:host=$host;dbname=$nombre_db;charset=utf8", $usuario, $password);
    

    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
} catch (PDOException $e) {
    echo "Error de conexión: " . $e->getMessage();
}
?>