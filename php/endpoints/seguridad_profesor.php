<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$rol_valido = isset($_SESSION['usuario_rol']) ? strtolower(trim($_SESSION['usuario_rol'])) : '';

if (!isset($_SESSION['id_usuario']) || ($rol_valido !== 'profesor' && $rol_valido !== 'sinodal')) {
    
    echo "<script>window.location.href = '../../../php/endpoints/login.php';</script>";
    exit(); 
}
?>          </div>";
    exit(); 
}
?>
