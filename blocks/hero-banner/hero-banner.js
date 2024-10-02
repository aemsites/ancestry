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

function wrapImagesInContainer() {
  const heroBannerWrappers = document.querySelectorAll('.hero-banner-wrapper');

  heroBannerWrappers.forEach((wrapper) => {
    const pictures = wrapper.querySelectorAll('picture');

    pictures.forEach((picture) => {
      if (!picture.parentElement.classList.contains('image-wrapper')) {
        const wrapperDiv = document.createElement('div');
        wrapperDiv.classList.add('image-wrapper');
        picture.parentNode.insertBefore(wrapperDiv, picture);
        wrapperDiv.appendChild(picture);
      }
    });
  });
}

function setImageDimensions() {
  const imageWrappers = document.querySelectorAll('.image-wrapper');

  imageWrappers.forEach((wrapper) => {
    const img = wrapper.querySelector('img');

    if (img) {
      const setAspectRatio = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;

        if (width && height) {
          const aspectRatio = (height / width).toFixed(4);

          // Set aspect ratio if not on mobile
          if (window.innerWidth > 600) {
            wrapper.style.setProperty('--aspect-ratio', aspectRatio);
          }
        }
      };

      if (img.complete) {
        setAspectRatio();
      } else {
        img.onload = setAspectRatio;
      }
    }
  });
}

export default function decorate() {
  const heroBannerWrappers = document.querySelectorAll('.hero-banner-wrapper');

  heroBannerWrappers.forEach((wrapper) => {
    const heroBanner = wrapper.querySelector('.hero-banner');

    if (heroBanner) {
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

  wrapImagesInContainer();
  setImageDimensions();
}
