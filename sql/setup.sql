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

INSERT INTO salon (edificio, piso, numero) VALUES 
('Edificio 1', 'Planta Baja', '1101'),
('Edificio de Pesados', 'Piso 2', 'Lab-Redes'),
('Edificio 2', 'Primer Piso', '2201'),
('Edificio 2', 'Segundo Piso', '2305'),
('Edificio de Ligeros', 'Planta Baja', 'Auditorio 1');

INSERT INTO materia (nombre, semestre, id_carrera, id_area) VALUES 
('Cálculo Aplicado', 2, 1, 1),
('Sistemas Operativos', 5, 1, 2),
('Redes de Computadoras', 6, 1, 3),
('Bases de Datos Avanzadas', 6, 1, 2),       
('Machine Learning', 7, 2, 4),               
('Circuitos Lógicos', 3, 4, 5),              
('Probabilidad y Estadística', 2, 3, 1);     


INSERT INTO usuario (correo, contrasena_hash, rol) VALUES 
('admin@ipn.mx', 'admin123', 'admin'),
('profesor@ipn.mx', 'profe123', 'profesor'),
('crisg@alumno.ipn.mx', 'cris123', 'alumno'),
('juan.gonzalez@alumno.ipn.mx', 'juan123', 'alumno');


INSERT INTO usuario (correo, contrasena_hash, rol) VALUES 
('profesor1@ipn.mx', 'pass123', 'profesor'), ('profesor2@ipn.mx', 'pass123', 'profesor'), ('profesor3@ipn.mx', 'pass123', 'profesor'), ('profesor4@ipn.mx', 'pass123', 'profesor'), ('profesor5@ipn.mx', 'pass123', 'profesor'), ('profesor6@ipn.mx', 'pass123', 'profesor'), ('profesor7@ipn.mx', 'pass123', 'profesor'), ('profesor8@ipn.mx', 'pass123', 'profesor'), ('profesor9@ipn.mx', 'pass123', 'profesor'), ('profesor10@ipn.mx', 'pass123', 'profesor'),
('alumno1@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno2@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno3@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno4@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno5@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno6@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno7@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno8@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno9@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno10@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno11@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno12@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno13@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno14@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno15@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno16@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno17@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno18@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno19@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno20@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno21@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno22@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno23@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno24@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno25@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno26@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno27@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno28@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno29@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno30@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno31@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno32@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno33@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno34@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno35@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno36@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno37@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno38@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno39@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno40@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno41@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno42@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno43@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno44@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno45@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno46@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno47@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno48@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno49@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno50@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno51@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno52@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno53@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno54@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno55@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno56@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno57@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno58@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno59@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno60@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno61@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno62@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno63@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno64@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno65@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno66@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno67@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno68@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno69@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno70@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno71@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno72@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno73@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno74@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno75@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno76@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno77@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno78@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno79@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno80@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno81@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno82@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno83@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno84@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno85@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno86@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno87@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno88@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno89@alumno.ipn.mx', 'pass123', 'alumno'), ('alumno90@alumno.ipn.mx', 'pass123', 'alumno');


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

