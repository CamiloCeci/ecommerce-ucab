document.addEventListener('DOMContentLoaded', () => {
    // 1. Ejecutar el pintado del perfil del administrador
    renderizarPerfilAdmin();

    // 2. Inicializar los datos del panel de control
    actualizarMetricasAdmin();
    renderizarTablaInventarioAdmin();
    renderizarHistorialOrdenesAdmin();

    // 3. Captura de eventos del formulario CRUD de productos
    const crudForm = document.getElementById('product-crud-form');
    const btnCancelar = document.getElementById('btn-crud-cancel');

    if (crudForm) {
        crudForm.addEventListener('submit', guardarProductoCRUD);
    }

    if (btnCancelar) {
        btnCancelar.addEventListener('click', cancelarEdicionCRUD);
    }
});

// ==========================================================================
// MÓDULO NUEVO: GESTIÓN Y RENDERIZADO DEL PERFIL DEL ADMINISTRADOR
// ==========================================================================
function renderizarPerfilAdmin() {
    const contenedor = document.getElementById('profile-display');
    const sesion = JSON.parse(localStorage.getItem('sesion'));
    if (!contenedor || !sesion) return;

    contenedor.innerHTML = `
        <div class="lb-avatar" style="background-image: url('${sesion.avatar || 'https://picsum.photos/100'}'); background-size: cover; float: left; margin-right: 15px; width: 50px; height: 50px; border-radius: 50%;"></div>
        <div style="float: left;">
            <strong>Administrador:</strong> ${sesion.name} | <small style="color: var(--color-primary); font-weight: bold;">Rol: ${sesion.role}</small><br>
            <small>📍 Sede de Operación: ${sesion.address}</small>
        </div>
        <div style="float: right; margin-top: 5px;">
            <button class="btn-secondary" onclick="window.location.href='perfil.html'" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">⚙️ Gestionar Perfil</button>
        </div>
        <div class="clear-fix"></div>
    `;
}

// ==========================================================================
// MÓDULO DE PANEL: CÁLCULO AUTOMÁTICO DE MÉTRICAS Y TOTALES
// ==========================================================================
function actualizarMetricasAdmin() {
    const productos = JSON.parse(localStorage.getItem('productosLocal')) || [];
    const ventas = JSON.parse(localStorage.getItem('ventas')) || [];

    // Calcular ingresos totales acumulando los montos numéricos de las ventas aprobadas
    const ingresosTotales = ventas.reduce((acc, v) => acc + parseFloat(v.total || 0), 0);

    // Inyectar en los contadores del DOM
    if (document.getElementById('total-revenue')) {
        document.getElementById('total-revenue').textContent = ingresosTotales.toFixed(2);
    }
    if (document.getElementById('total-orders-count')) {
        document.getElementById('total-orders-count').textContent = ventas.length;
    }
    if (document.getElementById('total-products-count')) {
        document.getElementById('total-products-count').textContent = productos.length;
    }
}

