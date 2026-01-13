<?php
/**
 * Password Hasher Utility
 * Run this script to generate the password hash for the initial admin user
 * 
 * Usage: php hash_password.php
 */

$password = 'ordKSTWbhb0rKdF1Hrz#*lXr';
$hash = password_hash($password, PASSWORD_DEFAULT);

echo "Password: " . $password . "\n";
echo "Hash: " . $hash . "\n\n";
echo "Copy the hash above and update it in database/seed.sql\n";
?>
