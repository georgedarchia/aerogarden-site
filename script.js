const products = [
    { latin: "PEA", geo: "ბარდა", price: 9 },
    { latin: "SUNFLOWER", geo: "მზესუმზირა", price: 9 },
    { latin: "RED BASIL", geo: "წითელი ბაზილიკი", price: 12 },
    { latin: "GREEN BASIL", geo: "მწვანე ბაზილიკი", price: 12 },
    { latin: "RED AMARANTH", geo: "წითელი ამარანტი", price: 10 },
    { latin: "RED MIZUNA", geo: "წითელი მიზუნა", price: 9 },
    { latin: "GREEN MIZUNA", geo: "მწვანე მიზუნა", price: 9 },
    { latin: "RED MUSTARD", geo: "წითელი მდოგვი", price: 10 },
    { latin: "ONION", geo: "ხახვი", price: 10 },
    { latin: "SWISSCHARD BRIGHT LIGHT", geo: "ჭარხალი Bright Light", price: 10 },
    { latin: "BEET BULLS BLOOD", geo: "ჭარხალი Bulls Blood", price: 10 },
    { latin: "RED KOHLRABI", geo: "წითელი კოლრაბი", price: 8 },
    { latin: "GARDEN CRESS", geo: "წიწმატი (კრესი სალათი)", price: 9 },
    { latin: "RADISH CHINA ROSE", geo: "ბოლოკი China Rose", price: 9 },
    { latin: "RADISH RED CORAL", geo: "ბოლოკი Red Coral", price: 9 },
    { latin: "RADISH SANGO", geo: "ბოლოკი Sango (მეწამული ბოლოკი)", price: 10 },
    { latin: "ROCKET", geo: "რუკოლა", price: 8 },
    { latin: "ROCKET RUNWAY", geo: "რუკოლა Runway", price: 8 },
    { latin: "TATSOI", geo: "ტატსოი", price: 9 }
];

let currentUser = null;
try {
    const stored = localStorage.getItem('ag_currentUser');
    if (stored) currentUser = JSON.parse(stored);
} catch(e) {}

let cart = {};

function initAdmin() {
    try {
        let users = JSON.parse(localStorage.getItem('ag_users') || '[]');
        if (!users.some(u => u.email === 'admin@aerogarden.ge')) {
            users.push({
                name: 'ადმინისტრატორი',
                restaurant: 'Aerogarden',
                phone: '555000000',
                email: 'admin@aerogarden.ge',
                password: 'admin',
                role: 'admin'
            });
            localStorage.setItem('ag_users', JSON.stringify(users));
        }
    } catch(e){}
}

function renderProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    let html = '';
    products.forEach((p, idx) => {
        let inputHtml = '';
        if (currentUser && currentUser.role === 'chef') {
            const qty = cart[idx] || 0;
            inputHtml = '<input type="number" min="0" value="' + qty + '" class="qty-input" data-idx="' + idx + '" placeholder="0">';
        }
        html += '<div class="product-card">' +
            '<div class="product-info">' +
            '<span class="product-latin">' + p.latin + '</span>' +
            '<span class="product-geo">' + p.geo + '</span>' +
            '</div>' +
            '<div class="product-action">' +
            '<span class="product-price">' + p.price + ' ₾</span>' +
            inputHtml +
            '</div></div>';
    });
    grid.innerHTML = html;

    document.querySelectorAll('.qty-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const idx = e.target.getAttribute('data-idx');
            const val = parseInt(e.target.value) || 0;
            if (val > 0) cart[idx] = val;
            else delete cart[idx];
            updateCartTotal();
        });
    });
}

function updateCartTotal() {
    let total = 0;
    Object.keys(cart).forEach(idx => {
        total += products[idx].price * cart[idx];
    });
    const el = document.getElementById('cart-total');
    if (el) el.innerText = total;
}

