const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const session = require("express-session"); // Oturum yönetimi için
require("dotenv").config();

const app = express();

//AYARLAR
const ADMIN_PASSWORD = "admin123"; // Şifreniz
const PORT = 5000;

// Middleware
app.use(cors());
// Limitleri artırdık (Resimli içerikler için)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, "public")));

//SESSION AYARLARI (GİRİŞ KONTROLÜ İÇİN)
app.use(session({
    secret: 'gizli-anahtar-kelime', // Güvenlik için rastgele bir kelime
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Localhost'ta false olmalı, HTTPS'de true
}));

//ULTER (DOSYA YÜKLEME)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, "public/uploads");
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Veritabanı
const pool = new Pool({
    user: "postgres",
    password: "123456",
    host: "localhost",
    port: 5432,
    database: "postgres"
});

//ARA YAZILIM: GİRİŞ KONTROLÜ (Middleware)
function requireLogin(req, res, next) {
    if (req.session.isAdmin) {
        next(); // Giriş yapmışsa devam et
    } else {
        res.redirect('/admin/login'); // Yapmamışsa login sayfasına at
    }
}

//SAYFA YÖNLENDİRMELERİ

app.get("/admin", (req, res) => {
    if (req.session.isAdmin) {
        res.redirect("/admin/dashboard");
    } else {
        res.redirect("/admin/login");
    }
});
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/about", (req, res) => res.sendFile(path.join(__dirname, "public", "about.html")));
app.get("/contact", (req, res) => res.sendFile(path.join(__dirname, "public", "contact.html")));
app.get("/detail", (req, res) => res.sendFile(path.join(__dirname, "public", "detail.html")));

//LOGIN SAYFASI
app.get("/admin/login", (req, res) => {
    if (req.session.isAdmin) return res.redirect('/admin/dashboard');
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

//DASHBOARD SAYFASI
app.get("/admin/dashboard", requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// --- API ---

// GİRİŞ YAPMA İŞLEMİ (POST)
app.post("/api/login", (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        req.session.isAdmin = true; // Oturumu başlat
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: "Hatalı Şifre!" });
    }
});

// --- SİLME VE GÜNCELLEME İŞLEMLERİ ---

//POST SİL (DELETE)
app.delete("/api/hairstyles/:id", requireLogin, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM hairstyles WHERE id = $1", [id]);
        res.json({ message: "Silindi" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Silinemedi" });
    }
});

//POST GÜNCELLE (PUT) - TARİH GÜNCELLEME EKLENDİ
app.put("/api/hairstyles/:id", requireLogin, upload.single('imageFile'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, summary, category } = req.body;

        let query, params;

        // updated_at = NOW() kısmını sorgulara ekledik
        if (req.file) {
            // Yeni resim var
            const image_url = `/uploads/${req.file.filename}`;
            query = "UPDATE hairstyles SET title=$1, description=$2, summary=$3, category=$4, image_url=$5, updated_at=NOW() WHERE id=$6 RETURNING *";
            params = [title, description, summary, category, image_url, id];
        } else {
            // Resim değişmeyecek
            query = "UPDATE hairstyles SET title=$1, description=$2, summary=$3, category=$4, updated_at=NOW() WHERE id=$5 RETURNING *";
            params = [title, description, summary, category, id];
        }

        const updated = await pool.query(query, params);
        res.json(updated.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Güncellenemedi" });
    }
});

//KATEGORİ SİL (DELETE)
app.delete("/api/categories/:id", requireLogin, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM categories WHERE id = $1", [id]);
        res.json({ message: "Kategori Silindi" });
    } catch (err) {
        res.status(500).json({ message: "Silinemedi" });
    }
});

// --- KATEGORİ API ---

//Kategorileri Getir
app.get("/api/categories", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM categories ORDER BY name ASC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).send("Hata");
    }
});

