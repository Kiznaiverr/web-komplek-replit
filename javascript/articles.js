// Load articles from API
async function loadArticles() {
    const container = document.getElementById('articlesContainer');
    
    try {
        const response = await fetch('https://web-komplek-replit.vercel.app/data/articles.json');
        const articles = await response.json();

        if (articles.length === 0) {
            container.innerHTML = `
                <div class="no-articles">
                    <i class="fas fa-newspaper"></i>
                    <p>Belum ada artikel yang tersedia.</p>
                </div>
            `;
            return;
        }

        // Sort articles by date (newest first)
        articles.sort((a, b) => new Date(b.date) - new Date(a.date));

        container.innerHTML = articles.map(article => `
            <article class="article-card">
                <div class="article-image">
                    <img src="${article.image || 'img/articles/fallback.jpeg'}" 
                         alt="${article.title}"
                         onerror="this.src='img/articles/fallback.jpeg'">
                </div>
                <div class="article-content">
                    <div class="article-meta">
                        <span><i class="far fa-calendar"></i> ${article.date}</span>
                        <span><i class="far fa-user"></i> Admin</span>
                    </div>
                    <h3>${article.title}</h3>
                    <p>${article.content.substring(0, 150)}...</p>
                    <a href="article-detail.html?id=${article.id}" class="btn btn-sm">Baca Selengkapnya</a>
                </div>
            </article>
        `).join('');
    } catch (err) {
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Gagal memuat artikel. Silakan coba lagi nanti.</p>
            </div>
        `;
        console.error('Error:', err);
    }
}

// Load articles when page loads
document.addEventListener('DOMContentLoaded', loadArticles);
