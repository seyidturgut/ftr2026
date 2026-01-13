<?php
/**
 * Content Categories Controller
 * Handles category management with role-based access
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../middleware/auth.php';

class ContentCategoryController
{

    /**
     * Get all categories for a page type
     * GET /api/routes/categories.php?page_type=akademik|dokuman
     * Public endpoint
     */
    public static function getAll()
    {
        $db = getDBConnection();

        $page_type = $_GET['page_type'] ?? null;

        $sql = "
            SELECT c.*, u.first_name, u.last_name, u.title as user_title,
                   (SELECT COUNT(*) FROM content_items WHERE category_id = c.id AND is_published = 1) as content_count
            FROM content_categories c
            LEFT JOIN users u ON c.created_by = u.id
            WHERE c.is_active = 1
        ";

        if ($page_type) {
            $sql .= " AND c.page_type = ?";
        }

        $sql .= " ORDER BY c.display_order ASC, c.name ASC";

        $stmt = $db->prepare($sql);
        if ($page_type) {
            $stmt->execute([$page_type]);
        } else {
            $stmt->execute();
        }

        $categories = $stmt->fetchAll();

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $categories
        ]);
    }

    /**
     * Get single category
     * GET /api/routes/categories.php/:id
     * Public endpoint
     */
    public static function getOne($id)
    {
        $db = getDBConnection();

        $stmt = $db->prepare("
            SELECT c.*, u.first_name, u.last_name, u.title as user_title,
                   (SELECT COUNT(*) FROM content_items WHERE category_id = c.id AND is_published = 1) as content_count
            FROM content_categories c
            LEFT JOIN users u ON c.created_by = u.id
            WHERE c.id = ? AND c.is_active = 1
        ");
        $stmt->execute([$id]);
        $category = $stmt->fetch();

        if (!$category) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Category not found'
            ]);
            return;
        }

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $category
        ]);
    }

    /**
     * Create new category
     * POST /api/routes/categories.php
     * Required role: fulladmin
     */
    public static function create()
    {
        $user = requireRole(['fulladmin']);
        $data = json_decode(file_get_contents('php://input'), true);

        // Validate required fields
        $required = ['name', 'slug', 'page_type'];
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

        // Check if slug exists
        $stmt = $db->prepare("SELECT id FROM content_categories WHERE slug = ?");
        $stmt->execute([$data['slug']]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode([
                'success' => false,
                'message' => 'Slug already exists'
            ]);
            return;
        }

        // Insert category
        $stmt = $db->prepare("
            INSERT INTO content_categories 
            (name, slug, description, icon, page_type, parent_id, display_order, created_by, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['name'],
            $data['slug'],
            $data['description'] ?? null,
            $data['icon'] ?? null,
            $data['page_type'],
            $data['parent_id'] ?? null,
            $data['display_order'] ?? 0,
            $user['id'],
            $data['is_active'] ?? true
        ]);

        $newId = $db->lastInsertId();

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Category created successfully',
            'data' => ['id' => $newId]
        ]);
    }

    /**
     * Update category
     * PUT /api/routes/categories.php/:id
     * Required role: fulladmin
     */
    public static function update($id)
    {
        $user = requireRole(['fulladmin']);
        $data = json_decode(file_get_contents('php://input'), true);
        $db = getDBConnection();

        $updates = [];
        $params = [];

        $allowedFields = ['name', 'slug', 'description', 'icon', 'page_type', 'parent_id', 'display_order', 'is_active'];

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
        $sql = "UPDATE content_categories SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Category updated successfully'
        ]);
    }

    /**
     * Delete category
     * DELETE /api/routes/categories.php/:id
     * Required role: fulladmin
     */
    public static function delete($id)
    {
        $user = requireRole(['fulladmin']);
        $db = getDBConnection();

        // Soft delete
        $stmt = $db->prepare("UPDATE content_categories SET is_active = 0 WHERE id = ?");
        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Category not found'
            ]);
            return;
        }

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Category deleted successfully'
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
    ContentCategoryController::getAll();
} elseif ($method === 'GET' && $isNumeric) {
    ContentCategoryController::getOne($id);
} elseif ($method === 'POST') {
    ContentCategoryController::create();
} elseif ($method === 'PUT' && $isNumeric) {
    ContentCategoryController::update($id);
} elseif ($method === 'DELETE' && $isNumeric) {
    ContentCategoryController::delete($id);
} else {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'message' => 'Endpoint not found'
    ]);
}
?>