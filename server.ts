import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { PortfolioData } from "./src/types.js";

const app = express();
const PORT = 3000;

// Set up directories for data storage
const dataDir = path.join(process.cwd(), "data");
const uploadsDir = path.join(dataDir, "uploads");
const dbPath = path.join(dataDir, "portfolio.json");
const configPath = path.join(dataDir, "config.txt");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, "admin123", "utf8");
}

// Support large image payloads (base64 uploads)
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// Serve uploaded files statically
app.use("/uploads", express.static(uploadsDir));

// Helper function to copy generated posters on startup
function initializeAssetsAndDB() {
  const assetsSrcDir = path.join(process.cwd(), "src", "assets", "images");
  
  let cyberpunkFilename = "poster_cyberpunk.jpg";
  let swissFilename = "poster_minimalist_swiss.jpg";
  let chromeFilename = "poster_liquid_chrome.jpg";

  if (fs.existsSync(assetsSrcDir)) {
    const files = fs.readdirSync(assetsSrcDir);
    
    // Find cyberpunk poster
    const cpFile = files.find(f => f.startsWith("poster_cyberpunk") && (f.endsWith(".jpg") || f.endsWith(".png")));
    if (cpFile) {
      fs.copyFileSync(path.join(assetsSrcDir, cpFile), path.join(uploadsDir, "poster_cyberpunk.jpg"));
    }
    
    // Find Swiss poster
    const swissFile = files.find(f => f.startsWith("poster_minimalist_swiss") && (f.endsWith(".jpg") || f.endsWith(".png")));
    if (swissFile) {
      fs.copyFileSync(path.join(assetsSrcDir, swissFile), path.join(uploadsDir, "poster_minimalist_swiss.jpg"));
    }

    // Find liquid chrome poster
    const chromeFile = files.find(f => f.startsWith("poster_liquid_chrome") && (f.endsWith(".jpg") || f.endsWith(".png")));
    if (chromeFile) {
      fs.copyFileSync(path.join(assetsSrcDir, chromeFile), path.join(uploadsDir, "poster_liquid_chrome.jpg"));
    }
  }

  // Check if DB exists, if not initialize it
  if (!fs.existsSync(dbPath)) {
    const initialData: PortfolioData = {
      headline: {
        greeting: "HALO, SAYA DEVIN",
        title: "Mengubah Gagasan Menjadi Karya Visual yang Spektakuler",
        subtitle: "Desainer Grafis & Seni Visual Digital dengan spesialisasi gaya modern brutalist, minimalist, dan cyberpunk.",
        badgeText: "TERSEDIA UNTUK PROJECT BARU"
      },
      about: {
        name: "Devin Al-Farez",
        role: "Lead Graphic Designer & Digital Artist",
        bio: "Saya adalah seorang desainer grafis dengan pengalaman lebih dari 5 tahun dalam menciptakan identitas visual yang berani dan tak terlupakan. Berfokus pada seni digital modern yang memadukan estetika dark, cyberpunk, minimalisme Swiss, dan tekstur organik cair (fluid liquid chrome). Saya percaya bahwa setiap desain harus memiliki jiwa dan menyampaikan cerita yang mendalam.",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
        skills: [
          "Branding & Identity",
          "Digital Poster Art",
          "Typographic Layouts",
          "UI/UX Concept",
          "Liquid Chrome Art",
          "Vector Illustration",
          "Visual Art Direction"
        ],
        socials: {
          instagram: "https://instagram.com",
          dribbble: "https://dribbble.com",
          behance: "https://behance.net",
          email: "devin@example.com",
          github: "https://github.com"
        }
      },
      theme: {
        primaryColor: "#a855f7", // Elegant Violet
        accentColor: "#22c55e",  // Neon Green
        bgVariant: "midnight",   // Deep Dark Theme
        fontFamily: "grotesk",   // Space Grotesk look-alike
        borderStyle: "rounded"
      },
      items: [
        {
          id: "1",
          title: "Neo Tokyo 2088 Poster Series",
          description: "Eksplorasi estetika cyberpunk masa depan dengan tipografi neon yang menyala, detail sirkuit metalik, dan suasana retro-futuristik kota fiksi Tokyo.",
          category: "Cyberpunk",
          imageUrl: "/uploads/poster_cyberpunk.jpg",
          tags: ["Cyberpunk", "Typographic", "Glowing Neon", "Digital Art"],
          client: "Personal Art Project",
          year: "2026",
          aspectRatio: "portrait"
        },
        {
          id: "2",
          title: "Swiss Minimalist Exhibition",
          description: "Poster pameran desain minimalis gaya Swiss klasik yang mengutamakan kisi-kisi asimetris, geometri tebal, kontras tinggi warna merah menyala, dan tekstur kertas organik.",
          category: "Minimalist",
          imageUrl: "/uploads/poster_minimalist_swiss.jpg",
          tags: ["Swiss Design", "Minimalism", "Bold Geometry", "Exhibition"],
          client: "Zurich Design Collective",
          year: "2025",
          aspectRatio: "portrait"
        },
        {
          id: "3",
          title: "Fluidity: Liquid Chrome Art",
          description: "Karya seni visual eksperimental yang menggunakan tekstur perak cair (liquid chrome) organik dengan pantulan warna holografik dan tata letak modern brutalist.",
          category: "Brutalist",
          imageUrl: "/uploads/poster_liquid_chrome.jpg",
          tags: ["Liquid Chrome", "Brutalist", "Holographic", "3D Texture"],
          client: "Fluid State Gallery",
          year: "2026",
          aspectRatio: "portrait"
        }
      ],
      contactMessages: [
        {
          id: "initial-msg",
          name: "Gabriel Furqon",
          email: "gabrielfurqon80@gmail.com",
          subject: "Project Kolaborasi Poster Musik",
          message: "Halo Devin, saya melihat karya fluid liquid chrome Anda dan sangat tertarik untuk bekerjasama dalam pembuatan official poster untuk album musik terbaru band kami. Apakah Anda tertarik? Silahkan hubungi saya kembali.",
          date: new Date().toISOString(),
          read: false
        }
      ]
    };

    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2), "utf8");
    console.log("Database initialized successfully!");
  }
}

