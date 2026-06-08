document.addEventListener('DOMContentLoaded', () => {
    const loginPageForm = document.getElementById('login-page-form');
    const logoutBtn = document.getElementById('logout-btn');

    // Manejo de Inicio de Sesión desde login.html
    if (loginPageForm) {
        loginPageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;

            const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
            const usuarioEncontrado = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

            if (usuarioEncontrado) {
                localStorage.setItem('sesion', JSON.stringify(usuarioEncontrado));
                if (usuarioEncontrado.role === 'Administrador') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'cliente.html';
                }
            } else {
                alert('❌ Credenciales inválidas. Por favor, verifica tu correo y contraseña.');
            }
        });
    }

    // Cierre de Sesión Seguro
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('sesion');
            window.location.href = 'index.html';
        });
    }

    // Ejecutar protección de rutas privadas
    verificarSeguridadRutas();
});

function verificarSeguridadRutas() {
    const rutaActual = window.location.pathname;
    const sesion = JSON.parse(localStorage.getItem('sesion'));

    // SOLUCIÓN: Solo intervenir si el usuario está intentando forzar la entrada a paneles protegidos
    if (rutaActual.includes('cliente.html')) {
        if (!sesion || sesion.role !== 'Cliente') {
            alert('🚫 Acceso denegado. Se requieren permisos de Cliente.');
            window.location.replace('login.html');
        }
    }

    if (rutaActual.includes('admin.html')) {
        if (!sesion || sesion.role !== 'Administrador') {
            alert('🚫 Área Restringida. Solo personal de Administración.');
            window.location.replace('login.html');
        }
    }
}