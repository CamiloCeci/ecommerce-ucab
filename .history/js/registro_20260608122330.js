document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');

    if (!registerForm) {
        console.error("⚠️ Error Crítico: No se encontró el formulario '#register-form' en el HTML.");
        return;
    }

    registerForm.addEventListener('submit', (e) => {
        // Evitar que la página se recargue automáticamente
        e.preventDefault();

        // Referencias a los inputs del DOM
        const elName = document.getElementById('reg-name');
        const elEmail = document.getElementById('reg-email');
        const elPassword = document.getElementById('reg-password');
        const elAvatar = document.getElementById('reg-avatar');
        const elAddress = document.getElementById('reg-address');
        const elRole = document.getElementById('reg-role');

        // VALIDACIÓN DE SEGURIDAD INTERNA: Verifica si falta algún elemento en el HTML
        if (!elName || !elEmail || !elPassword || !elAvatar || !elAddress || !elRole) {
            alert("❌ Error de Maquetación: Uno o más campos de texto no tienen el ID correcto en el HTML. Revisa la consola (F12).");
            console.error("Validación de IDs fallida:", { elName, elEmail, elPassword, elAvatar, elAddress, elRole });
            return;
        }

        // Extraer los valores limpios
        const name = elName.value.trim();
        const email = elEmail.value.trim();
        const password = elPassword.value;
        const avatar = elAvatar.value.trim() || 'https://picsum.photos/100';
        const address = elAddress.value.trim();
        const role = elRole.value;

        // Leer base de datos local de usuarios de forma segura
        let usuarios = [];
        try {
            usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        } catch (err) {
            usuarios = [];
        }

        // Comprobar si el correo ya existe
        const correoDuplicado = usuarios.some(user => user.email.toLowerCase() === email.toLowerCase());
        if (correoDuplicado) {
            alert(`⚠️ El correo [${email}] ya se encuentra registrado.`);
            return;
        }

        // Crear objeto de usuario
        const nuevoUsuario = { name, email, password, avatar, address, role };

        // Guardar en la base de datos distribuida de LocalStorage
        usuarios.push(nuevoUsuario);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));

        // Feedback visual
        alert(`🎉 ¡Registro Exitoso!\n\nBienvenido ${name}. Tu cuenta de [${role}] ha sido creada.`);

        // Loguear automáticamente al usuario recién creado
        localStorage.setItem('sesion', JSON.stringify(nuevoUsuario));

        // Redirección forzada inmediata deshabilitando el caché de navegación viejo
        if (role === 'Administrador') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'cliente.html';
        }
    });
});