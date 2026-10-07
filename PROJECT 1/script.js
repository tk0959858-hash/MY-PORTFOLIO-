/* ==========================================================================
   PAKFOOD - ONLINE FOOD ORDERING & CART SYSTEM INTERACTIVE SCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Food Menu Dataset
  const foodMenu = [
    {
      id: 101,
      title: 'Special Chicken Biryani',
      category: 'desi',
      price: 750,
      rating: 4.9,
      badge: 'Popular',
      image: 'IMAGES/biryani.jpg',
      desc: 'Authentic aromatic saffron basmati rice cooked with tender marinated chicken leg piece, spices & served with fresh raita.'
    },
    {
      id: 102,
      title: 'Desi Mutton Karahi (Half KG)',
      category: 'karahi',
      price: 1850,
      rating: 5.0,
      badge: 'Chef Special',
      image: 'IMAGES/karahi.jpg',
      desc: 'Fresh mutton cooked in black iron wok with tomatoes, green chilies, julienne ginger & desi ghee. Served with garlic naan.'
    },
    {
      id: 103,
      title: 'Gourmet Double Beef Cheeseburger',
      category: 'fastfood',
      price: 950,
      rating: 4.8,
      badge: 'Bestseller',
      image: 'IMAGES/burger.jpg',
      desc: 'Double flame-grilled beef patties, melted cheddar cheese, crisp lettuce, spicy secret sauce in a toasted brioche bun with fries.'
    },
    {
      id: 104,
      title: 'Pepperoni Supreme Pizza',
      category: 'fastfood',
      price: 1450,
      rating: 4.7,
      badge: 'Popular',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
      desc: 'Wood-fired crust topped with rich tomato herb sauce, extra mozzarella cheese & premium crispy beef pepperoni slices.'
    },
    {
      id: 105,
      title: 'Chicken Malai Boti Karahi',
      category: 'karahi',
      price: 1200,
      rating: 4.9,
      badge: 'Chef Special',
      image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80',
      desc: 'Creamy charcoal-grilled chicken malai boti simmered in rich cashew cream sauce and aromatic Pakistani spices.'
    },
    {
      id: 106,
      title: 'Peshawari Beef Chapli Kabab (2 Pcs)',
      category: 'desi',
      price: 650,
      rating: 4.8,
      badge: '',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
      desc: 'Traditional Peshawari style minced beef patties mixed with pomegranates, coriander seeds & fried to crispy perfection.'
    },
    {
      id: 107,
      title: 'Creamy Mango Lassi & Kheer',
      category: 'desserts',
      price: 350,
      rating: 4.9,
      badge: '',
      image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
      desc: 'Refreshing chilled Alphonso mango yogurt lassi served alongside traditional rice kheer topped with pistachios.'
    },
    {
      id: 108,
      title: 'Hot Chocolate Lava Cake & Ice Cream',
      category: 'desserts',
      price: 450,
      rating: 4.9,
      badge: 'Sweet Tooth',
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
      desc: 'Warm molten chocolate cake oozing rich fudge, served with a scoop of Madagascar vanilla bean ice cream.'
    }
  ];

  // 2. Shopping Cart State
  let cart = [
    { id: 101, title: 'Special Chicken Biryani', price: 750, image: 'IMAGES/biryani.jpg', qty: 1 }
  ];
  let discountApplied = false;

  // 3. Elements Selection
  const menuGrid = document.getElementById('menuGrid');
  const searchInput = document.getElementById('searchInput');
  const categoryTabs = document.querySelectorAll('#categoryTabs .cat-tab');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartTrigger = document.getElementById('cartTrigger');
  const cartClose = document.getElementById('cartClose');
  const cartCount = document.getElementById('cartCount');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartSubtotal = document.getElementById('cartSubtotal');
  const cartDelivery = document.getElementById('cartDelivery');
  const cartDiscount = document.getElementById('cartDiscount');
  const discountRow = document.getElementById('discountRow');
  const cartTotal = document.getElementById('cartTotal');
  const checkoutModal = document.getElementById('checkoutModal');
  const successModal = document.getElementById('successModal');
  const toastContainer = document.getElementById('toastContainer');

  // 4. Render Menu Grid
  function renderMenu(category = 'all', searchQuery = '') {
    if (!menuGrid) return;
    menuGrid.innerHTML = '';

    let filtered = foodMenu;

    if (category !== 'all') {
      filtered = filtered.filter(item => item.category === category);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q)
      );
    }

    if (filtered.length === 0) {
      menuGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
          <i class="fas fa-search" style="font-size: 2.5rem; color: var(--primary-amber); margin-bottom: 12px;"></i>
          <h3>No matching dishes found</h3>
          <p>Try searching for "Biryani", "Burger", or "Karahi"</p>
        </div>
      `;
      return;
    }

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'glass-card dish-card';
      card.innerHTML = `
        <div class="dish-img-wrap">
          <img src="${item.image}" alt="${item.title}" loading="lazy">
          ${item.badge ? `<span class="dish-badge ${item.badge === 'Popular' || item.badge === 'Bestseller' ? 'badge-popular' : 'badge-special'}">${item.badge}</span>` : ''}
        </div>
        <div class="dish-body">
          <div class="dish-header">
            <h3 class="dish-title">${item.title}</h3>
            <span class="dish-price">Rs ${item.price}</span>
          </div>
          <p class="dish-desc">${item.desc}</p>
          <div class="dish-footer">
            <div class="rating">
              <i class="fas fa-star"></i> <span>${item.rating} (120+ reviews)</span>
            </div>
            <button class="btn btn-primary btn-sm" onclick="addToCart(${item.id})">
              <i class="fas fa-plus"></i> Add
            </button>
          </div>
        </div>
      `;
      menuGrid.appendChild(card);
    });
  }

  renderMenu('all');

  // Search & Category Event Handlers
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const activeTab = document.querySelector('#categoryTabs .cat-tab.active');
      const cat = activeTab ? activeTab.getAttribute('data-cat') : 'all';
      renderMenu(cat, e.target.value);
    });
  }

  categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      categoryTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.getAttribute('data-cat');
      renderMenu(cat, searchInput ? searchInput.value : '');
    });
  });

  // 5. Shopping Cart Functions
  window.addToCart = function(id) {
    const item = foodMenu.find(f => f.id === id);
    if (!item) return;

    const existing = cart.find(c => c.id === id);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({
        id: item.id,
        title: item.title,
        price: item.price,
        image: item.image,
        qty: 1
      });
    }

    updateCartUI();
    showToast(`Added "${item.title}" to cart!`, 'success');
  };

  window.quickAddHeroDish = function() {
    window.addToCart(101);
    openCart();
  };

  function updateCartUI() {
    let totalItems = 0;
    let subtotal = 0;

    cartItemsList.innerHTML = '';

    if (cart.length === 0) {
      cartItemsList.innerHTML = `
        <div style="text-align: center; padding: 50px 20px; color: var(--text-muted);">
          <i class="fas fa-shopping-basket" style="font-size: 3rem; color: var(--border-glass); margin-bottom: 15px;"></i>
          <p>Your cart is empty.</p>
          <a href="#menu" class="btn btn-secondary btn-sm" style="margin-top: 15px;" onclick="closeCart()">Browse Menu</a>
        </div>
      `;
    } else {
      cart.forEach(item => {
        totalItems += item.qty;
        subtotal += item.price * item.qty;

        const cartItemDiv = document.createElement('div');
        cartItemDiv.className = 'cart-item';
        cartItemDiv.innerHTML = `
          <img src="${item.image}" alt="${item.title}">
          <div class="cart-item-info">
            <div class="cart-item-name">${item.title}</div>
            <div class="cart-item-price">Rs ${item.price}</div>
            <div class="cart-qty-ctrl">
              <button class="qty-btn" onclick="changeQty(${item.id}, -1)">-</button>
              <span style="font-size: 0.9rem; font-weight: 700;">${item.qty}</span>
              <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
            </div>
          </div>
          <button style="background: none; border: none; color: var(--primary-crimson); cursor: pointer; padding: 4px;" onclick="removeItem(${item.id})">
            <i class="fas fa-trash-alt"></i>
          </button>
        `;
        cartItemsList.appendChild(cartItemDiv);
      });
    }

    cartCount.textContent = totalItems;

    // Delivery calculation: Free if subtotal > 1000
    const deliveryFee = subtotal >= 1000 || subtotal === 0 ? 0 : 150;
    let discountAmount = discountApplied ? Math.round(subtotal * 0.2) : 0;
    const grandTotal = Math.max(0, subtotal + deliveryFee - discountAmount);

    cartSubtotal.textContent = `Rs ${subtotal}`;
    cartDelivery.textContent = deliveryFee === 0 ? 'FREE' : `Rs ${deliveryFee}`;
    cartTotal.textContent = `Rs ${grandTotal}`;

    if (discountApplied && subtotal > 0) {
      discountRow.style.display = 'flex';
      cartDiscount.textContent = `-Rs ${discountAmount}`;
    } else {
      discountRow.style.display = 'none';
    }

    const checkoutTotalAmount = document.getElementById('checkoutTotalAmount');
    if (checkoutTotalAmount) checkoutTotalAmount.textContent = `Rs ${grandTotal}`;
  }

  window.changeQty = function(id, delta) {
    const item = cart.find(c => c.id === id);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter(c => c.id !== id);
    }
    updateCartUI();
  };

  window.removeItem = function(id) {
    cart = cart.filter(c => c.id !== id);
    updateCartUI();
    showToast('Item removed from cart', 'info');
  };

  window.applyCoupon = function() {
    const couponInput = document.getElementById('couponInput');
    if (!couponInput) return;
    const code = couponInput.value.trim().toUpperCase();

    if (code === 'PAKFOOD20') {
      discountApplied = true;
      updateCartUI();
      showToast('🎉 Coupon PAKFOOD20 applied! 20% discount added.', 'success');
    } else {
      showToast('Invalid promo code. Use code: PAKFOOD20', 'error');
    }
  };

  // 6. Cart Drawer Toggle
  function openCart() {
    if (cartDrawer) cartDrawer.classList.add('active');
  }

  function closeCart() {
    if (cartDrawer) cartDrawer.classList.remove('active');
  }

  if (cartTrigger) cartTrigger.addEventListener('click', openCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);

  // 7. Checkout & Modal Logic
  window.openCheckoutModal = function() {
    if (cart.length === 0) {
      showToast('Your cart is empty! Please add dishes to order.', 'error');
      return;
    }
    closeCart();
    if (checkoutModal) checkoutModal.classList.add('active');
  };

  window.closeCheckoutModal = function() {
    if (checkoutModal) checkoutModal.classList.remove('active');
  };

  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      closeCheckoutModal();

      const trackingId = 'PF-' + Math.floor(10000 + Math.random() * 90000);
      const trackingElem = document.getElementById('trackingId');
      if (trackingElem) trackingElem.textContent = trackingId;

      // Reset Cart
      cart = [];
      discountApplied = false;
      updateCartUI();

      if (successModal) successModal.classList.add('active');
    });
  }

  window.closeSuccessModal = function() {
    if (successModal) successModal.classList.remove('active');
  };

  // 8. Table Reservation Inquiry Form
  const inquiryForm = document.getElementById('inquiryForm');
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      inquiryForm.reset();
      showToast('Inquiry submitted successfully! Our team will contact you shortly.', 'success');
    });
  }

  // 9. Countdown Timer Simulation
  let timeInSeconds = 8 * 3600 + 42 * 60 + 15;
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  setInterval(() => {
    if (timeInSeconds <= 0) return;
    timeInSeconds--;

    const h = Math.floor(timeInSeconds / 3600);
    const m = Math.floor((timeInSeconds % 3600) / 60);
    const s = timeInSeconds % 60;

    if (hoursEl) hoursEl.textContent = String(h).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(m).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(s).padStart(2, '0');
  }, 1000);

  // 10. Toast Notification System
  window.showToast = function(msg, type = 'info') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}" style="color: var(--primary-amber); font-size: 1.2rem;"></i>
      <span>${msg}</span>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.4s ease';
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  };

  // 11. Navbar Mobile Toggle & Scroll Highlight
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      if (navbar) navbar.classList.add('scrolled');
    } else {
      if (navbar) navbar.classList.remove('scrolled');
    }
  });

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  // Initialize UI
  updateCartUI();
});