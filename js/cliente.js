// Arreglo del carrito en memoria persistente
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

document.addEventListener('DOMContentLoaded', () => {
    renderizarPerfilCliente();
    renderizarCatálogoDinámico();
    renderizarCarritoCliente();
    renderizarReviewsMuro();
    poblarSelectReviews();

    // Eventos de los Filtros en Tiempo Real
    document.getElementById('search-input')?.addEventListener('input', ejecutarFiltrosCruzados);
    document.getElementById('category-filter')?.addEventListener('change', ejecutarFiltrosCruzados);
    document.getElementById('price-filter')?.addEventListener('input', (e) => {
        document.getElementById('price-value').textContent = e.target.value;
        ejecutarFiltrosCruzados();
    });

    // Envío del Checkout
    document.getElementById('checkout-form')?.addEventListener('submit', procesarPasarelaPago);

    // Envío de Reseñas
    document.getElementById('add-review-form')?.addEventListener('submit', publicarReviewCliente);
});

// 1. Mostrar información del usuario logueado
function renderizarPerfilCliente() {
    const contenedor = document.getElementById('profile-display');
    const sesion = JSON.parse(localStorage.getItem('sesion'));
    if (!contenedor || !sesion) return;

    contenedor.innerHTML = `
        <div class="lb-avatar" style="background-image: url('${sesion.avatar || 'https://picsum.photos/100'}'); background-size: cover; float: left; margin-right: 15px; width: 50px; height: 50px; border-radius: 50%;"></div>
        <div>
            <strong>Estudiante:</strong> ${sesion.name} | <small>Rol: ${sesion.role}</small><br>
            <small>📍 Despacho en: ${sesion.address}</small>
        </div>
        <div class="clear-fix"></div>
    `;
}

// 2. Renderizar catálogo leyendo desde LocalStorage (poblado con FakeStoreAPI)
function renderizarCatálogoDinámico() {
    const grid = document.getElementById('products-grid');
    const productos = JSON.parse(localStorage.getItem('productosLocal')) || [];
    if (!grid) return;

    grid.innerHTML = '';
    if (productos.length === 0) {
        grid.innerHTML = '<p class="txt-centered txt-muted">No hay productos en stock de FakeStoreAPI.</p>';
        return;
    }

    productos.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image-container">
                <img src="${p.image}" alt="${p.title}">
            </div>
            <div class="product-title" title="${p.title}">${p.title}</div>
            <div class="product-price">$${parseFloat(p.price).toFixed(2)}</div>
            <button class="btn-primary btn-full-width" onclick="agregarAlCarritoCliente(${p.id})">Agregar al Carrito</button>
        `;
        grid.appendChild(card);
    });

    actualizarCategoriasFiltro(productos);
}

// Generar dinámicamente las categorías reales que provee FakeStoreAPI
function actualizarCategoriasFiltro(productos) {
    const select = document.getElementById('category-filter');
    if (!select || select.children.length > 1) return; 

    const categorias = [...new Set(productos.map(p => p.category))];
    categorias.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
        select.appendChild(opt);
    });
}

// 3. Buscador, Categorías y Rango de Precios operando simultáneamente
function ejecutarFiltrosCruzados() {
    const busqueda = document.getElementById('search-input').value.toLowerCase();
    const categoria = document.getElementById('category-filter').value;
    const precioMax = parseFloat(document.getElementById('price-filter').value);

    const productos = JSON.parse(localStorage.getItem('productosLocal')) || [];
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';

    productos.forEach(p => {
        const cumpleBusqueda = p.title.toLowerCase().includes(busqueda);
        const cumpleCategoria = (categoria === 'all' || p.category === categoria);
        const cumplePrecio = parseFloat(p.price) <= precioMax;

        if (cumpleBusqueda && cumpleCategoria && cumplePrecio) {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-image-container">
                    <img src="${p.image}">
                </div>
                <div class="product-title" title="${p.title}">${p.title}</div>
                <div class="product-price">$${parseFloat(p.price).toFixed(2)}</div>
                <button class="btn-primary btn-full-width" onclick="agregarAlCarritoCliente(${p.id})">Agregar al Carrito</button>
            `;
            grid.appendChild(card);
        }
    });
}

