import { appendCarouselActions, appendCarouselIndicators } from '../carousel/carousel.js';

function reinitializeCarousel(popup) {
  const carouselBlocks = popup.querySelectorAll('.carousel.block');

  carouselBlocks.forEach((carousel) => {
    const slides = [...carousel.children];
    const slideCount = slides.length;

    if (slideCount > 0) {
      slides[0].classList.add('active');
    }

    if (slideCount > 1) {
      appendCarouselActions(carousel);
      appendCarouselIndicators(carousel);
    }
  });
}

export default function decorate(block) {
  function closeExistingPopups() {
    const existingPopup = document.querySelector('.popup-window');
    const existingOverlay = document.querySelector('.popup-overlay');
    if (existingPopup) existingPopup.remove();
    if (existingOverlay) existingOverlay.remove();

    document.body.classList.remove('no-scroll');
  }

  function openPopup(content, attr = '') {
    closeExistingPopups();

    document.body.classList.add('no-scroll');

    const overlay = document.createElement('div');
    overlay.setAttribute('data-popup-overlay', attr);
    overlay.classList.add('popup-overlay');
    overlay.addEventListener('click', closeExistingPopups);

    const popup = document.createElement('div');
    popup.classList.add('popup-window');
    popup.setAttribute('data-popup-content', attr);

    const closeButton = document.createElement('span');
    closeButton.innerHTML = '&times;';
    closeButton.classList.add('popup-close');
    closeButton.addEventListener('click', closeExistingPopups);

    popup.appendChild(closeButton);
    popup.appendChild(content);

    document.body.appendChild(overlay);
    document.body.appendChild(popup);

    popup.addEventListener('click', (e) => e.stopPropagation());

    reinitializeCarousel(popup);
  }

  document.addEventListener('click', (event) => {
    const linkElement = event.target.closest('a[data-popup="true"]');
    if (linkElement) {
      event.preventDefault();
      event.stopPropagation();

      const href = linkElement.getAttribute('href');
      const id = href.substring(1);

      const popupContentElement = block.querySelector(`#${id}`);
      const condition = `[data-fragment-id="${id}"][data-popup-content="true"]`;
      const popupContentFragmentElement = document.querySelector(condition);
      if (popupContentFragmentElement) {
        const fragmentContent = popupContentFragmentElement.querySelector('div .section').cloneNode(true);
        openPopup(fragmentContent, fragmentContent.classList);
      } else if (popupContentElement) {
        const content = popupContentElement.parentElement.cloneNode(true);
        openPopup(content);
      } else {
        // eslint-disable-next-line no-console
        console.error(`Popup content not found for id: ${id}`);
      }
    }
  });
}
