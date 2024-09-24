export default function decorate() {
  // Select all banners
  const banners = document.querySelectorAll(
    '.banner.block',
  );

  banners.forEach((banner) => {
    const anchor = banner.querySelector('a');
    const img = banner.querySelector('img');
    const container = banner.querySelector('div > div');

    // Match "Ancestry"
    const ancestryRegex = /Ancestry(?!<\/span>)/g;

    if (container) {
      const bannerText = container.innerHTML;
      if (
        !bannerText.includes('<span class="ancestry">')
        && ancestryRegex.test(bannerText)
      ) {
        const updatedText = bannerText.replace(
          ancestryRegex,
          '<span class="ancestry">Ancestry<sup>®</sup></span>',
        );
        container.innerHTML = updatedText;
      }
    }

    // Wrap anchor text in a span
    if (anchor && !anchor.querySelector('span')) {
      const text = anchor.textContent.trim();
      anchor.innerHTML = '';
      const span = document.createElement('span');
      span.textContent = text;
      anchor.appendChild(span);
      anchor.classList.add('anchor');
    }

    // If the banner has an image, adjust padding if necessary
    if (img && container) {
      const adjustPadding = () => {
        const imgHeight = img.offsetHeight;
        const additionalPadding = 20;
        container.style.paddingBottom = `${imgHeight + additionalPadding}px`;
      };

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