window.cancelOrder = function(orderId) {
    let orders = JSON.parse(localStorage.getItem('ag_orders') || '[]');
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
        const elapsed = Date.now() - (orders[idx].timestamp || 0);
        if (elapsed > 2 * 60 * 60 * 1000) {
            alert('შეკვეთის გაუქმების 2-საათიანი ვადა ამოიწურა!');
            return;
        }
        if (confirm('ნამდვილად გსურთ ამ შეკვეთის გაუქმება?')) {
            orders[idx].status = 'cancelled';
            localStorage.setItem('ag_orders', JSON.stringify(orders));
            alert('შეკვეთა გაუქმებულია!');
            updateUI();
        }
    }
};

window.setAdminOrderStatus = function(orderId, status) {
    let orders = JSON.parse(localStorage.getItem('ag_orders') || '[]');
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
        orders[idx].status = status;
        localStorage.setItem('ag_orders', JSON.stringify(orders));
        updateUI();
    }
};

function updateUI() {
    try {
        const stored = localStorage.getItem('ag_currentUser');
        currentUser = stored ? JSON.parse(stored) : null;
    } catch(e) { currentUser = null; }

    const authBtn = document.getElementById('auth-modal-btn');
    const welcome = document.getElementById('user-welcome');
    const orderActionBox = document.getElementById('order-action-box');
    const chefNav = document.getElementById('chef-nav-link');
    const chefSec = document.getElementById('chef-orders-section');
    const adminNav = document.getElementById('admin-nav-link');
    const adminSec = document.getElementById('admin-section');
    const dateInput = document.getElementById('delivery-date');

    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
    }

    if (currentUser) {
        if (authBtn) authBtn.innerText = 'გამოსვლა (' + currentUser.name + ')';
        if (currentUser.role === 'admin') {
            if (welcome) welcome.innerText = 'მოგესალმებით, ადმინისტრატორო!';
            if (adminNav) adminNav.style.display = 'inline-block';
            if (adminSec) adminSec.style.display = 'block';
            if (chefNav) chefNav.style.display = 'none';
            if (chefSec) chefSec.style.display = 'none';
            if (orderActionBox) orderActionBox.style.display = 'none';
            renderAdminOrders();
        } else {
            if (welcome) welcome.innerText = 'მოგესალმებით, შეფ ' + currentUser.name + ' (' + currentUser.restaurant + ')';
            if (adminNav) adminNav.style.display = 'none';
            if (adminSec) adminSec.style.display = 'none';
            if (chefNav) chefNav.style.display = 'inline-block';
            if (chefSec) chefSec.style.display = 'block';
            if (orderActionBox) orderActionBox.style.display = 'flex';
            renderChefOrders();
        }
    } else {
        if (authBtn) authBtn.innerText = 'შესვლა / რეგისტრაცია';
        if (welcome) welcome.innerText = 'სპეციალური პორტალი შეფ-მზარეულებისა და რესტორნებისთვის.';
        if (adminNav) adminNav.style.display = 'none';
        if (adminSec) adminSec.style.display = 'none';
        if (chefNav) chefNav.style.display = 'none';
        if (chefSec) chefSec.style.display = 'none';
        if (orderActionBox) orderActionBox.style.display = 'none';
    }
    renderProducts();
}

