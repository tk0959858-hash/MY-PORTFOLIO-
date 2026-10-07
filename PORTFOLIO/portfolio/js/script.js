'use strict';

/* =========================================================
   Utility helpers
   ========================================================= */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* =========================================================
   Profile Image Fallback
   ========================================================= */
(function initProfileFallback() {
  const img = $('#profileImg');
  const fallback = $('#profileFallback');
  if (!img || !fallback) return;

  img.addEventListener('error', () => {
    img.style.display = 'none';
    fallback.classList.add('visible');
  });

  img.addEventListener('load', () => {
    fallback.classList.remove('visible');
    img.style.display = '';
  });

  if (img.complete && img.naturalWidth === 0) {
    img.dispatchEvent(new Event('error'));
  }
})();

/* =========================================================
   Project Image Fallback
   ========================================================= */
(function initProjectFallbacks() {
  $$('.project-img').forEach(img => {
    img.addEventListener('error', () => {
      img.style.display = 'none';
      const placeholder = img.closest('.project-image')?.querySelector('.project-img-placeholder');
      if (placeholder) placeholder.style.display = 'flex';
    });
  });
})();

/* =========================================================
   Header scroll state
   ========================================================= */
(function initHeaderScroll() {
  const header = $('#header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* =========================================================
   Mobile Navigation (hamburger)
   ========================================================= */
(function initMobileNav() {
  const hamburger = $('#hamburger');
  const nav = $('#nav');
  const navLinks = $$('.nav-link');
  if (!hamburger || !nav) return;

  const openNav = () => {
    nav.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeNav = () => {
    nav.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  const toggleNav = () => {
    nav.classList.contains('open') ? closeNav() : openNav();
  };

  hamburger.addEventListener('click', toggleNav);

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (nav.classList.contains('open')) closeNav();
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('open')) closeNav();
  });

  document.addEventListener('click', e => {
    if (nav.classList.contains('open') &&
        !nav.contains(e.target) &&
        !hamburger.contains(e.target)) {
      closeNav();
    }
  });
})();

/* =========================================================
   Smooth Scrolling
   ========================================================= */
(function initSmoothScroll() {
  document.addEventListener('click', e => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const targetId = anchor.getAttribute('href');
    if (!targetId || targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();

    const headerH = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--header-h') || '68',
      10
    );

    const top = target.getBoundingClientRect().top + window.scrollY - headerH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
})();

/* =========================================================
   Active Navigation State (IntersectionObserver)
   ========================================================= */
(function initActiveNav() {
  const sections = $$('section[id]');
  const navLinks = $$('.nav-link[data-section]');
  if (!sections.length || !navLinks.length) return;

  const setActive = id => {
    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === id);
    });
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, {
    rootMargin: '-40% 0px -55% 0px',
    threshold: 0,
  });

  sections.forEach(sec => observer.observe(sec));
})();

/* =========================================================
   Scroll Reveal Animations
   ========================================================= */
(function initScrollReveal() {
  const elements = $$('.reveal');
  if (!elements.length) return;

  if (!window.IntersectionObserver) {
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
})();

/* =========================================================
   Back to Top Button
   ========================================================= */
(function initBackToTop() {
  const btn = $('#backToTop');
  if (!btn) return;

  const toggleVisibility = () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  };

  window.addEventListener('scroll', toggleVisibility, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* =========================================================
   Contact Form Validation
   ========================================================= */
(function initContactForm() {
  const form = $('#contactForm');
  if (!form) return;

  const nameInput    = $('#formName');
  const emailInput   = $('#formEmail');
  const messageInput = $('#formMessage');
  const nameError    = $('#nameError');
  const emailError   = $('#emailError');
  const messageError = $('#messageError');
  const successMsg   = $('#formSuccess');
  const submitBtn    = $('#formSubmit');

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const showError = (input, errorEl, message) => {
    input.classList.add('input-error');
    errorEl.textContent = message;
    return false;
  };

  const clearError = (input, errorEl) => {
    input.classList.remove('input-error');
    errorEl.textContent = '';
    return true;
  };

  const validateName = () => {
    const val = nameInput.value.trim();
    if (!val)          return showError(nameInput, nameError, 'Please enter your name.');
    if (val.length < 2) return showError(nameInput, nameError, 'Name must be at least 2 characters.');
    return clearError(nameInput, nameError);
  };

  const validateEmail = () => {
    const val = emailInput.value.trim();
    if (!val)               return showError(emailInput, emailError, 'Please enter your email address.');
    if (!EMAIL_RE.test(val)) return showError(emailInput, emailError, 'Please enter a valid email address.');
    return clearError(emailInput, emailError);
  };

  const validateMessage = () => {
    const val = messageInput.value.trim();
    if (!val)           return showError(messageInput, messageError, 'Please enter your message.');
    if (val.length < 10) return showError(messageInput, messageError, 'Message must be at least 10 characters.');
    return clearError(messageInput, messageError);
  };

  nameInput.addEventListener('blur', validateName);
  emailInput.addEventListener('blur', validateEmail);
  messageInput.addEventListener('blur', validateMessage);

  nameInput.addEventListener('input', () => {
    if (nameInput.classList.contains('input-error')) validateName();
  });
  emailInput.addEventListener('input', () => {
    if (emailInput.classList.contains('input-error')) validateEmail();
  });
  messageInput.addEventListener('input', () => {
    if (messageInput.classList.contains('input-error')) validateMessage();
  });

  form.addEventListener('submit', e => {
    e.preventDefault();

    const isNameValid    = validateName();
    const isEmailValid   = validateEmail();
    const isMessageValid = validateMessage();

    if (!isNameValid || !isEmailValid || !isMessageValid) return;

    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;

    setTimeout(() => {
      form.reset();
      successMsg.hidden = false;
      submitBtn.textContent = 'Send Message';
      submitBtn.disabled = false;

      setTimeout(() => { successMsg.hidden = true; }, 5000);
    }, 1200);
  });
})();

/* =========================================================
   Hero entrance animation (stagger children)
   ========================================================= */
(function initHeroEntrance() {
  const items = $$('.hero-content > *');
  items.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = `opacity 0.5s ease ${0.15 + i * 0.1}s, transform 0.5s ease ${0.15 + i * 0.1}s`;
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  });
})();
