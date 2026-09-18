const SUPABASE_URL = 'https://xgovnpojneaorxhihsxa.supabase.co';
const SUPABASE_KEY = 'sb_publishable_7HEmwuaJYPhA7jltChVqcQ_1r4AAhYr';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const products = [
    { latin: "PEA", geo: "ბარდა", price: 9, icon: "🫛", sub: "ბარდა · მწვანილი" },
    { latin: "SUNFLOWER", geo: "მზესუმზირა", price: 9, icon: "🌻", sub: "მზესუმზირა · მწვანილი" },
    { latin: "RED BASIL", geo: "წითელი ბაზილიკი", price: 12, icon: "🌿", sub: "წითელი ბაზილიკი · მწვანილი" },
    { latin: "GREEN BASIL", geo: "მწვანე ბაზილიკი", price: 12, icon: "🌱", sub: "მწვანე ბაზილიკი · მწვანილი" },
    { latin: "RED AMARANTH", geo: "წითელი ამარანტი", price: 10, icon: "🌿", sub: "წითელი ამარანტი · მწვანილი" },
    { latin: "RED MIZUNA", geo: "წითელი მიზუნა", price: 9, icon: "🌱", sub: "წითელი მიზუნა · მწვანილი" },
    { latin: "GREEN MIZUNA", geo: "მწვანე მიზუნა", price: 9, icon: "🌱", sub: "მწვანე მიზუნა · მწვანილი" },
    { latin: "RED MUSTARD", geo: "წითელი მდოგვი", price: 10, icon: "🌿", sub: "წითელი მდოგვი · მწვანილი" },
    { latin: "ONION", geo: "ხახვი", price: 10, icon: "🧅", sub: "ხახვი · მწვანილი" },
    { latin: "SWISSCHARD BRIGHT LIGHT", geo: "ჭარხალი Bright Light", price: 10, icon: "🌿", sub: "ჭარხალი · მწვანილი" },
    { latin: "BEET BULLS BLOOD", geo: "ჭარხალი Bulls Blood", price: 10, icon: "🌿", sub: "ჭარხალი · მწვანილი" },
    { latin: "RED KOHLRABI", geo: "წითელი კოლრაბი", price: 8, icon: "🌱", sub: "კოლრაბი · მწვანილი" },
    { latin: "GARDEN CRESS", geo: "წიწმატი (კრესი სალათი)", price: 9, icon: "🌱", sub: "წიწმატი · მწვანილი" },
    { latin: "RADISH CHINA ROSE", geo: "ბოლოკი China Rose", price: 9, icon: "🌱", sub: "ბოლოკი · მწვანილი" },
    { latin: "RADISH RED CORAL", geo: "ბოლოკი Red Coral", price: 9, icon: "🌱", sub: "ბოლოკი · მწვანილი" },
    { latin: "RADISH SANGO", geo: "ბოლოკი Sango", price: 10, icon: "🌿", sub: "ბოლოკი · მეწამული" },
    { latin: "ROCKET", geo: "რუკოლა", price: 8, icon: "🌱", sub: "რუკოლა · მწვანილი" },
    { latin: "ROCKET RUNWAY", geo: "რუკოლა Runway", price: 8, icon: "🌱", sub: "რუკოლა · მწვანილი" },
    { latin: "TATSOI", geo: "ტატსოი", price: 9, icon: "🌱", sub: "ტატსოი · მწვანილი" }
];

let currentUser = null;
try {
    const stored = localStorage.getItem('ag_currentUser');
    if (stored) currentUser = JSON.parse(stored);
} catch(e) {}

let cart = {};

window.changeQty = function(idx, delta) {
    const currentQty = cart[idx] || 0;
    const newQty = currentQty + delta;
    if (newQty > 0) {
        cart[idx] = newQty;
    } else {
        delete cart[idx];
    }
    renderProducts();
    updateCartTotal();
};

function renderProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    let html = '';
    products.forEach((p, idx) => {
        const qty = cart[idx] || 0;
        let actionHtml = '';

        if (currentUser && currentUser.role === 'chef') {
            if (qty === 0) {
                actionHtml = '<button class="add-btn" onclick="changeQty(' + idx + ', 1)">დამატება</button>';
            } else {
                actionHtml = '<div class="qty-control-box">' +
                    '<button class="qty-btn" onclick="changeQty(' + idx + ', -1)">-</button>' +
                    '<span class="qty-num">' + qty + '</span>' +
                    '<button class="qty-btn" onclick="changeQty(' + idx + ', 1)">+</button>' +
                    '</div>';
            }
        }

        html += '<div class="product-card">' +
            '<div class="product-left">' +
            '<div class="product-icon-box">' + p.icon + '</div>' +
            '<div class="product-text-info">' +
            '<span class="product-latin-name">' + p.latin + '</span>' +
            '<span class="product-sub-text">' + p.sub + '</span>' +
            '</div>' +
            '</div>' +
            '<div class="product-right">' +
            '<span class="product-price-tag">' + p.price + ' ₾</span>' +
            actionHtml +
            '</div>' +
            '</div>';
    });
    grid.innerHTML = html;
}

function updateCartTotal() {
    let total = 0;
    Object.keys(cart).forEach(idx => {
        total += products[idx].price * cart[idx];
    });
    const el = document.getElementById('cart-total');
    if (el) el.innerText = total;
}

window.cancelOrder = async function(orderId) {
    if (confirm('ნამდვილად გსურთ ამ შეკვეთის გაუქმება?')) {
        const { error } = await _supabase.from('orders').update({ status: 'cancelled' }).eq('id', orderId);
        if (!error) {
            alert('შეკვეთა გაუქმებულია!');
            updateUI();
        } else {
            alert('შეცდომა გაუქმებისას');
        }
    }
};

window.setAdminOrderStatus = async function(orderId, status) {
    const { error } = await _supabase.from('orders').update({ status: status }).eq('id', orderId);
    if (!error) {
        updateUI();
    } else {
        alert('შეცდომა სტატუსის განახლებისას');
    }
};

async function updateUI() {
    try {
        const stored = localStorage.getItem('ag_currentUser');
        currentUser = stored ? JSON.parse(stored) : null;
    } catch(e) { currentUser = null; }

    const authBtn = document.getElementById('auth-modal-btn');
    const welcome = document.getElementById('user-welcome');
    const orderActionBox = document.getElementById('order-action-box');
    const chefNav = document.getElementById('chef-nav-link');
    const profileNav = document.getElementById('profile-nav-link');
    const chefSec = document.getElementById('chef-orders-section');
    const profileSec = document.getElementById('profile-section');
    const adminNav = document.getElementById('admin-nav-link');
    const adminSec = document.getElementById('admin-section');
    const dateInput = document.getElementById('delivery-date');
    const addrInput = document.getElementById('delivery-address');

    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
    }

    if (currentUser) {
        if (authBtn) authBtn.innerText = 'გამოსვლა (' + currentUser.name + ')';
        if (currentUser.role === 'admin') {
            if (adminNav) adminNav.style.display = 'inline-block';
            if (adminSec) adminSec.style.display = 'block';
            if (chefNav) chefNav.style.display = 'none';
            if (profileNav) profileNav.style.display = 'none';
            if (chefSec) chefSec.style.display = 'none';
            if (profileSec) profileSec.style.display = 'none';
            if (orderActionBox) orderActionBox.style.display = 'none';
            await renderAdminOrders();
        } else {
            if (adminNav) adminNav.style.display = 'none';
            if (adminSec) adminSec.style.display = 'none';
            if (chefNav) chefNav.style.display = 'inline-block';
            if (profileNav) profileNav.style.display = 'inline-block';
            if (chefSec) chefSec.style.display = 'block';
            if (profileSec) profileSec.style.display = 'block';
            if (orderActionBox) orderActionBox.style.display = 'flex';
            
            if (addrInput && currentUser.address) {
                addrInput.value = currentUser.address;
            }
            populateProfileForm();
            await renderChefOrders();
        }
    } else {
        if (authBtn) authBtn.innerText = 'შესვლა / რეგისტრაცია';
        if (welcome) welcome.innerText = 'სპეციალური პორტალი შეფ-მზარეულებისა და რესტორნებისთვის.';
        if (adminNav) adminNav.style.display = 'none';
        if (adminSec) adminSec.style.display = 'none';
        if (chefNav) chefNav.style.display = 'none';
        if (profileNav) profileNav.style.display = 'none';
        if (chefSec) chefSec.style.display = 'none';
        if (profileSec) profileSec.style.display = 'none';
        if (orderActionBox) orderActionBox.style.display = 'none';
    }
    renderProducts();
}