INSERT INTO alumno (nombre, apellido_paterno, apellido_materno, boleta, situacion_academica, id_carrera, id_usuario) VALUES 
('Cris', 'G', 'M', '2026123456', 'Regular', 1, 3),
('Juan', 'González', 'Martínez', '2026123457', 'Regular', 1, 4),
('Alumno1', 'Pérez', 'López', '2026100001', 'Regular', 1, 15), ('Alumno2', 'García', 'Martínez', '2026100002', 'Regular', 2, 16), ('Alumno3', 'Sánchez', 'Ramírez', '2026100003', 'Irregular', 1, 17), ('Alumno4', 'Fernández', 'Gómez', '2026100004', 'Regular', 2, 18), ('Alumno5', 'Díaz', 'Pérez', '2026100005', 'Regular', 1, 19), ('Alumno6', 'Ruiz', 'Alonso', '2026100006', 'Regular', 2, 20), ('Alumno7', 'Álvarez', 'Jiménez', '2026100007', 'Irregular', 1, 21), ('Alumno8', 'Moreno', 'Iglesias', '2026100008', 'Regular', 2, 22), ('Alumno9', 'Romero', 'Navarro', '2026100009', 'Regular', 1, 23), ('Alumno10', 'Torres', 'Domínguez', '2026100010', 'Regular', 2, 24), ('Alumno11', 'Vázquez', 'Ramos', '2026100011', 'Regular', 1, 25), ('Alumno12', 'Gil', 'Blanco', '2026100012', 'Irregular', 2, 26), ('Alumno13', 'Serrano', 'Molina', '2026100013', 'Regular', 1, 27), ('Alumno14', 'Suárez', 'Ortega', '2026100014', 'Regular', 2, 28), ('Alumno15', 'Castro', 'Ortiz', '2026100015', 'Regular', 1, 29), ('Alumno16', 'Rubio', 'Marín', '2026100016', 'Irregular', 2, 30), ('Alumno17', 'Sanz', 'Iglesias', '2026100017', 'Regular', 1, 31), ('Alumno18', 'Núñez', 'Medina', '2026100018', 'Regular', 2, 32), ('Alumno19', 'Cortes', 'Garrido', '2026100019', 'Regular', 1, 33), ('Alumno20', 'Castillo', 'Santos', '2026100020', 'Irregular', 2, 34), ('Alumno21', 'Pérez', 'López', '2026100021', 'Regular', 1, 35), ('Alumno22', 'García', 'Martínez', '2026100022', 'Regular', 2, 36), ('Alumno23', 'Sánchez', 'Ramírez', '2026100023', 'Irregular', 1, 37), ('Alumno24', 'Fernández', 'Gómez', '2026100024', 'Regular', 2, 38), ('Alumno25', 'Díaz', 'Pérez', '2026100025', 'Regular', 1, 39), ('Alumno26', 'Ruiz', 'Alonso', '2026100026', 'Regular', 2, 40), ('Alumno27', 'Álvarez', 'Jiménez', '2026100027', 'Irregular', 1, 41), ('Alumno28', 'Moreno', 'Iglesias', '2026100028', 'Regular', 2, 42), ('Alumno29', 'Romero', 'Navarro', '2026100029', 'Regular', 1, 43), ('Alumno30', 'Torres', 'Domínguez', '2026100030', 'Regular', 2, 44), ('Alumno31', 'Vázquez', 'Ramos', '2026100031', 'Regular', 1, 45), ('Alumno32', 'Gil', 'Blanco', '2026100032', 'Irregular', 2, 46), ('Alumno33', 'Serrano', 'Molina', '2026100033', 'Regular', 1, 47), ('Alumno34', 'Suárez', 'Ortega', '2026100034', 'Regular', 2, 48), ('Alumno35', 'Castro', 'Ortiz', '2026100035', 'Regular', 1, 49), ('Alumno36', 'Rubio', 'Marín', '2026100036', 'Irregular', 2, 50), ('Alumno37', 'Sanz', 'Iglesias', '2026100037', 'Regular', 1, 51), ('Alumno38', 'Núñez', 'Medina', '2026100038', 'Regular', 2, 52), ('Alumno39', 'Cortes', 'Garrido', '2026100039', 'Regular', 1, 53), ('Alumno40', 'Castillo', 'Santos', '2026100040', 'Irregular', 2, 54), ('Alumno41', 'Pérez', 'López', '2026100041', 'Regular', 1, 55), ('Alumno42', 'García', 'Martínez', '2026100042', 'Regular', 2, 56), ('Alumno43', 'Sánchez', 'Ramírez', '2026100043', 'Irregular', 1, 57), ('Alumno44', 'Fernández', 'Gómez', '2026100044', 'Regular', 2, 58), ('Alumno45', 'Díaz', 'Pérez', '2026100045', 'Regular', 1, 59), ('Alumno46', 'Ruiz', 'Alonso', '2026100046', 'Regular', 2, 60), ('Alumno47', 'Álvarez', 'Jiménez', '2026100047', 'Irregular', 1, 61), ('Alumno48', 'Moreno', 'Iglesias', '2026100048', 'Regular', 2, 62), ('Alumno49', 'Romero', 'Navarro', '2026100049', 'Regular', 1, 63), ('Alumno50', 'Torres', 'Domínguez', '2026100050', 'Regular', 2, 64), ('Alumno51', 'Vázquez', 'Ramos', '2026100051', 'Regular', 1, 65), ('Alumno52', 'Gil', 'Blanco', '2026100052', 'Irregular', 2, 66), ('Alumno53', 'Serrano', 'Molina', '2026100053', 'Regular', 1, 67), ('Alumno54', 'Suárez', 'Ortega', '2026100054', 'Regular', 2, 68), ('Alumno55', 'Castro', 'Ortiz', '2026100055', 'Regular', 1, 69), ('Alumno56', 'Rubio', 'Marín', '2026100056', 'Irregular', 2, 70), ('Alumno57', 'Sanz', 'Iglesias', '2026100057', 'Regular', 1, 71), ('Alumno58', 'Núñez', 'Medina', '2026100058', 'Regular', 2, 72), ('Alumno59', 'Cortes', 'Garrido', '2026100059', 'Regular', 1, 73), ('Alumno60', 'Castillo', 'Santos', '2026100060', 'Irregular', 2, 74), ('Alumno61', 'Pérez', 'López', '2026100061', 'Regular', 1, 75), ('Alumno62', 'García', 'Martínez', '2026100062', 'Regular', 2, 76), ('Alumno63', 'Sánchez', 'Ramírez', '2026100063', 'Irregular', 1, 77), ('Alumno64', 'Fernández', 'Gómez', '2026100064', 'Regular', 2, 78), ('Alumno65', 'Díaz', 'Pérez', '2026100065', 'Regular', 1, 79), ('Alumno66', 'Ruiz', 'Alonso', '2026100066', 'Regular', 2, 80), ('Alumno67', 'Álvarez', 'Jiménez', '2026100067', 'Irregular', 1, 81), ('Alumno68', 'Moreno', 'Iglesias', '2026100068', 'Regular', 2, 82), ('Alumno69', 'Romero', 'Navarro', '2026100069', 'Regular', 1, 83), ('Alumno70', 'Torres', 'Domínguez', '2026100070', 'Regular', 2, 84), ('Alumno71', 'Vázquez', 'Ramos', '2026100071', 'Regular', 1, 85), ('Alumno72', 'Gil', 'Blanco', '2026100072', 'Irregular', 2, 86), ('Alumno73', 'Serrano', 'Molina', '2026100073', 'Regular', 1, 87), ('Alumno74', 'Suárez', 'Ortega', '2026100074', 'Regular', 2, 88), ('Alumno75', 'Castro', 'Ortiz', '2026100075', 'Regular', 1, 89), ('Alumno76', 'Rubio', 'Marín', '2026100076', 'Irregular', 2, 90), ('Alumno77', 'Sanz', 'Iglesias', '2026100077', 'Regular', 1, 91), ('Alumno78', 'Núñez', 'Medina', '2026100078', 'Regular', 2, 92), ('Alumno79', 'Cortes', 'Garrido', '2026100079', 'Regular', 1, 93), ('Alumno80', 'Castillo', 'Santos', '2026100080', 'Irregular', 2, 94), ('Alumno81', 'Pérez', 'López', '2026100081', 'Regular', 1, 95), ('Alumno82', 'García', 'Martínez', '2026100082', 'Regular', 2, 96), ('Alumno83', 'Sánchez', 'Ramírez', '2026100083', 'Irregular', 1, 97), ('Alumno84', 'Fernández', 'Gómez', '2026100084', 'Regular', 2, 98), ('Alumno85', 'Díaz', 'Pérez', '2026100085', 'Regular', 1, 99), ('Alumno86', 'Ruiz', 'Alonso', '2026100086', 'Regular', 2, 100), ('Alumno87', 'Álvarez', 'Jiménez', '2026100087', 'Irregular', 1, 101), ('Alumno88', 'Moreno', 'Iglesias', '2026100088', 'Regular', 2, 102), ('Alumno89', 'Romero', 'Navarro', '2026100089', 'Regular', 1, 103), ('Alumno90', 'Torres', 'Domínguez', '2026100090', 'Regular', 2, 104);

