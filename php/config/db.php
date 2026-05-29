<?php
$host = getenv('DB_HOST'); 
$nombre_db = getenv('DB_NAME'); 
$usuario = getenv('DB_USER'); 
$password = getenv('DB_PASSWORD');

try {
    $opciones = [
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4",
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ];
    $conexion = new PDO("mysql:host=$host;dbname=$nombre_db;charset=utf8mb4", $usuario, $password, $opciones);
} catch (PDOException $e) {
    echo "Error de conexión: " . $e->getMessage();
}
?>