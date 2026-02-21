// ===========================
// NAVIGATION
// ===========================

const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav__link');

// Show navigation after scroll
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        nav.classList.add('visible');
    } else {
        nav.classList.remove('visible');
    }

    lastScroll = currentScroll;
});

// Mobile menu toggle
navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
});

// Close menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// Close menu when clicking outside
navMenu.addEventListener('click', (e) => {
    if (e.target === navMenu) {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// ===========================
// SCROLL ANIMATIONS
// ===========================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            // Don't unobserve - keep the animation state
        }
    });
}, observerOptions);

// Observe all elements with data-animate attribute
document.querySelectorAll('[data-animate]').forEach(el => {
    observer.observe(el);
});

// ===========================
// SMOOTH SCROLL
// ===========================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));

        if (target) {
            const navHeight = nav.offsetHeight;
            const targetPosition = target.offsetTop - navHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===========================
// FORM HANDLING
// ===========================

const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);

        // Get the submit button
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        // Disable button and show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'שולח...';

        try {
            // Simulate form submission
            // In production, replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            console.log('Form submitted:', data);

            // Show success message
            submitBtn.textContent = '✓ ההודעה נשלחה!';
            submitBtn.style.background = 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)';

            // Reset form
            contactForm.reset();

            // Reset button after 3 seconds
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                submitBtn.style.background = '';
            }, 3000);

        } catch (error) {
            console.error('Form submission error:', error);

            // Show error message
            submitBtn.textContent = '✗ שגיאה, נסו שוב';
            submitBtn.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)';

            // Reset button after 3 seconds
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                submitBtn.style.background = '';
            }, 3000);
        }
    });
}

// ===========================
// FLOATING LABEL FIX
// ===========================

// Handle select elements for floating labels
const selectElements = document.querySelectorAll('.form__select');
selectElements.forEach(select => {
    select.addEventListener('change', () => {
        if (select.value) {
            select.classList.add('has-value');
        } else {
            select.classList.remove('has-value');
        }
    });
});

// ===========================
// PARALLAX EFFECT ON HERO
// ===========================

const hero = document.querySelector('.hero');
if (hero) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroContent = hero.querySelector('.hero__content');

        if (scrolled < window.innerHeight) {
            heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
            heroContent.style.opacity = 1 - (scrolled / window.innerHeight);
        }
    });
}

// ===========================
// DUST PARTICLES INTERACTION
// ===========================

const dustParticles = document.querySelector('.dust-particles');
if (dustParticles) {
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 100;
        mouseY = (e.clientY / window.innerHeight) * 100;

        dustParticles.style.backgroundPosition = `${mouseX}% ${mouseY}%`;
    });
}

// ===========================
// GALLERY LIGHTBOX (Simple)
// ===========================

const galleryItems = document.querySelectorAll('.gallery__item');
galleryItems.forEach(item => {
    item.addEventListener('click', () => {
        // Add a subtle pulse animation on click
        item.style.animation = 'none';
        setTimeout(() => {
            item.style.animation = '';
        }, 10);

        // In production, you could open a lightbox here
        console.log('Gallery item clicked');
    });
});

// ===========================
// LOADING ANIMATION
// ===========================

window.addEventListener('load', () => {
    // Trigger initial animations
    document.querySelectorAll('[data-animate]').forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight) {
            el.classList.add('animated');
        }
    });
});

// ===========================
// PERFORMANCE: REDUCE MOTION
// ===========================

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (prefersReducedMotion.matches) {
    // Disable animations for users who prefer reduced motion
    document.documentElement.style.setProperty('--transition-fast', '0s');
    document.documentElement.style.setProperty('--transition-base', '0s');
    document.documentElement.style.setProperty('--transition-slow', '0s');

    // Immediately show all animated elements
    document.querySelectorAll('[data-animate]').forEach(el => {
        el.classList.add('animated');
    });
}

// ===========================
// CONSOLE EASTER EGG
// ===========================

console.log('%c🏍️ Cohen Adventure', 'font-size: 24px; font-weight: bold; color: #D4722B;');
console.log('%cמחפשים מפתח מנוסה? צרו קשר!', 'font-size: 14px; color: #E8DCC4;');
console.log('%cwww.cohenadventure.com', 'font-size: 12px; color: #C9B896;');
