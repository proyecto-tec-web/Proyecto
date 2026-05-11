
CREATE TABLE carrera (
    id_carrera INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    acronimo VARCHAR(10) NOT NULL
);

CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL
);

CREATE TABLE salon(
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
CREATE TABLE alumno(
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

CREATE TABLE profesor(
    id_profesor INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    boleta VARCHAR(10) NOT NULL UNIQUE,
    id_usuario INT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE kardex(
    id_kardex INT AUTO_INCREMENT PRIMARY KEY,
    id_alumno INT NOT NULL,
    id_materia INT NOT NULL,
    calificacion DECIMAL(4,2) NOT NULL,
    FOREIGN KEY (id_alumno) REFERENCES alumno(id_alumno),
    FOREIGN KEY (id_materia) REFERENCES materia(id_materia)
);

CREATE TABLE examen(
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

CREATE TABLE inscripcion_examen(
    id_inscripcion INT AUTO_INCREMENT PRIMARY KEY,
    estado_pago VARCHAR(20) NOT NULL,
    calificacion DECIMAL(4,2),
    id_alumno INT NOT NULL,
    id_examen INT NOT NULL,
    FOREIGN KEY (id_alumno) REFERENCES alumno(id_alumno),
    FOREIGN KEY (id_examen) REFERENCES examen(id_examen)
);

-- -----------------------------------------------------
-- INSERCIÓN DE DATOS DE PRUEBA
-- -----------------------------------------------------

-- 1. Usuarios
INSERT INTO usuario (correo, contrasena_hash, rol) VALUES 
('admin@ipn.mx', 'admin123', 'admin'),
('profesor@ipn.mx', 'profe123', 'profesor'),
('crisg@alumno.ipn.mx', 'cris123', 'alumno');

-- 2. Carreras
INSERT INTO carrera (nombre, acronimo) VALUES 
('Ingeniería en Sistemas Computacionales', 'ISC'),
('Ingeniería en Inteligencia Artificial', 'IIA');

-- 3. Áreas (Nueva tabla)
INSERT INTO area (nombre) VALUES 
('Ciencias Básicas'), 
('Sistemas y Programación'), 
('Comunicaciones y Redes');

-- 4. Salones
INSERT INTO salon (edificio, piso, numero) VALUES 
('Edificio 1', 'Planta Baja', '1101'),
('Edificio de Pesados', 'Piso 2', 'Lab-Redes');

-- 5. Materias (Ahora incluyen el id_area)
INSERT INTO materia (nombre, semestre, id_carrera, id_area) VALUES 
('Cálculo Aplicado', 2, 1, 1),      -- Área 1: Ciencias Básicas
('Sistemas Operativos', 5, 1, 2),    -- Área 2: Sistemas y Programación
('Redes de Computadoras', 6, 1, 3);  -- Área 3: Comunicaciones y Redes

-- 6. Profesor
INSERT INTO profesor (nombre, apellido_materno, apellido_paterno, boleta, id_usuario) VALUES 
('Isaac', 'Newton', 'Pérez', 'P000001', 2);

-- 7. Alumno
INSERT INTO alumno (nombre, apellido_materno, apellido_paterno, boleta, situacion_academica, id_carrera, id_usuario) VALUES 
('Cris', 'G', 'M', '2026123456', 'Regular', 1, 3);

-- 8. Kardex
INSERT INTO kardex (id_alumno, id_materia, calificacion) VALUES 
(1, 3, 5.00);

-- 9. Examen
INSERT INTO examen (fecha, hora_inicio, hora_fin, estado, periodo_escolar, tipo_examen, cupo, id_materia, id_profesor, id_salon) VALUES 
('2026-06-15', '10:00:00', '12:00:00', 'Abierto', '2026-2', 'Ordinario', 30, 3, 1, 2);