import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Search, Printer, Trash2, Plus, Stethoscope, FileText, User, Calendar, Briefcase, PlusCircle, X, Lock, ArrowRight, Home, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ConfirmModal from './ui/ConfirmModal';

// --- Types ---
interface Product {
    id: string;
    name: string;
    code: string;
    info: string; // e.g. (F/O HR) (Hazır) (9 ay)
}

interface QuickAction {
    id: string;
    label: string;
    items: Product[];
}

interface QuickTemplate {
    label: string;
    text: string;
    diagnosis?: string;
}

// --- Mock Data ---
// --- Real Data from HTML ---
const PRODUCTS: Product[] = [
    { id: 'OP1000', code: "OP1000", name: "Alüminyum Koltuk Değneği", info: "(Hazır) (1 yıl)" },
    { id: 'OP1001', code: "OP1001", name: "Ayak Bileği Stabilizasyon Ortezi (Hava, jel vb. yastıklı)", info: "(Hazır) (6 ay)" },
    { id: 'OP1004', code: "OP1004", name: "Alt Ekstremite için Distraksiyon Sistemli Kontraktür Ortezi", info: "(Ismarlama) (2 yıl)" },
    { id: 'OP1005', code: "OP1005", name: "Kalça Abdüksiyon Ortezi Eklemli (yetişkinler için)", info: "(Ismarlama) (18 ay)" },
    { id: 'OP1006', code: "OP1006", name: "Kalça Abdüksiyon Ortezi Eklemsiz (yetişkinler için)", info: "(Ismarlama) (18 ay)" },
    { id: 'OP1008', code: "OP1008", name: "Bel Kemeri Değişimi", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1009', code: "OP1009", name: "Bel Kemeri ve Eklem Değişimi (fleksiyon-ekstansiyon, abdüksiyon-addüksiyon)", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1010', code: "OP1010", name: "Bel Kemeri ve Eklem Değişimi (fleksiyon-ekstansiyon)", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1011', code: "OP1011", name: "Kanedyen (Canadian) (Alüminyum)", info: "(Hazır) (2 yıl)" },
    { id: 'OP1012', code: "OP1012", name: "Diz Ortezi; Yan Barlı, Ayarlanabilir Eklemli", info: "(Hazır) (1 yıl)" },
    { id: 'OP1015', code: "OP1015", name: "Denis Browne Ortezi", info: "(Ismarlama) (1 defa)" },
    { id: 'OP1018', code: "OP1018", name: "Diz Kafesi (İsveç)", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1021', code: "OP1021", name: "Ayak-Ayakkabı Bağlantılı Dorsi Fleksiyon Ortezi (Soft)", info: "(Ismarlama) (6 ay)" },
    { id: 'OP1023', code: "OP1023", name: "Ayak Bilekliği; Elastik", info: "(Hazır) (6 ay)" },
    { id: 'OP1024', code: "OP1024", name: "Ayak Bilekliği; Elastik (Malleol / aşil destekli veya fleksible balenli)", info: "(Hazır) (6 ay)" },
    { id: 'OP1028', code: "OP1028", name: "Halluks Valgus Ateli", info: "(Hazır) (6 ay)" },
    { id: 'OP1029', code: "OP1029", name: "Halluks Valgus Makarası", info: "(Hazır) (6 ay)" },
    { id: 'OP1031', code: "OP1031", name: "Kalça Abdüksiyon Ortezi(Soft)", info: "(Hazır) (6 ay)" },
    { id: 'OP1032', code: "OP1032", name: "Kalkaneal Kap", info: "(Hazır) (6 ay)" },
    { id: 'OP1033', code: "OP1033", name: "Kalkaneal Kap", info: "(Ismarlama) (6 ay)" },
    { id: 'OP1038', code: "OP1038", name: "Patellar Tendondan Yük Taşıyıcı", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1043', code: "OP1043", name: "Uzun Yürüme Ortezi için Komple Deri Değişimi", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1044', code: "OP1044", name: "Kısalık Destekleri (her 1 cm için)", info: "(Ismarlama) (6 ay)" },
    { id: 'OP1049', code: "OP1049", name: "Takviyeli Tabanlık (1 Çift)", info: "(Hazır) (6 ay)" },
    { id: 'OP1050', code: "OP1050", name: "Tabanlık; Ülserasyonlu ve/veya Doku Kaybına Bağlı Deformasyonlu Ayak için", info: "(Ismarlama) (6 ay)" },
    { id: 'OP1051', code: "OP1051", name: "Ortopedik Bot (1 Çift)", info: "(Ismarlama) (6 ay)" },
    { id: 'OP1053', code: "OP1053", name: "Kendinden AFO'lu Bot (1 Çift)", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1054', code: "OP1054", name: "Patellar Tendon Bandı", info: "(Hazır) (6 ay)" },
    { id: 'OP1055', code: "OP1055", name: "Soft Kaplama (Plastazot-Pee-Lite vb. kaplama)", info: "(Ismarlama) (6 ay)" },
    { id: 'OP1056', code: "OP1056", name: "Diz Ortezi (Yüksek Yoğunluklu Plastik)", info: "(Ismarlama) (2 yıl)" },
    { id: 'OP1057', code: "OP1057", name: "Diz Ortezi (Düşük Yoğunluklu Plastik)", info: "(Ismarlama) (2 yıl)" },
    { id: 'OP1058', code: "OP1058", name: "Diz Ortezi (Harici Eklemli Plastik)", info: "(Ismarlama) (2 yıl)" },
    { id: 'OP1059', code: "OP1059", name: "Diz Ortezi (Kendinden Eklemli Plastik)", info: "(Ismarlama) (2 yıl)" },
    { id: 'OP1060', code: "OP1060", name: "Plastik İstirahat Moldu (PAFO)", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1061', code: "OP1061", name: "Plastik İstirahat Moldu (PKAFO)", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1062', code: "OP1062", name: "Yüksek Yoğunluklu Plastik Yürüyüş Moldu (Supra Malleolar)", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1063', code: "OP1063", name: "Yüksek Yoğunluklu Plastik Yürüyüş Moldu (Sub Malleolar)", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1064', code: "OP1064", name: "Yüksek Yoğunluklu Plastik Yürüyüş Moldu (PAFO)", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1065', code: "OP1065", name: "Yüksek Yoğunluklu Plastik Yürüyüş Moldu (Kendinden Eklemli)", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1066', code: "OP1066", name: "Yüksek Yoğunluklu Plastik Yürüyüş Moldu (Harici Eklemli)", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1067', code: "OP1067", name: "Yüksek Yoğunluklu Plastik Yürüyüş Moldu (Harici Asistif Eklemli)", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1068', code: "OP1068", name: "Yüksek Yoğunluklu Plastik Yürüyüş Moldu (Fleksiyonu Engelleyen)", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1069', code: "OP1069", name: "Yüksek Yoğunluklu Plastik Yürüyüş Moldu (Ekstansiyonu Engelleyen)", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1070', code: "OP1070", name: "Yüksek Yoğunluklu Plastik KAFO (Harici Eklemli)", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1072', code: "OP1072", name: "Deri Sandalet", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1077', code: "OP1077", name: "Uzun Yürüme Ortezi Modifiye Thomas (Bel kemerli)", info: "(Ismarlama) (2 yıl)" },
    { id: 'OP1078', code: "OP1078", name: "Uzun Yürüme Ortezi Thomas", info: "(Ismarlama) (2 yıl)" },
    { id: 'OP1105', code: "OP1105", name: "Walker (Alüminyum)(Hareketli-Sabit-Ters)", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1106', code: "OP1106", name: "Walker (Alüminyum)(Hareketli-Sabit-Ters)", info: "(Hazır) (1 yıl)" },
    { id: 'OP1107', code: "OP1107", name: "Walker (Modifiye; Aksilla Destekli, Ön Kol Destekli, vs)", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1108', code: "OP1108", name: "Walker (Modifiye; Aksilla Destekli, Ön Kol Destekli, vs)", info: "(Hazır) (1 yıl)" },
    { id: 'OP1109', code: "OP1109", name: "X Bain Veya O Bain Ortezi", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1111', code: "OP1111", name: "İnce El Becerilerini Destekleyen Tutma ve Kavrama Aparatları Dinamik", info: "(Hazır) (2 yıl)" },
    { id: 'OP1112', code: "OP1112", name: "İnce El Becerilerini Destekleyen Tutma ve Kavrama Aparatları Statik", info: "(Hazır) (2 yıl)" },
    { id: 'OP1113', code: "OP1113", name: "Kol Abdüksiyon Ortezi Statik-Pelvis Destekli", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1114', code: "OP1114", name: "Kol Abdüksiyon Ortezi Statik-Gövde Destekli", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1115', code: "OP1115", name: "Üst Ekstremite için Ayarlanabilir Eklemli Kontraktür Ortezi", info: "(Hazır) (9 ay)" },
    { id: 'OP1116', code: "OP1116", name: "Üst Ekstremite için Ayarlanabilir Eklemli Kontraktür Ortezi", info: "(Ismarlama) (9 ay)" },
    { id: 'OP1117', code: "OP1117", name: "Üst Ekstremite için Distraksiyon Sistemli Kontraktür Ortezi", info: "(Ismarlama) (2 yıl)" },
    { id: 'OP1118', code: "OP1118", name: "Başparmak Bandı", info: "(Hazır) (6 ay)" },
    { id: 'OP1119', code: "OP1119", name: "Brakial Pleksus Yaralanma Ortezi", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1120', code: "OP1120", name: "Dirsek Splinti; Dinamik", info: "(Ismarlama) (6 ay)" },
    { id: 'OP1123', code: "OP1123", name: "Parmak Splinti; Dinamik", info: "(Ismarlama) (6 ay)" },
    { id: 'OP1125', code: "OP1125", name: "Dirseklik; Elastik", info: "(Hazır) (6 ay)" },
    { id: 'OP1128', code: "OP1128", name: "Kısa Opponens Splinti", info: "(Ismarlama) (6 ay)" },
    { id: 'OP1129', code: "OP1129", name: "Kısa Opponens Splinti Lumbrikal Barlı", info: "(Ismarlama) (6 ay)" },
    { id: 'OP1130', code: "OP1130", name: "Uzun Opponens Splinti", info: "(Ismarlama) (6 ay)" },
    { id: 'OP1131', code: "OP1131", name: "Klavikula Bandajı; Valpau Bandajı; Kol Askısı", info: "(Hazır) (6 ay)" },
    { id: 'OP1134', code: "OP1134", name: "Kol Abdüksiyon Ortezi; Dinamik", info: "(Ismarlama) (6 ay)" },
    { id: 'OP1135', code: "OP1135", name: "Omuz Retraksiyon Harnesi (Postüreks vb.)", info: "(Hazır) (6 ay)" },
    { id: 'OP1136', code: "OP1136", name: "Parmak Kontraktür Ortezi", info: "(Ismarlama) (6 ay)" },
    { id: 'OP1137', code: "OP1137", name: "Poliform Ortez (Dirsek-El ortezleri)", info: "(Ismarlama) (6 ay)" },
    { id: 'OP1141', code: "OP1141", name: "Statik Dirsek Splinti", info: "(Ismarlama) (6 ay)" },
    { id: 'OP1142', code: "OP1142", name: "Statik Dirsek Splinti", info: "(Hazır) (6 ay)" },
    { id: 'OP1143', code: "OP1143", name: "Statik El-Bilek Splinti", info: "(Ismarlama) (6 ay)" },
    { id: 'OP1144', code: "OP1144", name: "Statik El-Bilek Splinti", info: "(Ismarlama) (6 ay)" },
    { id: 'OP1145', code: "OP1145", name: "Statik El-Bilek Parmak Splinti", info: "(Ismarlama) (6 ay)" },
    { id: 'OP1146', code: "OP1146", name: "Statik El Splinti", info: "(Ismarlama) (6 ay)" },
    { id: 'OP1147', code: "OP1147", name: "Statik El Splinti", info: "(Hazır) (6 ay)" },
    { id: 'OP1149', code: "OP1149", name: "Statik Parmak Splinti", info: "(Hazır) (6 ay)" },
    { id: 'OP1153', code: "OP1153", name: "Tenodezis Splinti Metal", info: "(Ismarlama) (6 ay)" },
    { id: 'OP1155', code: "OP1155", name: "Ön Kol Supinasyon / Pronasyon Ortezi Dinamik", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1268', code: "OP1268", name: "Gövde Ortezi; Dorsolomber Fleksible Balenli Korse", info: "(Hazır) (1 yıl)" },
    { id: 'OP1269', code: "OP1269", name: "Gövde Ortezi; Dorsolomber Metal Torakolombosacral Ortez; Taylor", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1270', code: "OP1270", name: "Gövde Ortezi; Metal TLSO; Steindler", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1271', code: "OP1271", name: "Gövde Ortezi; Dorsolumbosakral Korse; Plastik TLSO", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1272', code: "OP1272", name: "Gövde Ortezi; Servikal Ortez İlaveli TLSO", info: "(Ismarlama) (6 ay)" },
    { id: 'OP1273', code: "OP1273", name: "Gövde Ortezi; Skolyoz Ortezleri (Milwaukee Tip CTLSO)", info: "(Ismarlama) (6 ay)" },
    { id: 'OP1274', code: "OP1274", name: "Gövde Ortezi; Skolyoz Ortezleri (Boston, Miami vb Tip Plastik TLSO)", info: "(Ismarlama) (6 ay)" },
    { id: 'OP1275', code: "OP1275", name: "Gövde Ortezi; Servikal Ortez (Sünger)", info: "(Hazır) (6 ay)" },
    { id: 'OP1276', code: "OP1276", name: "Gövde Ortezi; Servikal Ortez (Plastazot)", info: "(Hazır) (6 ay)" },
    { id: 'OP1277', code: "OP1277", name: "Gövde Ortezi; Servikal Ortez (Philadelphia)", info: "(Hazır) (6 ay)" },
    { id: 'OP1278', code: "OP1278", name: "Gövde Ortezi; Servikal Ortez (Göğüs destekli; plastik çenelikli)", info: "(Ismarlama) (6 ay)" },
    { id: 'OP1279', code: "OP1279", name: "Gövde Ortezi; Servikal Ortez (SOMI; Barlı göğüs destekli)", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1281', code: "OP1281", name: "Gövde Ortezi; Hiperekstansiyon Ortez (Jewett Vb TLO)", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1282', code: "OP1282", name: "Gövde Ortezi; Hiperekstansiyon Ortez (Jewett Vb TLO)", info: "(Hazır) (1 yıl)" },
    { id: 'OP1283', code: "OP1283", name: "Gövde Ortezi; Lumbosakral Çelik Balenli Korse", info: "(Hazır) (1 yıl)" },
    { id: 'OP1284', code: "OP1284", name: "Gövde Ortezi; Lumbosakral Metal Ortez (Knight)", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1285', code: "OP1285", name: "Gövde Ortezi; Lumbosakral Yün Elastik Korse", info: "(Hazır) (6 ay)" },
    { id: 'OP1287', code: "OP1287", name: "Gövde Ortezi; Minerva Ortezi CTO", info: "(Hazır) (1 yıl)" },
    { id: 'OP1288', code: "OP1288", name: "Gövde Ortezi; Minerva Ortezi", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1289', code: "OP1289", name: "Gövde Ortezi; Plastazot Kaplama (Korse)", info: "(Ismarlama) (6 ay)" },
    { id: 'OP1290', code: "OP1290", name: "Gövde Ortezi; Plastik Gövde Ortezi (LSO)", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1294', code: "OP1294", name: "Tekerlekli Sandalye Oturma Adaptasyonu", info: "(Hazır) (3 yıl)" },
    { id: 'OP1295', code: "OP1295", name: "Standing Table (Ayakta Dik Konumlandırma Cihazı) (Hazır)", info: "(Hazır) (5 yıl)" },
    { id: 'OP1296', code: "OP1296", name: "Standing Table (Ayakta Dik Konumlandırma Cihazı) (Ismarlama)", info: "(Ismarlama) (5 yıl)" },
    { id: 'OP1297', code: "OP1297", name: "Ayakta Dik Pozisyonlama Cihazı (Stand Up Wheelchair)", info: "(Hazır) (5 yıl)" },
    { id: 'OP1298', code: "OP1298", name: "Velkro (Velcro) / Bant Değişimi", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1300', code: "OP1300", name: "Havalı Yatak", info: "(Hazır) (5 yıl)" },
    { id: 'OP1301', code: "OP1301", name: "Havalı Minder", info: "(Hazır) (5 yıl)" },
    { id: 'OP1342', code: "OP1342", name: "Tekerlekli Sandalye; Standart Manuel", info: "(Hazır) (5 yıl)" },
    { id: 'OP1343', code: "OP1343", name: "Tekerlekli Sandalye; Hafif Manuel", info: "(Hazır) (5 yıl)" },
    { id: 'OP1344', code: "OP1344", name: "Tekerlekli Sandalye; Pediatrik", info: "(Hazır) (5 yıl)" },
    { id: 'OP1345', code: "OP1345", name: "Tekerlekli Sandalye; Standart Akülü", info: "(Hazır) (5 yıl)" },
    { id: 'OP1534', code: "OP1534", name: "Ayak Bileği Ayarlanabilir Eklemli Kontraktür Ortezi", info: "(Ismarlama) (9 ay)" },
    { id: 'OP1535', code: "OP1535", name: "Ayak Bileği Ayarlanabilir Eklemli Kontraktür Ortezi", info: "(Hazır) (9 ay)" },
    { id: 'OP1536', code: "OP1536", name: "Diz Eklemi Ayarlanabilir Eklemli Kontraktür Ortezi", info: "(Ismarlama) (9 ay)" },
    { id: 'OP1537', code: "OP1537", name: "Kalça Abdüksiyon Ortezi Eklemsiz (yetişkinler için)", info: "(Hazır) (18 ay)" },
    { id: 'OP1538', code: "OP1538", name: "Ayak-Ayakkabı Bağlantılı Dorsi Fleksiyon Ortezi (Soft)", info: "(Hazır) (6 ay)" },
    { id: 'OP1539', code: "OP1539", name: "Kalça Abdüksiyon Ortezi(Rijit)", info: "(Ismarlama) (6 ay)" },
    { id: 'OP1540', code: "OP1540", name: "Kalça Abdüksiyon Ortezi(Soft)", info: "(Ismarlama) (6 ay)" },
    { id: 'OP1541', code: "OP1541", name: "Kısa Yürüme Ortezi (Bot sandalet hariç)", info: "(Ismarlama) (2 yıl)" },
    { id: 'OP1542', code: "OP1542", name: "Kısa Yürüme Ortezi Klenzak Eklemli", info: "(Ismarlama) (2 yıl)" },
    { id: 'OP1544', code: "OP1544", name: "Takviyeli Tabanlık (1 Çift)", info: "(Ismarlama) (6 ay)" },
    { id: 'OP1545', code: "OP1545", name: "Uzun Yürüme Ortezi Mekanik Eklemli (Yetişkin)", info: "(Ismarlama) (2 yıl)" },
    { id: 'OP1546', code: "OP1546", name: "Uzun Yürüme Ortezi Mekanik Eklemli Bel Kemerli (Yetişkin)", info: "(Ismarlama) (2 yıl)" },
    { id: 'OP1547', code: "OP1547", name: "Uzun Yürüme Ortezi Mekanik Eklemli Bel Kemerli Bilateral (Yetişkin)", info: "(Ismarlama) (2 yıl)" },
    { id: 'OP1548', code: "OP1548", name: "Uzun Yürüme Ortezi Mekanik Eklemli (2-18 yaş)", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1549', code: "OP1549", name: "Uzun Yürüme Ortezi Mekanik Eklemli Bel Kemerli (2-18 yaş)", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1550', code: "OP1550", name: "Uzun Yürüme Ortezi Mekanik Eklemli Bel Kemerli Bilateral (2-18 yaş)", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1551', code: "OP1551", name: "Uzun Yürüme Ortezi Mekanik Eklemli (Gövde Ortezine Monteli)", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1552', code: "OP1552", name: "Uzun Yürüme Ortezi Mekanik Eklemli Bilateral (Gövde Ortezine Monteli)", info: "(Ismarlama) (1 yıl)" },
    { id: 'OP1557', code: "OP1557", name: "Gövde Ortezi; Postür Koruyucu Oturma Ortezi", info: "(Ismarlama) (3 yıl)" }
    // NOTE: This list is populated from recete_olusturucu.html
];

const QUICK_ACTIONS: QuickAction[] = [
    // Pre-defined sets kept for backward compatibility or can be updated
    { id: 'dizlik_sag', label: 'Sağ Diz', items: [{ id: 'OP1270', name: 'Patella ve Ligament Destekli Dizlik (SAĞ)', code: 'OP1270', info: '(F/O HR) (Hazır) (1 yıl)' }] },
    { id: 'dizlik_sol', label: 'Sol Diz', items: [{ id: 'OP1270', name: 'Patella ve Ligament Destekli Dizlik (SOL)', code: 'OP1270', info: '(F/O HR) (Hazır) (1 yıl)' }] },
    { id: 'kts_sag', label: 'Sağ KTS', items: [{ id: 'OP1132', name: 'Statik El Bilek Ateli (SAĞ)', code: 'OP1132', info: '(F/O HR) (Hazır) (6 ay)' }] },
];

const QUICK_TEMPLATES: QuickTemplate[] = [
    { label: "CP 31-60", text: "Serebral Palsi tanısıyla takipli hastada oturma dengesi, ayakta durma ve terapötik ambulasyon çalışılıyor. FAS Skoru 1-2 düzeyinde. 1-2/4 spastisite mevcut. Hasta tedaviden fayda görmektedir. Tedavisinin 31-60 seansa uzatılması uygundur.", diagnosis: "Serebral Palsi (CP)" },
    { label: "CP 61-90", text: "Serebral Palsi tanısıyla takipli hastada oturma dengesi, ayakta durma ve terapötik ambulasyon çalışılıyor. FAS Skoru 1-2 düzeyinde. 1-2/4 spastisite mevcut. Hasta tedaviden fayda görmektedir. Tedavisinin 61-90 seansa uzatılması uygundur.", diagnosis: "Serebral Palsi (CP)" },
    { label: "HP 31-60", text: "Hemipleji tanısıyla takipli hastada nörolojik defisitler devam etmektedir. Brunnstrom evre 2-3. Spastisite Modifiye Ashworth 2. Hasta tedaviden fayda görmektedir. Tedavisinin 31-60 seansa uzatılması uygundur.", diagnosis: "Hemipleji" },
    { label: "HP 61-90", text: "Hemipleji tanısıyla takipli hastada nörolojik defisitler devam etmektedir. Brunnstrom evre 2-3. Spastisite Modifiye Ashworth 2. Hasta tedaviden fayda görmektedir. Tedavisinin 61-90 seansa uzatılması uygundur.", diagnosis: "Hemipleji" },
    { label: "PP 31-60", text: "Parapleji tanısıyla takipli hastada alt ekstremite kas gücü 2/5. Transfer aktiviteleri ve yürüme eğitimi çalışılıyor. Hasta tedaviden fayda görmektedir. Tedavisinin 31-60 seansa uzatılması uygundur.", diagnosis: "Parapleji" },
    { label: "PP 61-90", text: "Parapleji tanısıyla takipli hastada alt ekstremite kas gücü 2/5. Transfer aktiviteleri ve yürüme eğitimi çalışılıyor. Hasta tedaviden fayda görmektedir. Tedavisinin 61-90 seansa uzatılması uygundur.", diagnosis: "Parapleji" },
    { label: "TP 31-60", text: "Tetrapleji tanısıyla takipli hastada dört ekstremite kas gücü kaybı mevcut. Yatak içi mobilizasyon ve transfer eğitimi çalışılıyor. Hasta tedaviden fayda görmektedir. Tedavisinin 31-60 seansa uzatılması uygundur.", diagnosis: "Tetrapleji" },
    { label: "TP 61-90", text: "Tetrapleji tanısıyla takipli hastada dört ekstremite kas gücü kaybı mevcut. Yatak içi mobilizasyon ve transfer eğitimi çalışılıyor. Hasta tedaviden fayda görmektedir. Tedavisinin 61-90 seansa uzatılması uygundur.", diagnosis: "Tetrapleji" },
    { label: "Sol Dizlik", text: "Sol dizde gonartroz nedeniyle instabilite ve ağrı mevcuttur. Günlük yaşam aktiviteleri kısıtlanmıştır.", diagnosis: "Gonartroz (Sol Diz)" },
    { label: "Sağ Dizlik", text: "Sağ dizde gonartroz nedeniyle instabilite ve ağrı mevcuttur. Günlük yaşam aktiviteleri kısıtlanmıştır.", diagnosis: "Gonartroz (Sağ Diz)" },
    { label: "Bilat Dizlik", text: "Her iki dizde gonartroz nedeniyle instabilite ve ağrı mevcuttur. Günlük yaşam aktiviteleri kısıtlanmıştır.", diagnosis: "Gonartroz (Bilateral)" },
    { label: "Sol KTS", text: "Sol el bileğinde Karpal Tünel Sendromu tanısı mevcuttur. İstirahat splinti kullanması uygundur.", diagnosis: "Karpal Tünel Sendromu (Sol)" },
    { label: "Sağ KTS", text: "Sağ el bileğinde Karpal Tünel Sendromu tanısı mevcuttur. İstirahat splinti kullanması uygundur.", diagnosis: "Karpal Tünel Sendromu (Sağ)" },
    { label: "Bilat KTS", text: "Her iki el bileğinde Karpal Tünel Sendromu tanısı mevcuttur. İstirahat splinti kullanması uygundur.", diagnosis: "Karpal Tünel Sendromu (Bilateral)" },
    { label: "Sol Lat.Epik.", text: "Sol dirsekte Lateral Epikondilit tanısı mevcuttur. Epikondilit bandı kullanması uygundur.", diagnosis: "Lateral Epikondilit (Sol)" },
    { label: "Sağ Lat.Epik.", text: "Sağ dirsekte Lateral Epikondilit tanısı mevcuttur. Epikondilit bandı kullanması uygundur.", diagnosis: "Lateral Epikondilit (Sağ)" },
    { label: "Tabanlık", text: "Pes Planus/Kavus deformitesi nedeniyle tabanlık kullanması uygundur.", diagnosis: "Pes Planus / Pes Kavus" },
    { label: "Sol PAFO", text: "Sol ayak bileğinde düşük ayak deformitesi mevcuttur. Yürüme güvenliği için PAFO kullanması uygundur.", diagnosis: "Düşük Ayak (Sol)" },
    { label: "Sağ PAFO", text: "Sağ ayak bileğinde düşük ayak deformitesi mevcuttur. Yürüme güvenliği için PAFO kullanması uygundur.", diagnosis: "Düşük Ayak (Sağ)" },
    { label: "Bilat PAFO", text: "Her iki ayak bileğinde düşük ayak deformitesi mevcuttur. Yürüme güvenliği için PAFO kullanması uygundur.", diagnosis: "Düşük Ayak (Bilateral)" },
    { label: "Bez", text: "Mesane ve rektum kontrolü yoktur. İdrar ve gaita inkontinansı mevcuttur. Günde 4 adet hazır bez kullanması uygundur.", diagnosis: "İnkontinans" },
    { label: "Sonda 6x1", text: "Nörojenik mesane tanısı mevcuttur. Günde 6 kez TAK (Temiz Aralıklı Kateterizasyon) uygulaması gerekmektedir.", diagnosis: "Nörojenik Mesane" },
    { label: "Sonda 5+1", text: "Nörojenik mesane tanısı mevcuttur. Günde 5 kez TAK ve 1 adet torbalı sonda kullanması gerekmektedir.", diagnosis: "Nörojenik Mesane" },
    { label: "Kısaltma", text: "HR: Hekim Raporu, SKR: Sağlık Kurulu Raporu, UHR: Uzman Hekim Raporu, F: FTR Hekimi, O: Ortopedi Hekimi, N: Nöroloji Hekimi, NŞ: Beyin Cerrahi Hekimi, PC: Plastik Cerrahi Hekimi, G: Geriatri Hekimi", diagnosis: "Kısalık / Ekstremite Eşitsizliği" }
];

export default function PrescriptionGenerator({ onBack }: { onBack: () => void }) {
    const { isAuthenticated } = useAuth();
    const [patientName, setPatientName] = useState('');
    const [institution, setInstitution] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [description, setDescription] = useState(''); // New textarea content
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [doctorInfo, setDoctorInfo] = useState('');

    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);

    const printableRef = useRef<HTMLDivElement>(null);

    // Filter products
    const filteredProducts = PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addProduct = (product: Product) => {
        // Generate a unique instance ID to allow adding same product multiple times
        const newProduct = { ...product, id: Math.random().toString(36).substr(2, 9) };
        setSelectedProducts([...selectedProducts, newProduct]);
    };

    const addQuickAction = (action: QuickAction) => {
        const newProducts = action.items.map(item => ({ ...item, id: Math.random().toString(36).substr(2, 9) }));
        setSelectedProducts([...selectedProducts, ...newProducts]);
    };

    const addQuickTemplate = (tpl: QuickTemplate) => {
        // Set diagnosis if provided
        if (tpl.diagnosis && !diagnosis) {
            setDiagnosis(tpl.diagnosis);
        }

        setDescription(prev => {
            const lines = prev ? prev.split('\n') : [];
            let maxNum = 0;

            // Scan all lines to find the highest number
            lines.forEach(line => {
                const match = line.trim().match(/^(\d+)[\-\)\.]/);
                if (match) {
                    const num = parseInt(match[1]);
                    if (num > maxNum) maxNum = num;
                }
            });

            const nextNum = maxNum + 1;
            const newText = `${nextNum}-) ${tpl.text}`;

            if (!prev) return newText;

            // Ensure proper spacing and handle trailing newlines if any
            return prev.trimEnd() + '\n' + newText;
        });
    };

    const removeProduct = (indexToRemove: number) => {
        setSelectedProducts(selectedProducts.filter((_, index) => index !== indexToRemove));
    };

    const handlePrint = () => {
        window.print();
    };

    const handleClearPrescription = () => {
        setSelectedProducts([]);
        setDescription('');
        setDiagnosis('');
        setPatientName('');
        setInstitution('');
        setIsClearModalOpen(false);
    };

    if (!isAuthenticated) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 dark:border-slate-800 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                    <div className="w-20 h-20 bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock size={40} />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Reçeteci İçin Giriş Yapmalısınız
                    </h2>
                    <p className="text-gray-500 dark:text-slate-400 max-w-lg mx-auto mb-8 text-lg">
                        Profesyonel reçete oluşturucu modülünü kullanmak, ürünleri listelemek ve çıktı almak için lütfen üye girişi yapınız.
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg hover:shadow-gray-300 transform hover:-translate-y-1"
                    >
                        Giriş Yap
                        <ArrowRight size={20} />
                    </Link>

                    {/* Background decoration */}
                    <div className="absolute top-1/2 left-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                    <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-100 rounded-full blur-3xl opacity-20 translate-x-1/4 translate-y-1/4 pointer-events-none"></div>
                </div>

                {/* Blurry Preview Text/Icon */}
                <div className="flex justify-center gap-8 mt-12 opacity-30 pointer-events-none select-none">
                    <div className="flex flex-col items-center">
                        <Stethoscope size={48} className="text-gray-400 mb-2" />
                        <span className="font-bold text-gray-500">Reçete Oluştur</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <Printer size={48} className="text-gray-400 mb-2" />
                        <span className="font-bold text-gray-500">Çıktı Al</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-gray-50 dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800">
            {/* Breadcrumbs */}
            <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 md:px-8 py-3 shrink-0">
                <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    <button
                        onClick={() => onBack()}
                        className="hover:text-blue-600 transition-colors"
                    >
                        <Home size={12} />
                    </button>
                    <ChevronRight size={10} className="shrink-0 opacity-30" />
                    <span className="text-blue-600 dark:text-blue-400">Reçeteci</span>
                </nav>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">

                {/* LEFT PANEL: Prescription Preview (A4) */}
                <div className="w-full lg:w-1/2 p-4 lg:p-8 overflow-y-auto bg-gray-100 dark:bg-slate-900/50 flex justify-center border-b lg:border-r border-gray-200 dark:border-slate-800 lg:h-full">
                    <div
                        ref={printableRef}
                        className="bg-white shadow-xl w-full max-w-[210mm] min-h-[297mm] p-[30px] sm:p-[40px] relative flex flex-col print:shadow-none print:w-full print:h-full print:absolute print:top-0 print:left-0 print:m-0 print:p-[20mm] text-gray-900"
                    >
                        {/* Header */}
                        <div className="border-b-2 border-black pb-4 mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h1 className="text-3xl font-bold tracking-tight text-black">REÇETE</h1>
                                <Stethoscope size={32} className="text-gray-400" />
                            </div>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold w-24">Tarih:</span>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="bg-transparent border-gray-300 focus:border-blue-500 outline-none w-full print:border-none text-gray-900"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold w-24">Kurum:</span>
                                    <input
                                        type="text"
                                        placeholder="SGK / Özel..."
                                        value={institution}
                                        onChange={(e) => setInstitution(e.target.value)}
                                        className="bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none w-full print:border-none print:placeholder-transparent text-gray-900"
                                    />
                                </div>
                                <div className="flex items-center gap-2 col-span-2">
                                    <span className="font-bold w-24">Hasta Adı:</span>
                                    <input
                                        type="text"
                                        placeholder="Adı Soyadı"
                                        value={patientName}
                                        onChange={(e) => setPatientName(e.target.value)}
                                        className="bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none w-full font-medium print:border-none print:placeholder-transparent text-gray-900"
                                    />
                                </div>
                                <div className="flex items-center gap-2 col-span-2">
                                    <span className="font-bold w-24">Tanı:</span>
                                    <input
                                        type="text"
                                        placeholder="ICD Kodu / Tanı..."
                                        value={diagnosis}
                                        onChange={(e) => setDiagnosis(e.target.value)}
                                        className="bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none w-full print:border-none print:placeholder-transparent text-gray-900"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Prescription Body */}
                        <div className="flex-1">
                            <h2 className="text-2xl font-serif italic font-bold mb-2 text-gray-800">Rx /</h2>

                            {description && (
                                <div className="mb-4 whitespace-pre-wrap text-sm font-medium text-gray-700">
                                    {description}
                                </div>
                            )}

                            {selectedProducts.length === 0 ? (
                                <div className="text-gray-300 italic text-center py-20 print:hidden text-sm">
                                    Sağ panelden ürün seçiniz...
                                </div>
                            ) : (
                                <ul className="list-decimal list-inside space-y-4 text-gray-900 leading-relaxed font-medium">
                                    {selectedProducts.map((p, index) => (
                                        <li key={index} className="pl-2 group relative">
                                            <span className="uppercase">{p.name}</span> <br />
                                            <span className="text-sm font-normal ml-6 block text-gray-700">
                                                {p.code ? `(${p.code})` : ''} {p.info}
                                            </span>
                                            <button
                                                onClick={() => removeProduct(index)}
                                                className="absolute -left-6 top-1 text-red-300 hover:text-red-500 print:hidden opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="mt-8">
                            <div className="text-xs text-gray-500 text-center italic mb-8 border-t border-gray-200 pt-2">
                                “Sistemlerin çalışmaması nedeniyle e-reçete düzenlenememiştir.”
                            </div>

                            <div className="flex justify-end">
                                <div className="w-1/3 text-center">
                                    <div className="h-20 mb-2 flex items-end justify-center">
                                        {/* Kaşe Space */}
                                        {doctorInfo && <p className="text-sm font-bold whitespace-pre-line">{doctorInfo}</p>}
                                    </div>
                                    <div className="border-t border-black pt-1">
                                        <p className="font-bold text-sm">Doktor Kaşe / İmza</p>
                                        <textarea
                                            placeholder="Dr. Adı Soyadı&#10;Dip. No: ..."
                                            value={doctorInfo}
                                            onChange={(e) => setDoctorInfo(e.target.value)}
                                            className="w-full text-center text-xs bg-transparent outline-none resize-none h-12 mt-1 print:hidden focus:bg-gray-50 text-gray-900"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Branding Watermark (Optional) */}
                        <div className="absolute bottom-2 left-4 text-[10px] text-gray-300 print:hidden">
                            FTR Online RX Modülü
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: Controls & Search */}
                <div className="w-full lg:w-1/2 flex flex-col h-1/2 lg:h-full bg-white dark:bg-slate-900 print:hidden">

                    {/* Search Bar */}
                    <div className="p-4 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Ürün adı veya kodu ara (ör: OP1535, Dizlik)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm font-medium text-gray-900 dark:text-white"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">

                        {/* Filtered Products List */}
                        {searchTerm ? (
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Arama Sonuçları</h3>
                                <div className="space-y-2">
                                    {filteredProducts.length > 0 ? (
                                        filteredProducts.map(product => (
                                            <button
                                                key={product.id}
                                                onClick={() => addProduct(product)}
                                                className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group flex items-start gap-3"
                                            >
                                                <div className="bg-blue-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 p-2 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-slate-700 transition-colors">
                                                    <PlusCircle size={18} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-800 dark:text-white text-sm">{product.name}</div>
                                                    <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                                                        <span className="font-mono bg-gray-100 dark:bg-slate-800 px-1 rounded mr-1">{product.code}</span>
                                                        {product.info}
                                                    </div>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-400 text-sm">
                                            Sonuç bulunamadı.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Quick Actions Grid */}
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Briefcase size={14} />
                                        Hazır Açıklamalar
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {QUICK_TEMPLATES.map((tpl, i) => (
                                            <button
                                                key={i}
                                                onClick={() => addQuickTemplate(tpl)}
                                                className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-300 text-xs font-medium transition-all text-center h-full truncate"
                                                title={tpl.text}
                                            >
                                                {tpl.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 dark:border-slate-800 pt-4">
                                    <h3 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3">Sık Kullanılan Ürünler</h3>
                                    <div className="space-y-2">
                                        {PRODUCTS.slice(0, 5).map(product => (
                                            <button
                                                key={product.id}
                                                onClick={() => addProduct(product)}
                                                className="w-full text-left p-3 rounded-lg border border-gray-100 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all flex items-center justify-between group"
                                            >
                                                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{product.name}</span>
                                                <Plus size={16} className="text-gray-300 dark:text-slate-600 group-hover:text-gray-600 dark:group-hover:text-slate-400" />
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setSearchTerm(' ')} // Trigger list view
                                            className="w-full py-2 text-xs text-blue-600 dark:text-blue-400 hover:underline text-center"
                                        >
                                            Tüm Ürünleri Gör
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer Controls */}
                    <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800">
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsClearModalOpen(true)}
                                className="flex-1 py-3 px-4 rounded-xl border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center gap-2 transition-all transition-colors"
                            >
                                <Trash2 size={18} />
                                Temizle
                            </button>
                            <button
                                onClick={handlePrint}
                                className="flex-[2] py-3 px-4 rounded-xl bg-gray-900 dark:bg-blue-600 text-white font-bold hover:bg-black dark:hover:bg-blue-700 shadow-lg shadow-gray-200 dark:shadow-blue-900/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <Printer size={18} />
                                YAZDIR
                            </button>
                        </div>
                    </div>
                </div>

                {/* Print Styles */}
                <style jsx global>{`
                @media print {
                    @page { margin: 0; size: auto; }
                    body * { visibility: hidden; }
                    .print\\:hidden { display: none !important; }
                    .print\\:block { display: block !important; }
                    /* Make the printable ref visible and full page */
                    html, body { height: 100%; margin: 0 !important; padding: 0 !important; overflow: hidden; }
                }
            `}</style>
                <style>{`
                /* Specific targeting for print to ensure ref visibility */
                @media print {
                   div[class*="bg-white shadow-xl"] {
                        visibility: visible !important;
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                        margin: 0 !important;
                        padding: 20mm !important;
                        box-shadow: none !important;
                        z-index: 9999;
                   }
                   div[class*="bg-white shadow-xl"] * {
                       visibility: visible !important;
                   }
                }
            `}</style>

                {/* Confirm Modal */}
                <ConfirmModal
                    isOpen={isClearModalOpen}
                    title="Reçeteyi Temizle"
                    message="Tüm reçete içeriği, hasta bilgileri ve seçilen ürünler silinecek. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?"
                    onConfirm={handleClearPrescription}
                    onCancel={() => setIsClearModalOpen(false)}
                />
            </div>
        </div>
    );
}
