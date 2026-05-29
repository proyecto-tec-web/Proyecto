SET NAMES utf8mb4;


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


-- -----------------------------------------------------
-- 1. CARRERAS Y ÁREAS
-- -----------------------------------------------------
INSERT INTO carrera (nombre, acronimo) VALUES 
('Ingeniería en Sistemas Computacionales', 'ISC'),
('Ingeniería en Inteligencia Artificial', 'IIA'),
('Licenciatura en Ciencia de Datos', 'LCD'),
('Ingeniería en Mecatrónica', 'IM');

INSERT INTO area (nombre) VALUES 
('Ciencias Básicas'), 
('Sistemas y Programación'), 
('Comunicaciones y Redes'),
('Inteligencia Artificial y Datos'), 
('Hardware y Electrónica');

-- -----------------------------------------------------
-- 2. SALONES
-- -----------------------------------------------------
INSERT INTO salon (edificio, piso, numero) VALUES 
('Edificio 1', 'Planta Baja', '1101'),
('Edificio de Pesados', 'Piso 2', 'Lab-Redes'),
('Edificio 2', 'Primer Piso', '2201'),
('Edificio 2', 'Segundo Piso', '2305'),
('Edificio de Ligeros', 'Planta Baja', 'Auditorio 1');

-- -----------------------------------------------------
-- 3. MATERIAS (Mapa Curricular Plan 2020 y Especialidades)
-- -----------------------------------------------------
INSERT INTO materia (nombre, semestre, id_carrera, id_area) VALUES 
-- Nivel 1 (Semestres 1 y 2)
('Cálculo Diferencial e Integral', 1, 1, 1),
('Algoritmia y Programación Estructurada', 1, 1, 2),
('Física para Informáticos', 1, 1, 1),
('Matemática Discreta', 1, 1, 1),
('Cálculo Aplicado', 2, 1, 1),
('Estructuras de Datos', 2, 1, 2),
('Álgebra Lineal', 2, 1, 1),

-- Nivel 2 (Semestres 3 y 4)
('Ecuaciones Diferenciales', 3, 1, 1),
('Circuitos Lógicos', 3, 1, 5),
('Programación Orientada a Objetos', 3, 1, 2),
('Probabilidad y Estadística', 3, 1, 1),
('Bases de Datos', 4, 1, 2),
('Tecnologías para el Desarrollo de Aplicaciones Web', 4, 1, 2),
('Diseño de Sistemas Digitales', 4, 1, 5),

-- Nivel 3 (Semestres 5 y 6)
('Sistemas Operativos', 5, 1, 2),
('Análisis y Diseño de Sistemas', 5, 1, 2),
('Redes de Computadoras', 5, 1, 3),
('Bases de Datos Avanzadas', 5, 1, 2),
('Arquitectura de Computadoras', 5, 1, 5),
('Ingeniería de Software', 6, 1, 2),

-- Materias de otras carreras (IIA, LCD)
('Machine Learning', 7, 2, 4),
('Procesamiento de Lenguaje Natural', 8, 2, 4),
('Minería de Datos', 6, 3, 4);

-- -----------------------------------------------------
-- 4. USUARIOS (Administradores, Profesores y Alumnos)
-- -----------------------------------------------------
INSERT INTO usuario (correo, contrasena_hash, rol) VALUES 
('admin@ipn.mx', 'admin123', 'admin'),
('profesor@ipn.mx', 'profe123', 'profesor'),
('crisg@alumno.ipn.mx', 'cris123', 'alumno'),
('juan.gonzalez@alumno.ipn.mx', 'juan123', 'alumno'),
('profesor1@ipn.mx', 'pass123', 'profesor'), ('profesor2@ipn.mx', 'pass123', 'profesor'), ('profesor3@ipn.mx', 'pass123', 'profesor'), ('profesor4@ipn.mx', 'pass123', 'profesor'), ('profesor5@ipn.mx', 'pass123', 'profesor'), ('profesor6@ipn.mx', 'pass123', 'profesor'), ('profesor7@ipn.mx', 'pass123', 'profesor'), ('profesor8@ipn.mx', 'pass123', 'profesor'), ('profesor9@ipn.mx', 'pass123', 'profesor'), ('profesor10@ipn.mx', 'pass123', 'profesor'),
('alumno1@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno2@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno3@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno4@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno5@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno6@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno7@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno8@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno9@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno10@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno11@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno12@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno13@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno14@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno15@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno16@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno17@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno18@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno19@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno20@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno21@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno22@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno23@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno24@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno25@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno26@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno27@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno28@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno29@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno30@alumno.ipn.mx', 'pass123', 'alumno');