function renderChefOrders() {
    const list = document.getElementById('chef-orders-list');
    if (!list) return;
    const orders = JSON.parse(localStorage.getItem('ag_orders') || '[]');
    const myOrders = orders.filter(o => o.chefEmail === currentUser.email);

    if (myOrders.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#a8d5ba;">თქვენ ჯერ შეკვეთა არ გაგიკეთებიათ.</p>';
        return;
    }

    let html = '';
    myOrders.slice().reverse().forEach(o => {
        let itemsHtml = '';
        o.items.forEach(it => {
            itemsHtml += '<li>• ' + it.name + ' — <strong>' + it.qty + ' ცალი</strong> (' + it.price + ' ₾)</li>';
        });

        const elapsed = Date.now() - (o.timestamp || 0);
        const canCancel = (o.status !== 'cancelled') && (elapsed <= 2 * 60 * 60 * 1000);

        let statusBadge = '';
        if (o.status === 'confirmed') {
            statusBadge = '<span class="status-badge confirmed">✅ დადასტურებულია — ჩაბარდება დროულად</span>';
        } else if (o.status === 'rejected_date') {
            statusBadge = '<span class="status-badge rejected">⚠️ ვერ ხერხდება მითითებულ თარიღში ჩაბარება</span>';
        } else if (o.status === 'cancelled') {
            statusBadge = '<span class="status-badge cancelled">❌ გაუქმებულია</span>';
        } else {
            statusBadge = '<span class="status-badge pending">⏳ ელოდება ადმინისტრატორის დადასტურებას</span>';
        }

        let cancelBtnHtml = '';
        if (canCancel) {
            cancelBtnHtml = '<button class="cancel-btn" onclick="cancelOrder(\'' + o.id + '\')">❌ შეკვეთის გაუქმება</button>';
        } else if (o.status !== 'cancelled') {
            cancelBtnHtml = '<small style="color:#aaa; display:block; margin-top:8px;">(გაუქმების 2-საათიანი ვადა ამოიწურა)</small>';
        }

        html += '<div class="order-card ' + (o.status === 'cancelled' ? 'order-cancelled' : '') + '">' +
            '<div class="order-header">' +
            '<div><strong>' + o.restaurant + '</strong><br>' +
            '<small>📅 შეკვეთის თარიღი: ' + o.date + '</small><br>' +
            '<div class="delivery-badge">🚚 ჩაბარების თარიღი: ' + o.deliveryDate + '</div><br>' + statusBadge + '</div>' +
            '<div style="text-align:right;">' +
            '<div style="color:#69bf4a; font-weight:bold;">' + o.id + '</div>' +
            cancelBtnHtml +
            '</div>' +
            '</div>' +
            '<ul class="order-items">' + itemsHtml + '</ul>' +
            '<div class="order-total">სულ ჯამი: ' + o.total + ' ₾</div>' +
            '</div>';
    });
    list.innerHTML = html;
}

function renderAdminOrders() {
    const list = document.getElementById('orders-list');
    if (!list) return;
    const orders = JSON.parse(localStorage.getItem('ag_orders') || '[]');
    if (orders.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#a8d5ba;">ჯერჯერობით შეკვეთები არ არის.</p>';
        return;
    }
    let html = '';
    orders.slice().reverse().forEach(o => {
        let itemsHtml = '';
        o.items.forEach(it => {
            itemsHtml += '<li>• ' + it.name + ' — <strong>' + it.qty + ' ცალი</strong> (' + it.price + ' ₾)</li>';
        });

        let statusBadge = '';
        if (o.status === 'confirmed') {
            statusBadge = '<span class="status-badge confirmed">✅ დადასტურებულია — ჩაბარდება დროულად</span>';
        } else if (o.status === 'rejected_date') {
            statusBadge = '<span class="status-badge rejected">⚠️ მითითებულ თარიღში ვერ ჩაბარდება</span>';
        } else if (o.status === 'cancelled') {
            statusBadge = '<span class="status-badge cancelled">❌ გაუქმებულია შეფის მიერ</span>';
        } else {
            statusBadge = '<span class="status-badge pending">⏳ ახალი — ელოდება დადასტურებას</span>';
        }

        let adminActionsHtml = '';
        if (o.status !== 'cancelled') {
            adminActionsHtml = '<div class="admin-actions">' +
                '<button class="admin-btn confirm-btn" onclick="setAdminOrderStatus(\'' + o.id + '\', \'confirmed\')">✅ ჩაბარება შესაძლებელია</button>' +
                '<button class="admin-btn reject-btn" onclick="setAdminOrderStatus(\'' + o.id + '\', \'rejected_date\')">⚠️ ვერ ჩაბარდება ამ თარიღში</button>' +
                '</div>';
        }

        html += '<div class="order-card ' + (o.status === 'cancelled' ? 'order-cancelled' : '') + '">' +
            '<div class="order-header">' +
            '<div><strong>' + (o.restaurant || 'რესტორანი') + '</strong> (' + (o.chefName || 'შეფი') + ')<br><small>📞 ' + (o.phone || '-') + ' | 📅 შეკვეთის თარიღი: ' + o.date + '</small><br><div class="delivery-badge">🚚 ჩაბარების თარიღი: ' + o.deliveryDate + '</div><br>' + statusBadge + '</div>' +
            '<div style="color:#69bf4a; font-weight:bold;">' + o.id + '</div>' +
            '</div>' +
            '<ul class="order-items">' + itemsHtml + '</ul>' +
            '<div class="order-total">სულ ჯამი: ' + o.total + ' ₾</div>' +
            adminActionsHtml +
            '</div>';
    });
    list.innerHTML = html;
}

