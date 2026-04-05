<?php

class Conexion {
    public function obtenerConexion() {
        $env = parse_ini_file(__DIR__ . '/../../.env');

        try {
            $conexion = new PDO("mysql:host=" . $env['DB_HOST'] . ";dbname=" . $env['DB_NAME'], $env['DB_USER'], $env['DB_PASSWORD']);
            
            return $conexion;

        } catch(PDOException $e) {
            echo "Ups, problemas técnicos. Intente más tarde.";
            exit;
        }
    }
}
?>