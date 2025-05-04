// Show/Hide password toggle
document.getElementById('togglePassword').addEventListener('click', function() {
    const password = document.getElementById('password');
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
});

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    errorDiv.style.animation = 'none';
    void errorDiv.offsetWidth; // Trigger reflow
    errorDiv.style.animation = 'shake 0.5s ease';
}

// Add form submit handler
document.getElementById('loginForm').addEventListener('submit', handleLogin);

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'admin' && password === 'somalangu') {
        sessionStorage.setItem('adminLoggedIn', 'true');
        sessionStorage.setItem('adminUsername', username);
        sessionStorage.setItem('loginTime', new Date().toISOString());
        
        window.location.href = '../admin/dashboard.html';
    } else {
        showError('Username atau password salah!');
    }
}

// Check if already logged in
window.addEventListener('load', () => {
    if (sessionStorage.getItem('adminLoggedIn')) {
        window.location.href = '../admin/dashboard.html';
    }
});

// Prevent page caching
document.addEventListener('DOMContentLoaded', () => {
    // Prevent caching of this page
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = function () {
        window.history.pushState(null, '', window.location.href);
    };
});
