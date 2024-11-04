import { getYoutubeThumbnail } from '../../scripts/scripts.js';
import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    const contentBlocks = [...row.children];

    contentBlocks.forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        col.classList.add('columns-img-col');
        pic.replaceWith(createOptimizedPicture(pic.querySelector('img').src, pic.querySelector('img').alt, false, [{ width: '750' }]));
      } else {
        col.classList.add('text-content');
      }
    });

    const iconImages = block.querySelectorAll('img');
    iconImages.forEach((img) => {
      if (img.hasAttribute('data-icon-name')) {
        img.parentElement.parentElement.classList.add('icon-wrapper');
      }
    });
  });

  const youtubeLinks = block.querySelectorAll('a[data-youtube-video-url]');
  youtubeLinks.forEach((linkElement) => {
    const videoUrl = linkElement.getAttribute('data-youtube-video-url');
    const thumbnailUrl = getYoutubeThumbnail(videoUrl);

    if (block.classList.contains('thumbnail')) {
      const buttonContainer = linkElement.closest('.button-container');

      if (!buttonContainer.previousElementSibling || buttonContainer.previousElementSibling.tagName !== 'IMG') {
        const imgElement = document.createElement('img');
        imgElement.src = thumbnailUrl;
        imgElement.alt = 'YouTube video thumbnail';
        imgElement.classList.add('youtube-thumbnail');
        buttonContainer.parentNode.insertBefore(imgElement, buttonContainer);
      }
    }
  });
}
