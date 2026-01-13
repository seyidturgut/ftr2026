<?php
/**
 * Document Controller
 * Handles document CRUD operations with role-based access
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../middleware/auth.php';

class DocumentController
{

    /**
     * Get all documents
     * GET /api/documents
     */
    public static function getAll()
    {
        $user = authenticate();
        $db = getDBConnection();

        $stmt = $db->query("
            SELECT d.*, c.name as category_name, c.slug as category_slug,
                   u.first_name, u.last_name, u.title
            FROM documents d
            LEFT JOIN categories c ON d.category_id = c.id
            LEFT JOIN users u ON d.uploaded_by = u.id
            WHERE d.is_active = 1
            ORDER BY d.created_at DESC
        ");
        $documents = $stmt->fetchAll();

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $documents
        ]);
    }

    /**
     * Get single document
     * GET /api/documents/:id
     */
    public static function getOne($id)
    {
        $user = authenticate();
        $db = getDBConnection();

        $stmt = $db->prepare("
            SELECT d.*, c.name as category_name, c.slug as category_slug,
                   u.first_name, u.last_name, u.title
            FROM documents d
            LEFT JOIN categories c ON d.category_id = c.id
            LEFT JOIN users u ON d.uploaded_by = u.id
            WHERE d.id = ? AND d.is_active = 1
        ");
        $stmt->execute([$id]);
        $document = $stmt->fetch();

        if (!$document) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Document not found'
            ]);
            return;
        }

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $document
        ]);
    }

    /**
     * Create new document
     * POST /api/documents
     * Required role: fulladmin, admin, editor
     */
    public static function create()
    {
        $user = requireRole(['fulladmin', 'admin', 'editor']);
        $data = json_decode(file_get_contents('php://input'), true);

        // Validate required fields
        $required = ['title', 'file_type'];
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

        $db = getDBConnection();

        // Insert document
        $stmt = $db->prepare("
            INSERT INTO documents (title, description, file_type, file_path, file_size, category_id, uploaded_by, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['title'],
            $data['description'] ?? null,
            $data['file_type'],
            $data['file_path'] ?? null,
            $data['file_size'] ?? null,
            $data['category_id'] ?? null,
            $user['id'],
            $data['is_active'] ?? true
        ]);

        $newId = $db->lastInsertId();

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Document created successfully',
            'data' => ['id' => $newId]
        ]);
    }

    /**
     * Update document
     * PUT /api/documents/:id
     * Required role: fulladmin, admin, editor
     */
    public static function update($id)
    {
        $user = requireRole(['fulladmin', 'admin', 'editor']);
        $data = json_decode(file_get_contents('php://input'), true);
        $db = getDBConnection();

        // Build update query dynamically
        $updates = [];
        $params = [];

        $allowedFields = ['title', 'description', 'file_type', 'file_path', 'file_size', 'category_id'];

        // Only fulladmin and admin can change is_active
        if (in_array($user['role'], ['fulladmin', 'admin'])) {
            $allowedFields[] = 'is_active';
        }

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = ?";
                $params[] = $data[$field];
            }
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
        $sql = "UPDATE documents SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Document not found'
            ]);
            return;
        }

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Document updated successfully'
        ]);
    }

    /**
     * Delete document
     * DELETE /api/documents/:id
     * Required role: fulladmin, admin
     */
    public static function delete($id)
    {
        $user = requireRole(['fulladmin', 'admin']);
        $db = getDBConnection();

        // Soft delete
        $stmt = $db->prepare("UPDATE documents SET is_active = 0 WHERE id = ?");
        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Document not found'
            ]);
            return;
        }

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Document deleted successfully'
        ]);
    }

    /**
     * Get all categories
     * GET /api/documents/categories
     */
    public static function getCategories()
    {
        $user = authenticate();
        $db = getDBConnection();

        $stmt = $db->query("SELECT * FROM categories ORDER BY name");
        $categories = $stmt->fetchAll();

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $categories
        ]);
    }
}

// Handle requests
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Check for categories endpoint
if (end($pathParts) === 'categories' && $method === 'GET') {
    DocumentController::getCategories();
    exit;
}

// Extract ID if present
$id = end($pathParts);
$isNumeric = is_numeric($id);

if ($method === 'GET' && !$isNumeric) {
    DocumentController::getAll();
} elseif ($method === 'GET' && $isNumeric) {
    DocumentController::getOne($id);
} elseif ($method === 'POST') {
    DocumentController::create();
} elseif ($method === 'PUT' && $isNumeric) {
    DocumentController::update($id);
} elseif ($method === 'DELETE' && $isNumeric) {
    DocumentController::delete($id);
} else {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'message' => 'Endpoint not found'
    ]);
}
?>