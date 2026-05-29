<?php
session_start();  
$host = 'DB_HOST';
$user = 'DB_USER';                 
$pass = 'DB_PASS';
$dbname = 'DB_NAME';  
$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}
$conn->set_charset("utf8");
?>