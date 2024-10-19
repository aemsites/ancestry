export default function decorate(block) {
  let currentDialog = null;

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

  function openDialog(triggerElement, contentElement) {
    closeExistingDialogs();

    const dialog = document.createElement('div');
    dialog.classList.add('dialog-window');

    const triangle = document.createElement('div');
    triangle.classList.add('dialog-triangle');

    dialog.appendChild(contentElement.cloneNode(true));

    document.body.appendChild(dialog);
    document.body.appendChild(triangle);

    let position = 'below';
    const closestTooltip = contentElement.closest('.tooltips.top');

    if (closestTooltip) {
      closestTooltip.classList.forEach((className) => {
        if (className !== 'tooltips' && className !== 'top') {
          dialog.classList.add(className);
        }
      });
      position = 'above';
    }

    // update the position of the dialog
    function updatePosition() {
      const triggerRect = triggerElement.getBoundingClientRect();
      const dialogRect = dialog.getBoundingClientRect();

      const viewportWidth = window.innerWidth;

      let top = triggerRect.left + triggerRect.width / 2 - dialogRect.width / 2;
      let left = triggerRect.left + triggerRect.width / 2 - dialogRect.width / 2;

      if (left < 0) {
        left = 10;
      }
      if (left + dialogRect.width > viewportWidth) {
        left = viewportWidth - dialogRect.width - 10;
      }

      if (position === 'below') {
        top = triggerRect.bottom + 10;
        triangle.style.borderTop = 'none';
        triangle.style.borderBottom = '10px solid #fff';
        triangle.style.left = `${triggerRect.left + triggerRect.width / 2 - 10}px`;
        triangle.style.top = `${top - 7}px`;
      } else {
        top = triggerRect.top - dialogRect.height - 10;
        triangle.style.borderBottom = 'none';
        triangle.style.borderTop = '10px solid #fff';
        triangle.style.left = `${triggerRect.left + triggerRect.width / 2 - 10}px`;
        triangle.style.top = `${top + dialogRect.height - 8}px`;
      }

      const triangleRect = triangle.getBoundingClientRect();
      if (triangleRect.left < 0) {
        triangle.style.left = `10px`;
      } else if (triangleRect.right > viewportWidth) {
        triangle.style.left = `${viewportWidth - 20}px`;
      }

      dialog.style.position = 'fixed';
      dialog.style.top = `${top}px`;
      dialog.style.left = `${left}px`;
      dialog.style.zIndex = '1000';

      triangle.style.position = 'fixed';
      triangle.style.zIndex = '1000';
    }

    updatePosition();

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    function outsideClickListener(event) {
      if (
        !dialog.contains(event.target) && !triggerElement.contains(event.target)
      ) {
        closeExistingDialogs();
      }
    }

    setTimeout(() => {
      document.addEventListener('click', outsideClickListener);
    }, 0);

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
      let tooltipContentElement = block.querySelector(`#${tooltipId}`);

      if (!tooltipContentElement) {
        tooltipContentElement = document.querySelector(`#${tooltipId}`);
      }

      if (tooltipContentElement) {
        openDialog(triggerElement, tooltipContentElement.parentElement);
      } else {
        /* eslint-disable no-console */
        console.error(`Tooltip content not found for id: ${tooltipId}`);
      }
    }
  });
}