window.addEventListener('storage', () => {
    updateUI();
});

// Interactive Microgreens Animation with Drag & Throw Physics
function initInteractiveMicrogreens() {
    const oldBg = document.getElementById('microgreens-bg');
    if (oldBg) oldBg.remove();

    let canvas = document.getElementById('microgreens-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'microgreens-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.zIndex = '-1';
        canvas.style.pointerEvents = 'none';
        document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const icons = ['🌱', '🌿', '🍃', '🥬'];
    const particles = [];
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: -(Math.random() * 0.8 + 0.4),
            size: Math.random() * 18 + 28,
            icon: icons[Math.floor(Math.random() * icons.length)],
            angle: Math.random() * Math.PI * 2,
            vAngle: (Math.random() - 0.5) * 0.03,
            opacity: 0.85,
            isDragged: false
        });
    }

    let draggedParticle = null;
    let lastMousePos = { x: 0, y: 0 };

    window.addEventListener('mousedown', (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            const dist = Math.hypot(p.x - mouseX, p.y - mouseY);
            if (dist < p.size * 1.6) {
                draggedParticle = p;
                p.isDragged = true;
                lastMousePos = { x: mouseX, y: mouseY };
                break;
            }
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (draggedParticle) {
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            draggedParticle.vx = (mouseX - lastMousePos.x) * 0.45;
            draggedParticle.vy = (mouseY - lastMousePos.y) * 0.45;

            draggedParticle.x = mouseX;
            draggedParticle.y = mouseY;

            lastMousePos = { x: mouseX, y: mouseY };
        }
    });

    window.addEventListener('mouseup', () => {
        if (draggedParticle) {
            draggedParticle.isDragged = false;
            draggedParticle = null;
        }
    });

    function render() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            if (!p.isDragged) {
                p.x += p.vx;
                p.y += p.vy;
                p.angle += p.vAngle;

                p.vx *= 0.98;
                p.vy *= 0.98;

                if (Math.abs(p.vx) < 0.1) p.vx = (Math.random() - 0.5) * 0.3;
                if (p.vy > -0.3) p.vy -= 0.02;

                if (p.y < -60) {
                    p.y = height + 60;
                    p.x = Math.random() * width;
                    p.vy = -(Math.random() * 0.8 + 0.4);
                }
                if (p.y > height + 70) p.y = -50;
                if (p.x < -60) p.x = width + 60;
                if (p.x > width + 60) p.x = -60;
            }

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.font = `${p.size}px sans-serif`;
            ctx.globalAlpha = p.isDragged ? 1.0 : p.opacity;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            if (p.isDragged) {
                ctx.shadowColor = '#69bf4a';
                ctx.shadowBlur = 20;
            }

            ctx.fillText(p.icon, 0, 0);
            ctx.restore();
        });

        requestAnimationFrame(render);
    }

    render();
}