-- -----------------------------------------------------
-- 5. PROFESORES Y ALUMNOS
-- -----------------------------------------------------
INSERT INTO profesor (nombre, apellido_paterno, apellido_materno, boleta, id_usuario) VALUES 
('Isaac', 'Newton', 'Pérez', 'P000001', 2),
('Alan', 'Turing', 'García', 'P000002', 5),
('Ada', 'Lovelace', 'López', 'P000003', 6),
('Grace', 'Hopper', 'Martínez', 'P000004', 7),
('Dennis', 'Ritchie', 'Sánchez', 'P000005', 8),
('Ken', 'Thompson', 'Ramírez', 'P000006', 9),
('Linus', 'Torvalds', 'Fernández', 'P000007', 10),
('Margaret', 'Hamilton', 'Gómez', 'P000008', 11),
('Tim', 'Berners-Lee', 'Díaz', 'P000009', 12),
('Guido', 'van Rossum', 'Pérez', 'P000010', 13),
('James', 'Gosling', 'Ruiz', 'P000011', 14);

-- Nota: Insertamos solo los primeros 30 alumnos para mantener la integridad de las pruebas cruzadas
INSERT INTO alumno (nombre, apellido_paterno, apellido_materno, boleta, situacion_academica, id_carrera, id_usuario) VALUES 
('Cris', 'G', 'M', '2026123456', 'Regular', 1, 3),
('Juan', 'González', 'Martínez', '2026123457', 'Regular', 1, 4),
('Alumno1', 'Pérez', 'López', '2026100001', 'Regular', 1, 15), ('Alumno2', 'García', 'Martínez', '2026100002', 'Regular', 2, 16), ('Alumno3', 'Sánchez', 'Ramírez', '2026100003', 'Irregular', 1, 17), ('Alumno4', 'Fernández', 'Gómez', '2026100004', 'Regular', 2, 18), ('Alumno5', 'Díaz', 'Pérez', '2026100005', 'Regular', 1, 19), ('Alumno6', 'Ruiz', 'Alonso', '2026100006', 'Regular', 2, 20), ('Alumno7', 'Álvarez', 'Jiménez', '2026100007', 'Irregular', 1, 21), ('Alumno8', 'Moreno', 'Iglesias', '2026100008', 'Regular', 2, 22), ('Alumno9', 'Romero', 'Navarro', '2026100009', 'Regular', 1, 23), ('Alumno10', 'Torres', 'Domínguez', '2026100010', 'Regular', 2, 24), ('Alumno11', 'Vázquez', 'Ramos', '2026100011', 'Regular', 1, 25), ('Alumno12', 'Gil', 'Blanco', '2026100012', 'Irregular', 2, 26), ('Alumno13', 'Serrano', 'Molina', '2026100013', 'Regular', 1, 27), ('Alumno14', 'Suárez', 'Ortega', '2026100014', 'Regular', 2, 28), ('Alumno15', 'Castro', 'Ortiz', '2026100015', 'Regular', 1, 29), ('Alumno16', 'Rubio', 'Marín', '2026100016', 'Irregular', 2, 30), ('Alumno17', 'Sanz', 'Iglesias', '2026100017', 'Regular', 1, 31), ('Alumno18', 'Núñez', 'Medina', '2026100018', 'Regular', 2, 32), ('Alumno19', 'Cortes', 'Garrido', '2026100019', 'Regular', 1, 33), ('Alumno20', 'Castillo', 'Santos', '2026100020', 'Irregular', 2, 34), ('Alumno21', 'Pérez', 'López', '2026100021', 'Regular', 1, 35), ('Alumno22', 'García', 'Martínez', '2026100022', 'Regular', 2, 36), ('Alumno23', 'Sánchez', 'Ramírez', '2026100023', 'Irregular', 1, 37), ('Alumno24', 'Fernández', 'Gómez', '2026100024', 'Regular', 2, 38), ('Alumno25', 'Díaz', 'Pérez', '2026100025', 'Regular', 1, 39), ('Alumno26', 'Ruiz', 'Alonso', '2026100026', 'Regular', 2, 40), ('Alumno27', 'Álvarez', 'Jiménez', '2026100027', 'Irregular', 1, 41), ('Alumno28', 'Moreno', 'Iglesias', '2026100028', 'Regular', 2, 42), ('Alumno29', 'Romero', 'Navarro', '2026100029', 'Regular', 1, 43), ('Alumno30', 'Torres', 'Domínguez', '2026100030', 'Regular', 2, 44);

