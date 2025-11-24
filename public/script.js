// Initialize App
function initializeApp() {
    setupNavigation();
    updateDashboard();
    renderInventory();
    renderSales();
    renderCustomers();
    renderEmployees();
    renderInvoices();
    renderCharts();
    setupInventoryControls();
    setupSalesControls();
}

// Navigation
function setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

// Fetch Data
async function fetchData(endpoint) {
    const response = await fetch(`http://localhost:3000/api/${endpoint}`);
    return response.json();
}

// Dashboard Updates
async function updateDashboard() {
    const [sales, inventory] = await Promise.all([fetchData('sales'), fetchData('inventory')]);
    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0).toFixed(2);
    const totalInventory = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const totalCustomers = (await fetchData('customers')).length;

    document.getElementById('total-sales').textContent = `$${totalSales}`;
    document.getElementById('total-inventory').textContent = totalInventory;
    document.getElementById('total-customers').textContent = totalCustomers;

    // Stock Alert
    const lowStockItems = inventory.filter(item => item.quantity < 5 && item.quantity > 0);
    const stockAlert = document.getElementById('stock-alert');
    if (lowStockItems.length > 0) {
        stockAlert.textContent = `Low Stock Alert! ${lowStockItems.map(item => item.name).join(', ')}`;
        stockAlert.classList.remove('hidden');
    } else {
        stockAlert.classList.add('hidden');
    }

    // Recent Sales History
    const recentSales = sales.sort((a, b) => new Date(b.sale_date) - new Date(a.sale_date)).slice(0, 5);
    const recentSalesTable = document.getElementById('recent-sales');
    recentSalesTable.innerHTML = '';
    recentSales.forEach(sale => {
        const inventoryItem = inventory.find(item => item.id === sale.product_id);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="p-2">${inventoryItem ? inventoryItem.name : 'Unknown'}</td>
            <td class="p-2">${sale.quantity}</td>
            <td class="p-2">$${sale.total.toFixed(2)}</td>
            <td class="p-2">${sale.sale_date}</td>
        `;
        recentSalesTable.appendChild(row);
    });
}

// Render Inventory
async function renderInventory(filter = '', category = '') {
    const inventory = await fetchData('inventory');
    const inventoryList = document.getElementById('inventory-list');
    inventoryList.innerHTML = '';

    const filteredInventory = inventory
        .filter(item => item.name.toLowerCase().includes(filter.toLowerCase()))
        .filter(item => category ? (item.category || '').toLowerCase() === category.toLowerCase() : true);

    filteredInventory.forEach(item => {
        const status = item.quantity === 0 ? 'Out of Stock' : item.quantity < 5 ? 'Low Stock' : 'In Stock';
        const statusClass = item.quantity === 0 ? 'status-out-of-stock' : item.quantity < 5 ? 'status-low-stock' : 'status-in-stock';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="p-2">${item.name}</td>
            <td class="p-2">${item.category || 'N/A'}</td>
            <td class="p-2">$${item.price.toFixed(2)}</td>
            <td class="p-2">${item.quantity}</td>
            <td class="p-2"><span class="${statusClass}">${status}</span></td>
        `;
        inventoryList.appendChild(row);
    });
}

// Setup Inventory Controls (Search, Filter, Add Product)
function setupInventoryControls() {
    const searchInput = document.getElementById('search-products');
    const categoryFilter = document.getElementById('category-filter');
    const addProductBtn = document.getElementById('add-product-btn');
    const addProductModal = document.getElementById('add-product-modal');
    const cancelAddProduct = document.getElementById('cancel-add-product');
    const saveProductBtn = document.getElementById('save-product-btn');

    searchInput.addEventListener('input', () => {
        const filter = searchInput.value;
        const category = categoryFilter.value;
        renderInventory(filter, category);
    });

    categoryFilter.addEventListener('change', () => {
        const filter = searchInput.value;
        const category = categoryFilter.value;
        renderInventory(filter, category);
    });

    addProductBtn.addEventListener('click', () => {
        addProductModal.classList.remove('hidden');
    });

    cancelAddProduct.addEventListener('click', () => {
        addProductModal.classList.add('hidden');
        document.getElementById('product-name').value = '';
        document.getElementById('product-category').value = '';
        document.getElementById('product-quantity').value = '';
        document.getElementById('product-price').value = '';
        document.getElementById('product-expiration').value = '';
    });

    saveProductBtn.addEventListener('click', async () => {
        const name = document.getElementById('product-name').value;
        const category = document.getElementById('product-category').value;
        const quantity = document.getElementById('product-quantity').value;
        const price = document.getElementById('product-price').value;
        const expiration_date = document.getElementById('product-expiration').value;

        if (name && quantity && price) {
            await fetch('http://localhost:3000/api/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, category, quantity: parseInt(quantity), price: parseFloat(price), expiration_date })
            });
            addProductModal.classList.add('hidden');
            document.getElementById('product-name').value = '';
            document.getElementById('product-category').value = '';
            document.getElementById('product-quantity').value = '';
            document.getElementById('product-price').value = '';
            document.getElementById('product-expiration').value = '';
            renderInventory();
            updateDashboard();
        }
    });
}