// ==========================================================================
// MÓDULO DE INVENTARIO: RENDERIZADO DE TABLA DE PRODUCTOS
// ==========================================================================
function renderizarTablaInventarioAdmin() {
    const tbody = document.getElementById('admin-products-table-body');
    const productos = JSON.parse(localStorage.getItem('productosLocal')) || [];
    if (!tbody) return;

    tbody.innerHTML = '';

    if (productos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="txt-centered txt-muted">No existen productos en el catálogo de almacén.</td></tr>`;
        return;
    }

    productos.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${p.image}" alt="${p.title}" style="width: 40px; height: 40px; object-fit: contain; border-radius: var(--radius);"></td>
            <td><strong>${p.title.substring(0, 25)}...</strong></td>
            <td>${p.category}</td>
            <td>$${parseFloat(p.price).toFixed(2)}</td>
            <td>
                <button class="btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.8rem; margin-right: 5px;" onclick="cargarProductoParaEditar(${p.id})">✏️</button>
                <button class="btn-danger" style="padding: 0.2rem 0.5rem; font-size: 0.8rem;" onclick="eliminarProductoCRUD(${p.id})">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ==========================================================================
// MÓDULO CRUD: AGREGAR Y EDITAR REGISTROS (PERSISTENCIA LOCAL)
// ==========================================================================
function guardarProductoCRUD(e) {
    e.preventDefault();

    const idInput = document.getElementById('crud-product-id').value;
    const title = document.getElementById('crud-title').value.trim();
    const price = parseFloat(document.getElementById('crud-price').value);
    const category = document.getElementById('crud-category').value.trim();
    const image = document.getElementById('crud-image').value.trim();
    const description = document.getElementById('crud-description').value.trim();

    let productos = JSON.parse(localStorage.getItem('productosLocal')) || [];

    if (idInput) {
        // MODO EDICIÓN: El producto ya tiene ID mapeado en el formulario oculto
        productos = productos.map(p => {
            if (p.id === parseInt(idInput)) {
                return { ...p, title, price, category, image, description };
            }
            return p;
        });
        alert('📦 Producto modificado y actualizado correctamente en almacén.');
    } else {
        // MODO CREACIÓN: Generar un ID numérico correlativo autoincremental
        const nuevoId = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;
        const nuevoProducto = { id: nuevoId, title, price, category, image, description, rating: { rate: 5.0, count: 1 } };
        productos.push(nuevoProducto);
        alert('🎉 Nuevo producto registrado e indexado en el catálogo con éxito.');
    }

    // Guardar cambios en LocalStorage, limpiar campos e instruir repintado general
    localStorage.setItem('productosLocal', JSON.stringify(productos));
    cancelarEdicionCRUD();
    renderizarTablaInventarioAdmin();
    actualizarMetricasAdmin();
}

window.cargarProductoParaEditar = function(id) {
    const productos = JSON.parse(localStorage.getItem('productosLocal')) || [];
    const prod = productos.find(p => p.id === id);
    if (!prod) return;

    // Poblar el formulario con los datos existentes
    document.getElementById('crud-product-id').value = prod.id;
    document.getElementById('crud-title').value = prod.title;
    document.getElementById('crud-price').value = prod.price;
    document.getElementById('crud-category').value = prod.category;
    document.getElementById('crud-image').value = prod.image;
    document.getElementById('crud-description').value = prod.description;

    // Alterar textos visuales del panel para indicar edición activa
    document.getElementById('form-crud-title').textContent = '✏️ Editando Producto Interno';
    document.getElementById('btn-crud-submit').textContent = 'Actualizar Cambios';
    document.getElementById('btn-crud-cancel').style.display = 'block';
};

window.eliminarProductoCRUD = function(id) {
    if (!confirm('⚠️ ¿Estás seguro de que deseas dar de baja este producto del almacén? Esta acción alterará el stock del cliente.')) return;

    let productos = JSON.parse(localStorage.getItem('productosLocal')) || [];
    productos = productos.filter(p => p.id !== id);

    localStorage.setItem('productosLocal', JSON.stringify(productos));
    renderizarTablaInventarioAdmin();
    actualizarMetricasAdmin();
};

window.cancelarEdicionCRUD = function() {
    // Reiniciar los campos y restaurar el formulario a su estado de creación original
    document.getElementById('product-crud-form').reset();
    document.getElementById('crud-product-id').value = '';
    document.getElementById('form-crud-title').textContent = 'Añadir Nuevo Producto';
    document.getElementById('btn-crud-submit').textContent = 'Guardar Producto';
    document.getElementById('btn-crud-cancel').style.display = 'none';
};

// ==========================================================================
// MÓDULO DE HISTORIAL: FACTURACIÓN Y COMPRAS DE CLIENTES
// ==========================================================================
function renderizarHistorialOrdenesAdmin() {
    const tbody = document.getElementById('admin-orders-table-body');
    const ventas = JSON.parse(localStorage.getItem('ventas')) || [];
    if (!tbody) return;

    tbody.innerHTML = '';

    if (ventas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="txt-centered txt-muted">No se han registrado transacciones comerciales en el sistema.</td></tr>`;
        return;
    }

    // Mostrar las ventas de forma cronológica inversa (la más reciente arriba)
    ventas.reverse().forEach(v => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="badge" style="background-color: var(--border-color); padding: 0.2rem 0.5rem; border-radius: var(--radius); font-size: 0.8rem; font-family: monospace;">${v.idOrden}</span></td>
            <td><strong>${v.cliente}</strong></td>
            <td title="${v.productos}"><span>${v.productos}</span></td>
            <td style="color: var(--color-success); font-weight: bold;">$${parseFloat(v.total).toFixed(2)}</td>
            <td><span style="color: #dfa100; font-weight: bold;">🟢 Aprobada</span></td>
        `;
        tbody.appendChild(tr);
    });
}