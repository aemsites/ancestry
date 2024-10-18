export default function decorate(block) {
    // Function to close existing popups
    function closeExistingPopups() {
      const existingPopup = document.querySelector('.popup-window');
      const existingOverlay = document.querySelector('.popup-overlay');
      if (existingPopup) existingPopup.remove();
      if (existingOverlay) existingOverlay.remove();
    }
  
    // Function to open the popup
    function openPopup(content) {
      closeExistingPopups();
  
      const overlay = document.createElement('div');
      overlay.classList.add('popup-overlay');
      overlay.addEventListener('click', closeExistingPopups);
  
      const popup = document.createElement('div');
      popup.classList.add('popup-window');
  
      const closeButton = document.createElement('span');
      closeButton.innerHTML = '&times;';
      closeButton.classList.add('popup-close');
      closeButton.addEventListener('click', closeExistingPopups);
  
      popup.appendChild(closeButton);
      popup.appendChild(content);
  
      document.body.appendChild(overlay);
      document.body.appendChild(popup);
  
      popup.addEventListener('click', (e) => e.stopPropagation());
    }
  
    // Event listener for popup links
    document.addEventListener('click', (event) => {
        console.log('document click event function called');
      const linkElement = event.target.closest('a.popup-link');
      if (linkElement) {
        console.log('Popup link clicked:', linkElement);
        event.preventDefault();
        event.stopPropagation();
  
        const href = linkElement.getAttribute('href');
        const id = href.substring(1);
  
        const popupContentElement = block.querySelector(`#${id}`);
        if (popupContentElement) {
          const content = popupContentElement.parentElement.cloneNode(true);
          openPopup(content);
        } else {
          console.error(`Popup content not found for id: ${id}`);
        }
      }
    });
  }
  