INSERT INTO kardex (id_alumno, id_materia, calificacion) VALUES 
(1, 3, 5.00),
(3, 4, 8.50),
(4, 5, 9.00),
(5, 4, 7.00),
(6, 5, 10.00),
(7, 4, 5.50);

INSERT INTO examen (fecha, hora_inicio, hora_fin, estado, periodo_escolar, tipo_examen, cupo, id_materia, id_profesor, id_salon) VALUES 
('2026-06-15', '10:00:00', '12:00:00', 'Abierto', '2026-2', 'Ordinario', 30, 3, 1, 2),
('2026-07-10', '08:00:00', '10:00:00', 'Abierto', '2026-2', 'Extraordinario', 25, 4, 2, 3),
('2026-07-12', '12:00:00', '14:00:00', 'Abierto', '2026-2', 'Ordinario', 40, 5, 3, 4),
('2026-07-15', '16:00:00', '18:00:00', 'Cerrado', '2026-2', 'ETS', 50, 1, 4, 5);

INSERT INTO inscripcion_examen (estado_pago, calificacion, id_alumno, id_examen) VALUES 
('Pagado', NULL, 3, 2),
('Pendiente', NULL, 7, 2),
('Pagado', NULL, 12, 3),
('Pagado', NULL, 20, 3);