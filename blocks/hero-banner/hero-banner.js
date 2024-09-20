export default function decorate(block) {
  const ctaContainer = block.querySelector('.button-container');
  const ctaLink = ctaContainer.querySelector('a');

  // Make entire block clickable.
  ctaContainer.onclick = () => {
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

  // Look for Ancestry word in ctaLink and wrap it in a span
  if (ctaLink) {
    const ancestryRegex = /Ancestry/;
    const ctaText = ctaLink.innerHTML;

    if (ancestryRegex.test(ctaText)) {
      const updatedText = ctaText.replace(ancestryRegex, '<span class="ancestry">Ancestry</span>');
      ctaLink.innerHTML = updatedText;
    }
  }
}
  