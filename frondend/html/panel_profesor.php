<?php
session_start();
// Validar que sea profesor o sinodal (Protección de la página)
if (!isset($_SESSION['id_usuario']) || (strtolower(trim($_SESSION['usuario_rol'])) !== 'profesor' && strtolower(trim($_SESSION['usuario_rol'])) !== 'sinodal')) {
    header("Location: ../../php/endpoints/login.php");
    exit();
}

// Lógica para determinar el saludo según la hora local
date_default_timezone_set('America/Mexico_City');
$hora = (int)date('G'); // Hora en formato 24h (0-23)
$saludo = "buenas noches";
if ($hora >= 5 && $hora < 12) {
    $saludo = "buenos días";
} elseif ($hora >= 12 && $hora < 19) {
    $saludo = "buenas tardes";
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel Docente - Sistema ETS</title>
    <link rel="icon" href="tiburon.png">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700;800&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">  
    <link href="../css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
    
    <style>
    /* Fondo de pantalla para toda la aplicación */
        body {
        background-image: url('../img/fondo.jpg');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        background-attachment: fixed;
        background-color: #f8f9fa;
    }
        body { font-family: 'Poppins', sans-serif; background-color: #f8f9fa; }
        .sidebar { background-color: #004ec2; color: white; }
        /* 1. Todos los enlaces inactivos (Color Blanco por defecto) */
        .sidebar .menu-link { 
            color: #ffffff !important; 
            cursor: pointer; 
            transition: all 0.3s ease; 
        }
        
        /* Efecto al pasar el mouse por encima (Leve brillo para saber dónde estás) */
        .sidebar .menu-link:hover { 
            background-color: rgba(255, 255, 255, 0.1); 
        }

        /* 2. El enlace SELECCIONADO (Texto negro, Fondo blanco para que resalte) */
        .sidebar .menu-link.active { 
            color: #000000 !important; 
            background-color: #ffffffc2 !important; 
            border-radius: 8px; 
            font-weight: bold;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        /* Diseño de "Aplicación de Escritorio" para PC */
        @media (min-width: 768px) {
            body { 
                overflow: hidden; 
            }
            /* EL FIX: Solo afecta a la fila principal contenedora, no a las tarjetas */
            .container-fluid > .row { 
                height: 100vh; 
            }
            .sidebar-desktop { 
                height: 100vh; 
            }
            .main-wrapper { 
                height: 100vh; 
                overflow-y: auto; 
                padding-bottom: 50px;
                display: block; /* Evita que los elementos internos se estiren */
            } 
        }
        
        /* Límite de ancho exclusivo para celulares (En PC se expande al 100%) */
        @media (max-width: 767.98px) {
            .offcanvas-md { max-width: 280px !important; }
        }

        /* Estilo del Botón Flotante de Gmail */
        .btn-flotante-gmail {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background-color: #ea4335; /* Rojo característico de Gmail */
            color: white;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.8rem;
            box-shadow: 0 4px 12px rgba(234, 67, 53, 0.4);
            z-index: 1000;
            transition: all 0.3s ease;
            text-decoration: none;
        }

        .btn-flotante-gmail:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 16px rgba(234, 67, 53, 0.6);
            color: white;
        }
        .escom-blue { 
        background-color: #004ec2 !important; 
        color: #ffffff !important; 
    }
    </style>
</head>
<body>

    <header class="navbar d-md-none p-3 shadow-sm sticky-top" style="background-color: #004ec2;">
        <div class="d-flex align-items-center justify-content-between w-100">
            <h5 class="text-white mb-0 fw-bold" style="font-family: 'Montserrat', sans-serif;">Portal Docente</h5>
            
            <button class="navbar-toggler text-white border-0 p-0" type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebarMenu" aria-controls="sidebarMenu">
                <i class="bi bi-list" style="font-size: 2rem;"></i>
            </button>
        </div>
    </header>

    <div class="container-fluid">
        <div class="row">
            
            <nav class="col-md-3 col-lg-2 p-0 sidebar sidebar-desktop shadow">
                <div class="offcanvas-md offcanvas-start sidebar h-100 d-flex flex-column" tabindex="-1" id="sidebarMenu" aria-labelledby="sidebarMenuLabel">
                    
                    <div class="offcanvas-header d-md-none border-bottom border-secondary pt-4 pb-3">
                        <h5 class="offcanvas-title text-white fw-bold" id="sidebarMenuLabel">Menú</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" data-bs-target="#sidebarMenu" aria-label="Close"></button>
                    </div>
                    
                    <div class="offcanvas-body d-flex flex-column py-4 flex-grow-1">
                        
                        <div class="text-center mb-4 mt-3 d-none d-md-block">
                            <div class="d-flex justify-content-center align-items-center gap-3 px-3 mb-3">
                                <img src="../img/logoESCOMBlanco.png" alt="ESCOM" class="img-fluid" style="max-height: 65px;">
                                <img src="../img/tiburonProfesor.png" alt="Logo Institucional" class="img-fluid" style="max-height: 65px;">
                            </div>
                            <h5 class="fw-bold mt-2" style="font-family: 'Montserrat', sans-serif;">Portal Docente</h5>
                            <span class="badge bg-light text-primary mb-2 px-3 py-1 rounded-pill">Profesor</span><br>
                            <small class="text-light opacity-75" style="letter-spacing: 0.5px;"><?php echo $_SESSION['usuario_correo']; ?></small>
                        </div>

                        <div class="text-center mb-4 d-md-none">
                            <div class="d-flex justify-content-center align-items-center gap-3 px-4 mb-2">
                                <img src="../img/logoESCOMBlanco.png" alt="ESCOM" class="img-fluid" style="max-height: 50px;">
                                <img src="../img/tiburonProfesor.png" alt="Logo Institucional" class="img-fluid" style="max-height: 50px;">
                            </div>
                            <br><small class="text-light opacity-75"><?php echo $_SESSION['usuario_correo']; ?></small>
                        </div>

                        <hr class="text-secondary mt-0 mb-4 border-2 opacity-25">
                        
                        <ul class="nav flex-column px-3 w-100 mb-auto gap-2">
                            <li class="nav-item">
                                <a class="nav-link menu-link active py-3 px-3 rounded-3" onclick="cargarVista('dashboard_profesor', this)">
                                    <i class="bi bi-house-door me-3 fs-5"></i> <b class="fs-6">Inicio</b>
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link menu-link py-3 px-3 rounded-3" onclick="cargarVista('mis_examenes', this)">
                                    <i class="bi bi-journal-text me-3 fs-5"></i> <b class="fs-6">Mis Exámenes ETS</b>
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link menu-link py-3 px-3 rounded-3" onclick="cargarVista('revisiones', this)">
                                    <i class="bi bi-search me-3 fs-5"></i> <b class="fs-6">Peticiones de Revisión</b>
                                </a>
                            </li>
                        </ul>
                        
                        <div class="mt-auto w-100 px-3">
                            <hr class="text-secondary mb-3 border-2 opacity-25">
                            <ul class="nav flex-column w-100">
                                <li class="nav-item">
                                    <a class="nav-link fw-bold py-3 px-3 rounded-3 shadow-sm" href="../../php/endpoints/logout.php" style="background-color: #dc3545; color: #000000 !important; transition: transform 0.2s;">
                                        <i class="bi bi-box-arrow-left me-3 fs-5" style="color: #000000;"></i> <b class="fs-6">Cerrar Sesión</b>
                                    </a>
                                </li>
                            </ul>
                        </div>
                        
                    </div>
                </div>
            </nav>            

            <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4 main-wrapper">
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
                    <h1 class="h2 fw-bold" style="font-family: 'Montserrat', sans-serif;" id="titulo-seccion">¡Hola, <?php echo $saludo; ?>!</h1>
                    <a href="https://www.ipn.mx/assets/files/website/docs/inicio/calendarioipn-escolarizada.pdf" target="_blank" class="btn btn-primary btn-sm rounded-pill px-4 shadow-sm fw-bold text-white" style="font-family: 'Montserrat', sans-serif; background-color: #004ec2">
                        <i class="bi bi-calendar3 me-2 text-white"></i> Calendario Académico 2025-2026
                    </a>
                </div>
                
                <div id="view-container"></div>

                
                <footer class="mt-auto pt-4 pb-2 text-muted text-center text-md-start">
                    <div class="border-top pt-3">
                        <p class="mb-0 small">&copy; 2026 <strong>Sistema de Gestión Escolar</strong>. Planta Docentes (2026).</p>
                    </div>
                </footer>
            </main>
        </div>
    </div>

    <a href="https://mail.google.com/mail/?view=cm&fs=1&to=admin@ipn.mx&su=Dudas" target="_blank" class="btn-flotante-gmail" title="Enviar correo con dudas a Soporte">
        <i class="bi bi-envelope-fill"></i>
    </a>

    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="../js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://unpkg.com/just-validate@latest/dist/just-validate.production.min.js"></script>
    <script src="../js/app.js?v=<?php echo time(); ?>"></script>
    <script src="../js/profesor.js?v=<?php echo time(); ?>"></script>
</body>
</html>
