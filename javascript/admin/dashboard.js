import { API_URL, isProduction } from '../../config/api.js';

// Check authentication function
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    const username = sessionStorage.getItem('adminUsername');
    const loginTime = sessionStorage.getItem('loginTime');

    if (!isLoggedIn || !username || !loginTime) {
        window.location.href = '../admin/login.html';
        return false;
    }
    return true;
}

// Check auth on load
if (!checkAuth()) {
    window.location.href = '../admin/login.html';
}

// Check auth periodically
setInterval(checkAuth, 1000);

// Handle visibility change
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        checkAuth();
    }
});

// Safely get logout button and add event listener
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = '../admin/login.html';
    });
}

// Article management
let articles = [];

// Load articles from data file
async function loadArticles() {
    try {
        const response = await fetch('/data/articles.json');
        if (!response.ok) throw new Error('Failed to fetch articles');
        articles = await response.json() || [];
        renderArticles();
        updateStats();
    } catch (err) {
        console.error('Error loading articles:', err);
        document.getElementById('articlesList').innerHTML = `
            <div class="error-message">
                <p>Failed to load articles. Please try again.</p>
            </div>
        `;
    }
}

const modal = document.getElementById('articleModal');
let editingIndex = -1;

function renderArticles() {
    const list = document.getElementById('articlesList');
    list.innerHTML = articles.map((article, index) => `
        <div class="article-item">
            <div class="article-preview">
                <img src="${article.image || 'img/articles/fallback.jpeg'}" alt="${article.title}" class="article-thumbnail">
                <div>
                    <h3>${article.title}</h3>
                    <p>${article.content.substring(0, 100)}...</p>
                    <span class="article-date">${article.date}</span>
                </div>
            </div>
            <div class="article-actions">
                <button class="btn-primary edit-article" data-index="${index}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-danger delete-article" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    // Add event listeners after rendering
    document.querySelectorAll('.edit-article').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            const article = articles[index];
            window.location.href = `../admin/editor.html?id=${article.id}`;
        });
    });

    document.querySelectorAll('.delete-article').forEach(btn => {
        btn.addEventListener('click', async function() {
            const index = parseInt(this.dataset.index);
            await deleteArticle(index);
        });
    });
}

// Delete article
async function deleteArticle(index) {
    // Create modal dialog
    const modal = document.createElement('div');
    modal.className = 'delete-modal';
    modal.innerHTML = `
        <div class="delete-modal-content">
            <h3><i class="fas fa-exclamation-triangle"></i> Konfirmasi Hapus</h3>
            <p>Apakah Anda yakin ingin menghapus artikel ini?</p>
            <p>Tindakan ini tidak dapat dibatalkan.</p>
            <div class="modal-buttons">
                <button class="btn-secondary cancel-delete">Batal</button>
                <button class="btn-danger confirm-delete">Hapus</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Handle modal actions
    return new Promise((resolve) => {
        modal.querySelector('.cancel-delete').addEventListener('click', () => {
            modal.remove();
            resolve(false);
        });

        modal.querySelector('.confirm-delete').addEventListener('click', async () => {
            try {
                const articles = await fetch('/data/articles.json')
                    .then(res => res.json()) || [];
                
                articles.splice(index, 1);
                
                await fetch('/data/articles.json', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(articles, null, 2)
                });

                modal.remove();
                await loadArticles();
            } catch (err) {
                alert('Error deleting article: ' + err.message);
            }
            resolve(true);
        });

        // Close on click outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                resolve(false);
            }
        });
    });
}

function updateStats() {
    document.getElementById('totalArticles').textContent = articles.length;
}

function openModal(isEdit = false) {
    modal.style.display = 'block';
    document.getElementById('modalTitle').textContent = isEdit ? 'Edit Artikel' : 'Artikel Baru';
}

function closeModal() {
    modal.style.display = 'none';
    document.getElementById('articleForm').reset();
    editingIndex = -1;
}

function saveArticle(event) {
    event.preventDefault();
    
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const image = document.getElementById('imageUrl').value;
    const date = new Date().toLocaleDateString('id-ID');
    
    if (editingIndex > -1) {
        articles[editingIndex] = { 
            id: articles[editingIndex].id,
            title, 
            content,
            image,
            date 
        };
    } else {
        articles.push({ 
            id: Date.now(), // unique identifier
            title, 
            content,
            image,
            date 
        });
    }
    
    localStorage.setItem('articles', JSON.stringify(articles));
    closeModal();
    renderArticles();
    updateStats();
}

// Event Listeners
document.getElementById('newArticleBtn').addEventListener('click', () => {
    window.location.href = '../admin/editor.html';
});
document.getElementById('articleForm').addEventListener('submit', saveArticle);

// Initial load
loadArticles();