//Yeni Kategori Ekle
app.post("/api/categories", requireLogin, async (req, res) => {
    try {
        const { name, parent_group } = req.body;
        if (!name) return res.status(400).json({ message: "Kategori adı boş olamaz" });

        const newCat = await pool.query(
            "INSERT INTO categories (name, parent_group) VALUES($1, $2) RETURNING *",
            [name, parent_group || 'Colors']
        );
        res.json(newCat.rows[0]);
    } catch (err) {
        console.error(err);
        if (err.code === '23505') {
            return res.status(400).json({ message: "Bu kategori zaten var." });
        }
        res.status(500).send("Sunucu hatası");
    }
});

// ÇIKIŞ YAPMA İŞLEMİ
app.get("/api/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/admin/login");
});

// PAYLAŞIM SAYISINI ARTIRMA
app.post("/api/hairstyles/:id/share", async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("UPDATE hairstyles SET shares = COALESCE(shares, 0) + 1 WHERE id = $1", [id]);
        res.json({ message: "Paylaşım sayısı artırıldı" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Hata");
    }
});

//Tüm Modelleri Getir
app.get("/api/hairstyles", async (req, res) => {
    try {
        const { category, search, page, limit, sort } = req.query;

        const pageNumber = parseInt(page) || 1;
        const pageSize = parseInt(limit) || 9;
        const offset = (pageNumber - 1) * pageSize;

        let query = "SELECT * FROM hairstyles";
        let countQuery = "SELECT COUNT(*) FROM hairstyles";

        let params = [];
        let conditions = [];

        if (category) {
            conditions.push(`category ILIKE $${params.length + 1}`);
            params.push(`%${category}%`);
        }
        if (search) {
            conditions.push(`(title ILIKE $${params.length + 1} OR description ILIKE $${params.length + 1})`);
            params.push(`%${search}%`);
        }

        if (conditions.length > 0) {
            const whereClause = " WHERE " + conditions.join(" AND ");
            query += whereClause;
            countQuery += whereClause;
        }

        let orderByClause = " ORDER BY id DESC"; // Varsayılan: En Yeni

        if (sort === 'popular' || sort === 'trending') {
            orderByClause = " ORDER BY views DESC";
        } else if (sort === 'hot') {
            orderByClause = " ORDER BY RANDOM()";
        }

        query += orderByClause;
        query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        const queryParams = [...params, pageSize, offset];

        const [dataResult, countResult] = await Promise.all([
            pool.query(query, queryParams),
            pool.query(countQuery, params)
        ]);

        const totalItems = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalItems / pageSize);

        res.json({
            data: dataResult.rows,
            pagination: {
                totalItems,
                totalPages,
                currentPage: pageNumber,
                pageSize
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Sunucu hatası");
    }
});

// GET: Tek Veri
app.get("/api/hairstyles/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("SELECT * FROM hairstyles WHERE id = $1", [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Bulunamadı" });
        await pool.query("UPDATE hairstyles SET views = views + 1 WHERE id = $1", [id]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).send("Hata");
    }
});

// POST: Yeni Veri Ekle
app.post("/api/hairstyles", requireLogin, upload.single('imageFile'), async (req, res) => {
    try {
        const { title, description, summary, category } = req.body;

        if (!req.file) return res.status(400).json({ message: "Resim seçilmedi." });

        const image_url = `/uploads/${req.file.filename}`;
        const finalSummary = summary || description.substring(0, 100) + "...";

        // Yeni eklemede updated_at null kalabilir veya created_at ile aynı olabilir, veritabanı varsayılanı halleder.
        const newHair = await pool.query(
            "INSERT INTO hairstyles (title, image_url, description, summary, category) VALUES($1, $2, $3, $4, $5) RETURNING *",
            [title, image_url, description, finalSummary, category]
        );

        res.json(newHair.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Sunucu hatası");
    }
});

// İLETİŞİM FORMU
app.post("/api/contact", async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ error: "Lütfen tüm alanları doldurunuz." });
        }
        await pool.query(
            "INSERT INTO messages (name, email, message) VALUES ($1, $2, $3)",
            [name, email, message]
        );
        res.json({ success: true, message: "Mesajınız başarıyla alındı." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Sunucu hatası oluştu." });
    }
});

