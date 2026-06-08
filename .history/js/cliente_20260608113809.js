let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

document.addEventListener('DOMContentLoaded', () => {
    renderizarPerfil();
    renderizarCatálogo();
    renderizarCarrito();
    renderizarReviews();
    poblarSelectProductos();

    // Eventos Filtros
    document.getElementById('search-input')?.addEventListener('input', filtrarProductos);
    document.getElementById('category-filter')?.addEventListener('change', filtrarProductos);
    document.getElementById('price-filter')?.addEventListener('input', (e) => {
        document.getElementById('price-value').textContent = e.target.value;
        filtrarProductos();
    });

    // Checkout Form
    document.getElementById('checkout-form')?.addEventListener('submit', procesarCompra);

    // Review Form (Estilo Letterboxd)
    document.getElementById('add-review-form')?.addEventListener('submit', guardarReview);
});

function renderizarPerfil() {
    const contenedor = document.getElementById('profile-display');
    const sesion = JSON.parse(localStorage.getItem('sesion'));
    if (!contenedor || !sesion) return;

    contenedor.innerHTML = `
        <div style="float: left; margin-right: 15px;">
            <img src="${sesion.avatar || 'https://picsum.photos/80'}" style="width:60px; height:60px; border-radius:50%;">
        </div>
        <div>
            <strong>${sesion.name}</strong> (${sesion.role})<br>
            <small>📍 Dirección: ${sesion.address}</small>
        </div>
        <div style="clear:both;"></div>
    `;
}

function renderizarCatálogo() {
    const grid = document.getElementById('products-grid');
    const productos = JSON.parse(localStorage.getItem('productosLocal')) || [];
    if (!grid) return;

    grid.innerHTML = '';
    productos.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image-container">
                <img src="${p.image}" alt="${p.title}">
            </div>
            <div class="product-title">${p.title}</div>
            <div class="product-price">$${p.price.toFixed(2)}</div>
            <button class="btn-primary" onclick="agregarAlCarrito(${p.id})">Agregar al Carrito</button>
        `;
        grid.appendChild(card);
    });
    actualizarCategoriasSelect(productos);
}

function actualizarCategoriasSelect(productos) {
    const select = document.getElementById('category-filter');
    if (!select || select.children.length > 1) return; 
    const categorias = [...new Set(productos.map(p => p.category))];
    categorias.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
    });
}

function filtrarProductos() {
    const busqueda = document.getElementById('search-input').value.toLowerCase();
    const categoria = document.getElementById('category-filter').value;
    const precioMax = parseFloat(document.getElementById('price-filter').value);

    const productos = JSON.parse(localStorage.getItem('productosLocal')) || [];
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';

    productos.forEach(p => {
        const cumpleBusqueda = p.title.toLowerCase().includes(busqueda);
        const cumpleCategoria = (categoria === 'all' || p.category === categoria);
        const cumplePrecio = p.price <= precioMax;

        if (cumpleBusqueda && cumpleCategoria && cumplePrecio) {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-image-container">
                    <img src="${p.image}">
                </div>
                <div class="product-title">${p.title}</div>
                <div class="product-price">$${p.price.toFixed(2)}</div>
                <button class="btn-primary" onclick="agregarAlCarrito(${p.id})">Agregar al Carrito</button>
            `;
            grid.appendChild(card);
        }
    });
}

window.agregarAlCarrito = function(id) {
    const productos = JSON.parse(localStorage.getItem('productosLocal')) || [];
    const prod = productos.find(p => p.id === id);
    const itemEnCarrito = carrito.find(item => item.id === id);

    if (itemEnCarrito) {
        itemEnCarrito.cantidad++;
    } else {
        carrito.push({ ...prod, cantidad: 1 });
    }
    guardarYRecargarCarrito();
};

function guardarYRecargarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    renderizarCarrito();
}