document.addEventListener('DOMContentLoaded', () => {
    initAdmin();
    updateUI();
    initInteractiveMicrogreens();

    const modal = document.getElementById('auth-modal');
    const authBtn = document.getElementById('auth-modal-btn');
    const closeBtn = document.querySelector('.close-btn');

    if (authBtn) {
        authBtn.addEventListener('click', () => {
            if (currentUser) {
                currentUser = null;
                localStorage.removeItem('ag_currentUser');
                cart = {};
                updateCartTotal();
                updateUI();
            } else {
                if (modal) modal.style.display = 'flex';
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (modal) modal.style.display = 'none';
        });
    }

    const tabLogin = document.getElementById('tab-login-btn');
    const tabReg = document.getElementById('tab-register-btn');
    const loginForm = document.getElementById('login-form');
    const regForm = document.getElementById('register-form');

    if (tabLogin) {
        tabLogin.addEventListener('click', () => {
            tabLogin.classList.add('active');
            if (tabReg) tabReg.classList.remove('active');
            if (loginForm) loginForm.style.display = 'flex';
            if (regForm) regForm.style.display = 'none';
        });
    }

    if (tabReg) {
        tabReg.addEventListener('click', () => {
            tabReg.classList.add('active');
            if (tabLogin) tabLogin.classList.remove('active');
            if (regForm) regForm.style.display = 'flex';
            if (loginForm) loginForm.style.display = 'none';
        });
    }

    if (regForm) {
        regForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const users = JSON.parse(localStorage.getItem('ag_users') || '[]');
            const newUser = {
                name: document.getElementById('reg-name').value,
                restaurant: document.getElementById('reg-restaurant').value,
                phone: document.getElementById('reg-phone').value,
                email: document.getElementById('reg-email').value,
                password: document.getElementById('reg-password').value,
                role: 'chef'
            };
            users.push(newUser);
            localStorage.setItem('ag_users', JSON.stringify(users));
            currentUser = newUser;
            localStorage.setItem('ag_currentUser', JSON.stringify(currentUser));
            if (modal) modal.style.display = 'none';
            updateUI();
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const pass = document.getElementById('login-password').value;
            const users = JSON.parse(localStorage.getItem('ag_users') || '[]');
            const user = users.find(u => u.email === email && u.password === pass);

            if (user) {
                currentUser = user;
                localStorage.setItem('ag_currentUser', JSON.stringify(currentUser));
                if (modal) modal.style.display = 'none';
                updateUI();
            } else {
                alert('არასწორი ელ-ფოსტა ან პაროლი!');
            }
        });
    }

    const submitOrderBtn = document.getElementById('submit-order-btn');
    if (submitOrderBtn) {
        submitOrderBtn.addEventListener('click', () => {
            if (Object.keys(cart).length === 0) {
                alert('გთხოვთ, აირჩიოთ სულ მცირე 1 პროდუქტი!');
                return;
            }

            const deliveryDateVal = document.getElementById('delivery-date').value;
            if (!deliveryDateVal) {
                alert('გთხოვთ, აირჩიოთ ჩაბარების თარიღი!');
                return;
            }

            const orders = JSON.parse(localStorage.getItem('ag_orders') || '[]');
            const orderItems = Object.keys(cart).map(idx => ({
                name: products[idx].geo + " (" + products[idx].latin + ")",
                qty: cart[idx],
                price: products[idx].price * cart[idx]
            }));
            let total = 0;
            orderItems.forEach(i => total += i.price);
            const newOrder = {
                id: 'ORD-' + Date.now().toString().slice(-4),
                chefName: currentUser ? currentUser.name : 'შეფი',
                chefEmail: currentUser ? currentUser.email : '',
                restaurant: currentUser ? currentUser.restaurant : 'რესტორანი',
                phone: currentUser ? currentUser.phone : '-',
                items: orderItems,
                total: total,
                deliveryDate: deliveryDateVal,
                date: new Date().toLocaleString('ka-GE'),
                timestamp: Date.now(),
                status: 'pending'
            };
            orders.push(newOrder);
            localStorage.setItem('ag_orders', JSON.stringify(orders));
            alert('შეკვეთა წარმატებით გაიგზავნა!');
            cart = {};
            document.getElementById('delivery-date').value = '';
            updateCartTotal();
            updateUI();
        });
    }
});