document.addEventListener('DOMContentLoaded', () => {
    // 1. Navbar Scroll Effect & Active Link Highlight
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('section, header');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        // Sticky navbar styling
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active Link Highlight
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    });

    // 2. Mobile Menu Toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinksContainer = document.querySelector('.nav-links');

    mobileMenu.addEventListener('click', () => {
        navLinksContainer.classList.toggle('nav-active');
        // Simple animation for hamburger
        mobileMenu.classList.toggle('toggle');
    });

    // Close mobile menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navLinksContainer.classList.contains('nav-active')) {
                navLinksContainer.classList.remove('nav-active');
                mobileMenu.classList.remove('toggle');
            }
        });
    });

    // 3. Scroll Reveal Animation
    const reveals = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
        for (let i = 0; i < reveals.length; i++) {
            const windowHeight = window.innerHeight;
            const elementTop = reveals[i].getBoundingClientRect().top;
            const elementVisible = 100;

            if (elementTop < windowHeight - elementVisible) {
                reveals[i].classList.add('active');
            }
        }
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Trigger on initial load

    // 4. Form Submission Handler
    const orderForm = document.getElementById('orderForm');
    const formMessage = document.getElementById('formMessage');

    if (orderForm) {
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form values (just to show we can process them)
            const name = document.getElementById('name').value;
            const qty = document.getElementById('quantity').value;
            
            // Simulate an API call or order processing
            const submitBtn = orderForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = 'Processing...';
            submitBtn.disabled = true;

            setTimeout(() => {
                // Show success message
                formMessage.textContent = `Thank you, ${name}! Your order for ${qty}kg of mangoes has been placed successfully.`;
                formMessage.className = 'message success';
                
                // Reset form
                orderForm.reset();
                
                // Reset button
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;

                // Hide message after a few seconds
                setTimeout(() => {
                    formMessage.className = 'hidden message';
                }, 5000);

            }, 1500);
        });
    }
});
