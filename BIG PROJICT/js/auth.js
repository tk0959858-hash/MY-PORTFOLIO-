document.addEventListener('DOMContentLoaded', () => {
    
    // Register Logic
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const phone = document.getElementById('reg-phone').value;
            const password = document.getElementById('reg-password').value;
            const confirmPassword = document.getElementById('reg-confirm-password').value;
            
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            const users = JSON.parse(localStorage.getItem('talha_users')) || [];
            
            // Check if email exists
            if (users.some(u => u.email === email)) {
                alert('Email already registered!');
                return;
            }
            
            const newUser = { name, email, phone, password };
            users.push(newUser);
            localStorage.setItem('talha_users', JSON.stringify(users));
            
            // Auto login
            localStorage.setItem('talha_currentUser', JSON.stringify(newUser));
            alert('Registration Successful!');
            window.location.href = 'index.html';
        });
    }

    // Login Logic
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('log-email').value;
            const password = document.getElementById('log-password').value;
            
            const users = JSON.parse(localStorage.getItem('talha_users')) || [];
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                localStorage.setItem('talha_currentUser', JSON.stringify(user));
                alert('Login Successful!');
                window.location.href = 'index.html';
            } else {
                alert('Invalid email or password!');
            }
        });
    }

    // Profile Data Loading
    const profileContainer = document.getElementById('profile-info');
    if (profileContainer) {
        const currentUser = JSON.parse(localStorage.getItem('talha_currentUser'));
        
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }
        
        profileContainer.innerHTML = `
            <div style="margin-bottom: 20px;">
                <label style="font-size:12px; color:var(--text-light);">Full Name</label>
                <div style="font-weight:600; font-size:18px;">${currentUser.name}</div>
            </div>
            <div style="margin-bottom: 20px;">
                <label style="font-size:12px; color:var(--text-light);">Email Address</label>
                <div style="font-weight:600;">${currentUser.email}</div>
            </div>
            <div style="margin-bottom: 20px;">
                <label style="font-size:12px; color:var(--text-light);">Phone Number</label>
                <div style="font-weight:600;">${currentUser.phone}</div>
            </div>
            <button class="btn btn-outline" style="margin-top: 10px;">Edit Profile (Demo)</button>
        `;
    }
});