// Setup Sales Controls (Search, Export)
function setupSalesControls() {
    const searchInput = document.getElementById('search-sales');
    const exportBtn = document.getElementById('export-sales-btn');

    searchInput.addEventListener('input', () => {
        renderSales(searchInput.value);
    });

    exportBtn.addEventListener('click', async () => {
        const sales = await fetchData('sales');
        const customers = await fetchData('customers');
        const csvContent = [
            ['Order #', 'Customer', 'Date', 'Amount', 'Items', 'Status'],
            ...sales.map(sale => {
                const customer = customers.find(c => c.id === sale.customer_id) || { name: 'Unknown' };
                return [
                    `ORD-${String(sale.id).padStart(3, '0')}`,
                    customer.name,
                    sale.sale_date,
                    `$${sale.total.toFixed(2)}`,
                    sale.quantity,
                    sale.status || 'Pending'
                ];
            })
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'sales_export.csv';
        link.click();
    });
}

// Render Sales
async function renderSales(filter = '') {
    const sales = await fetchData('sales');
    const customers = await fetchData('customers');
    const salesList = document.getElementById('sales-list');
    salesList.innerHTML = '';

    // Calculate metrics
    const filteredSales = sales.filter(sale => {
        const customer = customers.find(c => c.id === sale.customer_id) || { name: 'Unknown' };
        return customer.name.toLowerCase().includes(filter.toLowerCase()) ||
               `ORD-${String(sale.id).padStart(3, '0')}`.toLowerCase().includes(filter.toLowerCase());
    });

    const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0).toFixed(2);
    const totalOrders = filteredSales.length;
    const averageOrder = totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : '0.00';
    const completedOrders = filteredSales.filter(sale => sale.status === 'Completed').length;
    const completionRate = totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(0) : '0';

    // Update metrics display
    document.getElementById('sales-total').textContent = `$${totalSales}`;
    document.getElementById('sales-orders').textContent = totalOrders;
    document.getElementById('sales-average').textContent = `$${averageOrder}`;
    document.getElementById('sales-completion').textContent = `${completionRate}%`;

    filteredSales.forEach(sale => {
        const customer = customers.find(c => c.id === sale.customer_id) || { name: 'Unknown' };
        const status = sale.status || 'Pending'; // Default to Pending if status is not set
        const statusClass = status === 'Completed' ? 'status-completed' : status === 'Refunded' ? 'status-refunded' : 'status-pending';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="p-2">ORD-${String(sale.id).padStart(3, '0')}</td>
            <td class="p-2">${customer.name}</td>
            <td class="p-2">${sale.sale_date}</td>
            <td class="p-2">$${sale.total.toFixed(2)}</td>
            <td class="p-2">${sale.quantity}</td>
            <td class="p-2"><span class="${statusClass}">${status}</span></td>
        `;
        salesList.appendChild(row);
    });
}

// Render Other Sections
async function renderCustomers() {
    const customers = await fetchData('customers');
    const customersList = document.getElementById('customers-list');
    customersList.innerHTML = '';
    customers.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="p-2">${customer.name}</td>
            <td class="p-2">${customer.email || 'N/A'}</td>
            <td class="p-2">${customer.phone || 'N/A'}</td>
            <td class="p-2">${customer.purchase_history || 'N/A'}</td>
        `;
        customersList.appendChild(row);
    });
}

async function renderEmployees() {
    const employees = await fetchData('employees');
    const employeesList = document.getElementById('employees-list');
    employeesList.innerHTML = '';
    employees.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="p-2">${employee.name}</td>
            <td class="p-2">${employee.role}</td>
            <td class="p-2">${employee.performance || 'N/A'}</td>
        `;
        employeesList.appendChild(row);
    });
}

async function renderInvoices() {
    const invoices = await fetchData('invoices');
    const invoicesList = document.getElementById('invoices-list');
    invoicesList.innerHTML = '';
    invoices.forEach(invoice => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="p-2">${invoice.customer_id}</td>
            <td class="p-2">$${invoice.total.toFixed(2)}</td>
            <td class="p-2">$${invoice.discount || 0}</td>
            <td class="p-2">${invoice.invoice_date}</td>
        `;
        invoicesList.appendChild(row);
    });
}

// Charts
async function renderCharts() {
    const sales = await fetchData('sales');
    const labels = sales.map(sale => sale.sale_date);
    const data = sales.map(sale => sale.total);

    new Chart(document.getElementById('analytics-chart'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Sales Trends',
                data: data,
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } },
            plugins: { legend: { labels: { color: '#1e293b' } } }
        }
    });
}