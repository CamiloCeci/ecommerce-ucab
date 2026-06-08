document.addEventListener('DOMContentLoaded', () => {
    const editForm = document.getElementById('edit-profile-form');
    const sesionActual = JSON.parse(localStorage.getItem('sesion'));

    // Redirigir al login si intenta entrar a la fuerza sin estar logueado
    if (!sesionActual) {
        window.location.href = 'login.html';
        return;
    }

    // 1. Precargar los datos actuales en los campos correspondientes
    if (editForm) {
        document.getElementById('edit-name').value = sesionActual.name;
        document.getElementById('edit-email').value = sesionActual.email; // Campo deshabilitado en HTML
        document.getElementById('edit-avatar').value = sesionActual.avatar || '';
        document.getElementById('edit-address').value = sesionActual.address;

        // 2. Evento para guardar las modificaciones
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Capturar los nuevos valores
            const nuevoNombre = document.getElementById('edit-name').value.trim();
            const nuevoAvatar = document.getElementById('edit-avatar').value.trim() || 'https://picsum.photos/100';
            const nuevaDireccion = document.getElementById('edit-address').value.trim();

            // Actualizar el objeto de la sesión en memoria
            sesionActual.name = nuevoNombre;
            sesionActual.avatar = nuevoAvatar;
            sesionActual.address = nuevaDireccion;

            // Persistir los cambios en la sesión activa
            localStorage.setItem('sesion', JSON.stringify(sesionActual));

            // Actualizar de forma sincronizada en la base de datos global de usuarios
            let listaUsuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
            
            listaUsuarios = listaUsuarios.map(u => {
                if (u.email.toLowerCase() === sesionActual.email.toLowerCase()) {
                    return {
                        ...u,
                        name: nuevoNombre,
                        avatar: nuevoAvatar,
                        address: nuevaDireccion
                    };
                }
                return u;
            });

            localStorage.setItem('usuarios', JSON.stringify(listaUsuarios));

            // Feedback visual de éxito
            alert('⚙️ ¡Perfil Actualizado!\nLos cambios se guardaron correctamente en la base de datos.');

            // Redirigir de vuelta al panel operativo del cliente
            window.location.href = 'cliente.html';
        });
    }
});