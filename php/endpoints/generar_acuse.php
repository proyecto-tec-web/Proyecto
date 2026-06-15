<?php
session_start();
date_default_timezone_set('America/Mexico_City');

require_once '../config/db.php';
require_once '../../librerias/dompdf/autoload.inc.php';
use Dompdf\Dompdf;
use Dompdf\Options;

$id_examen = $_GET['id_examen'] ?? null;

if (!$id_examen) die("ID no válido");

// Consulta de datos
$stmt = $conexion->prepare("SELECT m.nombre AS materia, al.boleta, al.nombre, ie.calificacion 
                            FROM examen e 
                            JOIN materia m ON e.id_materia = m.id_materia
                            JOIN inscripcion_examen ie ON e.id_examen = ie.id_examen 
                            JOIN alumno al ON ie.id_alumno = al.id_alumno 
                            WHERE e.id_examen = ?");
$stmt->execute([$id_examen]);
$datos = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($datos)) {
    die("No se encontraron registros para este examen o el examen no existe.");
}


// =========================================================================
// [AQUÍ VA EL CAMBIO] - CONVERSIÓN DE IMÁGENES A BASE64
// =========================================================================

$real_path_ipn = __DIR__ . '/../../frondend/img/ipn.jpg'; 
$real_path_escom = __DIR__ . '/../../frondend/img/escom.jpg';

// Procesamos la imagen del IPN
if (file_exists($real_path_ipn)) {
    $data_ipn = file_get_contents($real_path_ipn);
    $type_ipn = pathinfo($real_path_ipn, PATHINFO_EXTENSION);
    $logo_ipn_base64 = 'data:image/' . $type_ipn . ';base64,' . base64_encode($data_ipn);
} else {
    $logo_ipn_base64 = ''; // Vacío si no se encuentra
}

// Procesamos la imagen de ESCOM
if (file_exists($real_path_escom)) {
    $data_escom = file_get_contents($real_path_escom);
    $type_escom = pathinfo($real_path_escom, PATHINFO_EXTENSION);
    $logo_escom_base64 = 'data:image/' . $type_escom . ';base64,' . base64_encode($data_escom);
} else {
    $logo_escom_base64 = ''; // Vacío si no se encuentra
}

// =========================================================================


// HTML del reporte
$html = "
<style>
    body { font-family: sans-serif; font-size: 14px; }
    
    /* Estilos para la cabecera con los logos */
    .cabecera { width: 100%; margin-bottom: 30px; border-collapse: collapse; }
    .cabecera td { border: none; padding: 0; vertical-align: middle; }
    .logo { width: 70px; } /* Ajusta el tamaño de tus escudos aquí */
    .titulo { text-align: center; }
    .titulo h2 { margin: 0; font-size: 18px; color: #800020; /* Color guinda institucional */ }
    .titulo h3 { margin: 5px 0; font-size: 16px; color: #0d6efd; /* Color azul ESCOM */ }
    .titulo h4 { margin: 0; font-size: 14px; font-weight: normal; }
    
    /* Estilos de la tabla de calificaciones */
    .tabla-datos { width: 100%; border-collapse: collapse; margin-top: 20px; }
    .tabla-datos th, .tabla-datos td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    .tabla-datos th { background-color: #f2f2f2; }
</style>

<table class='cabecera'>
    <tr>
        <td style='width: 20%; text-align: left;'>
            <img src='{$logo_ipn_base64}' width='80' alt='IPN'>
        </td>
        <td style='width: 60%;' class='titulo'>
            <h2>Instituto Politécnico Nacional</h2>
            <h3>Escuela Superior de Cómputo</h3>
            <h4>Acuse de Calificaciones</h4>
        </td>
        <td style='width: 20%; text-align: right;'>
            <img src='{$logo_escom_base64}' width='135' alt='ESCOM'>
        </td>
    </tr>
</table>

<p><b>Materia:</b> " . htmlspecialchars($datos[0]['materia']) . "</p>

<table class='tabla-datos'>
    <tr><th>Boleta</th><th>Nombre</th><th>Calificación</th></tr>";

foreach ($datos as $fila) {
    $cal = ($fila['calificacion'] !== null) ? $fila['calificacion'] : 'NP';
    $html .= "<tr>
                <td>" . htmlspecialchars($fila['boleta']) . "</td>
                <td>" . htmlspecialchars($fila['nombre']) . "</td>
                <td>" . htmlspecialchars($cal) . "</td>
              </tr>";
}
$html .= "</table><p style='text-align: right; margin-top: 30px;'><i>Fecha de emisión: " . date('d/m/Y H:i:s') . "</i></p>";

// 3. Configuración extra de Dompdf para que permita leer imágenes
$options = new Options();
$options->set('isRemoteEnabled', true); 
$dompdf = new Dompdf($options);

$dompdf->loadHtml($html);
$dompdf->setPaper('A4', 'portrait');
$dompdf->render();

// 4. Abre el PDF directamente en una pestaña nueva del navegador
$dompdf->stream("Acuse_Examen_$id_examen.pdf", ["Attachment" => false]);
?>