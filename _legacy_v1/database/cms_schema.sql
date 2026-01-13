-- Content Management System Schema Extension
-- Add to existing ftronlinedb database

USE ftronlinedb;

-- =============================================
-- Table: content_categories
-- Hierarchical category system for Akademik and Doküman pages
-- =============================================
CREATE TABLE IF NOT EXISTS content_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    display_order INT DEFAULT 0,
    page_type ENUM('akademik', 'dokuman') NOT NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (parent_id) REFERENCES content_categories(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_parent (parent_id),
    INDEX idx_page_type (page_type),
    INDEX idx_slug (slug),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: content_items
-- Stores all content: PDF, Video, Text
-- =============================================
CREATE TABLE IF NOT EXISTS content_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    title VARCHAR(300) NOT NULL,
    slug VARCHAR(300) UNIQUE NOT NULL,
    description TEXT,
    content_type ENUM('pdf', 'video', 'text') NOT NULL,
    
    -- For PDF
    pdf_url VARCHAR(500),
    pdf_pages INT,
    pdf_file_size INT,
    
    -- For Video
    video_url VARCHAR(500),
    video_duration INT,
    video_thumbnail VARCHAR(500),
    video_platform VARCHAR(50), -- youtube, vimeo, self-hosted
    
    -- For Text
    text_content LONGTEXT,
    
    -- Common fields
    author_id INT,
    views INT DEFAULT 0,
    downloads INT DEFAULT 0,
    requires_auth BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    tags JSON,
    meta_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL,
    is_published BOOLEAN DEFAULT FALSE,
    
    FOREIGN KEY (category_id) REFERENCES content_categories(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_category (category_id),
    INDEX idx_slug (slug),
    INDEX idx_published (is_published),
    INDEX idx_content_type (content_type),
    INDEX idx_author (author_id),
    FULLTEXT idx_search (title, description, text_content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Insert sample categories
-- =============================================
INSERT INTO content_categories (name, slug, page_type, description, icon, display_order, created_by, is_active) VALUES
-- Akademik categories
('Tanı Kriterleri', 'tani-kriterleri', 'akademik', 'Güncel tanı kriterleri ve rehberler', 'FileText', 1, 1, TRUE),
('Tedavi Protokolleri', 'tedavi-protokolleri', 'akademik', 'Standart tedavi protokolleri', 'ClipboardList', 2, 1, TRUE),
('Araştırmalar', 'arastirmalar', 'akademik', 'Akademik araştırmalar ve makaleler', 'Brain', 3, 1, TRUE),
('Eğitim Materyalleri', 'egitim-materyalleri', 'akademik', 'Eğitim sunumları ve dökümanlar', 'BookOpen', 4, 1, TRUE),

-- Doküman categories
('FTR Tanı Grupları', 'ftr-tani-gruplari', 'dokuman', 'ICD-10 ve klinik sınıflandırma', 'List', 1, 1, TRUE),
('Değerlendirme Formları', 'degerlendirme-formlari', 'dokuman', 'Hasta değerlendirme ve ölçüm formları', 'FileCheck', 2, 1, TRUE),
('Egzersiz Programları', 'egzersiz-programlari', 'dokuman', 'Rehabilitasyon egzersiz programları', 'Activity', 3, 1, TRUE),
('Hasta Takip', 'hasta-takip', 'dokuman', 'Hasta takip formları ve şablonları', 'Clipboard', 4, 1, TRUE);
