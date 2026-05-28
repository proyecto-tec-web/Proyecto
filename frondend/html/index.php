<?php
session_start();

if (!isset($_SESSION['id_usuario'])) {
    header("Location: ./../../php/endpoints/login.php");
    exit(); 
}

$rol_usuario = strtolower(trim($_SESSION['usuario_rol']));

if ($rol_usuario !== 'admin' && $rol_usuario !== 'administrador') {
    if ($rol_usuario === 'alumno') {
        header("Location: panel_alumno.php");
    } elseif ($rol_usuario === 'profesor' || $rol_usuario === 'sinodal') {
        header("Location: panel_profesor.php");
    } else {
        header("Location: ./../../php/endpoints/login.php");
    }
    exit(); 
}
?>
<!doctype html>
<html lang="es" data-bs-theme="light">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Sistema ETS · Panel de Administración</title>
    <link href="./../css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <style>
        body { overflow: hidden; background-color: #f4f6f9; }
        .menu-link { transition: all 0.2s ease; cursor: pointer; }
        #view-container { animation: fadeIn 0.3s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    </style>
</head>
<body>
    <main class="d-flex flex-nowrap min-vh-100">
        
        <div class="offcanvas-md offcanvas-start bg-body-tertiary shadow-sm d-flex flex-column flex-shrink-0 p-3" tabindex="-1" id="sidebarMenu" style="width: 280px; z-index: 1045;">
            <div class="offcanvas-header d-md-none border-bottom mb-3">
                <h5 class="offcanvas-title">Menú Principal</h5>
                <button type="button" class="btn-close" data-bs-dismiss="offcanvas" data-bs-target="#sidebarMenu"></button>
            </div>
            
            <a href="#" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-body-emphasis text-decoration-none">
                <i class="bi bi-mortarboard-fill fs-2 text-primary me-2"></i>
                <span class="fs-5 fw-bold">Control ETS</span>
            </a>
            <hr>
            
            <ul class="nav nav-pills flex-column mb-auto">
                <li class="nav-item"><a class="nav-link active menu-link" onclick="cargarVista('dashboard', this)"><i class="bi bi-house-door me-2"></i> Inicio</a></li>
                <li><a class="nav-link link-body-emphasis menu-link" onclick="cargarVista('examenes', this)"><i class="bi bi-calendar-event me-2"></i> Programar ETS</a></li>
                <li><a class="nav-link link-body-emphasis menu-link" onclick="cargarVista('inscripciones', this)"><i class="bi bi-card-checklist me-2"></i> Inscripciones y Pagos</a></li>
                <li><a class="nav-link link-body-emphasis menu-link" onclick="cargarVista('calificaciones', this)"><i class="bi bi-pencil-square me-2"></i> Capturar Calificaciones</a></li>
                <hr>
                <li><a class="nav-link link-body-emphasis menu-link" onclick="cargarVista('alumnos', this)"><i class="bi bi-people me-2"></i> Alumnos y Kardex</a></li>
                <li><a class="nav-link link-body-emphasis menu-link" onclick="cargarVista('profesores', this)"><i class="bi bi-person-badge me-2"></i> Profesores / Sinodales</a></li>
                <hr>
                <li><a class="nav-link link-body-emphasis menu-link" onclick="cargarVista('configuracion', this)"><i class="bi bi-gear me-2"></i> Catálogos</a></li>
                <li><a class="nav-link link-body-emphasis menu-link" onclick="cargarVista('usuarios', this)"><i class="bi bi-shield-lock me-2"></i> Usuarios y Accesos</a></li>
            </ul>
            
            <hr>
            <div class="dropdown">
                <a href="#" class="d-flex align-items-center link-body-emphasis text-decoration-none dropdown-toggle" data-bs-toggle="dropdown">
                    <img src="https://ui-avatars.com/api/?name=Admin+Escolar&background=0D8ABC&color=fff" width="32" height="32" class="rounded-circle me-2">
                    <strong>Admin Escolar</strong>
                </a>
                <ul class="dropdown-menu text-small shadow">
                    <li><a class="dropdown-item" href="#">Mi Perfil</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger" href="./../../php/endpoints/logout.php">Cerrar sesión</a></li>
                </ul>
            </div>
        </div>

        <div class="flex-grow-1 p-4 w-100 overflow-y-auto d-flex flex-column" style="height: 100vh;">
            
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-2 pb-3 mb-4 border-bottom">
                <div class="d-flex align-items-center">
                    <button class="btn btn-outline-secondary d-md-none me-3" type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebarMenu">
                        <i class="bi bi-list"></i>
                    </button>
                    <h1 class="h2 mb-0 fw-bold text-dark" id="titulo-seccion">Inicio</h1>
                </div>
            </div>

            <div id="view-container">
                <div class="text-center mt-5">
                    <div class="spinner-border text-primary" role="status"></div>
                    <p class="mt-2 text-muted">Cargando sistema...</p>
                </div>
            </div>

            <footer class="mt-auto pt-4 pb-2 text-muted text-center text-md-start">
                <div class="border-top pt-3">
                    <p class="mb-0 small">&copy; 2026 <strong>Sistema de Gestión Escolar</strong>. Departamento de Control Escolar.</p>
                </div>
            </footer>
        </div>
    </main>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="./../js/app.js?v=999"></script>
</body>
</html>