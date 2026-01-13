-- FTR Online Initial Data
-- Run this after schema.sql

USE ftronlinedb;

-- =============================================
-- Insert Initial Admin User
-- Username: archivist
-- Password: ordKSTWbhb0rKdF1Hrz#*lXr
-- =============================================
INSERT INTO users (username, password, title, first_name, last_name, role, is_active) 
VALUES (
    'archivist',
    '$2y$12$C5E8kz5BVkebJq8YW.AGOOr4bnr35JMX6g3Tvpi9SRv0lygILFWNC',
    'Dr.',
    'Ender',
    'Salbas',
    'fulladmin',
    TRUE
);

-- =============================================
-- Insert Default Categories
-- =============================================
INSERT INTO categories (name, slug, description) VALUES
('Rehabilitasyon', 'rehabilitasyon', 'Rehabilitasyon protokolleri ve egzersiz programları'),
('Değerlendirme', 'degerlendirme', 'Hasta değerlendirme formları ve ölçekler'),
('Takip', 'takip', 'Hasta takip tabloları ve kayıt formları'),
('Eğitim', 'egitim', 'Hasta ve hasta yakını eğitim materyalleri'),
('Protokoller', 'protokoller', 'Tedavi protokolleri ve kılavuzlar'),
('Raporlar', 'raporlar', 'Sağlık raporu ve belge şablonları');

-- =============================================
-- Insert Sample Documents (Optional)
-- =============================================
INSERT INTO documents (title, description, file_type, file_path, category_id, uploaded_by, is_active) VALUES
('Omuz Rehabilitasyonu Protokolü', 'Rotator cuff yaralanmaları sonrası uygulanan standart rehabilitasyon protokolü.', 'PDF', '/uploads/omuz-rehab.pdf', 1, 1, TRUE),
('Diz Artroplastisi Egzersizleri', 'Total diz protezi sonrası ev egzersiz programı ve hasta takip formu.', 'WORD', '/uploads/diz-egzersiz.docx', 1, 1, TRUE),
('Bel Ağrısı Değerlendirme Formu', 'Kronik bel ağrısı hastalarında kullanılan kapsamlı değerlendirme formu.', 'PDF', '/uploads/bel-degerlendirme.pdf', 2, 1, TRUE),
('Hasta Takip Tablosu', 'Aylık hasta takibi ve ilerleme kaydı için hazırlanmış Excel şablonu.', 'EXCEL', '/uploads/hasta-takip.xlsx', 3, 1, TRUE),
('El Rehabilitasyonu Kılavuzu', 'El ve el bileği yaralanmalarında uygulanan tedavi ve egzersiz protokolleri.', 'PDF', '/uploads/el-rehab.pdf', 1, 1, TRUE);
