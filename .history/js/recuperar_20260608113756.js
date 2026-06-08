document.addEventListener('DOMContentLoaded', () => {
    const recoverForm = document.getElementById('recover-form');

    if (recoverForm) {
        recoverForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('recover-email').value.trim();
            const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
            
            const usuarioExiste = usuarios.find(u => u.email === email);

            if (usuarioExiste) {
                alert(`🔑 [Simulación Web] Se ha enviado un enlace de recuperación al correo: ${email}.\nSu clave actual es: ${usuarioExiste.password}`);
            } else {
                alert('❌ El correo electrónico ingresado no coincide con ningún usuario registrado.');
            }
        });
    }
});