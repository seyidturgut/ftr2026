<?php
/**
 * Content Items Controller
 * Handles content management (PDF, Video, Text) with access control
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../middleware/auth.php';

class ContentItemController
{

    /**
     * Get all content items
     * GET /api/routes/content.php?category_id=X
     * Returns titles only for non-authenticated, full content for authenticated
     */
    public static function getAll()
    {
        $db = getDBConnection();

        // Check if user is authenticated (optional for this endpoint)
        $isAuthenticated = false;
        $headers = getallheaders();
        if (isset($headers['Authorization'])) {
            try {
                $user = authenticate();
                $isAuthenticated = true;
            } catch (Exception $e) {
                // Not authenticated, continue as guest
            }
        }

        $category_id = $_GET['category_id'] ?? null;
        $content_type = $_GET['content_type'] ?? null;

        // Base query - select different fields based on auth status
        if ($isAuthenticated) {
            $sql = "
                SELECT c.*, cat.name as category_name, cat.slug as category_slug,
                       u.first_name, u.last_name, u.title as author_title
                FROM content_items c
                LEFT JOIN content_categories cat ON c.category_id = cat.id
                LEFT JOIN users u ON c.author_id = u.id
                WHERE c.is_published = 1
            ";
        } else {
            // Non-authenticated users see only basic info
            $sql = "
                SELECT c.id, c.title, c.slug, c.description, c.content_type, 
                       c.category_id, c.requires_auth, c.created_at, c.views,
                       c.cover_image, cat.name as category_name, cat.slug as category_slug
                FROM content_items c
                LEFT JOIN content_categories cat ON c.category_id = cat.id
                WHERE c.is_published = 1
            ";
        }

        $params = [];

        if ($category_id) {
            $sql .= " AND c.category_id = ?";
            $params[] = $category_id;
        }

        if ($content_type) {
            $sql .= " AND c.content_type = ?";
            $params[] = $content_type;
        }

        $sql .= " ORDER BY c.display_order ASC, c.created_at DESC";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $content = $stmt->fetchAll();

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $content,
            'authenticated' => $isAuthenticated
        ]);
    }

    /**
     * Get single content item
     * GET /api/routes/content.php/:slug
     * Protected based on requires_auth field
     */
    public static function getOne($slug)
    {
        $db = getDBConnection();

        // Check if user is authenticated
        $isAuthenticated = false;
        $user = null;
        $headers = getallheaders();
        if (isset($headers['Authorization'])) {
            try {
                $user = authenticate();
                $isAuthenticated = true;
            } catch (Exception $e) {
                // Not authenticated
            }
        }

        $stmt = $db->prepare("
            SELECT c.*, cat.name as category_name, cat.slug as category_slug, cat.page_type,
                   u.first_name, u.last_name, u.title as author_title
            FROM content_items c
            LEFT JOIN content_categories cat ON c.category_id = cat.id
            LEFT JOIN users u ON c.author_id = u.id
            WHERE c.slug = ? AND c.is_published = 1
        ");
        $stmt->execute([$slug]);
        $content = $stmt->fetch();

        if (!$content) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Content not found'
            ]);
            return;
        }

        // Check if authentication is required
        if ($content['requires_auth'] && !$isAuthenticated) {
            // Return limited info for non-authenticated users
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'data' => [
                    'id' => $content['id'],
                    'title' => $content['title'],
                    'slug' => $content['slug'],
                    'description' => $content['description'],
                    'content_type' => $content['content_type'],
                    'category_name' => $content['category_name'],
                    'requires_auth' => true,
                    'authenticated' => false
                ],
                'message' => 'Authentication required to view full content'
            ]);
            return;
        }

        // Increment view count
        $updateStmt = $db->prepare("UPDATE content_items SET views = views + 1 WHERE id = ?");
        $updateStmt->execute([$content['id']]);

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $content,
            'authenticated' => $isAuthenticated
        ]);
    }

    /**
     * Create new content
     * POST /api/routes/content.php
     * Required role: fulladmin, admin, editor
     */
    public static function create()
    {
        $user = requireRole(['fulladmin', 'admin', 'editor']);
        $data = json_decode(file_get_contents('php://input'), true);

        // Validate required fields
        $required = ['title', 'slug', 'category_id', 'content_type'];
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
        $stmt = $db->prepare("SELECT id FROM content_items WHERE slug = ?");
        $stmt->execute([$data['slug']]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode([
                'success' => false,
                'message' => 'Slug already exists'
            ]);
            return;
        }

        // Insert content
        $stmt = $db->prepare("
            INSERT INTO content_items 
            (category_id, title, meta_title, slug, description, content_type, 
             pdf_url, pdf_pages, pdf_file_size,
             video_url, video_duration, video_thumbnail, video_platform,
             text_content, cover_image,
             author_id, requires_auth, display_order, tags, meta_description, has_download, is_published, published_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $published = $data['is_published'] ?? false;
        $published_at = $published ? date('Y-m-d H:i:s') : null;

        $stmt->execute([
            $data['category_id'],
            $data['title'],
            $data['meta_title'] ?? null,
            $data['slug'],
            $data['description'] ?? null,
            $data['content_type'],
            $data['pdf_url'] ?? null,
            $data['pdf_pages'] ?? null,
            $data['pdf_file_size'] ?? null,
            $data['video_url'] ?? null,
            $data['video_duration'] ?? null,
            $data['video_thumbnail'] ?? null,
            $data['video_platform'] ?? null,
            $data['text_content'] ?? null,
            $data['cover_image'] ?? null,
            $user['id'],
            $data['requires_auth'] ?? true,
            $data['display_order'] ?? 0,
            isset($data['tags']) ? json_encode($data['tags']) : null,
            $data['meta_description'] ?? null,
            $data['has_download'] ?? false,
            $published,
            $published_at
        ]);

        $newId = $db->lastInsertId();

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Content created successfully',
            'data' => ['id' => $newId]
        ]);
    }

    /**
     * Update content
     * PUT /api/routes/content.php/:id
     * Required role: fulladmin, admin, editor (own content)
     */
    public static function update($id)
    {
        $user = requireRole(['fulladmin', 'admin', 'editor']);
        $data = json_decode(file_get_contents('php://input'), true);
        $db = getDBConnection();

        // Check ownership if not admin
        if (!in_array($user['role'], ['fulladmin', 'admin'])) {
            $stmt = $db->prepare("SELECT author_id FROM content_items WHERE id = ?");
            $stmt->execute([$id]);
            $content = $stmt->fetch();
            if (!$content || $content['author_id'] != $user['id']) {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'Unauthorized'
                ]);
                return;
            }
        }

        $updates = [];
        $params = [];

        $allowedFields = [
            'title',
            'meta_title',
            'slug',
            'description',
            'category_id',
            'content_type',
            'pdf_url',
            'pdf_pages',
            'pdf_file_size',
            'video_url',
            'video_duration',
            'video_thumbnail',
            'video_platform',
            'text_content',
            'cover_image',
            'requires_auth',
            'display_order',
            'meta_description',
            'has_download',
            'is_published'
        ];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = ?";
                $params[] = $data[$field];
            }
        }

        if (isset($data['tags'])) {
            $updates[] = "tags = ?";
            $params[] = json_encode($data['tags']);
        }

        // Handle publish status
        if (isset($data['is_published']) && $data['is_published']) {
            $updates[] = "published_at = NOW()";
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
        $sql = "UPDATE content_items SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Content updated successfully'
        ]);
    }

    /**
     * Delete content
     * DELETE /api/routes/content.php/:id
     * Required role: fulladmin, admin
     */
    public static function delete($id)
    {
        $user = requireRole(['fulladmin', 'admin']);
        $db = getDBConnection();

        // Soft delete by unpublishing
        $stmt = $db->prepare("UPDATE content_items SET is_published = 0 WHERE id = ?");
        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Content not found'
            ]);
            return;
        }

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Content deleted successfully'
        ]);
    }

    /**
     * Increment download count
     * POST /api/routes/content.php/:id/download
     */
    public static function incrementDownload($id)
    {
        $db = getDBConnection();

        $stmt = $db->prepare("UPDATE content_items SET downloads = downloads + 1 WHERE id = ?");
        $stmt->execute([$id]);

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Download count incremented'
        ]);
    }
}

// Handle requests
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Check for special endpoints
$lastPart = end($pathParts);
$secondToLast = count($pathParts) > 1 ? $pathParts[count($pathParts) - 2] : null;

if ($method === 'POST' && $lastPart === 'download' && is_numeric($secondToLast)) {
    ContentItemController::incrementDownload($secondToLast);
    exit;
}

// Extract ID or slug
$identifier = $lastPart;
$isNumeric = is_numeric($identifier);

if ($method === 'GET' && !$isNumeric && $identifier !== 'content.php') {
    // Get by slug
    ContentItemController::getOne($identifier);
} elseif ($method === 'GET') {
    ContentItemController::getAll();
} elseif ($method === 'POST') {
    ContentItemController::create();
} elseif ($method === 'PUT' && $isNumeric) {
    ContentItemController::update($identifier);
} elseif ($method === 'DELETE' && $isNumeric) {
    ContentItemController::delete($identifier);
} else {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'message' => 'Endpoint not found'
    ]);
}
?>