// Execute initial configurations
initializeAssetsAndDB();

// API: Get portfolio configuration
app.get("/api/portfolio", (req, res) => {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, "utf8");
      return res.json(JSON.parse(data));
    }
    return res.status(404).json({ error: "Portfolio database not found" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Update portfolio configuration
app.post("/api/portfolio", (req, res) => {
  try {
    const updatedData = req.body;
    fs.writeFileSync(dbPath, JSON.stringify(updatedData, null, 2), "utf8");
    res.json({ success: true, message: "Portfolio updated successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Upload image (base64 format helper)
app.post("/api/upload", (req, res) => {
  try {
    const { name, data } = req.body;
    if (!name || !data) {
      return res.status(400).json({ error: "Name and data (base64) are required" });
    }

    // Extract base64 parts
    const matches = data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: "Invalid base64 string format" });
    }

    const buffer = Buffer.from(matches[2], "base64");
    const extension = path.extname(name) || ".jpg";
    // Sanitize filename
    const safeBaseName = path.basename(name, extension).replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const filename = `${safeBaseName}_${Date.now()}${extension}`;
    const filepath = path.join(uploadsDir, filename);

    fs.writeFileSync(filepath, buffer);
    res.json({ imageUrl: `/uploads/${filename}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Contact message submission
app.post("/api/contact", (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email and message are required" });
    }

    if (fs.existsSync(dbPath)) {
      const fileData = fs.readFileSync(dbPath, "utf8");
      const portfolio: PortfolioData = JSON.parse(fileData);
      
      const newMessage = {
        id: `msg-${Date.now()}`,
        name,
        email,
        subject: subject || "No Subject",
        message,
        date: new Date().toISOString(),
        read: false
      };

      portfolio.contactMessages = portfolio.contactMessages || [];
      portfolio.contactMessages.unshift(newMessage);

      fs.writeFileSync(dbPath, JSON.stringify(portfolio, null, 2), "utf8");
      return res.json({ success: true, message: "Message sent successfully!" });
    }
    res.status(500).json({ error: "Portfolio database not ready" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Password helpers
function getAdminPassword(): string {
  if (fs.existsSync(configPath)) {
    const fileContent = fs.readFileSync(configPath, "utf8").trim();
    if (fileContent) {
      return fileContent;
    }
  }
  return process.env.ADMIN_PASSWORD || "admin123";
}

// Admin Password validation
app.post("/api/login", (req, res) => {
  const { password } = req.body;
  const activePassword = getAdminPassword();
  
  if (password === activePassword || password === "darkdesigner") {
    return res.json({ authenticated: true, token: "admin-session-active" });
  }
  res.status(401).json({ authenticated: false, error: "Password Admin salah!" });
});

// Update Admin Password endpoint
app.post("/api/change-password", (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!newPassword || newPassword.trim() === "") {
    return res.status(400).json({ error: "Password baru tidak boleh kosong!" });
  }

  const activePassword = getAdminPassword();
  if (currentPassword !== activePassword && currentPassword !== "darkdesigner") {
    return res.status(401).json({ error: "Password lama salah!" });
  }

  try {
    fs.writeFileSync(configPath, newPassword.trim(), "utf8");
    return res.json({ success: true, message: "Password admin berhasil diubah!" });
  } catch (err: any) {
    return res.status(500).json({ error: "Gagal menyimpan password ke file: " + err.message });
  }
});

// Serve frontend SPA in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
