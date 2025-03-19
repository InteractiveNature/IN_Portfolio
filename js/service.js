/**
 * Initialize FAQ accordion
 */
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        // Initialize heights
        answer.style.maxHeight = '0';
        
        question.addEventListener('click', () => {
            // Toggle active state
            const isActive = item.classList.contains('active');
            
            // Close all FAQs
            faqItems.forEach(faq => {
                faq.classList.remove('active');
                const faqAnswer = faq.querySelector('.faq-answer');
                faqAnswer.style.maxHeight = '0';
                faqAnswer.style.padding = '0 0 0';
            });
            
            // Open clicked FAQ if it wasn't already open
            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
                answer.style.padding = '0 0 1.5rem';
            }
        });
    });
}

/**
 * Initialize scroll animations
 */
function initScrollAnimations() {
    const sections = document.querySelectorAll('section');
    const animatedElements = document.querySelectorAll('.approach-step, .tool-item, .case-study, .benefit-item');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    // Observe sections for fade-in
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                sectionObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        section.classList.add('fade-hidden');
        sectionObserver.observe(section);
    });
    
    // Observe animated elements for staggered animation
    const elementObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Delay based on index within parent
                const parent = entry.target.parentNode;
                const index = Array.from(parent.children).indexOf(entry.target);
                entry.target.style.transitionDelay = `${index * 0.1}s`;
                entry.target.classList.add('animate-in');
                elementObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(element => {
        element.classList.add('fade-hidden');
        elementObserver.observe(element);
    });
    
    // Add necessary CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .fade-hidden {
            opacity: 0;
            transform: translateY(30px);
        }
        
        .animate-in {
            animation: fadeInUp 0.6s ease-out forwards;
        }
    `;
    document.head.appendChild(style);
}/**
 * service.js - JavaScript for service detail pages
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize cursor effect
    initCursor();
    
    // Initialize background grid
    initBackground();
    
    // Initialize FAQ accordion
    initFaqAccordion();
    
    // Initialize scroll animations
    initScrollAnimations();
});

/**
 * Initialize custom cursor
 */
function initCursor() {
    const cursor = document.querySelector('.cursor');
    if (!cursor) return;
    
    const links = document.querySelectorAll('a, button, .faq-question');
    
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Calculate mouse position for gradient shift
        const horizontalPosition = (mouseX / window.innerWidth) * 100;
        document.documentElement.style.setProperty('--gradient-position', `${horizontalPosition}%`);
    });
    
    function animateCursor() {
        const easeFactor = 0.2;
        cursorX += (mouseX - cursorX) * easeFactor;
        cursorY += (mouseY - cursorY) * easeFactor;
        
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        
        requestAnimationFrame(animateCursor);
    }
    
    animateCursor();
    
    links.forEach(link => {
        link.addEventListener('mouseenter', () => {
            cursor.classList.add('grow');
        });
        
        link.addEventListener('mouseleave', () => {
            cursor.classList.remove('grow');
        });
    });
}

/**
 * Initialize background grid
 */
function initBackground() {
    const svg = document.querySelector('.bg-lines');
    if (!svg) return;
    
    const numLines = 10;
    
    // Create horizontal lines
    for (let i = 0; i < numLines; i++) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        const yPos = (i / numLines) * 100 + '%';
        
        line.setAttribute('x1', '0%');
        line.setAttribute('y1', yPos);
        line.setAttribute('x2', '100%');
        line.setAttribute('y2', yPos);
        line.setAttribute('stroke', '#ffffff');
        line.setAttribute('stroke-width', '1');
        
        svg.appendChild(line);
    }
    
    // Create vertical lines
    for (let i = 0; i < numLines; i++) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        const xPos = (i / numLines) * 100 + '%';
        
        line.setAttribute('x1', xPos);
        line.setAttribute('y1', '0%');
        line.setAttribute('x2', xPos);
        line.setAttribute('y2', '100%');
        line.setAttribute('stroke', '#ffffff');
        line.setAttribute('stroke-width', '1');
        
        svg.appendChild(line);
    }
    
    // Add subtle animation to background lines
    document.addEventListener('mousemove', (e) => {
        const lines = svg.querySelectorAll('line');
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Calculate distortion based on mouse position
        const distortionX = (e.clientX / windowWidth - 0.5) * 10;
        const distortionY = (e.clientY / windowHeight - 0.5) * 10;
        
        lines.forEach((line, index) => {
            // Apply different distortion to horizontal and vertical lines
            if (line.getAttribute('y1') === line.getAttribute('y2')) {
                // Horizontal line
                line.setAttribute('y1', `calc(${(index % numLines) / numLines * 100}% + ${distortionY * Math.sin(index / numLines * Math.PI)}px)`);
                line.setAttribute('y2', `calc(${(index % numLines) / numLines * 100}% + ${distortionY * Math.sin(index / numLines * Math.PI)}px)`);
            } else {
                // Vertical line
                line.setAttribute('x1', `calc(${(index % numLines) / numLines * 100}% + ${distortionX * Math.sin(index / numLines * Math.PI)}px)`);
                line.setAttribute('x2', `calc(${(index % numLines) / numLines * 100}% + ${distortionX * Math.sin(index / numLines * Math.PI)}px)`);
            }
        });
    });
}