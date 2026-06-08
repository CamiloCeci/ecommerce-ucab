document.addEventListener('DOMContentLoaded', () => {
    const editForm = document.getElementById('edit-profile-form');
    const btnVolver = document.querySelector(".btn-secondary[onclick*='cliente.html']");
    const sesionActual = JSON.parse(localStorage.getItem('sesion'));

    // 1. CONTROL DE ACCESO: Si intenta ingresar sin sesión activa, rebota al login
    if (!sesionActual) {
        window.location.href = 'login.html';
        return;
    }

    // 2. COMPORTAMIENTO DINÁMICO DEL BOTÓN "VOLVER" EN EL ENCABEZADO
    // Si el usuario es Administrador, cambiamos la ruta del botón para que no lo mande a la vista de cliente
    if (btnVolver && sesionActual.role === 'Administrador') {
        btnVolver.setAttribute('onclick', "window.location.href='admin.html'");
        btnVolver.textContent = 'Volver al Panel Admin';
    }

    // 3. PRECARGAR LOS DATOS ACTUALES EN LOS INPUTS DEL FORMULARIO
    if (editForm) {
        document.getElementById('edit-name').value = sesionActual.name;
        document.getElementById('edit-email').value = sesionActual.email; // Campo deshabilitado (disabled) en el HTML
        document.getElementById('edit-avatar').value = sesionActual.avatar || '';
        document.getElementById('edit-address').value = sesionActual.address;

        // 4. EVENTO SUBMIT: PROCESAR Y PERSISTIR LAS MODIFICACIONES
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Capturar los nuevos valores ingresados por el usuario
            const nuevoNombre = document.getElementById('edit-name').value.trim();
            const nuevoAvatar = document.getElementById('edit-avatar').value.trim() || 'https://picsum.photos/100';
            const nuevaDireccion = document.getElementById('edit-address').value.trim();

            // Modificar las propiedades del objeto en la sesión en memoria
            sesionActual.name = nuevoNombre;
            sesionActual.avatar = nuevoAvatar;
            sesionActual.address = nuevaDireccion;

            // Guardar la sesión actualizada del usuario activo
            localStorage.setItem('sesion', JSON.stringify(sesionActual));

            // 5. SINCRONIZACIÓN CRUZADA: Actualizar el registro permanente en la tabla global de 'usuarios'
            let listaUsuarios = [];
            try {
                listaUsuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
            } catch (err) {
                listaUsuarios = [];
            }
            
            // Mapeamos el arreglo para sustituir únicamente al usuario que coincide con el correo de la sesión
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

            // Persistir la lista maestra actualizada
            localStorage.setItem('usuarios', JSON.stringify(listaUsuarios));

            // 6. FEEDBACK VISUAL INMEDIATO
            alert(`⚙️ ¡Perfil de ${sesionActual.role} Actualizado!\n\nLos cambios se han guardado con éxito en el almacenamiento local.`);

            // 7. REDIRECCIÓN INTELIGENTE POR ROL
            if (sesionActual.role === 'Administrador') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'cliente.html';
            }
        });
    }
});