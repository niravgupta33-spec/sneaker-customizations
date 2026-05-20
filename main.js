document.addEventListener('DOMContentLoaded', () => {

    
    // --- CART STATE ---
    let cart = [];
    const cartBadge = document.getElementById('cartBadge');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartTotal = document.getElementById('cartTotal');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOpenBtn = document.getElementById('cartOpenBtn');
    const cartCloseBtn = document.getElementById('cartCloseBtn');

    // Load cart from localStorage
    const savedCart = localStorage.getItem('kickcraft_cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (e) {
            cart = [];
        }
    }

    function saveCart() {
        localStorage.setItem('kickcraft_cart', JSON.stringify(cart));
    }

    function renderCart() {
        if (!cartBadge || !cartItemsContainer || !cartTotal) return;

        // Update badge
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = totalItems;
        if (totalItems === 0) {
            cartBadge.style.display = 'none';
        } else {
            cartBadge.style.display = 'flex';
        }

        // Render items
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="cart-empty">Your cart is empty.</div>';
            cartTotal.textContent = '₹0';
            return;
        }

        let html = '';
        let total = 0;

        cart.forEach((item, index) => {
            total += item.price * item.quantity;
            // Extract color hex from name if present (e.g. "Model X — #FF0000 (Matte)")
            const colorMatch = item.name.match(/#[0-9A-Fa-f]{6}/);
            const swatchHtml = colorMatch 
                ? `<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${colorMatch[0]};border:2px solid rgba(255,255,255,0.2);vertical-align:middle;margin-right:6px;"></span>` 
                : '';
            html += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${swatchHtml}${item.name}</div>
                        <div class="cart-item-price" style="display:flex; align-items:center; gap:10px; margin-top:4px;">
                            <span>₹${item.price.toLocaleString('en-IN')}</span>
                            <div class="cart-qty-controls" style="display:inline-flex; align-items:center; gap:8px; background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1);">
                                <button class="cart-qty-btn cart-qty-minus" data-index="${index}" style="background:transparent; border:none; color:#aaa; cursor:pointer; font-size:16px; padding:0 4px; transition:color 0.2s;">-</button>
                                <span style="font-size:0.9rem; min-width:16px; text-align:center;">${item.quantity}</span>
                                <button class="cart-qty-btn cart-qty-plus" data-index="${index}" style="background:transparent; border:none; color:#aaa; cursor:pointer; font-size:16px; padding:0 4px; transition:color 0.2s;">+</button>
                            </div>
                        </div>
                    </div>
                    <button class="cart-item-remove" data-index="${index}">🗑️</button>
                </div>
            `;
        });

        cartItemsContainer.innerHTML = html;
        cartTotal.textContent = `₹${total.toLocaleString('en-IN')}`;

        // Add remove listeners
        document.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.getAttribute('data-index'));
                cart.splice(idx, 1);
                saveCart();
                renderCart();
            });
        });

        // Add quantity listeners
        document.querySelectorAll('.cart-qty-minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.getAttribute('data-index'));
                if (cart[idx].quantity > 1) {
                    cart[idx].quantity -= 1;
                } else {
                    cart.splice(idx, 1); // Remove item if quantity hits 0
                }
                saveCart();
                renderCart();
            });
            // Hover effect
            btn.addEventListener('mouseover', () => btn.style.color = '#fff');
            btn.addEventListener('mouseout', () => btn.style.color = '#aaa');
        });

        document.querySelectorAll('.cart-qty-plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.getAttribute('data-index'));
                cart[idx].quantity += 1;
                saveCart();
                renderCart();
            });
            // Hover effect
            btn.addEventListener('mouseover', () => btn.style.color = '#fff');
            btn.addEventListener('mouseout', () => btn.style.color = '#aaa');
        });
    }

    function addToCart(name, price, image) {
        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ name, price, image, quantity: 1 });
        }
        saveCart();
        renderCart();
        openCart();
    }

    function openCart() {
        if (cartOverlay && cartSidebar) {
            cartOverlay.classList.add('cart-open');
            cartSidebar.classList.add('cart-open');
        }
    }

    function closeCart() {
        if (cartOverlay && cartSidebar) {
            cartOverlay.classList.remove('cart-open');
            cartSidebar.classList.remove('cart-open');
        }
    }

    if (cartOpenBtn) cartOpenBtn.addEventListener('click', openCart);
    if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    // Initial render
    renderCart();

    // --- OTHER UI LOGIC ---

    // 1. Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
                navbar.style.background = 'rgba(10, 10, 10, 0.95)';
                navbar.style.backdropFilter = 'blur(10px)';
                navbar.style.borderBottom = '1px solid var(--card-border)';
            } else {
                navbar.classList.remove('scrolled');
                navbar.style.background = 'transparent';
                navbar.style.backdropFilter = 'none';
                navbar.style.borderBottom = 'none';
            }
        });
    }

    // 2. Countdown Timer
    const countdownBlocks = document.querySelectorAll('.countdown-block span');
    if (countdownBlocks.length === 4) {
        // Set a date 3 days from now
        let targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 3);
        targetDate.setHours(targetDate.getHours() + 12);
        targetDate.setMinutes(targetDate.getMinutes() + 45);

        function updateCountdown() {
            const now = new Date();
            const diff = targetDate - now;

            if (diff <= 0) return;

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const mins = Math.floor((diff / 1000 / 60) % 60);
            const secs = Math.floor((diff / 1000) % 60);

            countdownBlocks[0].textContent = days.toString().padStart(2, '0');
            countdownBlocks[1].textContent = hours.toString().padStart(2, '0');
            countdownBlocks[2].textContent = mins.toString().padStart(2, '0');
            countdownBlocks[3].textContent = secs.toString().padStart(2, '0');
        }
        setInterval(updateCountdown, 1000);
        updateCountdown();
    }

    // 3. Add to Cart Buttons
    const addToCartBtns = document.querySelectorAll('.btn-add-cart');
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Visual feedback
            const originalText = btn.textContent;
            btn.textContent = '✅ Added!';
            btn.style.background = '#10b981';
            btn.style.color = '#fff';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
                btn.style.color = '';
            }, 2000);

            // Logic to add to cart
            let name = "Custom Sneaker";
            let price = 8999;
            let image = "assets/hero.png";

            const shopCard = btn.closest('.shop-card') || btn.closest('.gallery-card') || btn.closest('.gallery-item');
            if (shopCard) {
                const titleEl = shopCard.querySelector('h3');
                if (titleEl) name = titleEl.textContent;
                
                const priceEl = shopCard.querySelector('.shop-price');
                if (priceEl) {
                    const priceText = priceEl.textContent.replace(/[₹,\s]/g, '');
                    if (priceText) price = Math.round(parseFloat(priceText));
                }
                
                const imgEl = shopCard.querySelector('img');
                if (imgEl) image = imgEl.src;
            } else if (document.getElementById('total-price')) {
                // Customizer page — include selected color and studio material
                const colorPicker = document.getElementById('shoeColorPicker');
                const selectedColor = colorPicker ? colorPicker.value.toUpperCase() : '#FFFFFF';
                
                // Get the model name from the customizer header
                const modelTitleEl = document.getElementById('modelTitle');
                const modelName = modelTitleEl ? modelTitleEl.textContent : 'Model X';
                
                // Get the material selected from the Material Studio page
                const savedMaterial = localStorage.getItem('kickcraft_selected_material');
                const materialLabel = savedMaterial ? savedMaterial : 'Standard';
                
                name = `${modelName} — ${selectedColor} (${materialLabel})`;
                const pText = document.getElementById('total-price').textContent.replace(/[₹,\s]/g, '');
                price = Math.round(parseFloat(pText)) || 8999;
                image = "assets/hero.png";
            }

            addToCart(name, price, image);
        });
    });

    // 4. Newsletter Form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('newsletter-email');
            const btn = newsletterForm.querySelector('button');
            if (emailInput.value) {
                const originalText = btn.textContent;
                btn.textContent = 'Subscribed! 🎉';
                emailInput.value = '';
                setTimeout(() => {
                    btn.textContent = originalText;
                }, 3000);
            }
        });
    }


    // 7. Gallery Filters
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    if (filterBtns.length > 0 && galleryItems.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filter = btn.textContent.toLowerCase();
                
                galleryItems.forEach(item => {
                    item.style.transition = 'opacity 0.3s ease';
                    let isMatch = false;
                    
                    if (filter === 'all configs') {
                        isMatch = true;
                    } else if (filter === 'shōnen anime' && item.classList.contains('anime-theme')) {
                        isMatch = true;
                    } else if (filter === 'originals' && item.classList.contains('original-theme')) {
                        isMatch = true;
                    } else if (filter === 'streetwear') {
                        const h3 = item.querySelector('h3');
                        const p = item.querySelector('p');
                        if (h3 && h3.textContent.toLowerCase().includes('streetwear')) isMatch = true;
                        if (p && p.textContent.toLowerCase().includes('streetwear')) isMatch = true;
                    }

                    if (isMatch) {
                        item.style.display = 'block';
                        setTimeout(() => item.style.opacity = '1', 10);
                    } else {
                        item.style.opacity = '0';
                        setTimeout(() => {
                            if (item.style.opacity === '0') {
                                item.style.display = 'none';
                            }
                        }, 300);
                    }
                });
            });
        });
    }

    // 8. Colors Page - Zone selection and coloring
    const zoneCards = document.querySelectorAll('.zone-card');
    const colorPicker = document.getElementById('colorPicker');
    if (zoneCards.length > 0 && colorPicker) {
        let activeZoneIndicator = document.getElementById('ind-body');
        
        const rgb2hex = (rgb) => {
            if (/^#[0-9A-F]{6}$/i.test(rgb)) return rgb;
            rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            if (!rgb) return "#ffffff";
            function hex(x) {
                return ("0" + parseInt(x).toString(16)).slice(-2);
            }
            return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
        };

        if (activeZoneIndicator) {
            const rgb = window.getComputedStyle(activeZoneIndicator).backgroundColor;
            colorPicker.value = rgb2hex(rgb);
        }
        
        zoneCards.forEach(card => {
            card.addEventListener('click', () => {
                zoneCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                activeZoneIndicator = card.querySelector('.color-indicator');
                
                const rgb = window.getComputedStyle(activeZoneIndicator).backgroundColor;
                const hex = rgb2hex(rgb);
                colorPicker.value = hex;
            });
        });

        colorPicker.addEventListener('input', (e) => {
            if (activeZoneIndicator) {
                activeZoneIndicator.style.background = e.target.value;
            }
        });
    }

    // 9. Material Page - Material selection
    const materialCards = document.querySelectorAll('.material-card');
    if (materialCards.length > 0) {
        materialCards.forEach(card => {
            card.addEventListener('click', () => {
                materialCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
            });
        });
    }


    // ===== CHECKOUT & PAYMENT GATEWAY =====

    // Create payment modal overlay (injected once into the page)
    function createPaymentModal() {
        if (document.getElementById('paymentModal')) return;

        const modal = document.createElement('div');
        modal.id = 'paymentModal';
        modal.className = 'payment-modal-overlay';
        modal.innerHTML = `
            <div class="payment-modal">
                <button class="payment-close" id="paymentCloseBtn">✕</button>
                <div class="payment-header">
                    <div class="payment-logo">KICK<span>CRAFT</span></div>
                    <h2>Secure Checkout</h2>
                    <p class="payment-summary-text" id="paymentSummaryText">0 items — ₹0</p>
                </div>

                <form class="payment-form" id="paymentForm">
                    <div class="form-group">
                        <label for="payFullName">Full Name</label>
                        <input type="text" id="payFullName" placeholder="Kunal Sharma" required autocomplete="name">
                    </div>
                    <div class="form-group">
                        <label for="payEmail">Email Address</label>
                        <input type="email" id="payEmail" placeholder="kunal@example.com" required autocomplete="email">
                    </div>
                    <div class="form-group">
                        <label for="payAddress">Shipping Address</label>
                        <input type="text" id="payAddress" placeholder="123 MG Road, Mumbai, IN" required autocomplete="street-address">
                    </div>

                    <div class="form-divider"></div>
                    <h3 class="form-section-title">💳 Payment Details</h3>

                    <div class="form-group">
                        <label for="payCardNumber">Card Number</label>
                        <input type="text" id="payCardNumber" placeholder="4242 4242 4242 4242" maxlength="19" required autocomplete="cc-number">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="payExpiry">Expiry</label>
                            <input type="text" id="payExpiry" placeholder="MM/YY" maxlength="5" required autocomplete="cc-exp">
                        </div>
                        <div class="form-group">
                            <label for="payCVV">CVV</label>
                            <input type="text" id="payCVV" placeholder="123" maxlength="4" required autocomplete="cc-csc">
                        </div>
                    </div>

                    <button type="submit" class="btn-primary glow btn-pay" id="payBtn">
                        <span id="payBtnText">Pay Now</span>
                        <span id="payBtnSpinner" class="pay-spinner" style="display:none;"></span>
                    </button>
                </form>

                <!-- Success state -->
                <div class="payment-success" id="paymentSuccess" style="display:none;">
                    <div class="success-icon">✅</div>
                    <h2>Payment Successful!</h2>
                    <p>Your order has been placed. Thank you for shopping with KickCraft!</p>
                    <p class="order-id-display" id="orderIdDisplay"></p>
                    <a href="orders.html" class="btn-primary glow" style="margin-top:20px; display:inline-block;">View Order History</a>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Close modal
        document.getElementById('paymentCloseBtn').addEventListener('click', closePaymentModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closePaymentModal();
        });

        // Card number formatting
        const cardInput = document.getElementById('payCardNumber');
        cardInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '').substring(0, 16);
            let formatted = val.replace(/(.{4})/g, '$1 ').trim();
            e.target.value = formatted;
        });

        // Expiry formatting
        const expiryInput = document.getElementById('payExpiry');
        expiryInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '').substring(0, 4);
            if (val.length > 2) val = val.substring(0, 2) + '/' + val.substring(2);
            e.target.value = val;
        });

        // Form submission
        document.getElementById('paymentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            processPayment();
        });
    }

    function openPaymentModal() {
        createPaymentModal();
        const modal = document.getElementById('paymentModal');
        const summaryText = document.getElementById('paymentSummaryText');
        const form = document.getElementById('paymentForm');
        const success = document.getElementById('paymentSuccess');

        // Reset to form view
        form.style.display = 'block';
        success.style.display = 'none';

        // Update summary
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        summaryText.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''} — ₹${totalPrice.toLocaleString('en-IN')}`;

        // Update pay button text
        const payBtnText = document.getElementById('payBtnText');
        payBtnText.textContent = `Pay ₹${totalPrice.toLocaleString('en-IN')}`;

        // Show modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closePaymentModal() {
        const modal = document.getElementById('paymentModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function processPayment() {
        const payBtn = document.getElementById('payBtn');
        const payBtnText = document.getElementById('payBtnText');
        const payBtnSpinner = document.getElementById('payBtnSpinner');
        const form = document.getElementById('paymentForm');
        const success = document.getElementById('paymentSuccess');

        // Show loading
        payBtn.disabled = true;
        payBtnText.textContent = 'Processing...';
        payBtnSpinner.style.display = 'inline-block';

        // Simulate payment processing delay
        setTimeout(() => {
            // Generate order
            const orderId = 'KC-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
            const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            const order = {
                id: orderId,
                date: new Date().toISOString(),
                items: JSON.parse(JSON.stringify(cart)),
                total: totalPrice,
                customer: {
                    name: document.getElementById('payFullName').value,
                    email: document.getElementById('payEmail').value,
                    address: document.getElementById('payAddress').value
                },
                status: 'Confirmed',
                paymentMethod: 'Card ending ' + document.getElementById('payCardNumber').value.slice(-4)
            };

            // Save to order history
            let orders = [];
            try {
                orders = JSON.parse(localStorage.getItem('kickcraft_orders') || '[]');
            } catch (e) {
                orders = [];
            }
            orders.unshift(order);
            localStorage.setItem('kickcraft_orders', JSON.stringify(orders));

            // Clear cart
            cart = [];
            saveCart();
            renderCart();

            // Show success
            form.style.display = 'none';
            success.style.display = 'flex';
            document.getElementById('orderIdDisplay').textContent = `Order ID: ${orderId}`;

            // Reset button
            payBtn.disabled = false;
            payBtnText.textContent = 'Pay Now';
            payBtnSpinner.style.display = 'none';

            // Close cart sidebar
            closeCart();

        }, 2000);
    }

    // Attach checkout button handler to all pages
    const checkoutBtns = document.querySelectorAll('.btn-checkout');
    checkoutBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Your cart is empty! Add some items first.');
                return;
            }
            closeCart();
            openPaymentModal();
        });
    });


    // ===== ORDER HISTORY PAGE =====
    const ordersContainer = document.getElementById('ordersContainer');
    if (ordersContainer) {
        renderOrderHistory();
    }

    function renderOrderHistory() {
        const container = document.getElementById('ordersContainer');
        if (!container) return;

        let orders = [];
        try {
            orders = JSON.parse(localStorage.getItem('kickcraft_orders') || '[]');
        } catch (e) {
            orders = [];
        }

        if (orders.length === 0) {
            container.innerHTML = `
                <div class="orders-empty">
                    <div class="empty-icon">📦</div>
                    <h3>No Orders Yet</h3>
                    <p>Once you checkout, your order history will appear here.</p>
                    <a href="index.html" class="btn-primary glow" style="margin-top:20px; display:inline-block;">Start Shopping</a>
                </div>
            `;
            return;
        }

        let html = '';
        orders.forEach((order) => {
            const date = new Date(order.date);
            const formattedDate = date.toLocaleDateString('en-IN', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });

            let itemsHtml = '';
            order.items.forEach(item => {
                const colorMatch = item.name.match(/#[0-9A-Fa-f]{6}/);
                const swatchHtml = colorMatch 
                    ? `<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${colorMatch[0]};border:2px solid rgba(255,255,255,0.2);vertical-align:middle;margin-right:6px;"></span>` 
                    : '';
                itemsHtml += `
                    <div class="order-item-row">
                        <span class="order-item-name">${swatchHtml}${item.name}</span>
                        <span class="order-item-qty">x${item.quantity}</span>
                        <span class="order-item-price">₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                `;
            });

            html += `
                <div class="order-card">
                    <div class="order-card-header">
                        <div class="order-meta">
                            <span class="order-id">${order.id}</span>
                            <span class="order-date">${formattedDate}</span>
                        </div>
                        <span class="order-status order-status--${order.status.toLowerCase()}">${order.status}</span>
                    </div>
                    <div class="order-items-list">
                        ${itemsHtml}
                    </div>
                    <div class="order-card-footer">
                        <div class="order-customer">
                            <span>📍 ${order.customer.name}</span>
                            <span>${order.paymentMethod}</span>
                        </div>
                        <div class="order-total-badge">₹${order.total.toLocaleString('en-IN')}</div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    // Clear order history button
    const clearOrdersBtn = document.getElementById('clearOrdersBtn');
    if (clearOrdersBtn) {
        clearOrdersBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all order history?')) {
                localStorage.removeItem('kickcraft_orders');
                renderOrderHistory();
            }
        });
    }

});
