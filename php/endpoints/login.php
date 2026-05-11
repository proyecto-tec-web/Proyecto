<?php
session_start();
require_once './../config/db.php';

$error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    $correo_ingresado = $_POST['correo']; 
    $pass_ingresada = $_POST['password'];

    try {
        $consulta = $conexion->prepare("SELECT id_usuario, correo, contrasena_hash, rol FROM usuario WHERE correo = ?");
        $consulta->execute([$correo_ingresado]);

        $usuario = $consulta->fetch(PDO::FETCH_ASSOC);

        // ====================================================================
        // VERIFICACIÓN TEMPORAL EN TEXTO PLANO (MODO DESARROLLO)
        // Comparamos directamente si la contraseña coincide con lo que hay en BD
        if ($usuario && $pass_ingresada === $usuario['contrasena_hash']) {
        // ====================================================================
        
        // NOTA PARA EL FUTURO: Cuando ya tengas las contraseñas encriptadas, 
        // borra la línea del "if" de arriba y descomenta esta de abajo:
        // if ($usuario && password_verify($pass_ingresada, $usuario['contrasena_hash'])) {

            $_SESSION['usuario_correo'] = $usuario['correo'];
            $_SESSION['usuario_id'] = $usuario['id_usuario'];
            // Compatibilidad: algunas páginas comprueban `id_usuario`
            $_SESSION['id_usuario'] = $usuario['id_usuario'];
            $_SESSION['usuario_rol'] = $usuario['rol'];
            
            header("Location: ../../frondend/html/index.php");//No FUNCIONA 
            exit();
            
        } else {
            $error = "Correo o contraseña incorrecta. Intenta de nuevo.";
        }

    } catch (Exception $e) {
        $error = "Algo salió mal con la base de datos: " . $e->getMessage();
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Sistema ETS ESCOM</title>  
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700;800&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">  
    <link href="./../../frondend/css/bootstrap.min.css" rel="stylesheet">
    <link href="./../../frondend/css/styleLogin.css" rel="stylesheet">
</head>
<body>

    <div class="bg-overlay"></div>

    <!-- Menú Superior -->
    <nav class="navbar navbar-expand-lg navbar-dark navbar-escom">
        <div class="container">
            <a class="navbar-brand fw-bold" href="#">
                <img src="./../../frondend/img/logoESCOMBlanco.png" alt="ESCOM" class="brand-icon">
                Sistema de Gestion de ETS
            </a>
            <div class="collapse navbar-collapse justify-content-end">
                <ul class="navbar-nav">
                    <li class="nav-item"><a class="nav-link" href="https://www.escom.ipn.mx/">Conocenos</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <main class="main-content">
        <!-- Lado Izquierdo: Lema -->
        <div class="hero-section">
            <h1 class="lema-ipn">"La Técnica al Servicio de la Patria"</h1>
            <p class="sub-lema">Escuela Superior de Cómputo (ESCOM)</p>
        </div>

        <!-- Lado Derecho: Login -->
        <div class="login-section">
            <div class="card login-card p-4 p-md-5">
                <div class="text-center mb-4">
                    <h2 class="fw-bold text-dark">Iniciar Sesión</h2>
                    <small class="text-muted">Acceso administrativo y alumnos</small>
                </div>

                <?php if(isset($error) && $error != ""): ?>
                    <div class="alert alert-danger py-2 small text-center"><?php echo $error; ?></div>
                <?php endif; ?>

                <form method="POST" action="">
                    <div class="mb-3">
                        <label class="form-label fw-bold small text-secondary">CORREO INSTITUCIONAL</label>
                        <input type="email" name="correo" class="form-control form-control-lg" required placeholder="usuario@ipn.mx">
                    </div>
                    <div class="mb-4">
                        <label class="form-label fw-bold small text-secondary">CONTRASEÑA</label>
                        <input type="password" name="password" class="form-control form-control-lg" required placeholder="••••••••">
                    </div>
                    <button type="submit" class="btn btn-escom w-100 fw-bold shadow-sm">ENTRAR</button>
                </form>
            </div>
        </div>
    </main>

    <!-- Pie de Página -->
    <footer class="footer-escom">
        <div class="container">
            <div class="row">
                <div class="col-lg-4 col-md-6 mb-4 pr-lg-5">
                    <h5 class="footer-title">Sistema Control ETS</h5>
                    <p class="footer-text mb-3">Plataforma integral desarrollada para la gestión, inscripción y seguimiento de Exámenes a Título de Suficiencia.</p>
                </div>

                <div class="col-lg-4 col-md-6 mb-4">
                    <h5 class="footer-title">Enlaces Institucionales</h5>
                    <ul class="list-unstyled">
                        <li class="mb-2"><a href="https://www.ipn.mx/" target="_blank" class="footer-link">Instituto Politécnico Nacional</a></li>
                        <li class="mb-2"><a href="https://www.escom.ipn.mx/" target="_blank" class="footer-link">Escuela Superior de Cómputo</a></li>
                        <li class="mb-2"><a href="#" class="footer-link">Aviso de Privacidad</a></li>
                        <li class="mb-2"><a href="#" class="footer-link">Soporte Técnico Institucional</a></li>
                    </ul>
                </div>

                <div class="col-lg-4 col-md-12 mb-4">
                    <h5 class="footer-title">Contacto ESCOM</h5>
                    <ul class="list-unstyled footer-text">
                        <li class="mb-2"><strong>📍 Ubicación:</strong><br> Av. Juan de Dios Bátiz s/n, Zacatenco, Gustavo A. Madero, CDMX.</li>
                        <li class="mb-2"><strong>📞 Teléfono:</strong><br> 55 5729 6000 Ext. 52011</li>
                        <li class="mb-2"><strong>✉️ Correo:</strong><br> soporte_ets@escom.ipn.mx</li>
                    </ul>
                </div>
            </div>

            <div class="footer-divider"></div>
            <div class="row">
                <div class="col-12 text-center">
                    <p class="footer-text small">© 2026 Instituto Politécnico Nacional - ESCOM. Todos los derechos reservados.</p>
                </div>
            </div>
        </div>
    </footer>

    <script src="./../../frondend/js/bootstrap.bundle.min.js"></script>
</body>
</html>