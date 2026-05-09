<?php
session_start();

// Si el usuario ya había iniciado sesión, lo mandamos directo al index
if (isset($_SESSION['id_usuario'])) {
    header("Location: index.php");
    exit();
}

$error = "";

// Si el formulario fue enviado...
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // 1. Aquí te conectarías a tu Base de Datos real
    // $conexion = new mysqli("localhost", "root", "", "tu_base_datos");

    $correo = $_POST['correo'];
    $password = $_POST['password'];

    // --- SIMULACIÓN DE BASE DE DATOS PARA QUE LO PRUEBES ---
    // (Borra esto y usa tu BD real consultando la tabla 'usuario')
    $correo_bd = "admin@ipn.mx";
    $password_bd = "12345"; 
    // -------------------------------------------------------

    if ($correo === $correo_bd && $password === $password_bd) {
        // 2. Si es correcto, creamos las variables de sesión
        $_SESSION['id_usuario'] = 100; // El ID de tu tabla usuario
        $_SESSION['rol'] = 'Administrador';
        $_SESSION['correo'] = $correo;

        // 3. ¡LA REDIRECCIÓN! Lo mandamos a tu dashboard
        header("Location: ./../../frondend/html/index.php");
        exit();
    } else {
        $error = "Correo o contraseña incorrectos.";
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Sistema ETS</title>
    <link href="./../../frondend/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { background-color: #f4f6f9; height: 100vh; display: flex; align-items: center; justify-content: center; }
        .login-card { width: 100%; max-width: 400px; border-radius: 1rem; box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.1); }
    </style>
</head>
<body>

    <div class="card border-0 login-card p-4">
        <div class="text-center mb-4">
            <h2 class="fw-bold text-primary">Control ETS</h2>
            <p class="text-muted">Ingresa tus credenciales</p>
        </div>

        <!-- Muestra error si se equivocan -->
        <?php if($error != ""): ?>
            <div class="alert alert-danger p-2 text-center"><?php echo $error; ?></div>
        <?php endif; ?>

        <!-- Formulario -->
        <form method="POST" action="login.php">
            <div class="mb-3">
                <label class="form-label fw-bold">Correo Institucional</label>
                <input type="email" name="correo" class="form-control" required placeholder="ejemplo@ipn.mx">
            </div>
            <div class="mb-4">
                <label class="form-label fw-bold">Contraseña</label>
                <input type="password" name="password" class="form-control" required placeholder="******">
            </div>
            <button type="submit" class="btn btn-primary w-100 fw-bold">Iniciar Sesión</button>
        </form>
    </div>

</body>
</html>