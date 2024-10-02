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
  // create a dix with a cross button when clicked do same as close button
  if (block.classList.contains('animate')) {
    const closeDiv = document.createElement('div');
    closeDiv.classList.add('close-div');
    closeDiv.innerHTML = '<a href="#" class="close-button">X</a>';
    block.prepend(closeDiv);

    createRadioFromList();
  }

  document.querySelectorAll('.survey-container').forEach((container) => {
    if (container.querySelector('.animate')) {
      container.classList.add('animate-container');
    } else if (container.querySelector('.fixed')) {
      container.classList.add('fixed-container');
    }
  });

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
  const closeButton = document.querySelector('.close-button');
  const surveyContainer = document.querySelector('.survey-container.animate-container');

  const buttons = [dismissButton, closeButton].filter((button) => button !== null);
  buttons.forEach((button) => {
    button.removeAttribute('href');
    button.addEventListener('click', () => {
      surveyContainer.classList.add('hidden');
    });
  });
}