function renderizarCarrito() {
    const container = document.getElementById('cart-container');
    if (!container) return;

    container.innerHTML = '';
    if (carrito.length === 0) {
        container.innerHTML = '<p>El carrito está vacío.</p>';
        document.getElementById('cart-subtotal').textContent = '0.00';
        document.getElementById('cart-total').textContent = '0.00';
        return;
    }

    let subtotal = 0;
    carrito.forEach((item, index) => {
        subtotal += item.price * item.cantidad;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <div class="cart-item-info">
                <strong>${item.title}</strong><br>
                Price: $${item.price.toFixed(2)} x ${item.cantidad}
            </div>
            <div class="cart-item-actions">
                <button class="qty-btn" onclick="cambiarCantidad(${index}, 1)">+</button>
                <button class="qty-btn" onclick="cambiarCantidad(${index}, -1)">-</button>
                <button class="btn-danger" style="padding: 0.2rem 0.5rem; font-size:0.8rem;" onclick="eliminarDelCarrito(${index})">🗑️</button>
            </div>
        `;
        container.appendChild(itemDiv);
    });

    document.getElementById('cart-subtotal').textContent = subtotal.toFixed(2);
    document.getElementById('cart-total').textContent = subtotal.toFixed(2);
}

window.cambiarCantidad = function(index, cambio) {
    carrito[index].cantidad += cambio;
    if (carrito[index].cantidad <= 0) {
        carrito.splice(index, 1);
    }
    guardarYRecargarCarrito();
};

window.eliminarDelCarrito = function(index) {
    carrito.splice(index, 1);
    guardarYRecargarCarrito();
};

function procesarCompra(e) {
    e.preventDefault();
    if (carrito.length === 0) {
        alert('🛒 Tu carrito está vacío.');
        return;
    }

    const sesion = JSON.parse(localStorage.getItem('sesion'));
    const nuevaOrden = {
        idOrden: 'ORD-' + Math.floor(Math.random() * 90000 + 10000),
        cliente: sesion.name,
        productos: carrito.map(i => `${i.title} (${i.cantidad})`).join(', '),
        total: carrito.reduce((acc, i) => acc + (i.price * i.cantidad), 0),
        estado: 'Pendiente'
    };

    if (navigator.onLine) {
        const ventas = JSON.parse(localStorage.getItem('ventas')) || [];
        ventas.push(nuevaOrden);
        localStorage.setItem('ventas', JSON.stringify(ventas));
        alert('🛍️ ¡Compra procesada en línea con éxito! Código: ' + nuevaOrden.idOrden);
    } else {
        const cola = JSON.parse(localStorage.getItem('colaVentas')) || [];
        cola.push(nuevaOrden);
        localStorage.setItem('colaVentas', JSON.stringify(cola));
        alert('📡 Guardado localmente (Offline). Tu pedido se sincronizará automáticamente al recuperar internet.');
    }

    carrito = [];
    guardarYRecargarCarrito();
    document.getElementById('checkout-form').reset();
}

/* --- LOGICA SUB-MODULO RESEÑAS STYLE LETTERBOXD --- */
function poblarSelectProductos() {
    const select = document.getElementById('review-product-select');
    const productos = JSON.parse(localStorage.getItem('productosLocal')) || [];
    if (!select) return;
    productos.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.title;
        opt.textContent = p.title;
        select.appendChild(opt);
    });
}

function guardarReview(e) {
    e.preventDefault();
    const producto = document.getElementById('review-product-select').value;
    const comentario = document.getElementById('review-text').value;
    const estrellaSeleccionada = document.querySelector('input[name="stars"]:checked');
    
    if (!estrellaSeleccionada) {
        alert('⭐ Por favor asigna una puntuación en estrellas.');
        return;
    }

    const sesion = JSON.parse(localStorage.getItem('sesion'));
    const estrellas = '★'.repeat(parseInt(estrellaSeleccionada.value));

    const nuevaReview = {
        username: sesion.name,
        producto: producto,
        estrellas: estrellas,
        texto: comentario
    };

    const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    reviews.unshift(nuevaReview); // Lo más nuevo arriba
    localStorage.setItem('reviews', JSON.stringify(reviews));

    document.getElementById('add-review-form').reset();
    renderizarReviews();
}

function renderizarReviews() {
    const contenedor = document.getElementById('letterboxd-reviews-list');
    const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    if (!contenedor) return;

    contenedor.innerHTML = '';
    if (reviews.length === 0) {
        contenedor.innerHTML = '<p style="padding: 1rem; text-align:center;">Ninguna reseña aún. Sé el primero en opinar al estilo Letterboxd.</p>';
        return;
    }

    reviews.forEach(r => {
        const row = document.createElement('div');
        row.className = 'letterboxd-row';
        row.innerHTML = `
            <div class="lb-avatar"></div>
            <div class="lb-content">
                <div class="lb-header">
                    <span class="lb-username">@${r.username.replace(/\s+/g, '').toLowerCase()}</span>
                    <span>compró <strong>${r.producto}</strong></span>
                    <span class="lb-stars">${r.estrellas}</span>
                </div>
                <p class="lb-text">"${r.texto}"</p>
            </div>
        `;
        contenedor.appendChild(row);
    });
}