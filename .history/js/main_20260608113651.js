// Manejo del Tema Claro / Oscuro con Persistencia
document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const theme = document.documentElement.getAttribute('data-theme');
            const newTheme = theme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
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