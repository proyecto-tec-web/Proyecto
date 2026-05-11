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
            $_SESSION['usuario_rol'] = $usuario['rol'];
            
            header("Location: ./../../frondend/html/index.php");
            exit; 
            
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

        <?php if($error != ""): ?>
            <div class="alert alert-danger p-2 text-center"><?php echo $error; ?></div>
        <?php endif; ?>

        <form method="POST" action="">
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