function populateProfileForm() {
    if (!currentUser) return;
    if (document.getElementById('prof-name')) document.getElementById('prof-name').value = currentUser.name || '';
    if (document.getElementById('prof-restaurant')) document.getElementById('prof-restaurant').value = currentUser.restaurant || '';
    if (document.getElementById('prof-phone')) document.getElementById('prof-phone').value = currentUser.phone || '';
    if (document.getElementById('prof-email')) document.getElementById('prof-email').value = currentUser.email || '';
    if (document.getElementById('prof-address')) document.getElementById('prof-address').value = currentUser.address || '';
}

async function renderChefOrders() {
    const list = document.getElementById('chef-orders-list');
    if (!list) return;
    const { data: myOrders, error } = await _supabase
        .from('orders')
        .select('*')
        .eq('chef_email', currentUser.email)
        .order('created_at', { ascending: false });

    if (error || !myOrders || myOrders.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#a8d5ba;">თქვენ ჯერ შეკვეთა არ გაგიკეთებიათ.</p>';
        return;
    }

    let html = '';
    myOrders.forEach(o => {
        let itemsHtml = '';
        (o.items || []).forEach(it => {
            itemsHtml += '<li>• ' + it.name + ' — <strong>' + it.qty + ' ცალი</strong> (' + it.price + ' ₾)</li>';
        });

        let statusBadge = '';
        if (o.status === 'confirmed') {
            statusBadge = '<span class="status-badge confirmed">✅ დადასტურებულია — მზადდება ჩასაბარებლად</span>';
        } else if (o.status === 'rejected_date') {
            statusBadge = '<span class="status-badge rejected">⚠️ ვერ ხერხდება მითითებულ თარიღში ჩაბარება</span>';
        } else if (o.status === 'cancelled') {
            statusBadge = '<span class="status-badge cancelled">❌ გაუქმებულია</span>';
        } else {
            statusBadge = '<span class="status-badge pending">⏳ ელოდება ადმინისტრატორის დადასტურებას</span>';
        }

        let cancelBtnHtml = '';
        if (o.status === 'pending') {
            cancelBtnHtml = '<button class="cancel-btn" onclick="cancelOrder(\'' + o.id + '\')">❌ შეკვეთის გაუქმება</button>';
        }

        html += '<div class="order-card ' + (o.status === 'cancelled' ? 'order-cancelled' : '') + '">' +
            '<div class="order-header">' +
            '<div><strong>' + o.restaurant + '</strong><br>' +
            '<small>📅 შეკვეთის თარიღი: ' + o.date_str + '</small><br>' +
            '<div class="delivery-badge">🚚 ჩაბარების თარიღი: ' + o.delivery_date + '</div>' +
            '<div style="margin-top:4px; font-size:13px;">📍 მისამართი: ' + (o.address || 'არ არის მითითებული') + '</div><br>' + statusBadge + '</div>' +
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

async function renderAdminOrders() {
    const list = document.getElementById('orders-list');
    if (!list) return;
    const { data: orders, error } = await _supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (error || !orders || orders.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#a8d5ba;">ჯერჯერობით შეკვეთები არ არის.</p>';
        return;
    }
    let html = '';
    orders.forEach(o => {
        let itemsHtml = '';
        (o.items || []).forEach(it => {
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
            '<div><strong>' + (o.restaurant || 'რესტორანი') + '</strong> (' + (o.chef_name || 'შეფი') + ')<br><small>📞 ' + (o.phone || '-') + ' | 📅 შეკვეთის თარიღი: ' + o.date_str + '</small><br><div class="delivery-badge">🚚 ჩაბარების თარიღი: ' + o.delivery_date + '</div><div style="margin-top:4px; font-size:13px;">📍 მისამართი: ' + (o.address || 'არ არის მითითებული') + '</div><br>' + statusBadge + '</div>' +
            '<div style="color:#69bf4a; font-weight:bold;">' + o.id + '</div>' +
            '</div>' +
            '<ul class="order-items">' + itemsHtml + '</ul>' +
            '<div class="order-total">სულ ჯამი: ' + o.total + ' ₾</div>' +
            adminActionsHtml +
            '</div>';
    });
    list.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', () => {
    updateUI();

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

    // რეგისტრაცია
    if (regForm) {
        regForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newUser = {
                name: document.getElementById('reg-name').value,
                restaurant: document.getElementById('reg-restaurant').value,
                phone: document.getElementById('reg-phone').value,
                address: document.getElementById('reg-address').value,
                email: document.getElementById('reg-email').value,
                password: document.getElementById('reg-password').value,
                role: 'chef'
            };

            const { data, error } = await _supabase.from('users').insert([newUser]).select();
            if (error) {
                if (error.code === '23505') {
                    alert('ეს ელ-ფოსტა უკვე დარეგისტრირებულია! გთხოვთ, გაიაროთ ავტორიზაცია.');
                } else {
                    alert('რეგისტრაციის შეცდომა: ' + error.message);
                }
                return;
            }

            currentUser = newUser;
            localStorage.setItem('ag_currentUser', JSON.stringify(currentUser));
            if (modal) modal.style.display = 'none';
            updateUI();
        });
    }

    // შესვლა
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const pass = document.getElementById('login-password').value;

            const { data, error } = await _supabase.from('users').select('*').eq('email', email).eq('password', pass).single();

            if (data) {
                currentUser = data;
                localStorage.setItem('ag_currentUser', JSON.stringify(currentUser));
                if (modal) modal.style.display = 'none';
                updateUI();
            } else {
                alert('არასწორი ელ-ფოსტა ან პაროლი!');
            }
        });
    }

    // პროფილის განახლება
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentUser) return;

            const updatedData = {
                name: document.getElementById('prof-name').value,
                restaurant: document.getElementById('prof-restaurant').value,
                phone: document.getElementById('prof-phone').value,
                address: document.getElementById('prof-address').value
            };

            const { error } = await _supabase.from('users').update(updatedData).eq('email', currentUser.email);
            if (error) {
                alert('პროფილის განახლება ვერ მოხერხდა: ' + error.message);
                return;
            }

            currentUser = { ...currentUser, ...updatedData };
            localStorage.setItem('ag_currentUser', JSON.stringify(currentUser));
            alert('პროფილი და მისამართი წარმატებით განახლდა!');
            updateUI();
        });
    }

    // შეკვეთის გაგზავნა
    const submitOrderBtn = document.getElementById('submit-order-btn');
    if (submitOrderBtn) {
        submitOrderBtn.addEventListener('click', async () => {
            if (Object.keys(cart).length === 0) {
                alert('გთხოვთ, აირჩიოთ სულ მცირე 1 პროდუქტი!');
                return;
            }

            const deliveryDateVal = document.getElementById('delivery-date').value;
            const deliveryAddressVal = document.getElementById('delivery-address').value;

            if (!deliveryDateVal) {
                alert('გთხოვთ, აირჩიოთ ჩაბარების თარიღი!');
                return;
            }

            if (!deliveryAddressVal) {
                alert('გთხოვთ, მიუთითოთ მიწოდების მისამართი!');
                return;
            }

            const orderItems = Object.keys(cart).map(idx => ({
                name: products[idx].geo + " (" + products[idx].latin + ")",
                qty: cart[idx],
                price: products[idx].price * cart[idx]
            }));
            let total = 0;
            orderItems.forEach(i => total += i.price);

            const newOrder = {
                id: 'ORD-' + Date.now().toString().slice(-4),
                chef_name: currentUser ? currentUser.name : 'შეფი',
                chef_email: currentUser ? currentUser.email : '',
                restaurant: currentUser ? currentUser.restaurant : 'რესტორანი',
                phone: currentUser ? currentUser.phone : '-',
                address: deliveryAddressVal,
                items: orderItems,
                total: total,
                delivery_date: deliveryDateVal,
                date_str: new Date().toLocaleString('ka-GE'),
                status: 'pending'
            };

            const { error } = await _supabase.from('orders').insert([newOrder]);
            if (error) {
                alert('შეკვეთის გაგზავნის შეცდომა: ' + error.message);
                return;
            }

            alert('შეკვეთა წარმატებით გაიგზავნა!');
            cart = {};
            document.getElementById('delivery-date').value = '';
            updateCartTotal();
            updateUI();
        });
    }
});


