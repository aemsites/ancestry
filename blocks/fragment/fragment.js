/*
 * Fragment Block
 * Include content on a page as a fragment.
 * https://www.aem.live/developer/block-collection/fragment
 */

import {
  decorateMain,
} from '../../scripts/scripts.js';

import {
  loadSections,
} from '../../scripts/aem.js';

/**
 * Loads a fragment.
 * @param {string} path The path to the fragment
 * @returns {HTMLElement} The root element of the fragment
 */
export async function loadFragment(path) {
  if (path && path.startsWith('/')) {
    const resp = await fetch(`${path}.plain.html`);
    if (resp.ok) {
      const main = document.createElement('main');
      main.innerHTML = await resp.text();

      // reset base path for media to fragment base
      const resetAttributeBase = (tag, attr) => {
        main.querySelectorAll(`${tag}[${attr}^="./media_"]`).forEach((elem) => {
          elem[attr] = new URL(elem.getAttribute(attr), new URL(path, window.location)).href;
        });
      };
      resetAttributeBase('img', 'src');
      resetAttributeBase('source', 'srcset');

      decorateMain(main);
      await loadSections(main);
      return main;
    }
  }
  return null;
}

function createRadioFromList() {
  const list = document.querySelector('.animate ul');
  const listItems = list.getElementsByTagName('li');

  for (let i = 0; i < listItems.length; i += 1) {
    const value = listItems[i].innerText;
    const radioId = value.toLowerCase().replace(/\s+/g, '-');

    const radioInput = document.createElement('input');
    radioInput.type = 'radio';
    radioInput.name = 'response';
    radioInput.value = value.toLowerCase();
    radioInput.id = radioId;
    radioInput.style.appearance = 'none';

    // add href as a data attribute
    if (listItems[i].querySelector('a')) {
      radioInput.setAttribute('data-href', listItems[i].querySelector('a').getAttribute('href'));
    }

    const label = document.createElement('label');
    label.setAttribute('for', radioId);
    label.innerText = value;

    listItems[i].innerHTML = '';
    const outerLabel = document.createElement('label');
    outerLabel.appendChild(radioInput);
    outerLabel.appendChild(label);
    listItems[i].appendChild(outerLabel);
  }
}

export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  const fragment = await loadFragment(path);
  if (fragment) {
    const fragmentSections = fragment.querySelectorAll(':scope .section');
    if (fragmentSections.length > 0) {
      const blockDiv = block.closest('.fragment');
      blockDiv.innerHTML = '';
      fragmentSections.forEach((section) => {
        blockDiv.appendChild(section);
      });
    }
  }

  if (!block.classList.contains('animate') && !block.classList.contains('fixed')) {
    return;
  }

  // create a dix with a cross button when clicked do same as close button
  if (block.classList.contains('animate')) {
    const closeDiv = document.createElement('div');
    closeDiv.classList.add('close-div');
    closeDiv.innerHTML = '<a href="#" class="close-button">X</a>';
    block.prepend(closeDiv);
  }

  document.querySelectorAll('.fragment-container').forEach((container) => {
    if (container.querySelector('.animate')) {
      container.classList.add('animate-container');
    } else if (container.querySelector('.fixed')) {
      container.classList.add('fixed-container');
    }
  });

  createRadioFromList();

  document.querySelectorAll('.animate input[type="radio"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      const radioButtons = document.querySelectorAll('.animate input[type="radio"]');
      radioButtons.forEach((rb) => {
        if (rb.checked) {
          rb.parentElement.parentElement.classList.add('selected');
          rb.nextElementSibling.classList.add('selected-option');

          // redirect to data-href if available
          const href = rb.getAttribute('data-href');
          if (href) {
            window.location.href = href;
          }
        } else {
          rb.parentElement.parentElement.classList.remove('selected');
          rb.nextElementSibling.classList.remove('selected-option');
        }
      });
    });
  });

  // add class on selecting an option else show alert
  const continueButton = document.querySelector('.animate .button-container:nth-of-type(1) a:first-of-type');
  if (continueButton) {
    continueButton.addEventListener('click', (event) => {
      const radioButtons = document.querySelectorAll('.animate input[type="radio"]');
      let radioSelected = false;
      radioButtons.forEach((radio) => {
        if (radio.checked) {
          radioSelected = true;
        }
      });
      if (!radioSelected) {
        // stop redirect if no radio is selected
        event.preventDefault();
        // eslint-disable-next-line no-alert
        alert('Please select an option.');
      }
    });
  }

  // close fragment on Dismiss/Close button click
  const dismissButton = document.querySelector('.animate .button-container:nth-of-type(2) a:first-of-type');
  const closeButton = document.querySelector('.close-button');
  const fragmentContainer = document.querySelector('.fragment-container.animate-container');

  const buttons = [dismissButton, closeButton].filter((button) => button !== null);
  buttons.forEach((button) => {
    button.removeAttribute('href');
    button.addEventListener('click', () => {
      fragmentContainer.classList.add('hidden');
    });
  });
}
