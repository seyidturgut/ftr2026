<?php
/**
 * User Controller
 * Handles user CRUD operations with role-based access
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../middleware/auth.php';

class UserController
{

    /**
     * Get all users
     * GET /api/users
     * Required role: fulladmin, admin
     */
    public static function getAll()
    {
        $user = requireRole(['fulladmin', 'admin']);
        $db = getDBConnection();

        $stmt = $db->query("
            SELECT id, username, title, first_name, last_name, email, role, created_at, last_login, is_active
            FROM users
            ORDER BY created_at DESC
        ");
        $users = $stmt->fetchAll();

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $users
        ]);
    }

    /**
     * Get single user
     * GET /api/users/:id
     */
    public static function getOne($id)
    {
        $user = authenticate();
        $db = getDBConnection();

        // Users can only view their own profile unless they are admin/fulladmin
        if ($user['id'] != $id && !in_array($user['role'], ['fulladmin', 'admin'])) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'Unauthorized'
            ]);
            return;
        }

        $stmt = $db->prepare("
            SELECT id, username, title, first_name, last_name, email, role, created_at, last_login, is_active
            FROM users
            WHERE id = ?
        ");
        $stmt->execute([$id]);
        $userData = $stmt->fetch();

        if (!$userData) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'User not found'
            ]);
            return;
        }

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $userData
        ]);
    }

    /**
     * Create new user
     * POST /api/users
     * Required role: fulladmin
     */
    public static function create()
    {
        $user = requireRole(['fulladmin']);
        $data = json_decode(file_get_contents('php://input'), true);

        // Validate required fields
        $required = ['username', 'password', 'first_name', 'last_name', 'role'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => "Field '$field' is required"
                ]);
                return;
            }
        }

        // Validate role
        $allowedRoles = ['fulladmin', 'admin', 'editor', 'viewer'];
        if (!in_array($data['role'], $allowedRoles)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid role'
            ]);
            return;
        }

        $db = getDBConnection();

        // Check if username exists
        $stmt = $db->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->execute([$data['username']]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode([
                'success' => false,
                'message' => 'Username already exists'
            ]);
            return;
        }

        // Hash password
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);

        // Insert user
        $stmt = $db->prepare("
            INSERT INTO users (username, password, title, first_name, last_name, email, role, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['username'],
            $hashedPassword,
            $data['title'] ?? null,
            $data['first_name'],
            $data['last_name'],
            $data['email'] ?? null,
            $data['role'],
            $data['is_active'] ?? true
        ]);

        $newId = $db->lastInsertId();

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'User created successfully',
            'data' => ['id' => $newId]
        ]);
    }

    /**
     * Update user
     * PUT /api/users/:id
     * Required role: fulladmin or own profile
     */
    public static function update($id)
    {
        $user = authenticate();
        $data = json_decode(file_get_contents('php://input'), true);
        $db = getDBConnection();

        // Check permissions
        $canUpdateAll = in_array($user['role'], ['fulladmin']);
        $canUpdateOwn = ($user['id'] == $id);

        if (!$canUpdateAll && !$canUpdateOwn) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'Unauthorized'
            ]);
            return;
        }

        // Build update query dynamically
        $updates = [];
        $params = [];

        $allowedFields = ['title', 'first_name', 'last_name', 'email'];

        // Only fulladmin can change role and is_active
        if ($canUpdateAll) {
            $allowedFields[] = 'role';
            $allowedFields[] = 'is_active';
        }

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = ?";
                $params[] = $data[$field];
            }
        }

        // Handle password change
        if (isset($data['password']) && !empty($data['password'])) {
            $updates[] = "password = ?";
            $params[] = password_hash($data['password'], PASSWORD_DEFAULT);
        }

        if (empty($updates)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'No fields to update'
            ]);
            return;
        }

        $params[] = $id;
        $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'User updated successfully'
        ]);
    }

    /**
     * Delete user
     * DELETE /api/users/:id
     * Required role: fulladmin
     */
    public static function delete($id)
    {
        $user = requireRole(['fulladmin']);
        $db = getDBConnection();

        // Cannot delete yourself
        if ($user['id'] == $id) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Cannot delete your own account'
            ]);
            return;
        }

        $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'User not found'
            ]);
            return;
        }

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'User deleted successfully'
        ]);
    }
}

// Handle requests
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Extract ID if present
$id = end($pathParts);
$isNumeric = is_numeric($id);

if ($method === 'GET' && !$isNumeric) {
    UserController::getAll();
} elseif ($method === 'GET' && $isNumeric) {
    UserController::getOne($id);
} elseif ($method === 'POST') {
    UserController::create();
} elseif ($method === 'PUT' && $isNumeric) {
    UserController::update($id);
} elseif ($method === 'DELETE' && $isNumeric) {
    UserController::delete($id);
} else {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'message' => 'Endpoint not found'
    ]);
}
?>