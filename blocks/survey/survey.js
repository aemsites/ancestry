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
    listItems[i].appendChild(label);
    listItems[i].appendChild(radioInput);
  }
}

export default async function decorate(block) {
  const closeButtonTemplate = '<div class="close-div"><a href="#" class="close-button">X</a></div>';
  const isAnimated = block.classList.contains('animate');
  if (isAnimated) {
    block.insertAdjacentHTML('afterbegin', closeButtonTemplate);
    createRadioFromList();
    const dismissButton = block.querySelector('[title="Dismiss"]');
    if (dismissButton) {
      dismissButton.href = '#';
    }
  }

  const container = block.closest('.survey-container');
  if (!container) return;
  if (isAnimated) {
    requestAnimationFrame(() => {
      container.classList.add('animate-container');
    });
  } else if (block.classList.contains('fixed')) {
    container.classList.add('fixed-container');
  }

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

  // close survey on Dismiss/Close button click
  const dismissButton = document.querySelector('.animate .button-container:nth-of-type(2) a:first-of-type');
  const closeButtonElement = document.querySelector('.close-button');

  const buttons = [dismissButton, closeButtonElement].filter((button) => button !== null);
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      container.classList.add('hidden');
    });
  });
}
