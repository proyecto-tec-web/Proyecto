<?php
session_start();

if (!isset($_SESSION['id_usuario']) || (strtolower(trim($_SESSION['usuario_rol'])) !== 'admin' && strtolower(trim($_SESSION['usuario_rol'])) !== 'administrador')) {
    
    echo "<div class='alert alert-danger shadow-sm border-0 rounded-3 mt-4'>
            <i class='bi bi-shield-lock-fill me-2'></i> 
            <strong>Acceso Denegado:</strong> No tienes los privilegios necesarios para ver este módulo.
          </div>";
    exit(); 
}
?>