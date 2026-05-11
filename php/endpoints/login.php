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
    
    <style>
        :root {
            --escom-blue: #0055A5;
            --escom-dark: #003366;
            --font-titulos: 'Montserrat', sans-serif;
            --font-textos: 'Poppins', sans-serif;
        }

        body { 
            background-image: url('./../../frondend/img/escomExplanada.jpeg');
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
            margin: 0;
            font-family: var(--font-textos); 
        }

        .bg-overlay {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: linear-gradient(to right, rgba(0, 31, 63, 0.85), rgba(0, 0, 0, 0.6));
            z-index: -1;
        }

        .navbar-escom {
            background: none; 
            padding: 1rem 0;
            z-index: 10;
        }

        .navbar-brand {
            color: white !important; 
            letter-spacing: 0.5px;
            display: inline-flex;
            align-items: center;
            font-family: var(--font-titulos); 
        }

        .navbar-brand .brand-icon {
            height: 1.75rem;
            width: auto;
            margin-right: 0.5rem;
        }

        
        .login-card .form-label {
            font-size: 0.85rem;
            letter-spacing: 1px; 
        }
        
        .login-card .form-control,
        .login-card .form-control::placeholder {
            font-size: 0.95rem;
            font-family: var(--font-textos);
        }

        .navbar-dark .navbar-nav .nav-link {
            color: #f8f9fa;
            font-weight: 500;
        }

        .main-content {
            min-height: 100vh;
            display: flex;
            align-items: center;
            padding: 2rem 10%;
        }

        .hero-section {
            color: white;
            flex: 1;
            padding-right: 50px;
            transform: translateY(-60px); 
        }

        .lema-ipn {
            font-family: var(--font-titulos);
            font-size: 3rem;
            font-weight: 800; 
            text-shadow: 2px 2px 15px rgba(0,0,0,0.9);
            line-height: 1.2;
            margin-bottom: 1rem;
        }

        .sub-lema {
            font-family: var(--font-textos);
            font-size: 1.4rem;
            color: #e0e0e0; 
            font-weight: 300; 
            text-shadow: 1px 1px 5px rgba(0,0,0,0.8);
        }

        .login-section {
            flex: 1;
            display: flex;
            justify-content: flex-end;
        }

        .login-card { 
            width: 100%; 
            max-width: 400px; 
            border-radius: 1.2rem; 
            box-shadow: 0 25px 50px rgba(0,0,0,0.6); 
            background: rgba(255, 255, 255, 0.95);
            border: none;
            backdrop-filter: blur(10px);
        }
        
        .login-card h2 {
            font-family: var(--font-titulos);
            font-weight: 700;
        }

        .btn-escom {
            background-color: var(--escom-blue);
            color: white;
            border: none;
            padding: 0.8rem;
            border-radius: 0.5rem;
            transition: all 0.3s ease;
            font-family: var(--font-titulos);
            letter-spacing: 0.5px;
        }

        .btn-escom:hover {
            background-color: var(--escom-dark);
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 85, 165, 0.4);
        }

        .footer-escom {
            background-color: #ffffff; 
            padding: 1.5rem 0;
            box-shadow: 0 -4px 15px rgba(0,0,0,0.1); 
            z-index: 10;
        }

        .footer-text {
            color: var(--escom-dark); 
            font-size: 0.95rem;
            font-weight: 500;
            margin: 0;
            font-family: var(--font-textos);
        }

        @media (max-width: 992px) {
            .main-content {
                flex-direction: column;
                padding: 4rem 2rem;
                text-align: center;
            }
            .hero-section {
                padding-right: 0;
                margin-bottom: 40px;
                transform: translateY(0); 
            }
            .login-section {
                justify-content: center;
            }
            .lema-ipn { font-size: 2.2rem; }
        }
    </style>
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
        <div class="container text-center">
            <p class="footer-text">© 2026 IPN - ESCOM | Gestión de Exámenes a Título de Suficiencia</p>
        </div>
    </footer>

    <script src="./../../frondend/js/bootstrap.bundle.min.js"></script>
</body>
</html>