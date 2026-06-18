SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE carrera (
    id_carrera INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    acronimo VARCHAR(10) NOT NULL
);

CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'Activo'
);

CREATE TABLE salon (
    id_salon INT AUTO_INCREMENT PRIMARY KEY,
    edificio VARCHAR(50) NOT NULL,
    piso VARCHAR(20) NOT NULL,
    numero VARCHAR(20) NOT NULL
);

CREATE TABLE area (
    id_area INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE materia (
    id_materia INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    semestre INT NOT NULL,
    id_carrera INT NOT NULL,
    id_area INT NOT NULL,
    FOREIGN KEY (id_carrera) REFERENCES carrera(id_carrera),
    FOREIGN KEY (id_area) REFERENCES area(id_area)
);

CREATE TABLE alumno (
    id_alumno INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    boleta VARCHAR(10) NOT NULL UNIQUE,
    situacion_academica VARCHAR(30) NOT NULL,
    id_carrera INT NOT NULL,
    id_usuario INT NOT NULL,
    FOREIGN KEY (id_carrera) REFERENCES carrera(id_carrera),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE profesor (
    id_profesor INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    boleta VARCHAR(10) NOT NULL UNIQUE,
    id_usuario INT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE kardex (
    id_kardex INT AUTO_INCREMENT PRIMARY KEY,
    id_alumno INT NOT NULL,
    id_materia INT NOT NULL,
    calificacion DECIMAL(4,2) NOT NULL,
    FOREIGN KEY (id_alumno) REFERENCES alumno(id_alumno),
    FOREIGN KEY (id_materia) REFERENCES materia(id_materia)
);

CREATE TABLE examen (
    id_examen INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    estado VARCHAR(20) NOT NULL,
    periodo_escolar VARCHAR(10) NOT NULL,
    tipo_examen VARCHAR(20) NOT NULL,
    cupo INT NOT NULL,
    id_materia INT NOT NULL,
    id_profesor INT NOT NULL,
    id_salon INT NOT NULL,
    FOREIGN KEY (id_materia) REFERENCES materia(id_materia),
    FOREIGN KEY (id_profesor) REFERENCES profesor(id_profesor),
    FOREIGN KEY (id_salon) REFERENCES salon(id_salon)
);

CREATE TABLE inscripcion_examen (
    id_inscripcion INT AUTO_INCREMENT PRIMARY KEY,
    estado_pago VARCHAR(20) NOT NULL,
    calificacion DECIMAL(4,2),
    id_alumno INT NOT NULL,
    id_examen INT NOT NULL,
    FOREIGN KEY (id_alumno) REFERENCES alumno(id_alumno),
    FOREIGN KEY (id_examen) REFERENCES examen(id_examen)
);

CREATE TABLE peticion_revision (
    id_peticion INT AUTO_INCREMENT PRIMARY KEY,
    id_inscripcion INT NOT NULL, 
    motivo_alumno TEXT NOT NULL, 
    fecha_solicitud DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
    FOREIGN KEY (id_inscripcion) REFERENCES inscripcion_examen(id_inscripcion)
);

INSERT INTO usuario (id_usuario, correo, contrasena_hash, rol, estado) VALUES
(1, 'admin@ipn.mx', 'admin123', 'admin', 'Activo'),
(2, 'jrodriguez@ipn.mx', 'profesor123', 'profesor', 'Activo'),
(3, 'mgomez@ipn.mx', 'profesor123', 'profesor', 'Activo'),
(4, 'cruiz@ipn.mx', 'profesor123', 'profesor', 'Inactivo'),
(5, 'lfernandez@ipn.mx', 'profesor123', 'profesor', 'Activo'),
(6, 'rmartinez@ipn.mx', 'profesor123', 'profesor', 'Activo'),
(7, 'alumno1@alumno.ipn.mx', 'IPN2026', 'alumno', 'Activo'),
(8, 'alumno2@alumno.ipn.mx', 'IPN2026', 'alumno', 'Activo'),
(9, 'alumno3@alumno.ipn.mx', 'IPN2026', 'alumno', 'Activo'),
(10, 'alumno4@alumno.ipn.mx', 'IPN2026', 'alumno', 'Activo'),
(11, 'alumno5@alumno.ipn.mx', 'IPN2026', 'alumno', 'Activo'),
(12, 'alumno6@alumno.ipn.mx', 'IPN2026', 'alumno', 'Inactivo'),
(13, 'alumno7@alumno.ipn.mx', 'IPN2026', 'alumno', 'Activo'),
(14, 'alumno8@alumno.ipn.mx', 'IPN2026', 'alumno', 'Activo'),
(15, 'alumno9@alumno.ipn.mx', 'IPN2026', 'alumno', 'Activo'),
(16, 'alumno10@alumno.ipn.mx', 'IPN2026', 'alumno', 'Activo'),
(17, 'alumno11@alumno.ipn.mx', 'IPN2026', 'alumno', 'Activo'),
(18, 'alumno12@alumno.ipn.mx', 'IPN2026', 'alumno', 'Activo'),
(19, 'alumno13@alumno.ipn.mx', 'IPN2026', 'alumno', 'Inactivo'),
(20, 'alumno14@alumno.ipn.mx', 'IPN2026', 'alumno', 'Activo'),
(21, 'alumno15@alumno.ipn.mx', 'IPN2026', 'alumno', 'Activo'),
(22, 'alumno16@alumno.ipn.mx', 'IPN2026', 'alumno', 'Activo'),
(23, 'alumno17@alumno.ipn.mx', 'IPN2026', 'alumno', 'Activo'),
(24, 'alumno18@alumno.ipn.mx', 'IPN2026', 'alumno', 'Activo'),
(25, 'alumno19@alumno.ipn.mx', 'IPN2026', 'alumno', 'Activo'),
(26, 'alumno20@alumno.ipn.mx', 'IPN2026', 'alumno', 'Activo');

INSERT INTO carrera (id_carrera, nombre, acronimo) VALUES
(1, 'Ingeniería en Sistemas Computacionales', 'ISC'),
(2, 'Ingeniería en Inteligencia Artificial', 'IIA'),
(3, 'Licenciatura en Ciencia de Datos', 'LCD');

INSERT INTO area (id_area, nombre) VALUES
(1, 'Ciencias Básicas'),
(2, 'Programación y Algoritmia'),
(3, 'Sistemas y Redes');

INSERT INTO materia (id_materia, nombre, semestre, id_carrera, id_area) VALUES
(1, 'Cálculo Diferencial e Integral', 1, 1, 1),
(2, 'Fundamentos de Programación', 1, 1, 2),
(3, 'Estructuras de Datos', 2, 1, 2),
(4, 'Bases de Datos', 3, 1, 3),
(5, 'Redes de Computadoras', 4, 1, 3),
(6, 'Desarrollo de Tecnologías Web', 5, 1, 2),
(7, 'Sistemas Operativos', 4, 1, 3),
(8, 'Ingeniería de Software', 6, 1, 2),
(9, 'Inteligencia Artificial', 6, 2, 2),
(10, 'Álgebra Lineal', 2, 3, 1);

INSERT INTO salon (id_salon, edificio, piso, numero) VALUES
(1, 'Edificio 1', 'Planta Baja', '101'), 
(2, 'Edificio 1', 'Planta Baja', '102'), 
(3, 'Edificio 2', 'Primer Piso', '201'), 
(4, 'Edificio 2', 'Primer Piso', '202'), 
(5, 'Edificio 3', 'Segundo Piso', '301'), 
(6, 'Laboratorio Pesado', 'Planta Baja', 'L-Redes'),
(7, 'Laboratorio Pesado', 'Planta Baja', 'L-Sistemas'),
(8, 'Edificio de Gobierno', 'Planta Alta', 'Auditorio');

INSERT INTO profesor (id_profesor, nombre, apellido_materno, apellido_paterno, boleta, id_usuario) VALUES
(1, 'Juan', 'López', 'Rodríguez', 'EMP001', 2),
(2, 'María', 'Sánchez', 'Gómez', 'EMP002', 3),
(3, 'Carlos', 'Díaz', 'Ruiz', 'EMP003', 4),
(4, 'Laura', 'Méndez', 'Fernández', 'EMP004', 5),
(5, 'Roberto', 'Cruz', 'Martínez', 'EMP005', 6);

INSERT INTO alumno (id_alumno, nombre, apellido_materno, apellido_paterno, boleta, situacion_academica, id_carrera, id_usuario) VALUES
(1, 'Luis', 'García', 'Hernández', '2026000001', 'Regular', 1, 7),
(2, 'Ana', 'Rodríguez', 'Martínez', '2026000002', 'Irregular', 1, 8),
(3, 'Pedro', 'López', 'Fernández', '2026000003', 'Regular', 2, 9),
(4, 'Sofía', 'Pérez', 'López', '2026000004', 'Regular', 3, 10),
(5, 'Miguel', 'Ángel', 'Torres', '2026000005', 'Irregular', 1, 11),
(6, 'Laura', 'Méndez', 'García', '2026000006', 'Baja', 2, 12),
(7, 'Diego', 'Soto', 'Ramírez', '2026000007', 'Regular', 1, 13),
(8, 'Valeria', 'Ortiz', 'Cruz', '2026000008', 'Regular', 3, 14),
(9, 'Jorge', 'Reyes', 'Gómez', '2026000009', 'Regular', 1, 15),
(10, 'Daniela', 'Vargas', 'Flores', '2026000010', 'Irregular', 2, 16),
(11, 'Alejandro', 'Castillo', 'Morales', '2026000011', 'Regular', 1, 17),
(12, 'Camila', 'Rojas', 'Ortiz', '2026000012', 'Regular', 3, 18),
(13, 'Andrés', 'Navarro', 'Gutiérrez', '2026000013', 'Baja', 1, 19),
(14, 'Isabella', 'Molina', 'Chávez', '2026000014', 'Regular', 2, 20),
(15, 'Fernando', 'Delgado', 'Ruiz', '2026000015', 'Irregular', 1, 21),
(16, 'Mariana', 'Peña', 'Álvarez', '2026000016', 'Regular', 3, 22),
(17, 'Emilio', 'Ríos', 'Jiménez', '2026000017', 'Regular', 1, 23),
(18, 'Valentina', 'Aguilar', 'Moreno', '2026000018', 'Irregular', 2, 24),
(19, 'Sebastián', 'Herrera', 'Muñoz', '2026000019', 'Regular', 1, 25),
(20, 'Lucía', 'Salazar', 'Rojas', '2026000020', 'Regular', 3, 26);

INSERT INTO examen (id_examen, fecha, hora_inicio, hora_fin, estado, periodo_escolar, tipo_examen, cupo, id_materia, id_profesor, id_salon) VALUES
(1, '2026-07-20', '08:00:00', '10:00:00', 'Programado', '2026-2', 'ETS', 30, 8, 1, 1),
(2, '2026-07-21', '10:00:00', '12:00:00', 'Programado', '2026-2', 'ETS', 40, 9, 4, 3),
(3, '2026-07-22', '12:00:00', '14:00:00', 'Programado', '2026-2', 'ETS', 100, 10, 5, 8),
(4, '2026-07-10', '10:00:00', '12:00:00', 'Abierto', '2026-2', 'ETS', 40, 2, 2, 2),
(5, '2026-07-11', '14:00:00', '16:00:00', 'Abierto', '2026-2', 'ETS', 30, 7, 5, 6),
(6, '2026-07-12', '16:00:00', '18:00:00', 'Abierto', '2026-2', 'ETS', 80, 1, 1, 8),
(7, '2026-07-05', '12:00:00', '14:00:00', 'Cerrado', '2026-2', 'ETS', 20, 3, 1, 3),
(8, '2026-07-06', '08:00:00', '10:00:00', 'Cerrado', '2026-2', 'ETS', 25, 6, 2, 5),
(9, '2026-07-07', '10:00:00', '12:00:00', 'Cerrado', '2026-2', 'ETS', 35, 5, 4, 4),
(10, '2026-01-15', '14:00:00', '16:00:00', 'Calificado', '2026-1', 'Ordinario', 25, 4, 2, 4), 
(11, '2026-01-16', '08:00:00', '10:00:00', 'Calificado', '2026-1', 'Ordinario', 30, 1, 3, 1),
(12, '2026-01-17', '10:00:00', '12:00:00', 'Calificado', '2026-1', 'Ordinario', 20, 5, 1, 2),
(13, '2026-01-18', '12:00:00', '14:00:00', 'Calificado', '2026-1', 'Ordinario', 40, 6, 4, 6),
(14, '2026-01-19', '14:00:00', '16:00:00', 'Calificado', '2026-1', 'Ordinario', 20, 7, 5, 7),
(15, '2026-01-20', '16:00:00', '18:00:00', 'Calificado', '2026-1', 'Ordinario', 30, 8, 1, 3);

INSERT INTO inscripcion_examen (id_inscripcion, estado_pago, calificacion, id_alumno, id_examen) VALUES
(1, 'Pagado', NULL, 1, 4),
(2, 'Pagado', NULL, 2, 4),
(3, 'Pendiente', NULL, 3, 4),
(4, 'Pendiente', NULL, 4, 4),
(5, 'Pendiente', NULL, 5, 4),
(6, 'Pagado', NULL, 6, 5),
(7, 'Pendiente', NULL, 7, 5),
(8, 'Pagado', NULL, 8, 5),
(9, 'Pagado', NULL, 9, 6),
(10, 'Pagado', NULL, 10, 6),
(11, 'Pendiente', NULL, 11, 6),
(12, 'Pendiente', NULL, 12, 6),
(13, 'Pagado', NULL, 1, 7), 
(14, 'Pagado', NULL, 3, 7),
(15, 'Pagado', NULL, 5, 7),
(16, 'Pagado', NULL, 7, 7),
(17, 'Pagado', NULL, 9, 7),
(18, 'Pagado', NULL, 11, 7),
(19, 'Pagado', NULL, 2, 8),
(20, 'Pagado', NULL, 4, 8),
(21, 'Pagado', NULL, 6, 8),
(22, 'Pagado', NULL, 8, 8),
(23, 'Pagado', NULL, 10, 8),
(24, 'Pagado', NULL, 14, 9),
(25, 'Pagado', NULL, 15, 9),
(26, 'Pagado', NULL, 16, 9),
(27, 'Pagado', NULL, 17, 9),
(28, 'Pagado', NULL, 18, 9),
(29, 'Pagado', 9.5, 1, 10),
(30, 'Pagado', 4.0, 2, 10),
(31, 'Pagado', 8.0, 3, 10),
(32, 'Pagado', 10.0, 4, 10),
(33, 'Pagado', 5.5, 5, 10),
(34, 'Pagado', 7.0, 6, 11),
(35, 'Pagado', 8.5, 7, 11),
(36, 'Pagado', 10.0, 8, 11),
(37, 'Pagado', 5.0, 9, 11),
(38, 'Pagado', 6.0, 10, 11),
(39, 'Pagado', 4.5, 11, 12),
(40, 'Pagado', 6.5, 12, 12),
(41, 'Pagado', 9.0, 13, 12),
(42, 'Pagado', 10.0, 14, 12),
(43, 'Pagado', 7.5, 15, 12),
(44, 'Pagado', 8.0, 16, 13),
(45, 'Pagado', 5.0, 17, 13),
(46, 'Pagado', 9.5, 18, 13),
(47, 'Pagado', 10.0, 19, 13),
(48, 'Pagado', 6.0, 20, 13),
(49, 'Pagado', 6.0, 1, 14),
(50, 'Pagado', 9.0, 3, 14),
(51, 'Pagado', 10.0, 5, 14),
(52, 'Pagado', 4.0, 7, 14),
(53, 'Pagado', 8.5, 9, 14),
(54, 'Pagado', 7.5, 2, 15),
(55, 'Pagado', 10.0, 4, 15),
(56, 'Pagado', 5.0, 6, 15),
(57, 'Pagado', 9.0, 8, 15),
(58, 'Pagado', 8.0, 10, 15),
(59, 'Pagado', 9.5, 12, 15),
(60, 'Pagado', 10.0, 14, 15),
(61, 'Pagado', 8.0, 16, 15);

INSERT INTO kardex (id_alumno, id_materia, calificacion) VALUES
(1, 4, 9.5), (2, 4, 4.0), (3, 4, 8.0), (4, 4, 10.0), (5, 4, 5.5),
(6, 1, 7.0), (7, 1, 8.5), (8, 1, 10.0), (9, 1, 5.0), (10, 1, 6.0),
(11, 5, 4.5), (12, 5, 6.5), (13, 5, 9.0), (14, 5, 10.0), (15, 5, 7.5),
(16, 6, 8.0), (17, 6, 5.0), (18, 6, 9.5), (19, 6, 10.0), (20, 6, 6.0),
(1, 7, 6.0), (3, 7, 9.0), (5, 7, 10.0), (7, 7, 4.0), (9, 7, 8.5),
(2, 8, 7.5), (4, 8, 10.0), (6, 8, 5.0), (8, 8, 9.0), (10, 8, 8.0), 
(12, 8, 9.5), (14, 8, 10.0), (16, 8, 8.0);

ALTER TABLE peticion_revision 
ADD COLUMN notas_profesor TEXT DEFAULT NULL,
ADD COLUMN fecha_revision DATETIME DEFAULT NULL,
ADD COLUMN fecha_revision_agendada DATETIME DEFAULT NULL,
ADD COLUMN lugar_revision VARCHAR(100) DEFAULT NULL;

-- =========================================================================
-- 1. CREAR CUENTAS DE USUARIO PARA LOS NUEVOS ALUMNOS IRREGULARES
-- =========================================================================
INSERT INTO usuario (id_usuario, correo, contrasena_hash, rol, estado) VALUES
(27, 'alumno21@alumno.ipn.mx', 'IPN2026', 'alumno', 'Activo'),
(28, 'alumno22@alumno.ipn.mx', 'IPN2026', 'alumno', 'Activo'),
(29, 'alumno23@alumno.ipn.mx', 'IPN2026', 'alumno', 'Activo');

-- =========================================================================
-- 2. REGISTRAR A LOS ALUMNOS CON ESTADO 'Irregular'
-- =========================================================================
INSERT INTO alumno (id_alumno, nombre, apellido_materno, apellido_paterno, boleta, situacion_academica, id_carrera, id_usuario) VALUES
(21, 'Héctor', 'Salinas', 'Juárez', '2026000021', 'Irregular', 1, 27),
(22, 'Carmen', 'Vega', 'Romero', '2026000022', 'Irregular', 2, 28),
(23, 'Arturo', 'Luna', 'Paredes', '2026000023', 'Irregular', 3, 29);

-- =========================================================================
-- 3. INSERTAR SUS CALIFICACIONES REPROBADAS EN EL KARDEX (> 3 reprobadas)
-- =========================================================================

-- Kardex del Alumno 21 (Héctor): Tiene 4 reprobadas
INSERT INTO kardex (id_alumno, id_materia, calificacion) VALUES
(21, 1, 4.5), -- Cálculo Diferencial
(21, 2, 5.0), -- Fundamentos de Programación
(21, 3, 3.0), -- Estructuras de Datos
(21, 4, 5.5); -- Bases de Datos

-- Kardex del Alumno 22 (Carmen): Tiene 5 reprobadas
INSERT INTO kardex (id_alumno, id_materia, calificacion) VALUES
(22, 1, 2.0), -- Cálculo Diferencial
(22, 3, 4.0), -- Estructuras de Datos
(22, 5, 5.0), -- Redes de Computadoras
(22, 7, 3.5), -- Sistemas Operativos
(22, 9, 4.5); -- Inteligencia Artificial

-- Kardex del Alumno 23 (Arturo): Tiene 4 reprobadas
INSERT INTO kardex (id_alumno, id_materia, calificacion) VALUES
(23, 2, 5.5), -- Fundamentos de Programación
(23, 4, 5.0), -- Bases de Datos
(23, 6, 4.0), -- Desarrollo de Tecnologías Web
(23, 10, 2.5); -- Álgebra Lineal

SET FOREIGN_KEY_CHECKS = 1;

