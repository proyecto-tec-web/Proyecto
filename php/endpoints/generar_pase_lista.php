<?php
session_start();
require_once '../config/db.php';

if (!isset($conexion) || !($conexion instanceof PDO)) {
    echo json_encode(["status" => "error", "message" => "No hay conexión a la base de datos."]);
    exit;
}

if (!isset($_SESSION['id_usuario']) || !isset($_GET['id_examen'])) {
    die("Acceso denegado o faltan parámetros.");
}

$id_examen = (int)$_GET['id_examen'];

try {
    $stmtExamen = $conexion->prepare("
        SELECT e.id_examen, m.nombre as materia, e.fecha, e.hora_inicio, 
               CONCAT(s.edificio, ' - ', s.piso, ' (', s.numero, ')') as salon, 
               CONCAT(p.nombre, ' ', p.apellido_paterno) as profesor
        FROM examen e
        INNER JOIN materia m ON e.id_materia = m.id_materia
        INNER JOIN profesor p ON e.id_profesor = p.id_profesor
        INNER JOIN salon s ON e.id_salon = s.id_salon
        WHERE e.id_examen = ?
    ");
    $stmtExamen->execute([$id_examen]);
    $examen = $stmtExamen->fetch(PDO::FETCH_ASSOC);

    if (!$examen) die("Examen no encontrado.");

    $stmtAlumnos = $conexion->prepare("
        SELECT a.boleta, CONCAT(a.apellido_paterno, ' ', a.apellido_materno, ' ', a.nombre) as nombre_completo
        FROM inscripcion_examen ie
        INNER JOIN alumno a ON ie.id_alumno = a.id_alumno
        WHERE ie.id_examen = ? AND ie.estado_pago = 'Aprobado'
        ORDER BY a.apellido_paterno ASC
    ");
    $stmtAlumnos->execute([$id_examen]);
    $alumnos = $stmtAlumnos->fetchAll(PDO::FETCH_ASSOC);

} catch (PDOException $e) {
    die("Error de Base de Datos: " . $e->getMessage());
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Pase de Lista - <?php echo htmlspecialchars($examen['materia']); ?></title>
    <link rel="icon" href="/frondend/html/tiburon.png">
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; font-size: 14px; color: #000; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; }
        .header h1 { margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 1px; }
        .header h2 { margin: 5px 0 0; font-size: 16px; color: #333; }
        
        .info-box { width: 100%; margin-bottom: 20px; border-collapse: collapse; }
        .info-box td { padding: 6px; font-weight: bold; }
        .info-box span { font-weight: normal; border-bottom: 1px dotted #000; padding-bottom: 2px; }
        
        table.lista { width: 100%; border-collapse: collapse; margin-top: 20px; }
        table.lista th, table.lista td { border: 1px solid #000; padding: 10px; text-align: left; }
        table.lista th { background-color: #f0f0f0; text-align: center; }
        table.lista td.firma { width: 35%; }
        
        .footer { margin-top: 60px; text-align: center; }
        .firma-profesor { width: 300px; border-bottom: 1px solid #000; margin: 0 auto 10px; }
        
            @media print {
            @page { margin: 1cm; }
            .ocultar-al-imprimir { display: none !important; }
            body { padding: 0; }
        }
    </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
</head>
<body>
    <div class="ocultar-al-imprimir" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #e9ecef;">
    
    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
        <button onclick="window.print()" style="background-color: #0d6efd; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            🖨️ Imprimir Hoja
        </button>

        <button onclick="descargarPDFDirecto()" style="background-color: #198754; color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: bold; cursor: pointer; font-size: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            📥 Descargar PDF
        </button>
    </div>

    <button onclick="window.close()" style="background-color: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        ❌ Cerrar y Regresar
    </button>
    </div>

    <div class="header">
        <h1>Instituto Politécnico Nacional</h1>
        <h2>Escuela Superior de Cómputo</h2>
        <p style="margin-top: 15px; font-weight: bold;">PASE DE LISTA OFICIAL - EXAMEN A TÍTULO DE SUFICIENCIA</p>
    </div>

    <table class="info-box">
        <tr>
            <td>Unidad de Aprendizaje: <span><?php echo htmlspecialchars($examen['materia']); ?></span></td>
            <td style="text-align: right;">Folio de Examen: <span>#<?php echo $examen['id_examen']; ?></span></td>
        </tr>
        <tr>
            <td>Fecha: <span><?php echo htmlspecialchars($examen['fecha']); ?></span></td>
            <td style="text-align: right;">Horario: <span><?php echo htmlspecialchars($examen['hora_inicio']); ?></span></td>
        </tr>
        <tr>
            <td>Salón Asignado: <span><?php echo htmlspecialchars($examen['salon']); ?></span></td>
            <td style="text-align: right;">Docente: <span><?php echo htmlspecialchars($examen['profesor']); ?></span></td>
        </tr>
    </table>

    <table class="lista">
        <thead>
            <tr>
                <th style="width: 5%;">No.</th>
                <th style="width: 15%;">Boleta</th>
                <th>Nombre Completo del Alumno</th>
                <th class="firma">Firma de Asistencia</th>
            </tr>
        </thead>
        <tbody>
            <?php if (count($alumnos) > 0): ?>
                <?php $contador = 1; foreach ($alumnos as $alumno): ?>
                    <tr>
                        <td style="text-align: center;"><?php echo $contador++; ?></td>
                        <td style="text-align: center; font-family: monospace; font-size: 15px;"><?php echo htmlspecialchars($alumno['boleta']); ?></td>
                        <td><?php echo htmlspecialchars($alumno['nombre_completo']); ?></td>
                        <td></td>
                    </tr>
                <?php endforeach; ?>
            <?php else: ?>
                <tr>
                    <td colspan="4" style="text-align: center; padding: 30px;">Ningún alumno cumplió con los requisitos de inscripción para este examen.</td>
                </tr>
            <?php endif; ?>
        </tbody>
    </table>

    <div class="footer">
        <div class="firma-profesor"></div>
        <p style="font-weight: bold; margin-top: 5px;">Firma del Docente Evaluador</p>
    </div>

    <script>
        window.onload = function() {
            setTimeout(() => { window.print(); }, 500);
        }

        function descargarPDFDirecto() {
            const botones = document.querySelector('.ocultar-al-imprimir');
            botones.style.display = 'none';

            const elemento = document.body;
            const opciones = {
                margin:       1,
                filename:     'Pase_Lista_<?php echo $id_examen; ?>.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2 },
                jsPDF:        { unit: 'cm', format: 'letter', orientation: 'portrait' }
            };

            html2pdf().set(opciones).from(elemento).save().then(() => {
                botones.style.style = 'flex';
                botones.style.display = 'flex';
            });
        }
    </script>
</body>
</html>
