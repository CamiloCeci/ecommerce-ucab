const API_URL = 'https://fakestoreapi.com/products';

async function inicializarBaseDeDatos() {
    // 1. Inicializar Productos desde la API si no existen
    if (!localStorage.getItem('productosLocal')) {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            localStorage.setItem('productosLocal', JSON.stringify(data));
        } catch (err) {
            console.warn('⚠️ Modo Offline detectado al inicializar. Usando plantilla de emergencia.');
            localStorage.setItem('productosLocal', JSON.stringify([
                { id: 1, title: "Producto Offline Eco", price: 29.99, category: "Electrónica", description: "Modo sin conexión activo", image: "https://picsum.photos/200" }
            ]));
        }
    }

    // 2. Crear Administrador por defecto si no existen usuarios
    if (!localStorage.getItem('usuarios')) {
        const adminPredeterminado = [
            { name: "Admin UCAB", email: "admin@ucab.ve", password: "123", role: "Administrador", avatar: "", address: "Sede Montalbán" },
            { name: "Cliente Demo", email: "cliente@ucab.ve", password: "123", role: "Cliente", avatar: "", address: "Caracas, Venezuela" }
        ];
        localStorage.setItem('usuarios', JSON.stringify(adminPredeterminado));
    }

    // 3. Inicializar tablas de soporte vacías
    if (!localStorage.getItem('ventas')) localStorage.setItem('ventas', JSON.stringify([]));
    if (!localStorage.getItem('reviews')) localStorage.setItem('reviews', JSON.stringify([]));
}

// Ejecución inmediata al cargar el script
inicializarBaseDeDatos();