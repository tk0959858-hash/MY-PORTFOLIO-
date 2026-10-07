document.addEventListener('DOMContentLoaded', async () => {
    const products = await getProducts();
    
    // Render Cart Items
    const cartContainer = document.getElementById('cart-items-container');
    const cartSubtotalEl = document.getElementById('cart-subtotal');
    const cartTotalEl = document.getElementById('cart-total');
    
    function renderCart() {
        if (!cartContainer) return;
        
        const cart = JSON.parse(localStorage.getItem('talha_cart')) || [];
        
        if (cart.length === 0) {
            cartContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Your cart is empty</h3>
                    <p>Looks like you haven't added anything to your cart yet.</p>
                    <a href="index.html" class="btn" style="margin-top:20px;">Continue Shopping</a>
                </div>
            `;
            if (cartSubtotalEl) cartSubtotalEl.innerText = 'Rs. 0';
            if (cartTotalEl) cartTotalEl.innerText = 'Rs. 0';
            return;
        }
        
        let subtotal = 0;
        let html = `
            <table class="cart-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        cart.forEach((cartItem, index) => {
            const product = products.find(p => p.id === cartItem.id);
            if (!product) return;
            
            const itemTotal = product.price * cartItem.quantity;
            subtotal += itemTotal;
            
            html += `
                <tr>
                    <td>
                        <div class="cart-item-info">
                            <img src="${product.image}" alt="${product.title}" class="cart-item-img">
                            <a href="product-details.html?id=${product.id}">${product.title}</a>
                        </div>
                    </td>
                    <td>Rs. ${product.price.toLocaleString()}</td>
                    <td>
                        <div class="qty-controls">
                            <button class="qty-btn" onclick="updateCartQty(${index}, -1)">-</button>
                            <input type="text" class="qty-input" value="${cartItem.quantity}" readonly>
                            <button class="qty-btn" onclick="updateCartQty(${index}, 1)">+</button>
                        </div>
                    </td>
                    <td style="font-weight:600; color:var(--primary-color);">Rs. ${itemTotal.toLocaleString()}</td>
                    <td><button class="btn btn-outline" style="padding: 5px 10px;" onclick="removeFromCart(${index})"><i class="fas fa-trash"></i></button></td>
                </tr>
            `;
        });
        
        html += `</tbody></table>`;
        cartContainer.innerHTML = html;
        
        if (cartSubtotalEl) cartSubtotalEl.innerText = `Rs. ${subtotal.toLocaleString()}`;
        if (cartTotalEl) cartTotalEl.innerText = `Rs. ${(subtotal + 150).toLocaleString()}`; // Adding 150 delivery fee
    }
    
    window.updateCartQty = function(index, change) {
        let cart = JSON.parse(localStorage.getItem('talha_cart')) || [];
        if (cart[index]) {
            cart[index].quantity += change;
            if (cart[index].quantity < 1) cart[index].quantity = 1;
            localStorage.setItem('talha_cart', JSON.stringify(cart));
            renderCart();
            updateBadges();
        }
    };
    
    window.removeFromCart = function(index) {
        let cart = JSON.parse(localStorage.getItem('talha_cart')) || [];
        cart.splice(index, 1);
        localStorage.setItem('talha_cart', JSON.stringify(cart));
        renderCart();
        updateBadges();
    };
    
    renderCart();

    // Render Wishlist
    const wishlistContainer = document.getElementById('wishlist-grid');
    if (wishlistContainer) {
        const wishlist = JSON.parse(localStorage.getItem('talha_wishlist')) || [];
        
        if (wishlist.length === 0) {
            wishlistContainer.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-heart"></i>
                    <h3>Your wishlist is empty</h3>
                    <a href="index.html" class="btn" style="margin-top:20px;">Explore Products</a>
                </div>
            `;
        } else {
            const wishlistProducts = products.filter(p => wishlist.includes(p.id));
            wishlistContainer.innerHTML = wishlistProducts.map(createProductCard).join('');
        }
    }

    // Checkout Form
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        // Render Checkout Summary
        const summaryContainer = document.getElementById('checkout-summary-items');
        const checkoutTotal = document.getElementById('checkout-total');
        const cart = JSON.parse(localStorage.getItem('talha_cart')) || [];
        
        if (cart.length === 0) {
            window.location.href = 'cart.html'; // Redirect to cart if empty
            return;
        }

        let subtotal = 0;
        let summaryHtml = '';
        
        cart.forEach(cartItem => {
            const product = products.find(p => p.id === cartItem.id);
            if (!product) return;
            const itemTotal = product.price * cartItem.quantity;
            subtotal += itemTotal;
            summaryHtml += `
                <div class="summary-row">
                    <span>${product.title} x ${cartItem.quantity}</span>
                    <span>Rs. ${itemTotal.toLocaleString()}</span>
                </div>
            `;
        });
        
        summaryContainer.innerHTML = summaryHtml;
        const totalAmount = subtotal + 150;
        checkoutTotal.innerText = `Rs. ${totalAmount.toLocaleString()}`;

        // Handle Submit
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form values
            const formData = new FormData(checkoutForm);
            const orderData = {
                id: 'ORD-' + Math.floor(Math.random() * 1000000),
                date: new Date().toLocaleDateString(),
                status: 'Processing',
                items: cart,
                total: totalAmount,
                paymentMethod: formData.get('payment_method'),
                customer: {
                    name: formData.get('fullName'),
                    phone: formData.get('phone'),
                    address: formData.get('address')
                }
            };
            
            // Save Order
            const orders = JSON.parse(localStorage.getItem('talha_orders')) || [];
            orders.unshift(orderData);
            localStorage.setItem('talha_orders', JSON.stringify(orders));
            
            // Clear Cart
            localStorage.setItem('talha_cart', JSON.stringify([]));
            
            alert('Order Placed Successfully! Your Order ID is ' + orderData.id);
            window.location.href = 'orders.html';
        });
    }

    // Render Orders
    const ordersContainer = document.getElementById('orders-list');
    if (ordersContainer) {
        const orders = JSON.parse(localStorage.getItem('talha_orders')) || [];
        
        if (orders.length === 0) {
            ordersContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box"></i>
                    <h3>No orders yet</h3>
                    <a href="index.html" class="btn" style="margin-top:20px;">Start Shopping</a>
                </div>
            `;
            return;
        }

        let html = '';
        orders.forEach(order => {
            html += `
                <div class="cart-items" style="margin-bottom: 20px;">
                    <div style="display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding-bottom:10px; margin-bottom:15px;">
                        <span style="font-weight:600;">Order #${order.id}</span>
                        <span style="color:var(--primary-color); font-weight:600;">Status: ${order.status}</span>
                    </div>
                    <p style="font-size:14px; margin-bottom:5px;">Date: ${order.date}</p>
                    <p style="font-size:14px; margin-bottom:5px;">Payment: ${order.paymentMethod}</p>
                    <p style="font-size:14px; font-weight:bold; margin-bottom:15px;">Total: Rs. ${order.total.toLocaleString()}</p>
                    <table class="cart-table">
            `;
            
            order.items.forEach(item => {
                const product = products.find(p => p.id === item.id);
                if (product) {
                    html += `
                        <tr>
                            <td><img src="${product.image}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;"></td>
                            <td>${product.title}</td>
                            <td>Qty: ${item.quantity}</td>
                            <td>Rs. ${(product.price * item.quantity).toLocaleString()}</td>
                        </tr>
                    `;
                }
            });
            html += `</table></div>`;
        });
        
        ordersContainer.innerHTML = html;
    }
});
