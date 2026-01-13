<?php
// User Profile Update API
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../middleware/auth.php';

header('Content-Type: application/json');

$user = authenticate();
if (!$user) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'PUT' || $method === 'PATCH') {
    updateProfile();
} elseif ($method === 'GET') {
    getProfile();
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

function getProfile()
{
    global $user;
    $conn = getDBConnection();

    $sql = "SELECT id, username, title, first_name, last_name, email, profile_photo, role, created_at FROM users WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->execute([$user['id']]);
    $userData = $stmt->fetch();

    if ($userData) {
        echo json_encode([
            'success' => true,
            'data' => $userData
        ]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
    }
}

function updateProfile()
{
    global $user;
    $conn = getDBConnection();

    $data = json_decode(file_get_contents('php://input'), true);

    $title = $data['title'] ?? $user['title'];
    $first_name = $data['first_name'] ?? $user['first_name'];
    $last_name = $data['last_name'] ?? $user['last_name'];
    $email = $data['email'] ?? $user['email'];

    // Validate required fields
    if (empty($first_name) || empty($last_name)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Ad ve Soyad gereklidir']);
        return;
    }

    // Check if password change is requested
    if (!empty($data['new_password'])) {
        if (empty($data['current_password'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Mevcut şifre gereklidir']);
            return;
        }

        // Verify current password
        if (!password_verify($data['current_password'], $user['password'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Mevcut şifre yanlış']);
            return;
        }

        // Update with new password
        $new_password_hash = password_hash($data['new_password'], PASSWORD_DEFAULT);
        $sql = "UPDATE users SET title = ?, first_name = ?, last_name = ?, email = ?, password = ? WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$title, $first_name, $last_name, $email, $new_password_hash, $user['id']]);
    } else {
        // Update without password change
        $sql = "UPDATE users SET title = ?, first_name = ?, last_name = ?, email = ? WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$title, $first_name, $last_name, $email, $user['id']]);
    }

    if ($stmt->rowCount() >= 0) { // rowCount can be 0 if nothing changed
        echo json_encode([
            'success' => true,
            'message' => 'Profil başarıyla güncellendi',
            'data' => [
                'title' => $title,
                'first_name' => $first_name,
                'last_name' => $last_name,
                'email' => $email
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Güncelleme başarısız oldu']);
    }
}
?>