// --- BENZER İÇERİKLER API (YENİ) ---
app.get("/api/hairstyles/:id/related", async (req, res) => {
    try {
        const { id } = req.params;
        const { category } = req.query; // Örn: "Blonde"

        // Mantık: Şu anki ID hariç (id != $1), aynı kategorideki postları rastgele sırala ve 3 tane al.
        let query = "SELECT id, title, image_url, slug FROM hairstyles WHERE id != $1";
        let params = [id];

        if (category) {
            // İlk kategoriyi baz alıyoruz (Virgülle ayrılmışsa backend'e tek parça gelir, like ile ararız)
            // Daha hassas arama için ILIKE kullanıyoruz
            query += " AND category ILIKE $2";
            params.push(`%${category}%`);
        }

        query += " ORDER BY RANDOM() LIMIT 3";

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Hata");
    }
});

// --- AI TRY-ON UÇ NOKTASI (PHASE 2 & 3) ---

// AI GÖRÜNTÜ İŞLEME İÇİN ÖZEL GÜVENLİ DEPOLAMA (GEÇİCİ)
const tempStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const tempDir = path.join(__dirname, "temp_faces");
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'temp_face_' + uniqueSuffix + path.extname(file.originalname));
    }
});
const uploadTemp = multer({ storage: tempStorage });

app.post("/api/ai-tryon", uploadTemp.single('userPhoto'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Fotoğraf yüklenemedi." });
        }

        const userDataStr = req.body.userData;
        let userData = {};
        if (userDataStr) {
            userData = JSON.parse(userDataStr);
        }

        // Prompt Mühendisliği (Mock)
        const prompt = `A photo of a ${userData.age || 'adult'} ${userData.gender || 'person'} with a ${userData.faceShape || 'oval'} face, wearing a ${userData.color || 'natural'} ${userData.texture || 'straight'} ${userData.length || 'medium'} hairstyle`;

        console.log("\n== AI TRY-ON STARTED ==");
        console.log("Uploaded File Saved Temporarily At:", req.file.path);
        console.log("Generated Prompt:", prompt);

        // Faz 3: Yapay Zeka (AI API) Entegrasyonu Mock.
        // Aslında burada Replicate veya Fal.ai'ye req atıp bekleyeceğiz.

        setTimeout(() => {
            // İşlem bittikten sonra fotoğrafı güvenle sil (Güvenlik / GDPR kuralı)
            fs.unlink(req.file.path, (err) => {
                if (err) console.error("Temp file deletion error:", err);
                else console.log("Temp face photo securely deleted.\n");
            });

            // Geriye sahte sonuç dönüyoruz (Mock Data)
            res.json({
                success: true,
                message: "AI analysis and generation complete.",
                generatedImages: [
                    "https://images.unsplash.com/photo-1595476108010-b4d1f10c5144?auto=format&fit=crop&w=400&q=80", // Kıvırcık premium portre
                    "https://images.unsplash.com/photo-1605980776566-0386c9dcfc7d?auto=format&fit=crop&w=400&q=80", // Dalgalı kahverengi
                    "https://images.unsplash.com/photo-1580618672591-eeb7a59af310?auto=format&fit=crop&w=400&q=80", // Erkek/unisex
                    "https://images.unsplash.com/photo-1512496015851-a1dcafb1e4ac?auto=format&fit=crop&w=400&q=80"  // Kadın portre
                ]
            });
        }, 4000); // 4 saniyelik yapay zeka bekleme simülasyonu

    } catch (error) {
        console.error("AI Try-On Error:", error);
        res.status(500).json({ error: "Sunucu hatası oluştu." });
    }
});

app.listen(PORT, () => {
    console.log(`Server çalışıyor: http://localhost:${PORT}`);
});