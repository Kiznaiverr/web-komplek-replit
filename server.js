const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const sharp = require('sharp');

const app = express();
const PORT = 3000;

// Update CORS configuration untuk izinkan akses dari domain Vercel
app.use(cors({
    origin: ['http://localhost:3000', 'https://web-komplek-replit.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

// Serve static files first
app.use(express.static('.'));

// Ensure upload directories exist
const createUploadDirs = async () => {
    const dirs = [
        path.join(__dirname, 'img'),
        path.join(__dirname, 'img/articles'),
        path.join(__dirname, 'img/articles/uploads')
    ];
    
    for (const dir of dirs) {
        try {
            await fs.access(dir);
        } catch {
            await fs.mkdir(dir, { recursive: true });
        }
    }
};

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'img/articles/uploads/'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'article-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mime = allowedTypes.test(file.mimetype);
        
        if (ext && mime) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed'));
    }
});

// Path to articles.json
const ARTICLES_FILE = path.join(__dirname, 'data', 'articles.json');

// Ensure data directory exists
async function initializeDataDir() {
    const dataDir = path.join(__dirname, 'data');
    try {
        await fs.mkdir(dataDir, { recursive: true });
        try {
            await fs.access(ARTICLES_FILE);
        } catch {
            await fs.writeFile(ARTICLES_FILE, '[]');
        }
    } catch (err) {
        console.error('Error initializing data directory:', err);
    }
}

// API Endpoints
app.get('/api/articles', async (req, res) => {
    try {
        const data = await fs.readFile(ARTICLES_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        res.status(500).json({ error: 'Error reading articles' });
    }
});

// Get single article endpoint
app.get('/api/articles/:id', async (req, res) => {
    try {
        const articles = JSON.parse(await fs.readFile(ARTICLES_FILE, 'utf8'));
        const article = articles.find(a => a.id === req.params.id);
        
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }
        
        res.json(article);
    } catch (err) {
        res.status(500).json({ error: 'Error loading article' });
    }
});

app.post('/api/articles', async (req, res) => {
    try {
        const { title, content, image } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }
        
        const articles = JSON.parse(await fs.readFile(ARTICLES_FILE, 'utf8'));
        const newArticle = {
            id: Date.now().toString(),
            title: title.trim(),
            content: content.trim(),
            image: image, // Store Cloudinary URL
            date: new Date().toLocaleDateString('id-ID')
        };
        
        articles.push(newArticle);
        await fs.writeFile(ARTICLES_FILE, JSON.stringify(articles, null, 2));
        res.json(newArticle);
    } catch (err) {
        console.error('Save error:', err);
        res.status(500).json({ error: 'Error saving article: ' + err.message });
    }
});

app.put('/api/articles/:id', async (req, res) => {
    try {
        const { title, content, image } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }
        
        const articles = JSON.parse(await fs.readFile(ARTICLES_FILE, 'utf8'));
        const index = articles.findIndex(a => a.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Article not found' });
        }
        
        articles[index] = {
            ...articles[index],
            title: title.trim(),
            content: content.trim(),
            image: image ? image.trim() : articles[index].image,
            date: new Date().toLocaleDateString('id-ID')
        };
        
        await fs.writeFile(ARTICLES_FILE, JSON.stringify(articles, null, 2));
        res.json(articles[index]);
    } catch (err) {
        console.error('Update error:', err);
        res.status(500).json({ error: 'Error updating article: ' + err.message });
    }
});

// Update upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        res.json({
            success: true,
            imageUrl: `/img/articles/uploads/${req.file.filename}`
        });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Update delete article endpoint to remove image
app.delete('/api/articles/:id', async (req, res) => {
    try {
        const articles = JSON.parse(await fs.readFile(ARTICLES_FILE, 'utf8'));
        const article = articles.find(a => a.id === req.params.id);
        
        if (article && article.image) {
            const imagePath = path.join(__dirname, article.image);
            try {
                await fs.unlink(imagePath);
            } catch (err) {
                console.error('Error deleting image:', err);
            }
        }
        
        const newArticles = articles.filter(a => a.id !== req.params.id);
        await fs.writeFile(ARTICLES_FILE, JSON.stringify(newArticles, null, 2));
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting article' });
    }
});

// Add endpoint to handle articles.json operations
app.post('/data/articles.json', async (req, res) => {
    try {
        await fs.writeFile(ARTICLES_FILE, JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (err) {
        console.error('Write error:', err);
        res.status(500).json({ error: 'Failed to write articles' });
    }
});

app.get('/data/articles.json', async (req, res) => {
    try {
        const data = await fs.readFile(ARTICLES_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error('Read error:', err);
        res.status(500).json({ error: 'Failed to read articles' });
    }
});

// Initialize directories and start server
Promise.all([createUploadDirs(), initializeDataDir()])
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Initialization error:', err);
    });
