import { getYoutubeThumbnail } from '../../scripts/scripts.js';

export default function decorate(block) {
  const youtubeLinks = block.querySelectorAll('a[data-youtube-video-url]');

  youtubeLinks.forEach((linkElement) => {
    const videoUrl = linkElement.getAttribute('data-youtube-video-url');
    const thumbnailUrl = getYoutubeThumbnail(videoUrl);

    if (thumbnailUrl) {
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
