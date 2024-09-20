export default function decorate(block) {
    const ctaContainer = block.querySelector('.button-container');
    const ctaLink = ctaContainer.querySelector('a');
  
    // Make entire block clickable.
    block.onclick = () => {
      if (ctaLink) {
        ctaLink.click();
      }
    };

    const heroBannerWrappers = document.querySelectorAll('.hero-banner-wrapper');

    heroBannerWrappers.forEach(wrapper => {
        const heroBanner = wrapper.querySelector('.hero-banner');
        
        if (heroBanner) {
        // Check the class of the inner div and apply the corresponding class to the outer wrapper
        if (heroBanner.classList.contains('mobile-banner')) {
            wrapper.classList.add('mobile-banner-wrapper');
        } else if (heroBanner.classList.contains('tab-banner')) {
            wrapper.classList.add('tab-banner-wrapper');
        } else if (heroBanner.classList.contains('desktop-banner')) {
            wrapper.classList.add('desktop-banner-wrapper');
        }
        }
    });

  }
  


  