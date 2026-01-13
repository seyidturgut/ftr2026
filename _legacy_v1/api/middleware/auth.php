<?php
/**
 * Authentication Middleware
 * Verifies session token and loads user data
 */

require_once __DIR__ . '/../config/database.php';

function authenticate()
{
    // Try multiple ways to get the authorization header (Apache compatibility)
    $headers = null;
    $token = null;

    // Method 1: getallheaders()
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        if (isset($headers['Authorization'])) {
            $auth = $headers['Authorization'];
            if (preg_match('/Bearer\s+(.*)$/i', $auth, $matches)) {
                $token = $matches[1];
            }
        }
    }

    // Method 2: $_SERVER (fallback for Apache)
    if (!$token && isset($_SERVER['HTTP_AUTHORIZATION'])) {
        if (preg_match('/Bearer\s+(.*)$/i', $_SERVER['HTTP_AUTHORIZATION'], $matches)) {
            $token = $matches[1];
        }
    }

    // Method 3: Apache redirect workaround
    if (!$token && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        if (preg_match('/Bearer\s+(.*)$/i', $_SERVER['REDIRECT_HTTP_AUTHORIZATION'], $matches)) {
            $token = $matches[1];
        }
    }

    // Method 4: Custom header X-Auth-Token (most reliable with Apache)
    if (!$token && isset($_SERVER['HTTP_X_AUTH_TOKEN'])) {
        $token = $_SERVER['HTTP_X_AUTH_TOKEN'];
    }

    // Method 5: Direct from getallheaders (custom header)
    if (!$token && function_exists('getallheaders')) {
        $headers = getallheaders();
        if (isset($headers['X-Auth-Token'])) {
            $token = $headers['X-Auth-Token'];
        }
    }

    if (!$token) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'No token provided'
        ]);
        exit;
    }

    // Verify token
    $db = getDBConnection();
    $stmt = $db->prepare("
        SELECT s.*, u.id as user_id, u.username, u.role, u.first_name, u.last_name, u.title, u.password
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.session_token = ? AND s.expires_at > NOW() AND u.is_active = 1
    ");
    $stmt->execute([$token]);
    $session = $stmt->fetch();

    if (!$session) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid or expired token'
        ]);
        exit;
    }

    // Return user data
    return [
        'id' => $session['user_id'],
        'username' => $session['username'],
        'role' => $session['role'],
        'first_name' => $session['first_name'],
        'last_name' => $session['last_name'],
        'title' => $session['title'],
        'password' => $session['password'] // For password verification
    ];
}

function requireRole($allowedRoles)
{
    $user = authenticate();

    if (!in_array($user['role'], $allowedRoles)) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Insufficient permissions'
        ]);
        exit;
    }

    return $user;
}
?>