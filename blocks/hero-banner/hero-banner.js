// Wrap 'Ancestry' in a span with class 'ancestry' within a given element
function wrapAncestryText(element) {
  const ancestryRegex = /AncestryDNA|Ancestry/g;
  function traverseNodes(node) {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const updatedText = child.textContent.replace(ancestryRegex, (match) => {
          if (child.parentElement && child.parentElement.classList.contains('ancestry')) {
            return match;
          }
          return `<span class="ancestry">${match}</span>`;
        });
        if (updatedText !== child.textContent) {
          const wrapper = document.createElement('span');
          wrapper.innerHTML = updatedText;
          child.replaceWith(...wrapper.childNodes);
        }
      } else if (child.nodeType === Node.ELEMENT_NODE && child.nodeName !== 'SCRIPT' && child.nodeName !== 'STYLE') {
        traverseNodes(child);
      }
    });
  }

  traverseNodes(element);
}

export default function decorate() {
  const heroBannerWrappers = document.querySelectorAll('.hero-banner-wrapper');

  heroBannerWrappers.forEach((wrapper) => {
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

      wrapAncestryText(heroBanner);
    }
  });
}
