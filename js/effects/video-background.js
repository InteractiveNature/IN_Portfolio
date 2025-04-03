/**
 * video-background.js - Video background effect for Interactive Nature website
 */

export class VideoBackground {
    /**
     * Create a new video background instance
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        this.options = {
            selector: '.video-background video',
            muted: true,
            autoplay: true,
            loop: true,
            playbackRate: 1,
            opacity: 0.7,
            mobileFallbackImage: null, // Optional fallback image for mobile
            ...options
        };
        
        this.video = null;
        this.isInitialized = false;
        this.isMobile = this.checkIfMobile();
    }
    
    /**
     * Check if the current device is mobile
     * @returns {boolean} - Whether the device is mobile
     */
    checkIfMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               (window.matchMedia && window.matchMedia('(max-width: 768px)').matches);
    }
    
    /**
     * Initialize the video background
     * @returns {VideoBackground} - For chaining
     */
    init() {
        this.video = document.querySelector(this.options.selector);
        
        if (!this.video) {
            console.warn('Video background element not found');
            return this;
        }
        
        // Set video attributes
        this.video.muted = this.options.muted;
        this.video.autoplay = this.options.autoplay;
        this.video.loop = this.options.loop;
        this.video.playbackRate = this.options.playbackRate;
        this.video.style.opacity = this.options.opacity;
        
        // Add playsinline attribute for iOS
        this.video.setAttribute('playsinline', '');
        this.video.setAttribute('webkit-playsinline', ''); // For older iOS versions
        
        // Optimize loading
        this.video.setAttribute('preload', 'auto');
        
        // Set crossorigin attribute to handle potential CORS issues
        this.video.setAttribute('crossorigin', 'anonymous');
        
        // Handle video loading
        this.setupEventListeners();
        
        // Mark as initialized
        this.isInitialized = true;
        
        return this;
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Handle loading
        this.video.addEventListener('loadeddata', () => {
            console.log('Video loaded successfully');
            this.video.classList.add('loaded');
        });
        
        // Handle errors
        this.video.addEventListener('error', (e) => {
            console.error('Error loading video:', e);
            this.handleVideoError();
        });
        
        // Handle stalled video
        this.video.addEventListener('stalled', () => {
            console.warn('Video stalled');
            this.handleVideoError();
        });
        
        // Handle visibility changes to pause video when not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.video.pause();
            } else {
                this.video.play().catch(e => {
                    console.warn('Could not autoplay video:', e);
                    this.handleVideoError();
                });
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Ensure video plays
        this.ensureVideoPlays();
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        // Update mobile status on resize
        this.isMobile = this.checkIfMobile();
        
        // Re-attempt to play video if device orientation changed
        if (!this.isMobile) {
            this.ensureVideoPlays();
        }
    }
    
    /**
     * Handle video error or failure to play
     */
    handleVideoError() {
        // If we have a fallback image and we're on mobile, use it
        if (this.options.mobileFallbackImage && this.isMobile) {
            this.useFallbackImage();
        }
    }
    
    /**
     * Use fallback image instead of video
     */
    useFallbackImage() {
        // Only proceed if we have a fallback image
        if (!this.options.mobileFallbackImage) return;
        
        // Get the video container
        const videoContainer = this.video.parentElement;
        
        // Check if we already applied the fallback
        if (videoContainer.querySelector('.video-fallback-image')) return;
        
        // Create fallback image
        const fallbackImage = document.createElement('div');
        fallbackImage.className = 'video-fallback-image';
        fallbackImage.style.position = 'absolute';
        fallbackImage.style.top = '0';
        fallbackImage.style.left = '0';
        fallbackImage.style.width = '100%';
        fallbackImage.style.height = '100%';
        fallbackImage.style.backgroundImage = `url(${this.options.mobileFallbackImage})`;
        fallbackImage.style.backgroundSize = 'cover';
        fallbackImage.style.backgroundPosition = 'center center';
        fallbackImage.style.opacity = this.options.opacity;
        fallbackImage.style.zIndex = '-1';
        
        // Hide the video
        this.video.style.display = 'none';
        
        // Add the fallback image
        videoContainer.appendChild(fallbackImage);
        
        console.log('Using fallback image for video background');
    }
    
    /**
     * Ensure video plays (handles autoplay restrictions)
     */
    ensureVideoPlays() {
        // For mobile devices, we need special handling
        if (this.isMobile) {
            // Make sure video is muted (required for autoplay on mobile)
            this.video.muted = true;
            
            // Add low-level play attempt for iOS
            document.addEventListener('touchstart', () => {
                this.video.play().catch(e => {
                    console.warn('Could not play video after touch:', e);
                    this.handleVideoError();
                });
            }, { once: true });
        }
        
        // Try to play the video
        const playPromise = this.video.play();
        
        // Handle autoplay restrictions
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn('Autoplay prevented:', error);
                
                // Add a play button for user interaction if needed
                if (!this.options.muted) {
                    this.addPlayButton();
                } else {
                    // Try again with muted (most browsers allow muted autoplay)
                    this.video.muted = true;
                    this.video.play().catch(e => {
                        console.error('Could not play muted video:', e);
                        
                        // If we're on mobile and still can't play, use fallback
                        if (this.isMobile) {
                            this.handleVideoError();
                        } else {
                            this.addPlayButton();
                        }
                    });
                }
            });
        }
        
        // Additional attempt for iOS - sometimes needed after a short delay
        setTimeout(() => {
            if (this.isMobile && this.video.paused) {
                this.video.play().catch(e => {
                    console.warn('Delayed play attempt failed:', e);
                    this.handleVideoError();
                });
            }
        }, 500);
    }
    
    /**
     * Add a play button for user interaction
     */
    addPlayButton() {
        const videoContainer = this.video.parentElement;
        
        // Check if play button already exists
        if (videoContainer.querySelector('.video-play-button')) {
            return;
        }
        
        // Create play button
        const playButton = document.createElement('button');
        playButton.className = 'video-play-button';
        playButton.innerHTML = '<span>Play</span>';
        playButton.style.position = 'absolute';
        playButton.style.top = '50%';
        playButton.style.left = '50%';
        playButton.style.transform = 'translate(-50%, -50%)';
        playButton.style.zIndex = '1';
        playButton.style.background = 'rgba(0, 0, 0, 0.5)';
        playButton.style.color = 'white';
        playButton.style.border = 'none';
        playButton.style.borderRadius = '50%';
        playButton.style.width = '60px';
        playButton.style.height = '60px';
        playButton.style.cursor = 'pointer';
        
        // Add click event
        playButton.addEventListener('click', () => {
            this.video.play().then(() => {
                playButton.remove();
            }).catch(e => {
                console.error('Could not play video after click:', e);
            });
        });
        
        // Add to container
        videoContainer.appendChild(playButton);
    }
    
    /**
     * Set video opacity
     * @param {number} opacity - Opacity value (0-1)
     */
    setOpacity(opacity) {
        if (this.video) {
            this.video.style.opacity = opacity;
            this.options.opacity = opacity;
        }
    }
    
    /**
     * Set video playback rate
     * @param {number} rate - Playback rate
     */
    setPlaybackRate(rate) {
        if (this.video) {
            this.video.playbackRate = rate;
            this.options.playbackRate = rate;
        }
    }
    
    /**
     * Destroy the video background instance
     */
    destroy() {
        if (this.video) {
            // Remove event listeners
            this.video.removeEventListener('loadeddata', () => {});
            this.video.removeEventListener('error', () => {});
            
            // Pause video
            this.video.pause();
            
            // Remove play button if exists
            const playButton = this.video.parentElement.querySelector('.video-play-button');
            if (playButton) {
                playButton.remove();
            }
        }
        
        // Remove window event listeners
        window.removeEventListener('resize', this.handleResize.bind(this));
        document.removeEventListener('visibilitychange', () => {});
    }
}
