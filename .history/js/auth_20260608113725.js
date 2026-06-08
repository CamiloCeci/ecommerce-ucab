document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');

    // Manejo de Inicio de Sesión
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
            const usuarioEncontrado = usuarios.find(u => u.email === email && u.password === password);

            if (usuarioEncontrado) {
                localStorage.setItem('sesion', JSON.stringify(usuarioEncontrado));
                // Redirección selectiva e inmediata por Rol
                if (usuarioEncontrado.role === 'Administrador') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'cliente.html';
                }
            } else {
                alert('❌ Credenciales inválidas. Inténtalo de nuevo.');
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

    // Proteger Rutas y Vistas según Rol (Control de Acceso)
    verificarSeguridadRutas();
});

function verificarSeguridadRutas() {
    const rutaActual = window.location.pathname;
    const sesion = JSON.parse(localStorage.getItem('sesion'));

    if (rutaActual.includes('cliente.html')) {
        if (!sesion || sesion.role !== 'Cliente') {
            alert('🚫 Acceso denegado. Se requieren permisos de Cliente.');
            window.location.href = 'index.html';
        }
    }

    if (rutaActual.includes('admin.html')) {
        if (!sesion || sesion.role !== 'Administrador') {
            alert('🚫 Área Restringida. Solo personal de Administración.');
            window.location.href = 'index.html';
        }
    }
}