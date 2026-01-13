<?php
// File Upload API - Handle profile photos, PDFs, videos
// Files are stored in /uploads directory, only paths stored in database

require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../middleware/auth.php';

header('Content-Type: application/json');

// Authenticate user
$user = authenticate();
if (!$user) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    uploadFile();
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

function uploadFile()
{
    global $user;
    $conn = getDBConnection();

    // Debug logging
    error_log("Requests Headers: " . print_r(getallheaders(), true));
    error_log("Upload request: " . print_r($_FILES, true));
    error_log("Upload POST: " . print_r($_POST, true));

    if (!isset($_FILES['file'])) {
        error_log("Upload failed: No file uploaded");
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No file uploaded']);
        return;
    }

    $file = $_FILES['file'];
    $uploadType = $_POST['type'] ?? 'profile'; // profile, pdf, video, etc.

    // Validate file
    if ($file['error'] !== UPLOAD_ERR_OK) {
        error_log("Upload failed: File error code " . $file['error']);
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Upload error: ' . $file['error']]);
        return;
    }

    // File type validation
    $allowedTypes = [
        'profile' => ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        'content_cover' => ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        'pdf' => ['application/pdf'],
        'video' => ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm']
    ];

    // MIME type check with fallback
    $mimeType = mime_content_type($file['tmp_name']);
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

    error_log("Detected MIME type: " . $mimeType . " for type: " . $uploadType . ", Extension: " . $extension);

    // Whitelisted extensions map
    $allowedExtensions = [
        'profile' => ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        'content_cover' => ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        'pdf' => ['pdf'],
        'video' => ['mp4', 'mpeg', 'mov', 'webm']
    ];

    // Primary Check: MIME Type (Strict)
    $isValidMime = in_array($mimeType, $allowedTypes[$uploadType] ?? []);

    // Secondary Check: Extension (Fallback for MAMP/Local issues where mime_content_type fails)
    $isValidExtension = in_array($extension, $allowedExtensions[$uploadType] ?? []);

    // If neither is valid, fail.
    if (!$isValidMime && !$isValidExtension) {
        error_log("Upload failed: Invalid mime type ($mimeType) and extension ($extension)");
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid file type: ' . $mimeType . ' (' . $extension . ')']);
        return;
    }

    // File size validation (2MB for profiles, 50MB for PDFs/videos)
    $maxSize = $uploadType === 'profile' ? 2 * 1024 * 1024 : 50 * 1024 * 1024;
    if ($file['size'] > $maxSize) {
        error_log("Upload failed: File too large " . $file['size']);
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'File too large']);
        return;
    }

    // Create upload directory if not exists
    $uploadDir = __DIR__ . '/../uploads/' . $uploadType . 's/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid($uploadType . '_' . $user['id'] . '_') . '.' . $extension;
    $filepath = $uploadDir . $filename;

    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to save file']);
        return;
    }

    // Generate URL path (for database storage)
    $fileUrl = '/uploads/' . $uploadType . 's/' . $filename;

    // If profile photo, update user record
    if ($uploadType === 'profile') {
        $sql = "UPDATE users SET profile_photo = ? WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$fileUrl, $user['id']]);
    }

    echo json_encode([
        'success' => true,
        'message' => 'File uploaded successfully',
        'data' => [
            'url' => $fileUrl,
            'filename' => $filename,
            'type' => $uploadType
        ]
    ]);
}
?>