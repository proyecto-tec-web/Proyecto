<?php
   session_start();
   session_unset();    // Limpia las variables de sesión
   session_destroy();  // Destruye la sesión por completo
   
   // Lo regresa al login
   header("Location: ../../php/endpoints/login.php");
        exit();
   ?>