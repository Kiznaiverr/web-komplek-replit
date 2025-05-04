import { CLOUDINARY_CONFIG } from '../../config/api.js';
import config from '../config.js';

// Initial variable
let editingImage = null;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize TinyMCE with a promise
    const initEditor = new Promise((resolve) => {
        if (typeof tinymce !== 'undefined') {
            tinymce.init({
                selector: '#content',
                plugins: 'advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table wordcount',
                toolbar: 'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                height: 500,
                setup: function(editor) {
                    editor.on('init', function() {
                        resolve(editor);
                    });
                }
            });
        } else {
            console.error('TinyMCE not loaded');
        }
    });

    // Handle image upload
    const imageUpload = document.getElementById('imageUpload');
    if (imageUpload) {
        imageUpload.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (!file) return;

            // Show loading state
            const preview = document.getElementById('imagePreview');
            preview.innerHTML = '<p>Uploading...</p>';

            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_CONFIG.upload_preset);

            try {
                const response = await fetch(CLOUDINARY_CONFIG.uploadUrl, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) throw new Error('Upload failed');
                
                const data = await response.json();
                const imageUrl = data.secure_url;
                
                // Update preview
                preview.innerHTML = `<img src="${imageUrl}" alt="Preview">`;
                preview.dataset.imageUrl = imageUrl;
            } catch (err) {
                preview.innerHTML = '<p>Upload failed</p>';
                alert('Error uploading image: ' + err.message);
                console.error('Upload error:', err);
            }
        });
    }

    // Handle preview button
    const previewBtn = document.getElementById('previewBtn');
    if (previewBtn) {
        previewBtn.addEventListener('click', async function() {
            const editor = await initEditor;
            const title = document.getElementById('title').value;
            const preview = document.getElementById('imagePreview');
            const imageUrl = preview ? preview.dataset.imageUrl : '';
            const content = editor.getContent();
            
            const previewArea = document.getElementById('previewArea');
            if (previewArea) {
                previewArea.innerHTML = `
                    <h1>${title}</h1>
                    ${imageUrl ? `<img src="${imageUrl}" alt="${title}">` : ''}
                    <div class="article-content">${content}</div>
                `;
                
                document.getElementById('previewModal').style.display = 'block';
            }
        });
    }

    // Handle form submission
    const articleForm = document.getElementById('articleForm');
    if (articleForm) {
        articleForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                const editor = await initEditor;
                const title = document.getElementById('title').value.trim();
                const content = editor.getContent();
                const articleDate = document.getElementById('articleDate').value;
                
                // Get image URL from preview
                const imagePreview = document.getElementById('imagePreview');
                const imageUrl = imagePreview.dataset.imageUrl || editingImage;

                if (!title || !content || !articleDate) {
                    alert('Judul, konten, dan tanggal harus diisi!');
                    return;
                }

                // Read existing articles - update URL
                const response = await fetch('https://web-komplek-replit.vercel.app/data/articles.json');
                let articles = await response.json() || [];

                const articleId = new URLSearchParams(window.location.search).get('id');
                let updatedArticles;

                if (articleId) {
                    // Update existing article
                    updatedArticles = articles.map(article => {
                        if (article.id === articleId) {
                            return {
                                ...article,
                                title,
                                content,
                                image: imageUrl,
                                date: new Date(articleDate).toLocaleDateString('id-ID')
                            };
                        }
                        return article;
                    });
                } else {
                    // Add new article
                    updatedArticles = [...articles, {
                        id: Date.now().toString(),
                        title,
                        content,
                        image: imageUrl,
                        date: new Date(articleDate).toLocaleDateString('id-ID')
                    }];
                }

                // Save to articles.json - update URL
                const saveResponse = await fetch('https://web-komplek-replit.vercel.app/data/articles.json', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedArticles, null, 2)
                });

                if (!saveResponse.ok) {
                    throw new Error('Failed to save article');
                }

                window.location.href = 'dashboard.html';
            } catch (err) {
                console.error('Save error:', err);
                alert('Error saving article: ' + err.message);
            }
        });
    }

    // Load existing article
    const articleId = new URLSearchParams(window.location.search).get('id');
    if (articleId) {
        fetch('https://web-komplek-replit.vercel.app/data/articles.json')
            .then(res => res.json())
            .then(articles => {
                const article = articles.find(a => a.id === articleId);
                if (!article) throw new Error('Article not found');

                document.getElementById('editorTitle').textContent = 'Edit Artikel';
                document.getElementById('title').value = article.title;
                
                // Convert date string to YYYY-MM-DD
                const [day, month, year] = article.date.split('/');
                document.getElementById('articleDate').value = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                
                initEditor.then(editor => {
                    editor.setContent(article.content);
                });
                
                editingImage = article.image;
                if (article.image) {
                    const preview = document.getElementById('imagePreview');
                    preview.innerHTML = `<img src="${article.image}" alt="Preview">`;
                    preview.dataset.imageUrl = article.image;
                }
            })
            .catch(err => {
                console.error('Error loading article:', err);
                alert('Error loading article for editing');
            });
    }

    // Close preview modal
    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            const previewModal = document.getElementById('previewModal');
            if (previewModal) {
                previewModal.style.display = 'none';
            }
        });
    }
});
