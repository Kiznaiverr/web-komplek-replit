import { API_URL } from '../config/api.js';

async function loadArticleDetail() {
    const articleId = new URLSearchParams(window.location.search).get('id');
    const container = document.getElementById('articleContent');

    if (!articleId) {
        window.location.href = 'articles.html';
        return;
    }

    try {
        const response = await fetch('/data/articles.json');
        const articles = await response.json();
        const article = articles.find(a => a.id === articleId);
        
        if (!article) {
            throw new Error('Article not found');
        }
        
        container.innerHTML = `
            <article class="article-full">
                <h1 class="article-title">${article.title}</h1>
                <div class="article-meta">
                    <span><i class="far fa-calendar"></i> ${article.date}</span>
                    <span><i class="far fa-user"></i> Admin</span>
                </div>
                <div class="article-featured-image">
                    <img src="${article.image || 'img/articles/fallback.jpeg'}" 
                         alt="${article.title}"
                         onerror="this.src='img/articles/fallback.jpeg'">
                </div>
                <div class="article-body">
                    ${article.content}
                </div>
            </article>
        `;
    } catch (err) {
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>${err.message === 'Article not found' ? 
                    'Artikel tidak ditemukan' : 
                    'Gagal memuat artikel. Silakan coba lagi nanti.'}</p>
                <a href="articles.html" class="btn">Kembali ke Daftar Artikel</a>
            </div>
        `;
        console.error('Error:', err);
    }
}

document.addEventListener('DOMContentLoaded', loadArticleDetail);
