// ===========================
// LANGUAGE SWITCHING
// ===========================

// Get current language from localStorage or default to Hebrew
let currentLang = localStorage.getItem('lang') || 'he';

// Initialize page with saved language
function initLanguage() {
    const html = document.documentElement;
    html.setAttribute('lang', currentLang);
    html.setAttribute('dir', currentLang === 'he' ? 'rtl' : 'ltr');
    html.setAttribute('data-lang', currentLang);

    // Update lang toggle button text
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        const toggleText = langToggle.querySelector('.lang-toggle__text');
        if (toggleText) {
            toggleText.textContent = currentLang === 'he' ? 'EN' : 'עב';
        }
    }

    // Update all translatable elements
    updateContent();
}

// Update all content based on current language
function updateContent() {
    const t = translations[currentLang];

    // Navigation
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const keys = key.split('.');
        let value = t;
        for (const k of keys) value = value?.[k];
        if (value) el.textContent = value;
    });

    // Special cases - multi-line content
    const aboutTitleEl = document.querySelector('.about__text .section__title');
    if (aboutTitleEl) {
        aboutTitleEl.innerHTML = `${t.about.title}<br><span class="highlight">${t.about.titleHighlight}</span>`;
    }

    const aboutDesc = document.querySelector('.about__description');
    if (aboutDesc) {
        aboutDesc.innerHTML = `<p>${t.about.description1}</p><p>${t.about.description2}</p>`;
    }

    const contactTitle = document.querySelector('.contact__info .section__title');
    if (contactTitle) {
        contactTitle.innerHTML = `${t.contact.title}<br>${t.contact.titleLine2}`;
    }

    // Stats
    const statLabels = document.querySelectorAll('.stat__label');
    if (statLabels.length >= 3) {
        statLabels[0].textContent = t.about.stat1Label;
        statLabels[1].textContent = t.about.stat2Label;
        statLabels[2].textContent = t.about.stat3Label;
    }

    // Service cards
    const serviceCards = document.querySelectorAll('.service-card');
    if (serviceCards.length >= 3) {
        // Service 1
        const s1Title = serviceCards[0].querySelector('.service-card__title');
        const s1Desc = serviceCards[0].querySelector('.service-card__description');
        const s1Features = serviceCards[0].querySelectorAll('.service-card__features li');
        if (s1Title) s1Title.textContent = t.services.service1Title;
        if (s1Desc) s1Desc.textContent = t.services.service1Description;
        s1Features.forEach((li, i) => {
            if (t.services.service1Features[i]) li.textContent = t.services.service1Features[i];
        });

        // Service 2 (Featured)
        const s2Title = serviceCards[1].querySelector('.service-card__title');
        const s2Desc = serviceCards[1].querySelector('.service-card__description');
        const s2Features = serviceCards[1].querySelectorAll('.service-card__features li');
        const s2Badge = serviceCards[1].querySelector('.service-card__badge');
        if (s2Title) s2Title.textContent = t.services.service2Title;
        if (s2Desc) s2Desc.textContent = t.services.service2Description;
        if (s2Badge) s2Badge.textContent = t.services.service2Badge;
        s2Features.forEach((li, i) => {
            if (t.services.service2Features[i]) li.textContent = t.services.service2Features[i];
        });

        // Service 3
        const s3Title = serviceCards[2].querySelector('.service-card__title');
        const s3Desc = serviceCards[2].querySelector('.service-card__description');
        const s3Features = serviceCards[2].querySelectorAll('.service-card__features li');
        if (s3Title) s3Title.textContent = t.services.service3Title;
        if (s3Desc) s3Desc.textContent = t.services.service3Description;
        s3Features.forEach((li, i) => {
            if (t.services.service3Features[i]) li.textContent = t.services.service3Features[i];
        });
    }

    // Gallery captions
    const galleryCaptions = document.querySelectorAll('.gallery__caption');
    if (galleryCaptions.length >= 4) {
        galleryCaptions[0].textContent = t.gallery.caption1;
        galleryCaptions[1].textContent = t.gallery.caption2;
        galleryCaptions[2].textContent = t.gallery.caption3;
        galleryCaptions[3].textContent = t.gallery.caption4;
    }

    // Gallery header
    const galleryLabel = document.querySelector('.gallery__header .section__label');
    const galleryTitle = document.querySelector('.gallery__header .section__title');
    if (galleryLabel) galleryLabel.textContent = t.gallery.label;
    if (galleryTitle) galleryTitle.textContent = t.gallery.title;

    // Services header
    const servicesLabel = document.querySelector('.services__header .section__label');
    const servicesTitle = document.querySelector('.services__header .section__title');
    if (servicesLabel) servicesLabel.textContent = t.services.label;
    if (servicesTitle) servicesTitle.textContent = t.services.title;

    // Social section
    const socialTitle = document.querySelector('.social__title');
    const socialDesc = document.querySelector('.social__description');
    if (socialTitle) socialTitle.textContent = t.social.title;
    if (socialDesc) socialDesc.textContent = t.social.description;

    // Contact description
    const contactDesc = document.querySelector('.contact__description');
    if (contactDesc) contactDesc.textContent = t.contact.description;

    // Form labels
    const formLabels = document.querySelectorAll('.form__label');
    if (formLabels.length >= 5) {
        formLabels[0].textContent = t.contact.formName;
        formLabels[1].textContent = t.contact.formPhone;
        formLabels[2].textContent = t.contact.formEmail;
        formLabels[3].textContent = t.contact.formInterest;
        formLabels[4].textContent = t.contact.formMessage;
    }

    // Form options
    const formOptions = document.querySelectorAll('.form__select option');
    if (formOptions.length >= 4) {
        formOptions[1].textContent = t.contact.formInterestOption1;
        formOptions[2].textContent = t.contact.formInterestOption2;
        formOptions[3].textContent = t.contact.formInterestOption3;
        formOptions[4].textContent = t.contact.formInterestOption4;
    }

    // Form submit button
    const submitBtn = document.querySelector('.contact__form button[type="submit"]');
    if (submitBtn && submitBtn.textContent.indexOf('✓') === -1 && submitBtn.textContent.indexOf('✗') === -1) {
        submitBtn.textContent = t.contact.formSubmit;
    }

    // Footer
    const footerTitle = document.querySelector('.footer__title');
    const footerTagline = document.querySelector('.footer__tagline');
    const footerCopyright = document.querySelector('.footer__bottom p');
    if (footerTitle) footerTitle.textContent = t.footer.title;
    if (footerTagline) footerTagline.textContent = t.footer.tagline;
    if (footerCopyright) footerCopyright.textContent = t.footer.copyright;

    // Badge text
    const badgeYears = document.querySelector('.image__badge span:last-child');
    if (badgeYears) badgeYears.textContent = t.about.yearsLabel;

    // Document title
    document.title = currentLang === 'he'
        ? 'צביקה כהן השטח | הדרכות אופנועי אדוונצ\'ר'
        : 'Zvika Cohen Off-Road | Adventure Motorcycle Training';
}

// Toggle language
function toggleLanguage() {
    currentLang = currentLang === 'he' ? 'en' : 'he';
    localStorage.setItem('lang', currentLang);

    const html = document.documentElement;
    html.setAttribute('lang', currentLang);
    html.setAttribute('dir', currentLang === 'he' ? 'rtl' : 'ltr');
    html.setAttribute('data-lang', currentLang);

    // Update lang toggle button text
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        const toggleText = langToggle.querySelector('.lang-toggle__text');
        if (toggleText) {
            toggleText.textContent = currentLang === 'he' ? 'EN' : 'עב';
        }
    }

    updateContent();
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', () => {
    initLanguage();

    // Add click handler to language toggle button
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.addEventListener('click', toggleLanguage);
    }
});

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
