import { connectToDatabase } from '../../config/db';
import corsMiddleware from '../../middleware/cors';

export default async function handler(req, res) {
    await corsMiddleware(req, res, async () => {
        try {
            const { db } = await connectToDatabase();
            const collection = db.collection('articles');

            if (req.method === 'GET') {
                const articles = await collection.find({}).toArray();
                return res.status(200).json(articles);
            }

            if (req.method === 'POST') {
                const { title, content, image } = req.body;
                
                if (!title || !content) {
                    return res.status(400).json({ error: 'Title and content are required' });
                }

                const article = {
                    id: Date.now().toString(),
                    title: title.trim(),
                    content: content.trim(),
                    image: image || '',
                    date: new Date().toLocaleDateString('id-ID')
                };

                await collection.insertOne(article);
                return res.status(200).json(article);
            }

            return res.status(405).json({ error: 'Method not allowed' });
        } catch (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database operation failed' });
        }
    });
}
