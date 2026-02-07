// Portfolio JavaScript - Govind Gupta

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Contact Form Submission Handler
document.addEventListener('DOMContentLoaded', function() {
    console.log('Portfolio script loaded');
    
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    
    if (!form) {
        console.error('Contact form not found');
        return;
    }
    
    if (!submitBtn) {
        console.error('Submit button not found');
        return;
    }
    
    console.log('Form elements found successfully');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Form submission started');
        
        // Get form data
        const formData = new FormData(form);
        console.log('Form data collected:', Object.fromEntries(formData));
        
        // Show loading state
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        // Your Formspree form ID
        const FORMSPREE_ID = 'xrelnvbd';
        
        try {
            console.log('Sending to Formspree...');
            
            const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            console.log('Response received:', response.status);
            
            if (response.ok) {
                console.log('Form submitted successfully! Redirecting...');
                // Success - redirect to thank you page
                window.location.href = 'thank-you.html';
            } else {
                console.error('Form submission failed:', response.status);
                // Show error message
                alert('Oops! There was a problem submitting your form. Please try again or email me directly at govind.gupta2051@gmail.com');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            // Show error message
            alert('Oops! There was a problem submitting your form. Please try again or email me directly at govind.gupta2051@gmail.com');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
    
    console.log('Form event listener attached successfully');
});

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

// Wait for DOM to load before observing elements
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.service-card, .timeline-item, .contact-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

console.log('Portfolio JavaScript loaded successfully');