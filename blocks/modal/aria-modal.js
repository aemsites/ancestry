export const constants = {
  tagName: 'hlx-aria-modal',
};

export class AriaModal extends HTMLElement {
  constructor() {
    super();
    this.handleKeydownEvent = this.handleKeydownEvent.bind(this);
  }

  static getId() {
    return Math.random().toString(32).substring(2);
  }

  connectedCallback() {
    this.decorate();
    Promise.resolve().then(() => {
      this.attachListeners();
    });
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this.handleKeydownEvent);
  }

  attachListeners() {
    const modal = this.querySelector('[role="modal"]');
    const overlay = this.querySelector('.popup-overlay');
    const closeButton = modal.querySelector('.popup-close');

    if (closeButton) {
      closeButton.addEventListener('click', () => this.close());
    }

    if (overlay) {
      overlay.addEventListener('click', () => this.close());
    }

    document.addEventListener('keydown', this.handleKeydownEvent);
  }

  handleKeydownEvent(ev) {
    const modal = this.querySelector('[role="modal"]');
    if (!modal || modal.getAttribute('aria-hidden') === 'true') {
      return;
    }

    if (ev.key === 'Escape') {
      ev.stopPropagation();
      this.close();
      return;
    }

    if (ev.key !== 'Tab') return;
    ev.preventDefault();
    const focusables = this.getFocusables();
    if (focusables.length === 0) {
      return;
    }

    const currentIndex = focusables.indexOf(document.activeElement);

    let nextIndex;
    if (ev.shiftKey) {
      // Shift + Tab
      nextIndex = currentIndex > 0 ? currentIndex - 1 : focusables.length - 1;
    } else {
      // Tab
      nextIndex = currentIndex >= 0 && currentIndex < focusables.length - 1
        ? currentIndex + 1
        : 0;
    }
    focusables[nextIndex].focus();
  }

  getFocusables() {
    const modal = this.querySelector('[role="modal"]');
    const focusables = modal
      ? Array.from(
        modal.querySelectorAll(
          'button:not([disabled]):not([aria-hidden="true"]), '
          + 'a[href]:not([tabindex="-1"]):not([aria-hidden="true"]), '
          + 'input:not([disabled]):not([aria-hidden="true"]), '
          + 'select:not([disabled]):not([aria-hidden="true"]), '
          + 'textarea:not([disabled]):not([aria-hidden="true"]), '
          + '[tabindex]:not([tabindex="-1"]):not([aria-hidden="true"])',
        ),
      ).filter(
        (el) => modal.contains(el) && el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden',
      )
      : [];
    return focusables;
  }

  decorate() {
    const id1 = AriaModal.getId();
    const id2 = AriaModal.getId();

    const overlay = document.createElement('div');
    overlay.classList.add('popup-overlay');
    this.appendChild(overlay);

    const modal = document.createElement('div');
    modal.id = id2;
    modal.setAttribute('role', 'modal');
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('aria-labelledby', id1);
    modal.setAttribute('aria-modal', 'true');
    modal.classList.add('popup-window');
    modal.setAttribute('tabindex', '-1');

    if (this.hasAttribute('data-popup-content')) {
      const popupContentAttr = this.getAttribute('data-popup-content');
      modal.setAttribute('data-popup-content', popupContentAttr);
    }

    this.appendChild(modal);

    const closeButton = document.createElement('button');
    closeButton.setAttribute('aria-label', 'close modal');
    closeButton.classList.add('popup-close');
    modal.appendChild(closeButton);

    const contentElements = Array.from(this.children).filter(
      (child) => child !== modal && child !== overlay,
    );
    contentElements.forEach((el) => {
      modal.appendChild(el);
    });

    this.dispatchEvent(new CustomEvent('modalContentLoaded', { bubbles: true }));
  }

  open() {
    const modal = this.querySelector('[role="modal"]');
    const overlay = this.querySelector('.popup-overlay');
    if (modal && overlay) {
      modal.setAttribute('aria-hidden', 'false');
      overlay.style.display = 'block';
      document.body.classList.add('no-scroll');

      const focusables = this.getFocusables();
      if (focusables.length > 0) {
        focusables[0].focus();
      } else {
        modal.focus();
      }
    }
  }

  close() {
    const modal = this.querySelector('[role="modal"]');
    const overlay = this.querySelector('.popup-overlay');
    if (modal && overlay) {
      modal.setAttribute('aria-hidden', 'true');
      overlay.style.display = 'none';
      document.body.classList.remove('no-scroll');
      this.parentNode.removeChild(this);
    }
  }
}

customElements.define(constants.tagName, AriaModal);
