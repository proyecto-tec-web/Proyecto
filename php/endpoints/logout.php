<?php
     session_start();
     session_unset(); 
     session_destroy();     
     header("Location: ../../php/endpoints/login.php");
     exit();
?>