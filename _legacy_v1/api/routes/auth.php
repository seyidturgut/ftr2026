<?php
/**
 * Authentication Controller
 * Handles login, logout, verify endpoints
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/cors.php';

class AuthController
{

    /**
     * Login endpoint
     * POST /api/auth/login
     */
    public static function login()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['username']) || !isset($data['password'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Username and password are required'
            ]);
            return;
        }

        $db = getDBConnection();

        // Get user
        $stmt = $db->prepare("SELECT * FROM users WHERE username = ? AND is_active = 1");
        $stmt->execute([$data['username']]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($data['password'], $user['password'])) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid username or password'
            ]);
            return;
        }

        // Create session token
        $token = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', strtotime('+24 hours'));
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;

        $stmt = $db->prepare("
            INSERT INTO sessions (user_id, session_token, ip_address, user_agent, expires_at)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([$user['id'], $token, $ipAddress, $userAgent, $expiresAt]);

        // Update last login
        $stmt = $db->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
        $stmt->execute([$user['id']]);

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'title' => $user['title'],
                    'first_name' => $user['first_name'],
                    'last_name' => $user['last_name'],
                    'role' => $user['role']
                ]
            ]
        ]);
    }

    /**
     * Logout endpoint
     * POST /api/auth/logout
     */
    public static function logout()
    {
        $headers = getallheaders();
        $token = null;

        if (isset($headers['Authorization'])) {
            $auth = $headers['Authorization'];
            if (preg_match('/Bearer\s+(.*)$/i', $auth, $matches)) {
                $token = $matches[1];
            }
        }

        if ($token) {
            $db = getDBConnection();
            $stmt = $db->prepare("DELETE FROM sessions WHERE session_token = ?");
            $stmt->execute([$token]);
        }

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Logout successful'
        ]);
    }

    /**
     * Verify token endpoint
     * GET /api/auth/verify
     */
    public static function verify()
    {
        require_once __DIR__ . '/../middleware/auth.php';
        $user = authenticate();

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => [
                'user' => $user
            ]
        ]);
    }
}

// Handle requests
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if ($method === 'POST' && str_ends_with($path, '/login')) {
    AuthController::login();
} elseif ($method === 'POST' && str_ends_with($path, '/logout')) {
    AuthController::logout();
} elseif ($method === 'GET' && str_ends_with($path, '/verify')) {
    AuthController::verify();
} else {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'message' => 'Endpoint not found'
    ]);
}
?>