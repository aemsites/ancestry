import { createVideoIframe } from '../../scripts/scripts.js';
import { appendCarouselActions } from '../carousel/carousel.js';

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
    }
  });
}

function closeExistingPopups() {
  document.querySelectorAll('.popup-window, .popup-overlay').forEach((element) => element.remove());
  document.body.classList.remove('no-scroll');
}

function openPopup(content, attr = '') {
  closeExistingPopups();
  document.body.classList.add('no-scroll');

  const overlay = document.createElement('div');
  overlay.classList.add('popup-overlay');
  if (attr) overlay.setAttribute('data-popup-overlay', attr);
  overlay.addEventListener('click', closeExistingPopups);

  const popup = document.createElement('div');
  popup.classList.add('popup-window');
  if (attr) popup.setAttribute('data-popup-content', attr);

  if (content instanceof HTMLIFrameElement) popup.classList.add('iframe-popup');

  const closeButton = document.createElement('span');
  closeButton.classList.add('popup-close');
  closeButton.addEventListener('click', closeExistingPopups);

  popup.append(closeButton, content);

  document.body.appendChild(overlay);
  document.body.appendChild(popup);

  if (popup.getAttribute('data-popup-content')?.includes('carousel-container')) {
    reinitializeCarousel(popup);
  }
}

export default function decorate(block) {
  document.addEventListener('click', (event) => {
    const linkElement = event.target.closest('a[data-popup="true"]');
    if (linkElement) {
      event.preventDefault();
      event.stopPropagation();
      const videoUrl = linkElement.getAttribute('data-youtube-video-url');
      if (videoUrl) {
        const iframe = createVideoIframe(videoUrl);
        openPopup(iframe);
      } else {
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
    }
  });
}
