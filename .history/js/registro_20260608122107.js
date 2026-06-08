document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            // 1. Detener la recarga automática del formulario para proteger la escritura de datos
            e.preventDefault();

            // 2. Capturar y limpiar los valores de los inputs
            const name = document.getElementById('reg-name').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const password = document.getElementById('reg-password').value;
            const avatar = document.getElementById('reg-avatar').value.trim() || 'https://picsum.photos/100';
            const address = document.getElementById('reg-address').value.trim();
            const role = document.getElementById('reg-role').value;

            // 3. Recuperar la lista de usuarios existentes de forma segura
            let usuarios = [];
            try {
                usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
            } catch (err) {
                console.error("Error al leer la tabla de usuarios:", err);
                usuarios = [];
            }

            // 4. Validar de forma estricta que el correo electrónico no esté duplicado
            const correoDuplicado = usuarios.some(user => user.email.toLowerCase() === email.toLowerCase());
            if (correoDuplicado) {
                alert(`⚠️ El correo electrónico [${email}] ya se encuentra registrado en el sistema UCAB.`);
                return;
            }

            // 5. Construir el nuevo objeto de usuario con sus propiedades obligatorias
            const nuevoUsuario = { 
                name, 
                email, 
                password, 
                avatar, 
                address, 
                role 
            };

            // 6. Insertar el nuevo registro en el arreglo y persistirlo en LocalStorage
            usuarios.push(nuevoUsuario);
            localStorage.setItem('usuarios', JSON.stringify(usuarios));

            // 7. FEEDBACK VISUAL EXITOSO: Informar de inmediato al estudiante/admin
            alert(`🎉 ¡Registro Exitoso!\n\nBienvenido, ${name}.\nTu cuenta con el rol de [${role}] ha sido creada e indexada correctamente.`);

            // 8. INICIAR SESIÓN AUTOMÁTICA: Guardamos el usuario en la tabla 'sesion' para saltar el login
            localStorage.setItem('sesion', JSON.stringify(nuevoUsuario));

            // 9. REDIRECCIÓN DINÁMICA POR ROL: Despachar directo al panel correspondiente
            console.log(`Redirigiendo usuario con rol: ${role}`);
            if (role === 'Administrador') {
                window.location.replace('admin.html');
            } else {
                window.location.replace('cliente.html');
            }
        });
    }
});