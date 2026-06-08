// 1. Manejo del Tema Oscuro con persistencia [cite: 44, 45]
const themeToggleBtn = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme') || 'light';

document.documentElement.setAttribute('data-theme', currentTheme);

themeToggleBtn.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    let newTheme = theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme); // Se guarda la preferencia [cite: 45]
});

// 2. Poblar el catálogo inicialmente [cite: 56, 57]
async function initCatalog() {
    if (!localStorage.getItem('productosLocal')) {
        try {
            const response = await fetch('https://fakestoreapi.com/products');
            const data = await response.json();
            localStorage.setItem('productosLocal', JSON.stringify(data));
        } catch (error) {
            console.error("Error cargando API, verificando Service Worker", error);
        }
    }
}

// 3. Indicador de Red (Online / Offline) 
function updateNetworkStatus() {
    const statusDiv = document.getElementById('network-status');
    if (navigator.onLine) {
        statusDiv.textContent = '🟢 Online';
        statusDiv.className = 'status-online';
        // Aquí iría la lógica para procesar la "cola de espera" de compras offline 
    } else {
        statusDiv.textContent = '🔴 Offline';
        statusDiv.className = 'status-offline';
    }
}

window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);

// 4. Registro del Service Worker para carga sin internet 
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/js/sw.js').then(registration => {
            console.log('SW registrado con éxito: ', registration.scope);
        }).catch(err => {
            console.log('Fallo el registro del SW: ', err);
        });
    });
}

// Inicialización
initCatalog();
updateNetworkStatus();