/**
 * project.js - JavaScript for project detail pages
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize cursor effect
    initCursor();
    
    // Initialize background grid
    initBackground();
    
    // Initialize gallery lightbox
    initGalleryLightbox();
});

/**
 * Initialize custom cursor
 */
function initCursor() {
    const cursor = document.querySelector('.cursor');
    if (!cursor) return;
    
    const links = document.querySelectorAll('a, button, .gallery-item');
    
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

/**
 * Initialize gallery lightbox
 */
function initGalleryLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            if (!img) return;
            
            // Create lightbox
            const lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            
            // Create lightbox content
            const lightboxContent = document.createElement('div');
            lightboxContent.className = 'lightbox-content';
            
            // Create image element
            const lightboxImg = document.createElement('img');
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            
            // Create close button
            const closeBtn = document.createElement('button');
            closeBtn.className = 'lightbox-close';
            closeBtn.innerHTML = '&times;';
            
            // Add elements to DOM
            lightboxContent.appendChild(lightboxImg);
            lightbox.appendChild(closeBtn);
            lightbox.appendChild(lightboxContent);
            document.body.appendChild(lightbox);
            
            // Show lightbox
            setTimeout(() => {
                lightbox.classList.add('active');
            }, 10);
            
            // Handle close button click
            closeBtn.addEventListener('click', () => {
                lightbox.classList.remove('active');
                setTimeout(() => {
                    document.body.removeChild(lightbox);
                }, 300);
            });
            
            // Close on click outside image
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) {
                    lightbox.classList.remove('active');
                    setTimeout(() => {
                        document.body.removeChild(lightbox);
                    }, 300);
                }
            });
        });
    });
    
    // Add lightbox styles
    const style = document.createElement('style');
    style.textContent = `
        .lightbox {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
            backdrop-filter: blur(5px);
        }
        
        .lightbox.active {
            opacity: 1;
        }
        
        .lightbox-content {
            max-width: 80%;
            max-height: 80%;
        }
        
        .lightbox-content img {
            max-width: 100%;
            max-height: 80vh;
            display: block;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }
        
        .lightbox-close {
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 30px;
            color: white;
            background: none;
            border: none;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);
}
