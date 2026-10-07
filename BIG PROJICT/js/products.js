// Generate a product card HTML
function createProductCard(product) {
    const isWishlist = (JSON.parse(localStorage.getItem('talha_wishlist')) || []).some(id => id === product.id);
    const wishlistClass = isWishlist ? 'active' : '';
    
    return `
        <div class="product-card">
            ${product.discount ? `<div class="product-badge">-${product.discount}%</div>` : ''}
            <a href="product-details.html?id=${product.id}" class="product-img-wrapper">
                <img src="${product.image}" alt="${product.title}" class="product-img">
            </a>
            <div class="product-info">
                <a href="product-details.html?id=${product.id}">
                    <h3 class="product-title">${product.title}</h3>
                </a>
                <div class="product-price">Rs. ${product.price.toLocaleString()}</div>
                ${product.oldPrice ? `<div class="product-old-price">Rs. ${product.oldPrice.toLocaleString()}</div>` : ''}
                <div class="product-rating">
                    ${'<i class="fas fa-star"></i>'.repeat(Math.floor(product.rating))}
                    ${product.rating % 1 !== 0 ? '<i class="fas fa-star-half-alt"></i>' : ''}
                    <span>(${product.reviews})</span>
                </div>
            </div>
            <div class="product-actions">
                <button class="btn-add-cart" onclick="addToCart(${product.id})">Add to Cart</button>
                <button class="btn-wishlist ${wishlistClass}" onclick="toggleWishlist(${product.id}, this)"><i class="fas fa-heart"></i></button>
            </div>
        </div>
    `;
}

// Global functions for cart and wishlist interaction from product cards
window.addToCart = function(productId, qty = 1) {
    const cart = JSON.parse(localStorage.getItem('talha_cart')) || [];
    const existing = cart.find(item => item.id === productId);
    
    if (existing) {
        existing.quantity += qty;
    } else {
        cart.push({ id: productId, quantity: qty });
    }
    
    localStorage.setItem('talha_cart', JSON.stringify(cart));
    updateBadges();
    alert('Product added to cart!');
};

window.toggleWishlist = function(productId, btnElement) {
    let wishlist = JSON.parse(localStorage.getItem('talha_wishlist')) || [];
    const index = wishlist.indexOf(productId);
    
    if (index === -1) {
        wishlist.push(productId);
        if (btnElement) btnElement.classList.add('active');
    } else {
        wishlist.splice(index, 1);
        if (btnElement) btnElement.classList.remove('active');
    }
    
    localStorage.setItem('talha_wishlist', JSON.stringify(wishlist));
    updateBadges();
};

