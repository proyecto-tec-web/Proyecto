<?php
require_once '../config/conexion.php';
$baseDeDatos = new Conexion();
$db = $baseDeDatos->obtenerConexion();

if($db) {
    echo "<h2>Conexión exitosa. Iniciando prueba...</h2>";

    $db->exec("CREATE TABLE IF NOT EXISTS prueba_carreras (id INT AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(100))");

    $db->exec("INSERT INTO prueba_carreras (nombre) VALUES ('Ingeniería en Sistemas')");
    echo "✅ 1. Se agregó la carrera correctamente.<br>";

    $busqueda = $db->query("SELECT * FROM prueba_carreras ORDER BY id DESC LIMIT 1");
    $resultado = $busqueda->fetch(PDO::FETCH_ASSOC);
    
    echo "✅ 2. Se encontró en la base de datos: <b>" . $resultado['nombre'] . "</b> (Con el ID: " . $resultado['id'] . ")<br>";

    $db->exec("DELETE FROM prueba_carreras WHERE id = " . $resultado['id']);
    echo "✅ 3. Se eliminó el registro para dejar todo limpio.<br>";
}
?>