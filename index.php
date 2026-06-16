<?php
session_start();

$base_url = "http://" . $_SERVER['HTTP_HOST'] . rtrim(dirname($_SERVER['PHP_SELF']), '/\\');

if (!isset($_SESSION['id_usuario'])) {
    header("Location: " . $base_url . "/php/endpoints/login.php");
    exit();
} else {
    header("Location: " . $base_url . "/frondend/html/index.php");
    exit();
}
?>