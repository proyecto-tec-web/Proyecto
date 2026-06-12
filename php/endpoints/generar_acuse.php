<?php
session_start();
require_once '../config/db.php';
// Asegúrate de tener la ruta correcta a tu carpeta librerias
require_once '../../librerias/dompdf/autoload.inc.php'; 
use Dompdf\Dompdf;

$id_examen = $_GET['id_examen'] ?? null;

if (!$id_examen) die("ID no válido");

// Consultamos datos
$stmt = $conexion->prepare("SELECT e.materia, al.boleta, al.nombre, ie.calificacion 
                            FROM examen e 
                            JOIN inscripcion_examen ie ON e.id_examen = ie.id_examen 
                            JOIN alumno al ON ie.id_alumno = al.id_alumno 
                            WHERE e.id_examen = ?");
$stmt->execute([$id_examen]);
$datos = $stmt->fetchAll(PDO::FETCH_ASSOC);

// HTML del reporte
$html = "
<style>
    body { font-family: sans-serif; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
</style>
<h1>Acuse de Calificaciones - ESCOM</h1>
<p><b>Materia:</b> " . ($datos[0]['materia'] ?? 'N/A') . "</p>
<table>
    <tr><th>Boleta</th><th>Nombre</th><th>Calificación</th></tr>";

foreach ($datos as $fila) {
    $cal = ($fila['calificacion'] !== null) ? $fila['calificacion'] : 'NP';
    $html .= "<tr><td>{$fila['boleta']}</td><td>{$fila['nombre']}</td><td>{$cal}</td></tr>";
}
$html .= "</table><p><i>Fecha de emisión: " . date('d/m/Y H:i:s') . "</i></p>";

// Generación
$dompdf = new Dompdf();
$dompdf->loadHtml($html);
$dompdf->setPaper('A4', 'portrait');
$dompdf->render();
$dompdf->stream("Acuse_Examen_$id_examen.pdf");
?>
