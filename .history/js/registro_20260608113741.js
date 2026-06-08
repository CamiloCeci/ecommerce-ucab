document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('reg-name').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const password = document.getElementById('reg-password').value;
            const avatar = document.getElementById('reg-avatar').value.trim() || 'https://picsum.photos/100';
            const address = document.getElementById('reg-address').value.trim();
            const role = document.getElementById('reg-role').value;

            const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

            // Evitar correos duplicados
            if (usuarios.some(user => user.email === email)) {
                alert('⚠️ Este correo electrónico ya está registrado.');
                return;
            }

            // Guardar usuario nuevo
            const nuevoUsuario = { name, email, password, avatar, address, role };
            usuarios.push(nuevoUsuario);
            localStorage.setItem('usuarios', JSON.stringify(usuarios));

            alert('🎉 Cuenta creada con éxito. Ya puedes iniciar sesión.');
            window.location.href = 'index.html';
        });
    }
});