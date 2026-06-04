<?php
session_start();

// Validar que el usuario tenga el rol de profesor o sinodal
if (!isset($_SESSION['id_usuario']) || (strtolower(trim($_SESSION['usuario_rol'])) !== 'profesor' && strtolower(trim($_SESSION['usuario_rol'])) !== 'sinodal')) {
    
    echo "<div class='alert alert-danger shadow-sm border-0 rounded-3 mt-4'>
            <i class='bi bi-shield-lock-fill me-2'></i> 
            <strong>Acceso Denegado:</strong> Esta vista es exclusiva para el personal docente.
          </div>";
    exit(); 
}
?>
