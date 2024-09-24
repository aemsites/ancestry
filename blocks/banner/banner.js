export default function decorate() {
    // Select all banners within the multiple banner container
    const banners = document.querySelectorAll('.section.multiple.banner-container .banner.block');
  
    banners.forEach(banner => {
      const anchor = banner.querySelector('a');
      const img = banner.querySelector('img');
      const container = banner.querySelector('div > div');
  
      // Wrap anchor text in a span if not already wrapped
      if (anchor && !anchor.querySelector('span')) {
        const text = anchor.textContent.trim();
        anchor.innerHTML = '';
  
        // Create a span and set the text
        const span = document.createElement('span');
        span.textContent = text;
        anchor.appendChild(span);
        anchor.classList.add('anchor');
      }
  
      // If the banner has an image, adjust padding if necessary
      if (img && container) {
        // Ensure the container has enough padding-bottom to accommodate the image
        const adjustPadding = () => {
          const imgHeight = img.offsetHeight;
          const additionalPadding = 20;
          container.style.paddingBottom = `${imgHeight + additionalPadding}px`;
        };
  
        // Adjust padding when image loads or if already loaded
        if (img.complete) {
          adjustPadding();
        } else {
          img.onload = adjustPadding;
        }
  
        // Adjust padding on window resize
        window.addEventListener('resize', adjustPadding);
      }
    });
  }
  