document.addEventListener('DOMContentLoaded', function() {
    // Preloader
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        window.addEventListener('load', function() {
            preloader.classList.add('fade-out');
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        });
    }

    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navbar = document.querySelector('.navbar ul');
    
    if (menuToggle && navbar) {
        menuToggle.addEventListener('click', function() {
            navbar.classList.toggle('active');
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-times');
            }
        });
        
        // Close mobile menu when clicking on a link
        document.querySelectorAll('.navbar ul li a').forEach(link => {
            link.addEventListener('click', () => {
                navbar.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                }
            });
        });
    }

    // Sticky Header on Scroll
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', function() {
            header.classList.toggle('scrolled', window.scrollY > 100);
        });
    }

    // Back to Top Button
    const backToTopBtn = document.querySelector('.back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', function() {
            backToTopBtn.classList.toggle('active', window.scrollY > 300);
        });
        
        backToTopBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Counter Animation
    function animateCounter(counter, target) {
        const duration = 2000; // Animation duration in ms
        const start = parseInt(counter.innerText);
        const range = target - start;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(start + (range * easeOutQuart));
            
            counter.innerText = current;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    function startCounterAnimation(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counters = entry.target.querySelectorAll('.counter');
                counters.forEach(counter => {
                    const target = parseInt(counter.getAttribute('data-target'));
                    counter.innerText = '0'; // Reset counter before animation
                    animateCounter(counter, target);
                });
            }
        });
    }

    // Create observer for counter elements
    const counterObserver = new IntersectionObserver(startCounterAnimation, {
        threshold: 0.5
    });

    // Observe the stats container
    const statsContainer = document.querySelector('.profile-stats');
    if (statsContainer) {
        counterObserver.observe(statsContainer);
    }

    // Intersection Observer for Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '-50px'
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // Get all animation classes on the element
            const animationClasses = Array.from(entry.target.classList).filter(cls => 
                cls.startsWith('animate-')
            );
            
            if (entry.isIntersecting) {
                // Re-trigger animations by removing and adding classes
                animationClasses.forEach(cls => {
                    entry.target.classList.remove(cls);
                    void entry.target.offsetWidth; // Force reflow
                    entry.target.classList.add(cls);
                });
                entry.target.classList.add('animated');
            } else {
                entry.target.classList.remove('animated');
                // Reset animation classes when out of view
                animationClasses.forEach(cls => {
                    entry.target.classList.remove(cls);
                });
            }
        });
    }, observerOptions);
    
    // Observe all elements with animation classes
    document.querySelectorAll('.animate-slide-up, .animate-slide-down, .animate-slide-left, .animate-slide-right, .animate-fade-in, .animate-scale, .profile-stats').forEach(element => {
        observer.observe(element);
    });

    // Scroll Animations Observer
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.remove('show');
                void entry.target.offsetWidth; // Force reflow
                entry.target.classList.add('show');
            } else {
                entry.target.classList.remove('show');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '-50px'
    });

    // Observe all elements with scroll-animation class
    document.querySelectorAll('.scroll-animation').forEach((element) => {
        scrollObserver.observe(element);
    });

    // Form Submission
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Here you would typically send the data to a server
            console.log('Form submitted:', data);
            
            // Show success message
            alert('Pesan Anda telah terkirim. Terima kasih!');
            this.reset();
        });
    }
});