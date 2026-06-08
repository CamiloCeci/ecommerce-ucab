// Manejo del Tema Claro / Oscuro con Persistencia y Emojis Dinámicos
document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    // Leer el tema guardado o por defecto 'light'
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // Aplicar el tema al iniciar
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // Sincronizar el emoji correcto del botón al cargar la página
    if (themeToggleBtn) {
        themeToggleBtn.textContent = currentTheme === 'light' ? '🌙' : '☀️';
        
        // Evento de clic para alternar
        themeToggleBtn.addEventListener('click', () => {
            const theme = document.documentElement.getAttribute('data-theme');
            if (theme === 'light') {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                themeToggleBtn.textContent = '☀️'; // Muestra el sol si está oscuro
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
                themeToggleBtn.textContent = '🌙'; // Muestra la luna si está claro
            }
        });
    }
    
    // Sincronizar estado de red inicial
    updateNetworkStatus();
});

// Monitoreo Dinámico de Red (Online / Offline)
function updateNetworkStatus() {
    const statusDiv = document.getElementById('network-status');
    if (!statusDiv) return;

    if (navigator.onLine) {
        statusDiv.textContent = '🟢 Online';
        statusDiv.className = 'status-online';
        // Procesar cola offline al recuperar internet
        procesarColaVentasOffline();
    } else {
        statusDiv.textContent = '🔴 Offline';
        statusDiv.className = 'status-offline';
    }
}

window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);

// Registro del Service Worker para funcionamiento sin conexión
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('js/sw.js')
            .then(reg => console.log('Service Worker registrado con éxito:', reg.scope))
            .catch(err => console.error('Error al registrar SW:', err));
    });
}

// Procesar compras pendientes guardadas en modo offline
function procesarColaVentasOffline() {
    const cola = JSON.parse(localStorage.getItem('colaVentas')) || [];
    if (cola.length === 0) return;

    const ventas = JSON.parse(localStorage.getItem('ventas')) || [];
    cola.forEach(orden => {
        ventas.push(orden);
    });

    localStorage.setItem('ventas', JSON.stringify(ventas));
    localStorage.removeItem('colaVentas');
    console.log('📦 Órdenes capturadas en modo offline sincronizadas con éxito.');
    
    // Si estamos en la vista de administración, recargar tabla
    if (window.location.pathname.includes('admin.html') && typeof cargarVentas === 'function') {
        cargarVentas();
    }
}