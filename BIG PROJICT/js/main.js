// Utility to fetch products
async function getProducts() {
    try {
        const response = await fetch('products.json');
        if (!response.ok) throw new Error('Failed to fetch products');
        return await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

// Update cart and wishlist badges
function updateBadges() {
    const cart = JSON.parse(localStorage.getItem('talha_cart')) || [];
    const wishlist = JSON.parse(localStorage.getItem('talha_wishlist')) || [];
    
    const cartBadge = document.getElementById('cart-badge');
    const wishlistBadge = document.getElementById('wishlist-badge');
    
    if (cartBadge) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = totalItems;
        cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    
    if (wishlistBadge) {
        wishlistBadge.textContent = wishlist.length;
        wishlistBadge.style.display = wishlist.length > 0 ? 'flex' : 'none';
    }
}

// Initialize common UI elements
document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navBar = document.querySelector('.nav-bar');
    
    if (mobileMenuBtn && navBar) {
        mobileMenuBtn.addEventListener('click', () => {
            navBar.classList.toggle('active');
        });
    }

    // Search functionality
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const searchInput = document.getElementById('search-input').value.trim();
            if (searchInput) {
                window.location.href = `products.html?search=${encodeURIComponent(searchInput)}`;
            }
        });
    }

    // Auth state update
    const currentUser = JSON.parse(localStorage.getItem('talha_currentUser'));
    const userLinks = document.getElementById('user-links');
    if (userLinks) {
        if (currentUser) {
            userLinks.innerHTML = `
                <a href="profile.html">Hi, ${currentUser.name.split(' ')[0]}</a>
                <a href="#" id="logout-btn">Logout</a>
            `;
            document.getElementById('logout-btn').addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('talha_currentUser');
                window.location.reload();
            });
        } else {
            userLinks.innerHTML = `
                <a href="login.html">Login</a>
                <a href="register.html">Register</a>
            `;
        }
    }

    // Initial badge update
    updateBadges();
});