// --- Admin Inline Product Price & Image Editor ---
function initAdminProductEditor() {
    var isAdmin = document.body.textContent.includes("გამოსვლა (ადმინისტრატორი)") || document.getElementById("admin-nav-link")?.style.display !== "none";
    if (!isAdmin) return;
    var cards = document.querySelectorAll(".product-card, .card");
    cards.forEach(function(card) {
        if (card.classList.contains("admin-editable")) return;
        card.classList.add("admin-editable");
        card.style.position = "relative";
        var editOverlay = document.createElement("div");
        editOverlay.style.cssText = "position: absolute; top: 6px; left: 6px; z-index: 25; display: flex; gap: 6px;";
        editOverlay.innerHTML = "<button class=\"admin-edit-btn\" style=\"background: #1e472c; color: #a5d6a7; border: 1px solid #2e603a; border-radius: 4px; padding: 2px 6px; font-size: 10px; cursor: pointer;\">✏️ რედაქტირება</button>";
        card.appendChild(editOverlay);
        var editBtn = editOverlay.querySelector(".admin-edit-btn");
        editBtn.addEventListener("click", function(e) {
            e.stopPropagation();
            var currentPriceEl = card.querySelector(".price, [class*=\"price\"]") || card.querySelector("span:not([class])");
            var newPrice = prompt("შეიყვანეთ ახალი ფასი (₾):", "9");
            if (newPrice !== null) {
                if (currentPriceEl) currentPriceEl.textContent = newPrice + " ₾";
                showToast("ფასი წარმატებით განახლდა! ✅");
            }
            var newImgUrl = prompt("შეიყვანეთ სურათის ახალი URL მისამართი:", "");
            if (newImgUrl) {
                var imgEl = card.querySelector("img");
                if (imgEl) {
                    imgEl.src = newImgUrl;
                    showToast("სურათი წარმატებით შეიცვალა! 🖼️");
                }
            }
        });
    });
}
setInterval(initAdminProductEditor, 1000);
// --- Strict Admin-Only Product Price & Image Editor ---
function initAdminProductEditor() {
    // მკაცრად ვამოწმებთ, რომ გვერდზე მითითებულია ზუსტად ადმინისტრატორის სტატუსი
    var bodyText = document.body.textContent || '';
    var isAdmin = bodyText.includes('გამოსვლა (ადმინისტრატორი)') || bodyText.includes('ადმინისტრატო');
    
    // თუ არ არის ადმინი, ვეძებთ და ვშლით ძველ ღილაკებს თუ სადმე დარჩა
    if (!isAdmin) {
        document.querySelectorAll('.admin-edit-btn').forEach(btn => btn.remove());
        return;
    }

    // ვამატებთ რედაქტირების ღილაკებს მხოლოდ მაშინ, თუ ნამდვილად ადმინია
    var cards = document.querySelectorAll('.product-card, .card');
    cards.forEach(function(card) {
        if (card.querySelector('.admin-edit-btn')) return;
        card.style.position = 'relative';

        var editBtn = document.createElement('button');
        editBtn.className = 'admin-edit-btn';
        editBtn.textContent = '✏️ რედაქტირება';
        editBtn.style.cssText = 'position: absolute; top: 6px; left: 6px; z-index: 30; background: #1e472c; color: #a5d6a7; border: 1px solid #2e603a; border-radius: 4px; padding: 3px 8px; font-size: 11px; font-weight: bold; cursor: pointer;';
        
        editBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            var currentPriceEl = card.querySelector('.price, [class*="price"]') || card.querySelector('span:not([class])');
            
            var newPrice = prompt('შეიყვანეთ ახალი ფასი (₾):', '9');
            if (newPrice !== null && newPrice.trim() !== '') {
                if (currentPriceEl) {
                    currentPriceEl.textContent = newPrice + ' ₾';
                }
                if (typeof showToast === 'function') {
                    showToast('ფასი წარმატებით განახლდა! ✅');
                } else {
                    alert('ფასი წარმატებით განახლდა!');
                }
            }

            var newImgUrl = prompt('შეიყვანეთ სურათის ახალი URL მისამართი:', '');
            if (newImgUrl !== null && newImgUrl.trim() !== '') {
                var imgEl = card.querySelector('img');
                if (imgEl) {
                    imgEl.src = newImgUrl;
                    if (typeof showToast === 'function') {
                        showToast('სურათი წარმატებით შეიცვალა! 🖼️');
                    }
                }
            }
        });

        card.appendChild(editBtn);
    });
}

// მუდმივად ვაკონტროლებთ სტატუსს
setInterval(initAdminProductEditor, 1000);