// 4. Lógica operativa del Carrito de Compras (Agregar, Clonar, Restar, Eliminar)
window.agregarAlCarritoCliente = function(id) {
    const productos = JSON.parse(localStorage.getItem('productosLocal')) || [];
    const prod = productos.find(p => p.id === id);
    if (!prod) return;

    const itemEnCarrito = carrito.find(item => item.id === id);
    if (itemEnCarrito) {
        itemEnCarrito.cantidad++;
    } else {
        carrito.push({ ...prod, cantidad: 1 });
    }
    guardarYActualizarCarrito();
};

window.clonarItemCarrito = function(index) {
    // Clonación: duplica la cantidad completa del ítem seleccionado en el estado actual
    if (carrito[index]) {
        carrito[index].cantidad *= 2; 
        guardarYActualizarCarrito();
    }
};

window.cambiarCantidadCarrito = function(index, delta) {
    if (!carrito[index]) return;
    carrito[index].cantidad += delta;
    if (carrito[index].cantidad <= 0) {
        carrito.splice(index, 1);
    }
    guardarYActualizarCarrito();
};

window.eliminarItemCarrito = function(index) {
    if (carrito[index]) {
        carrito.splice(index, 1);
        guardarYActualizarCarrito();
    }
};

function guardarYActualizarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    renderizarCarritoCliente();
}

function renderizarCarritoCliente() {
    const container = document.getElementById('cart-container');
    if (!container) return;

    container.innerHTML = '';
    if (carrito.length === 0) {
        container.innerHTML = '<p class="txt-centered txt-muted">El carrito está vacío.</p>';
        document.getElementById('cart-subtotal').textContent = '0.00';
        document.getElementById('cart-total').textContent = '0.00';
        return;
    }

    let subtotalAcumulado = 0;

    carrito.forEach((item, index) => {
        const costeFila = parseFloat(item.price) * item.cantidad;
        subtotalAcumulado += costeFila;

        const fila = document.createElement('div');
        fila.className = 'cart-item';
        fila.innerHTML = `
            <div class="cart-item-info">
                <strong>${item.title.substring(0, 20)}...</strong><br>
                <small>$${parseFloat(item.price).toFixed(2)} x ${item.cantidad} = $${costeFila.toFixed(2)}</small>
            </div>
            <div class="cart-item-actions">
                <button class="qty-btn" onclick="cambiarCantidadCarrito(${index}, 1)" title="Sumar 1">+</button>
                <button class="qty-btn" onclick="cambiarCantidadCarrito(${index}, -1)" title="Restar 1">-</button>
                <button class="qty-btn" style="background-color: var(--color-primary); color: #fff;" onclick="clonarItemCarrito(${index})" title="Clonar cantidad (x2)">👯</button>
                <button class="btn-danger" style="padding: 0.2rem 0.4rem; font-size: 0.75rem;" onclick="eliminarItemCarrito(${index})" title="Eliminar ítem">🗑️</button>
            </div>
            <div class="clear-fix"></div>
        `;
        container.appendChild(fila);
    });

    // Asignación automática calculada de subtotales y totales
    document.getElementById('cart-subtotal').textContent = subtotalAcumulado.toFixed(2);
    document.getElementById('cart-total').textContent = subtotalAcumulado.toFixed(2);
}