document.addEventListener('DOMContentLoaded', async () => {
    const products = await getProducts();
    
    // Homepage - Slider
    const slider = document.querySelector('.slider');
    if (slider) {
        let currentSlide = 0;
        const slidesCount = document.querySelectorAll('.slide').length;
        
        document.querySelector('.next-btn')?.addEventListener('click', () => {
            currentSlide = (currentSlide + 1) % slidesCount;
            slider.style.transform = `translateX(-${currentSlide * 100}%)`;
        });
        
        document.querySelector('.prev-btn')?.addEventListener('click', () => {
            currentSlide = (currentSlide - 1 + slidesCount) % slidesCount;
            slider.style.transform = `translateX(-${currentSlide * 100}%)`;
        });
        
        // Auto slide
        setInterval(() => {
            currentSlide = (currentSlide + 1) % slidesCount;
            slider.style.transform = `translateX(-${currentSlide * 100}%)`;
        }, 5000);
    }
    
    // Homepage - Flash Sale Countdown
    const countdownEl = document.getElementById('countdown');
    if (countdownEl) {
        // Set end time 24 hours from now (demo)
        let endTime = localStorage.getItem('talha_flash_end');
        if (!endTime || new Date(parseInt(endTime)) < new Date()) {
            endTime = new Date().getTime() + 24 * 60 * 60 * 1000;
            localStorage.setItem('talha_flash_end', endTime);
        }
        
        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = endTime - now;
            
            if (distance < 0) return;
            
            const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((distance % (1000 * 60)) / 1000);
            
            document.getElementById('hours').innerText = h.toString().padStart(2, '0');
            document.getElementById('minutes').innerText = m.toString().padStart(2, '0');
            document.getElementById('seconds').innerText = s.toString().padStart(2, '0');
        };
        
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }
    
    // Homepage - Render Products
    const flashSaleGrid = document.getElementById('flash-sale-grid');
    if (flashSaleGrid) {
        // Get products with discount > 15
        const flashProducts = products.filter(p => p.discount > 15).slice(0, 5);
        flashSaleGrid.innerHTML = flashProducts.map(createProductCard).join('');
    }
    
    const justForYouGrid = document.getElementById('just-for-you-grid');
    if (justForYouGrid) {
        const randomProducts = [...products].sort(() => 0.5 - Math.random()).slice(0, 15);
        justForYouGrid.innerHTML = randomProducts.map(createProductCard).join('');
    }
    
    // Products Page - Filter & Sort
    const productsGrid = document.getElementById('all-products-grid');
    if (productsGrid) {
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search')?.toLowerCase() || '';
        const categoryQuery = urlParams.get('category')?.toLowerCase() || '';
        
        let filteredProducts = products.filter(p => {
            const matchSearch = p.title.toLowerCase().includes(searchQuery) || p.description.toLowerCase().includes(searchQuery);
            const matchCat = categoryQuery ? p.category.toLowerCase() === categoryQuery : true;
            return matchSearch && matchCat;
        });
        
        // Setup Search Title
        const pageTitle = document.getElementById('products-page-title');
        if (pageTitle) {
            if (searchQuery) pageTitle.innerText = `Search Results for "${searchQuery}"`;
            else if (categoryQuery) pageTitle.innerText = categoryQuery.charAt(0).toUpperCase() + categoryQuery.slice(1);
        }
        
        const renderProducts = (prods) => {
            if (prods.length === 0) {
                productsGrid.innerHTML = `<div class="empty-state"><i class="fas fa-box-open"></i><h3>No products found</h3></div>`;
                productsGrid.style.display = 'block';
            } else {
                productsGrid.style.display = 'grid';
                productsGrid.innerHTML = prods.map(createProductCard).join('');
            }
        };
        
        renderProducts(filteredProducts);
        
        // Sorting
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                const val = e.target.value;
                let sorted = [...filteredProducts];
                if (val === 'price-low') sorted.sort((a, b) => a.price - b.price);
                if (val === 'price-high') sorted.sort((a, b) => b.price - a.price);
                if (val === 'rating') sorted.sort((a, b) => b.rating - a.rating);
                if (val === 'popular') sorted.sort((a, b) => b.sold - a.sold);
                renderProducts(sorted);
            });
        }
        
        // Filtering
        document.querySelectorAll('input[name="category"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const cat = e.target.value;
                if (cat === 'all') {
                    filteredProducts = products.filter(p => p.title.toLowerCase().includes(searchQuery));
                } else {
                    filteredProducts = products.filter(p => p.category === cat && p.title.toLowerCase().includes(searchQuery));
                }
                // apply sort if any
                sortSelect?.dispatchEvent(new Event('change'));
            });
        });
    }
    
    // Product Details Page
    const detailsContainer = document.getElementById('product-details-container');
    if (detailsContainer) {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = parseInt(urlParams.get('id'));
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            detailsContainer.innerHTML = `<div class="empty-state"><h3>Product not found</h3><a href="index.html" class="btn">Go Home</a></div>`;
            return;
        }
        
        // Breadcrumb
        document.getElementById('breadcrumb-category').innerText = product.category;
        document.getElementById('breadcrumb-title').innerText = product.title;
        
        // Populate Details
        document.getElementById('main-image').src = product.image;
        document.getElementById('thumb-1').src = product.image;
        document.getElementById('detail-title').innerText = product.title;
        document.getElementById('detail-reviews').innerText = `${product.reviews} Ratings | ${product.sold} Sold`;
        document.getElementById('detail-price').innerText = `Rs. ${product.price.toLocaleString()}`;
        if (product.oldPrice) {
            document.getElementById('detail-old-price').innerText = `Rs. ${product.oldPrice.toLocaleString()}`;
            document.getElementById('detail-discount').innerText = `-${product.discount}%`;
        } else {
            document.getElementById('detail-old-price').style.display = 'none';
            document.getElementById('detail-discount').style.display = 'none';
        }
        document.getElementById('detail-description').innerText = product.description;
        
        // Ratings
        document.getElementById('detail-stars').innerHTML = 
            '<i class="fas fa-star"></i>'.repeat(Math.floor(product.rating)) +
            (product.rating % 1 !== 0 ? '<i class="fas fa-star-half-alt"></i>' : '');
            
        // Quantity Controls
        const qtyInput = document.getElementById('qty-input');
        document.getElementById('qty-minus').addEventListener('click', () => {
            if (qtyInput.value > 1) qtyInput.value--;
        });
        document.getElementById('qty-plus').addEventListener('click', () => {
            qtyInput.value++;
        });
        
        // Add to Cart
        document.getElementById('detail-add-cart').addEventListener('click', () => {
            window.addToCart(product.id, parseInt(qtyInput.value));
        });
        
        // Buy Now
        document.getElementById('detail-buy-now').addEventListener('click', () => {
            window.addToCart(product.id, parseInt(qtyInput.value));
            window.location.href = 'cart.html';
        });
    }
});