-- -----------------------------------------------------
-- 6. KARDEX (Historiales Simulados)
-- -----------------------------------------------------
INSERT INTO kardex (id_alumno, id_materia, calificacion) VALUES 
-- Alumno 1 (Cris): A la mitad de la carrera. Todo aprobado, una que otra baja.
(1, 1, 8.50), (1, 2, 9.00), (1, 3, 7.50), (1, 4, 8.00), -- Semestre 1
(1, 5, 7.00), (1, 6, 9.50), (1, 7, 6.50),               -- Semestre 2
(1, 8, 6.00), (1, 9, 8.00), (1, 10, 10.00), (1, 11, 7.50),-- Semestre 3
(1, 12, 9.00), (1, 13, 8.50),                           -- Semestre 4 (Cursando)

-- Alumno 2 (Juan): Recién entrando a 3er semestre.
(2, 1, 7.00), (2, 2, 8.00), (2, 3, 7.50), (2, 4, 8.00),
(2, 5, 6.50), (2, 6, 7.50), (2, 7, 8.00),

-- Alumno 3 (Alumno1): El de excelencia académica. Todo 10.
(3, 1, 10.00), (3, 2, 10.00), (3, 3, 10.00), (3, 4, 10.00),
(3, 5, 10.00), (3, 6, 10.00), (3, 7, 10.00),

-- Alumno 5 (Alumno3): Prueba de Irregularidad (4 materias reprobadas)
(5, 1, 5.00), (5, 2, 5.00), (5, 3, 8.00), (5, 4, 4.00),
(5, 5, 5.00), (5, 6, 7.00), (5, 7, 6.00),

-- Alumno 9 (Alumno7): Prueba de Irregularidad al límite (3 reprobadas)
(9, 1, 6.00), (9, 2, 5.00), (9, 3, 5.00), (9, 4, 8.00),
(9, 5, 5.00), (9, 6, 8.00), (9, 7, 7.00);

-- -----------------------------------------------------
-- 7. EXÁMENES E INSCRIPCIONES
-- -----------------------------------------------------
INSERT INTO examen (fecha, hora_inicio, hora_fin, estado, periodo_escolar, tipo_examen, cupo, id_materia, id_profesor, id_salon) VALUES 
('2026-06-15', '10:00:00', '12:00:00', 'Abierto', '2026-2', 'Ordinario', 30, 8, 1, 2),  -- Ecuaciones Diferenciales
('2026-07-10', '08:00:00', '10:00:00', 'Abierto', '2026-2', 'Extraordinario', 25, 2, 2, 3), -- Algoritmia
('2026-07-12', '12:00:00', '14:00:00', 'Abierto', '2026-2', 'Ordinario', 40, 15, 3, 4), -- Sistemas Operativos
('2026-07-15', '16:00:00', '18:00:00', 'Cerrado', '2026-2', 'ETS', 50, 1, 4, 5);      -- Cálculo Diferencial

INSERT INTO inscripcion_examen (estado_pago, calificacion, id_alumno, id_examen) VALUES 
('Pagado', NULL, 5, 2),  -- El alumno 5 (irregular) inscrito al extra de Algoritmia
('Pendiente', NULL, 9, 4), -- El alumno 9 inscrito al ETS de Cálculo
('Pagado', NULL, 1, 1),  -- Cris inscrito a Ordinario
('Pagado', NULL, 2, 1);