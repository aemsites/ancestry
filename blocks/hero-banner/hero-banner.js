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
    }
  });

  wrapImagesInContainer();
  setImageDimensions();
}
