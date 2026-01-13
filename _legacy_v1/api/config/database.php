<?php
/**
 * Database Configuration
 * MAMP MySQL Connection
 */

// Database credentials for MAMP
define('DB_HOST', '127.0.0.1');
define('DB_PORT', '8889'); // Default MAMP MySQL port, change if different
define('DB_NAME', 'ftronlinedb');
define('DB_USER', 'root');
define('DB_PASS', 'root'); // Default MAMP password

// Create connection
function getDBConnection()
{
    try {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];

        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Database connection failed'
        ]);
        exit;
    }
}
?>