// 5. Pasarela de Pago y Captura de Órdenes (Soporta Offline de forma transparente)
function procesarPasarelaPago(e) {
    e.preventDefault();
    if (carrito.length === 0) {
        alert('🛒 Tu carrito de compras se encuentra vacío.');
        return;
    }

    const sesion = JSON.parse(localStorage.getItem('sesion'));
    const subtotal = carrito.reduce((acc, i) => acc + (parseFloat(i.price) * i.cantidad), 0);
    
    // Generación estructurada del objeto de la orden de compra
    const nuevaOrden = {
        idOrden: 'UCAB-' + Date.now().toString().slice(-6),
        cliente: sesion.name,
        productos: carrito.map(i => `${i.title.substring(0,15)}... (${i.cantidad})`).join(', '),
        total: subtotal.toFixed(2),
        estado: 'Pendiente'
    };

    if (navigator.onLine) {
        const ventas = JSON.parse(localStorage.getItem('ventas')) || [];
        ventas.push(nuevaOrden);
        localStorage.setItem('ventas', JSON.stringify(ventas));
        alert(`💳 Pasarela Aprobada.\n\nOrden ${nuevaOrden.idOrden} procesada en línea.\nTotal debitado: $${nuevaOrden.total}`);
    } else {
        // Almacenamiento en cola diferida si el estudiante no tiene cobertura de red en el campus
        const cola = JSON.parse(localStorage.getItem('colaVentas')) || [];
        cola.push(nuevaOrden);
        localStorage.setItem('colaVentas', JSON.stringify(cola));
        alert(`📡 [Modo Offline Activo]\n\nTu pago ha sido validado y guardado en el almacenamiento local. Se transmitirá al administrador automáticamente al recuperar conexión.`);
    }

    // Vaciar carrito tras la venta exitosa
    carrito = [];
    guardarYActualizarCarrito();
    document.getElementById('checkout-form').reset();
}

// 6. Sub-módulo Complementario de Reseñas (Estilo Letterboxd)
function poblarSelectReviews() {
    const select = document.getElementById('review-product-select');
    const productos = JSON.parse(localStorage.getItem('productosLocal')) || [];
    if (!select) return;
    select.innerHTML = '';
    productos.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.title;
        opt.textContent = p.title.substring(0, 40) + '...';
        select.appendChild(opt);
    });
}

function publicarReviewCliente(e) {
    e.preventDefault();
    const prodSeleccionado = document.getElementById('review-product-select').value;
    const criticaTxt = document.getElementById('review-text').value.trim();
    const estrellaCheck = document.querySelector('input[name="stars"]:checked');

    if (!estrellaCheck) {
        alert('⭐ Selecciona una calificación en estrellas.');
        return;
    }

    const sesion = JSON.parse(localStorage.getItem('sesion'));
    const stringEstrellas = '★'.repeat(parseInt(estrellaCheck.value));

    const reviewObjeto = {
        username: sesion.name,
        producto: prodSeleccionado,
        estrellas: stringEstrellas,
        texto: criticaTxt
    };

    const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    reviews.unshift(reviewObjeto);
    localStorage.setItem('reviews', JSON.stringify(reviews));

    document.getElementById('add-review-form').reset();
    renderizarReviewsMuro();
}

function renderizarReviewsMuro() {
    const contenedor = document.getElementById('letterboxd-reviews-list');
    const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    if (!contenedor) return;

    contenedor.innerHTML = '';
    if (reviews.length === 0) {
        contenedor.innerHTML = '<p class="txt-centered txt-muted" style="padding: 1rem;">No hay críticas en la cartelera todavía.</p>';
        return;
    }

    reviews.forEach(r => {
        const row = document.createElement('div');
        row.className = 'letterboxd-row';
        row.innerHTML = `
            <div class="lb-avatar" style="background-image: url('https://picsum.photos/80?random=${Math.random()}'); background-size: cover;"></div>
            <div class="lb-content">
                <div class="lb-header">
                    <span class="lb-username">@${r.username.replace(/\s+/g, '').toLowerCase()}</span>
                    <span>evaluó <strong>${r.producto.substring(0, 30)}...</strong></span>
                    <span class="lb-stars">${r.estrellas}</span>
                </div>
                <p class="lb-text">"${r.texto}"</p>
            </div>
            <div class="clear-fix"></div>
        `;
        contenedor.appendChild(row);
    });
}