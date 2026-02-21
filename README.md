# Cohen Adventure - Landing Page

A mobile-first, single-page website for **Tzivka Cohen** (צביקה כהן השטח), an adventure motorcycle instructor and content creator specializing in off-road training and guided tours.

## 🎨 Design Concept

**Rugged Editorial** — A bold, cinematic approach that merges adventure magazine aesthetics with off-road motorcycle culture. The design features:

- **Terrain-inspired visual language**: Diagonal cuts mimicking mountain ridges, dust particle effects, and dynamic compositions
- **Earthy color palette**: Sand, dust, earth, stone, and rock tones with rust/copper accents
- **Distinctive typography**: Rubik (display) and Heebo (body) for strong Hebrew language support
- **Gritty textures**: Grain overlays, noise effects, and layered transparencies
- **Motion that feels like momentum**: Scroll-driven animations, parallax effects, and micro-interactions

## 🚀 Features

### Sections
1. **Hero** — Bold introduction with animated badge, title, and CTAs
2. **About** — Biography with stats and diagonal-cut image frame
3. **Services** — Three service cards (training, tours, content creation)
4. **Gallery** — Grid layout for photos with hover overlays
5. **Social** — Instagram link with prominent CTA
6. **Contact** — Form with floating labels + contact details
7. **Footer** — Navigation links and copyright

### Interactions
- Sticky navigation that appears on scroll
- Mobile hamburger menu with full-screen overlay
- Scroll-triggered animations (fade-up, slide, scale)
- Parallax effect on hero section
- Mouse-interactive dust particles
- Hover states on all interactive elements
- Form validation and submission feedback

## 📱 Mobile-First Approach

The design prioritizes mobile experience:
- Touch-friendly button sizes (min 48px)
- Readable typography at small sizes
- Optimized layouts for portrait orientation
- Progressive enhancement for larger screens

## 🛠️ Implementation

### Structure
- **index.html** — Semantic HTML5 with RTL support
- **style.css** — Modern CSS with custom properties, no frameworks
- **script.js** — Vanilla JavaScript, no dependencies

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement for older browsers

### Performance
- No external dependencies (except Google Fonts)
- Optimized animations with `will-change` hints
- Respects `prefers-reduced-motion`
- Lazy loading ready for images

## 📝 Customization Guide

### Adding Real Images
Replace the `.image__placeholder` and `.gallery__placeholder` divs with actual `<img>` tags:

```html
<!-- Replace placeholder divs with: -->
<img src="path/to/image.jpg" alt="Description" />
```

### Updating Content
1. **Hero Section**: Edit `.hero__title` and `.hero__tagline`
2. **About Stats**: Modify `.stat__number` and `.stat__label` values
3. **Services**: Update `.service-card` content for each service
4. **Gallery**: Replace placeholder divs with actual images
5. **Contact Details**: Update links in `.contact__details`

### Color Customization
Edit CSS custom properties in `:root`:

```css
--color-primary: #D4722B; /* Main accent color */
--color-bg: #1A1612;      /* Background */
--color-text: #E8DCC4;    /* Text color */
```

### Form Integration
Connect the contact form to your backend by modifying the `contactForm` submit handler in `script.js`:

```javascript
// Replace the simulated submission with your API call
const response = await fetch('YOUR_API_ENDPOINT', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
});
```

## 🎯 SEO & Social Media

Add to `<head>` for better SEO:

```html
<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://www.cohenadventure.com/">
<meta property="og:title" content="צביקה כהן השטח | הדרכות אופנועי אדוונצ'ר">
<meta property="og:description" content="הדרכות אופנועי אדוונצ'ר, מסעות בישראל ובעולם, מדריך מוסמך">
<meta property="og:image" content="https://www.cohenadventure.com/og-image.jpg">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="https://www.cohenadventure.com/">
<meta property="twitter:title" content="צביקה כהן השטח | הדרכות אופנועי אדוונצ'ר">
<meta property="twitter:description" content="הדרכות אופנועי אדוונצ'ר, מסעות בישראל ובעולם, מדריך מוסמך">
<meta property="twitter:image" content="https://www.cohenadventure.com/twitter-image.jpg">
```

## 📦 Deployment

### Option 1: Static Hosting (Recommended)
Deploy to Netlify, Vercel, or GitHub Pages:
1. Push code to Git repository
2. Connect to hosting platform
3. Configure custom domain

### Option 2: Traditional Hosting
Upload files via FTP/SFTP:
1. Upload all files to web root
2. Ensure `index.html` is in the root directory
3. Configure server for custom domain

## ♿ Accessibility

The design includes:
- Semantic HTML5 elements
- ARIA labels for interactive elements
- Keyboard navigation support
- Color contrast meeting WCAG AA standards
- `prefers-reduced-motion` support
- RTL language support

## 📞 Contact & Links

- **Website**: [www.cohenadventure.com](https://www.cohenadventure.com)
- **Instagram**: [@cohenadventure](https://www.instagram.com/cohenadventure/)

---

**Built with attention to detail and passion for adventure motorcycling.** 🏍️
