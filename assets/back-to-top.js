// Back to Top functionality with smooth scrolling
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling to all back-to-top links
    const backToTopLinks = document.querySelectorAll('a[href="#remote-friendly-companies"]');
    
    backToTopLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Smooth scroll to top
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    });
    
    // Optional: Add a floating back-to-top button that appears when scrolling
    const floatingButton = document.createElement('button');
    floatingButton.innerHTML = '⬆️ Top';
    floatingButton.className = 'floating-back-to-top';
    floatingButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #0366d6;
        color: white;
        border: none;
        border-radius: 50px;
        padding: 12px 16px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
    `;
    
    document.body.appendChild(floatingButton);
    
    // Show/hide floating button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            floatingButton.style.opacity = '1';
            floatingButton.style.visibility = 'visible';
        } else {
            floatingButton.style.opacity = '0';
            floatingButton.style.visibility = 'hidden';
        }
    });
    
    // Floating button click handler
    floatingButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Hover effects for floating button
    floatingButton.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#0256cc';
        this.style.transform = 'translateY(-2px)';
    });
    
    floatingButton.addEventListener('mouseleave', function() {
        this.style.backgroundColor = '#0366d6';
        this.style.transform = 'translateY(0)';
    });
});