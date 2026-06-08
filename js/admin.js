document.addEventListener('DOMContentLoaded', () => {
    cargarDashboard();
    cargarInventarioTabla();
    cargarVentas();

    // Listener del Formulario CRUD
    document.getElementById('product-form')?.addEventListener('submit', guardarProductoCRUD);
    document.getElementById('cancel-btn')?.addEventListener('click', cancelarEdicion);
});

function cargarDashboard() {
    const ventas = JSON.parse(localStorage.getItem('ventas')) || [];
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

    // Calcular ganancias acumuladas
    const totalEarnings = ventas.reduce((acc, v) => acc + parseFloat(v.total), 0);
    document.getElementById('total-earnings').textContent = `$${totalEarnings.toFixed(2)}`;

    // Usuarios del sistema
    document.getElementById('registered-users').textContent = usuarios.length;
    document.getElementById('active-users').textContent = usuarios.filter(u => u.role === 'Cliente').length;

    // Top 3 Productos Simulado basado en el catálogo actual
    const productos = JSON.parse(localStorage.getItem('productosLocal')) || [];
    const topList = document.getElementById('top-products-list');
    if (topList) {
        topList.innerHTML = '';
        productos.slice(0, 3).forEach(p => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${p.title}</strong> - Alto Rendimiento`;
            topList.appendChild(li);
        });
    }
}

function cargarInventarioTabla() {
    const tbody = document.getElementById('inventory-tbody');
    const productos = JSON.parse(localStorage.getItem('productosLocal')) || [];
    if (!tbody) return;

    tbody.innerHTML = '';
    productos.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${p.image}" style="width:40px; height:40px; object-fit:contain;"></td>
            <td><strong>${p.title}</strong></td>
            <td>${p.category}</td>
            <td>$${p.price.toFixed(2)}</td>
            <td>
                <button class="btn-primary" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="prepararEditar(${p.id})">Editar</button>
                <button class="btn-danger" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="eliminarProductoCRUD(${p.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function guardarProductoCRUD(e) {
    e.preventDefault();
    const id = document.getElementById('product-id').value;
    const title = document.getElementById('prod-title').value.trim();
    const price = parseFloat(document.getElementById('prod-price').value);
    const category = document.getElementById('prod-category').value.trim();
    const image = document.getElementById('prod-image').value.trim();
    const description = document.getElementById('prod-description').value.trim();

    let productos = JSON.parse(localStorage.getItem('productosLocal')) || [];

    if (id) {
        // Operación: ACTUALIZAR (Edit)
        productos = productos.map(p => p.id == id ? { id: parseInt(id), title, price, category, image, description } : p);
        alert('🔄 Producto actualizado correctamente.');
    } else {
        // Operación: CREAR (Add)
        const nuevoProd = {
            id: Date.now(), // Generación de clave única confiable
            title, price, category, image, description
        };
        productos.unshift(nuevoProd);
        alert('✨ Nuevo producto indexado en el catálogo.');
    }

    localStorage.setItem('productosLocal', JSON.stringify(productos));
    document.getElementById('product-form').reset();
    cancelarEdicion();
    cargarInventarioTabla();
}

window.prepararEditar = function(id) {
    const productos = JSON.parse(localStorage.getItem('productosLocal')) || [];
    const p = productos.find(prod => prod.id === id);
    if (!p) return;

    document.getElementById('product-id').value = p.id;
    document.getElementById('prod-title').value = p.title;
    document.getElementById('prod-price').value = p.price;
    document.getElementById('prod-category').value = p.category;
    document.getElementById('prod-image').value = p.image;
    document.getElementById('prod-description').value = p.description;

    document.getElementById('form-action-title').textContent = 'Modificar Producto Existente';
    document.getElementById('cancel-btn').style.display = 'inline-block';
};

window.cancelarEdicion = function() {
    document.getElementById('product-id').value = '';
    document.getElementById('form-action-title').textContent = 'Añadir Nuevo Producto';
    document.getElementById('cancel-btn').style.display = 'none';
    document.getElementById('product-form').reset();
};

window.eliminarProductoCRUD = function(id) {
    if (!confirm('⚠️ ¿Estás seguro de que deseas remover permanentemente este producto del inventario?')) return;
    let productos = JSON.parse(localStorage.getItem('productosLocal')) || [];
    productos = productos.filter(p => p.id !== id);
    localStorage.setItem('productosLocal', JSON.stringify(productos));
    cargarInventarioTabla();
};

window.cargarVentas = function() {
    const tbody = document.getElementById('sales-tbody');
    const ventas = JSON.parse(localStorage.getItem('ventas')) || [];
    if (!tbody) return;

    tbody.innerHTML = '';
    if (ventas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No se registran transacciones.</td></tr>';
        return;
    }

    ventas.forEach((v, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><code>${v.idOrden}</code></td>
            <td>${v.cliente}</td>
            <td><small>${v.productos}</small></td>
            <td><strong>$${parseFloat(v.total).toFixed(2)}</strong></td>
            <td>
                <select onchange="cambiarEstadoEnvio(${index}, this.value)" style="padding:0.2rem; font-size:0.85rem; border-radius:4px;">
                    <option value="Pendiente" ${v.estado === 'Pendiente' ? 'selected' : ''}>⏳ Pendiente</option>
                    <option value="Enviado" ${v.estado === 'Enviado' ? 'selected' : ''}>🚚 Enviado</option>
                    <option value="Entregado" ${v.estado === 'Entregado' ? 'selected' : ''}>✅ Entregado</option>
                </select>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.cambiarEstadoEnvio = function(index, nuevoEstado) {
    const ventas = JSON.parse(localStorage.getItem('ventas')) || [];
    ventas[index].estado = nuevoEstado;
    localStorage.setItem('ventas', JSON.stringify(ventas));
    console.log(`Estado de orden cambiado a: ${nuevoEstado}`);
};