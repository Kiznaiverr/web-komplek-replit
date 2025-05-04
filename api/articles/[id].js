import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import corsMiddleware from '../../middleware/cors';

const ARTICLES_FILE = path.join(process.cwd(), 'data', 'articles.json');

export default async function handler(req, res) {
    // Apply CORS middleware
    await corsMiddleware(req, res, async () => {
        const { id } = req.query;

        if (req.method === 'GET') {
            try {
                const articles = JSON.parse(await readFile(ARTICLES_FILE, 'utf8'));
                const article = articles.find(a => a.id === id);
                
                if (!article) {
                    return res.status(404).json({ error: 'Article not found' });
                }
                
                return res.status(200).json(article);
            } catch (err) {
                return res.status(500).json({ error: 'Error loading article' });
            }
        }

        if (req.method === 'PUT') {
            try {
                const { title, content, image } = req.body;
                
                if (!title || !content) {
                    return res.status(400).json({ error: 'Title and content are required' });
                }
                
                const articles = JSON.parse(await readFile(ARTICLES_FILE, 'utf8'));
                const index = articles.findIndex(a => a.id === id);
                
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
                
                await writeFile(ARTICLES_FILE, JSON.stringify(articles, null, 2));
                return res.status(200).json(articles[index]);
            } catch (err) {
                return res.status(500).json({ error: 'Error updating article' });
            }
        }

        if (req.method === 'DELETE') {
            try {
                const articles = JSON.parse(await readFile(ARTICLES_FILE, 'utf8'));
                const newArticles = articles.filter(a => a.id !== id);
                await writeFile(ARTICLES_FILE, JSON.stringify(newArticles, null, 2));
                return res.status(200).json({ success: true });
            } catch (err) {
                return res.status(500).json({ error: 'Error deleting article' });
            }
        }

        return res.status(405).json({ error: 'Method not allowed' });
    });
}
