document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Capturar datos directo de los campos del formulario
            const name = document.getElementById('reg-name').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const password = document.getElementById('reg-password').value;
            const avatar = document.getElementById('reg-avatar').value.trim() || 'https://picsum.photos/100';
            const address = document.getElementById('reg-address').value.trim();
            const role = document.getElementById('reg-role').value;

            // Obtener usuarios anteriores
            let listaUsuarios = [];
            const datosLocales = localStorage.getItem('usuarios');
            if (datosLocales) {
                listaUsuarios = JSON.parse(datosLocales);
            }

            // Validar correo repetido
            const existe = listaUsuarios.some(u => u.email.toLowerCase() === email.toLowerCase());
            if (existe) {
                alert('⚠️ Este correo electrónico ya se encuentra registrado.');
                return;
            }

            // Insertar el nuevo usuario en el array
            const nuevoUsuario = { name, email, password, avatar, address, role };
            listaUsuarios.push(nuevoUsuario);

            // Guardar inmediatamente en la base de datos local
            localStorage.setItem('usuarios', JSON.stringify(listaUsuarios));

            // Auto-logueo inmediato para que las páginas privadas le den acceso
            localStorage.setItem('sesion', JSON.stringify(nuevoUsuario));

            // Alerta de éxito e instrucción de redirección limpia
            alert(`🎉 ¡Cuenta creada con éxito!\nBienvenido: ${name}\nRol asignado: ${role}`);

            if (role === 'Administrador') {
                window.location.assign('admin.html');
            } else {
                window.location.assign('cliente.html');
            }
        });
    }
});