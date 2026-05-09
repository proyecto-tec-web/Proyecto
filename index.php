<?php
session_start();

// Esta línea detecta automáticamente tu ruta base (Ej: http://localhost/ o http://localhost/mi_proyecto)
$base_url = "http://" . $_SERVER['HTTP_HOST'] . rtrim(dirname($_SERVER['PHP_SELF']), '/\\');

if (!isset($_SESSION['id_usuario'])) {
    // Te manda al login usando la ruta completa
    header("Location: " . $base_url . "/php/endpoints/login.php");
    exit();
} else {
    // Te manda al panel usando la ruta completa
    header("Location: " . $base_url . "/frondend/html/index.php");
    exit();
}
?>