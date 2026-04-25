// Portfolio JavaScript - Govind Gupta

// Smooth scrolling for in-page anchor links
document.body.addEventListener('click', function (e) {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (href === '#' || href === '') return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        closeMobileNav();
    }
});

function openMobileNav() {
    document.body.classList.add('nav-open');
    var btn = document.getElementById('navToggle');
    var overlay = document.getElementById('navMenuOverlay');
    if (btn) {
        btn.setAttribute('aria-expanded', 'true');
        btn.setAttribute('aria-label', 'Close menu');
    }
    if (overlay) overlay.setAttribute('aria-hidden', 'false');
}

function closeMobileNav() {
    document.body.classList.remove('nav-open');
    var btn = document.getElementById('navToggle');
    var overlay = document.getElementById('navMenuOverlay');
    if (btn) {
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-label', 'Open menu');
    }
    if (overlay) overlay.setAttribute('aria-hidden', 'true');
}

function initMobileNav() {
    var toggle = document.getElementById('navToggle');
    if (!toggle) return;
    toggle.addEventListener('click', function () {
        if (document.body.classList.contains('nav-open')) {
            closeMobileNav();
        } else {
            openMobileNav();
        }
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMobileNav();
    });
}

function initPortfolio() {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');

    if (form && submitBtn) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();

            const formData = new FormData(form);
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            const FORMSPREE_ID = 'xrelnvbd';

            try {
                const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    window.location.href = 'thank-you.html';
                } else {
                    alert('Oops! There was a problem submitting your form. Please try again or email me directly at govind@govindgupta.com');
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            } catch (error) {
                alert('Oops! There was a problem submitting your form. Please try again or email me directly at govind@govindgupta.com');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    document.querySelectorAll('.service-card, .package-card, .case-study-card, .timeline-item, .contact-item, .audience-card, .differentiator-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Scroll animations for elements
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initPortfolio();
});