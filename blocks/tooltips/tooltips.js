export default function decorate(block) {
    // Keep track of the current open dialog
    let currentDialog = null;
  
    // Function to close existing dialogs
    function closeExistingDialogs() {
      if (currentDialog) {
        currentDialog.dialog.remove();
        currentDialog.triangle.remove();
        window.removeEventListener('resize', currentDialog.updatePosition);
        window.removeEventListener('scroll', currentDialog.updatePosition);
        document.removeEventListener('click', currentDialog.outsideClickListener);
        currentDialog = null;
      }
    }
  
    // Function to open the dialog window with updated positioning logic
    function openDialog(triggerElement, contentElement) {
      closeExistingDialogs();
  
      const dialog = document.createElement('div');
      dialog.classList.add('dialog-window');
  
      const triangle = document.createElement('div');
      triangle.classList.add('dialog-triangle');
  
      dialog.appendChild(contentElement.cloneNode(true));
  
      // Append to document body
      document.body.appendChild(dialog);
      document.body.appendChild(triangle);
  
      // Function to update the position of the tooltip
      function updatePosition() {
        const triggerRect = triggerElement.getBoundingClientRect();
  
        // Check if the trigger element is visible
        if (
          triggerRect.bottom < 0 ||
          triggerRect.top > window.innerHeight ||
          triggerRect.right < 0 ||
          triggerRect.left > window.innerWidth
        ) {
          // Trigger is out of viewport, close the dialog
          closeExistingDialogs();
          return;
        }
  
        const dialogRect = dialog.getBoundingClientRect();
  
        // Calculate positions relative to viewport
        let top = triggerRect.bottom + 10; // Offset below the trigger
        let left = triggerRect.left + triggerRect.width / 2 - dialogRect.width / 2;
  
        const viewportWidth = window.innerWidth;
  
        // Adjust left position if dialog overflows viewport horizontally
        if (left < 0) {
          left = 0;
        }
        if (left + dialogRect.width > viewportWidth) {
          left = viewportWidth - dialogRect.width;
        }
  
        // Position the triangle
        triangle.style.left = `${triggerRect.left + triggerRect.width / 2 - 10}px`; // Centered under the trigger
        triangle.style.top = `${top - 7}px`; // Just above the dialog
  
        // Ensure the triangle stays within the viewport horizontally
        const triangleRect = triangle.getBoundingClientRect();
        if (triangleRect.left < 0) {
          triangle.style.left = `10px`;
        } else if (triangleRect.right > viewportWidth) {
          triangle.style.left = `${viewportWidth - 20}px`;
        }
  
        // Set the triangle to point upward
        triangle.style.borderTop = 'none';
        triangle.style.borderBottom = '10px solid #fff'; // Adjust color to match dialog window
  
        // Set dialog styles
        dialog.style.position = 'fixed';
        dialog.style.top = `${top}px`;
        dialog.style.left = `${left}px`;
        dialog.style.zIndex = '1000';
  
        triangle.style.position = 'fixed';
        triangle.style.zIndex = '1000';
      }
  
      // Initial positioning
      updatePosition();
  
      // Add event listeners to update position on scroll and resize
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);
  
      // Function to handle clicks outside the dialog
      function outsideClickListener(event) {
        if (
          !dialog.contains(event.target) &&
          !triggerElement.contains(event.target)
        ) {
          closeExistingDialogs();
        }
      }
  
      // Listen for clicks outside the dialog
      setTimeout(() => {
        document.addEventListener('click', outsideClickListener);
      }, 0); // Delay to allow current event to finish
  
      // Update current dialog reference
      currentDialog = {
        dialog,
        triangle,
        updatePosition,
        outsideClickListener,
      };
    }
  
    // Event listener for tooltip triggers and links
    document.addEventListener('click', (event) => {
      const triggerElement = event.target.closest('.tooltip-trigger, .tooltip-link');
      if (triggerElement) {
        event.preventDefault();
  
        const tooltipId = triggerElement.getAttribute('data-tooltip-id');
  
        // Find the content in the tooltips block
        const tooltipContentElement = block.querySelector(`#${tooltipId}`);
        if (tooltipContentElement) {
          openDialog(triggerElement, tooltipContentElement.parentElement);
        } else {
          console.error(`Tooltip content not found for id: ${tooltipId}`);
        }
      }
    });
  }
  