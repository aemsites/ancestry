import { createVideoIframe } from '../../scripts/scripts.js';
import { appendCarouselActions, createIndicators } from '../carousel/carousel.js';
import { constants as AriaModal } from './aria-modal.js';

function reinitializeCarousel(dialog, callback) {
  const carouselBlocks = dialog.querySelectorAll('.carousel.block');

  carouselBlocks.forEach((carousel) => {
    const slides = [...carousel.children];
    const slideCount = slides.length;

    if (slideCount > 1) {
      appendCarouselActions(carousel);
      createIndicators(carousel, slideCount);
    }
  });

  if (typeof callback === 'function') {
    callback();
  }
}

function closeExistingModals() {
  document.querySelectorAll(AriaModal.tagName).forEach((modal) => {
    if (modal.close) {
      modal.close();
    } else {
      modal.parentNode.removeChild(modal);
    }
  });
}

export default function decorate(block) {
  document.addEventListener('click', (event) => {
    const linkElement = event.target.closest('a[data-popup="true"]');
    if (linkElement) {
      event.preventDefault();
      event.stopPropagation();

      closeExistingModals();

      const videoUrl = linkElement.getAttribute('data-youtube-video-url');
      let content;
      let attr = '';

      if (videoUrl) {
        content = createVideoIframe(videoUrl);
        attr = 'iframe-popup';
      } else {
        const href = linkElement.getAttribute('href');
        const id = href.substring(1);

        const popupContentElement = block.querySelector(`#${id}`);
        const condition = `[data-fragment-id="${id}"][data-popup-content="true"]`;
        const popupContentFragmentElement = document.querySelector(condition);

        if (popupContentFragmentElement) {
          content = popupContentFragmentElement.querySelector('div .section').cloneNode(true);
          attr = content.classList.value;
        } else if (popupContentElement) {
          content = popupContentElement.parentElement.cloneNode(true);
        } else {
          return;
        }
      }

      const dialog = document.createElement(AriaModal.tagName);
      dialog.setAttribute('modal', 'true');
      if (attr) dialog.setAttribute('data-popup-content', attr);

      const dialogContent = document.createElement('div');
      dialogContent.classList.add('popup-content');
      dialogContent.appendChild(content);
      dialog.appendChild(dialogContent);

      dialog.addEventListener('modalContentLoaded', () => {
        if (attr.includes('carousel-container')) {
          reinitializeCarousel(dialog, () => {
            const focusables = dialog.getFocusables();
            if (focusables.length > 0) focusables[0].focus();
          });
        } else {
          const focusables = dialog.getFocusables();
          if (focusables.length > 0) focusables[0].focus();
        }
      });

      document.body.appendChild(dialog);
      dialog.open();
    }
  });
}
