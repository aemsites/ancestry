import { createOptimizedPicture } from '../../scripts/aem.js';

function wrapAncestryText(element) {
  const ancestryRegex = /AncestryDNA|Ancestry/g;
  function traverseNodes(node) {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const parent = child.parentNode;
        if (parent && parent.classList && parent.classList.contains('ancestry')) {
          return;
        }

        const updatedText = child.textContent.replace(ancestryRegex, (match) => `<span class="ancestry">${match}</span>`);
        if (updatedText !== child.textContent) {
          const wrapper = document.createElement('span');
          wrapper.innerHTML = updatedText;
          child.replaceWith(...wrapper.childNodes);
        }
      } else if (child.nodeType === Node.ELEMENT_NODE && child.nodeName !== 'SCRIPT' && child.nodeName !== 'STYLE') {
        traverseNodes(child);
      }
    });
  }

  traverseNodes(element);
}

function formatPrice(element) {
  const priceText = element.textContent.trim().toLowerCase();
  if (priceText.startsWith('only $')) {
    const priceMatch = element.textContent.match(/only \$(\d+)/i);
    if (priceMatch) {
      const price = priceMatch[1];

      const formattedPrice = `
        ONLY <strong>
          <span class="dollar-sign">$</span>
          <span class="price">${price}</span>
          <sup class="price-asterisk">*</sup>
        </strong>
      `;
      element.innerHTML = formattedPrice;
    }
  }
}

function setupAccordion(cardBody) {
  const detailDiv = cardBody.querySelector('.detail');
  if (!detailDiv) return;

  const paragraphs = detailDiv.querySelectorAll('p');
  let subscriptionParagraph = null;

  paragraphs.forEach((paragraph) => {
    const strongElement = paragraph.querySelector('strong');
    if (strongElement && strongElement.textContent.trim().toLowerCase().includes('subscription offer')) {
      subscriptionParagraph = paragraph;
    }
  });

  if (subscriptionParagraph) {
    console.log('Subscription offer found:', subscriptionParagraph);

    const accordionWrapper = document.createElement('div');
    accordionWrapper.classList.add('accordion');

    const toggleText = document.createElement('div');
    toggleText.classList.add('accordion-toggle');
    toggleText.innerHTML = `<sup>§</sup> See offer details <span class="arrow"></span>`;

    const accordionContent = document.createElement('div');
    accordionContent.classList.add('accordion-content');
    accordionContent.style.display = 'none';

    accordionContent.appendChild(subscriptionParagraph.cloneNode(true));

    let sibling = subscriptionParagraph.nextElementSibling;
    const siblingsToMove = [];

    while (sibling) {
      siblingsToMove.push(sibling);
      sibling = sibling.nextElementSibling;
    }

    siblingsToMove.forEach((sibling) => {
      accordionContent.appendChild(sibling.cloneNode(true));
      sibling.remove();
    });

    toggleText.addEventListener('click', () => {
      if (accordionContent.style.display === 'none') {
        accordionContent.style.display = 'block';
        toggleText.classList.add('expanded'); 
        toggleText.innerHTML = `<sup style="font-size: 0.55em;top: -0.9em;">§</sup> Hide offer details <span class="arrow"></span>`;
      } else {
        accordionContent.style.display = 'none';
        toggleText.classList.remove('expanded'); 
        toggleText.innerHTML = `<sup style="font-size: 0.55em;top: -0.9em;">§</sup> See offer details <span class="arrow"></span>`;
      }
    });

    detailDiv.insertBefore(toggleText, subscriptionParagraph);
    detailDiv.insertBefore(accordionContent, toggleText.nextElementSibling);

    subscriptionParagraph.remove();
  }
}

function openPopup(hiddenContent) {
  const overlay = document.createElement('div');
  overlay.classList.add('popup-overlay');

  const popup = document.createElement('div');
  popup.classList.add('popup-window');

  const title = document.createElement('h2');
  title.textContent = "What's included";
  title.classList.add('popup-title');

  const closeButton = document.createElement('span');
  closeButton.innerHTML = '&times;';
  closeButton.classList.add('popup-close');
  closeButton.addEventListener('click', () => {
    document.body.removeChild(overlay);
    document.body.removeChild(popup);
  });

  hiddenContent.forEach((element) => {
    popup.appendChild(element.cloneNode(true));
  });

  popup.prepend(closeButton);
  popup.prepend(title);
  document.body.appendChild(overlay);
  document.body.appendChild(popup);

  popup.addEventListener('click', (e) => e.stopPropagation());
}

export default function decorate(block) {
  const dnaSection = block.closest('.section.dna');

  const ul = document.createElement('ul');

  [...block.children].forEach((row, index) => {
    const li = document.createElement('li');
    li.classList.add(`item-${index + 1}`);

    while (row.firstElementChild) {
      li.append(row.firstElementChild);
    }

    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-card-image';
      } else {
        div.className = 'cards-card-body';
      }

      const icon = div.querySelector('.icon');
      if (icon) {
        const grandParent = div.closest('.cards-card-body');
        if (icon.classList.contains('icon-icon-leaf')) {
          grandParent.classList.add('leaf-background');
        } else if (icon.classList.contains('icon-icon-dna')) {
          grandParent.classList.add('dna-background');
        } else if (icon.classList.contains('icon-icon-tree-pedigree')) {
          grandParent.classList.add('tree-pedigree-background');
        }
      }
    });

if (dnaSection) {
  const cardBodies = li.querySelectorAll('.cards-card-body');

  cardBodies.forEach((cardBody, idx) => {
    const h2Group = document.createElement('div');
    h2Group.className = 'title';

    const productGroup = document.createElement('div');
    productGroup.className = 'product';

    const leftAlignedGroup = document.createElement('div');
    leftAlignedGroup.className = 'detail';

    const expandGroup = document.createElement('div');
    expandGroup.className = 'expand';

    const elements = [...cardBody.children];

    // Apply different structures based on the item index and context
    if (index === 0) { // item-1: Handle title and product content
      elements.forEach((elem) => {
        if (elem.matches('h2')) {
          h2Group.appendChild(elem);
        } else {
          productGroup.appendChild(elem);
          formatPrice(elem);
        }
      });
      cardBody.innerHTML = '';
      cardBody.appendChild(h2Group);
      cardBody.appendChild(productGroup);
    } else if (index === 1) { // item-2: Handle "What's included" for mobile
      const hiddenContent = [];
      elements.forEach((elem) => {
        if (elem.textContent.trim().toLowerCase() === "what’s included") {
          const whatsIncluded = document.createElement('a');
          whatsIncluded.href = "#";
          whatsIncluded.textContent = elem.textContent;
          whatsIncluded.classList.add('whats-included');

          whatsIncluded.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openPopup(hiddenContent);
          });

          expandGroup.appendChild(whatsIncluded);
        } else {
          hiddenContent.push(elem);
        }
      });

      cardBody.innerHTML = '';
      cardBody.appendChild(expandGroup);
    } else if (index === 2) { // item-3: Handle <ul> and <u> elements as dialog components
      elements.forEach((elem) => leftAlignedGroup.appendChild(elem));
      cardBody.innerHTML = '';
      cardBody.appendChild(leftAlignedGroup);

      const ulElements = cardBody.querySelectorAll('ul');
      const uElements = cardBody.querySelectorAll('p > u');

      ulElements.forEach((ul, i) => {
        const liElements = ul.querySelectorAll('li');

        liElements.forEach((li) => {
          const infoIcon = document.createElement('span');
          infoIcon.classList.add('info-icon');
          li.appendChild(infoIcon);

          const dialogWrapper = document.createElement('div');
          dialogWrapper.classList.add('dialog-wrapper');
          dialogWrapper.style.display = 'none';

          const dialogContent = document.createElement('div');
          dialogContent.classList.add('dialog-content');

          const clonedLi = li.cloneNode(true);
          const clonedU = uElements[i] ? uElements[i].cloneNode(true) : null;

          dialogContent.appendChild(clonedLi);
          if (clonedU) {
            dialogContent.appendChild(clonedU);
            uElements[i].style.display = 'none';
          }

          dialogWrapper.appendChild(dialogContent);
          ul.parentNode.insertBefore(dialogWrapper, ul.nextSibling);

          ul.addEventListener('click', function (e) {
            e.stopPropagation();
            closeAllDialogs();
            dialogWrapper.style.display = 'block';
          });
        });
      });
    }
    setupAccordion(cardBody);
  });
}

ul.appendChild(li);

    
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])
    );
  });

  block.textContent = '';
  block.append(ul);

  const defaultContentWrapper = block
    .closest('.cards-container')
    .querySelector('.default-content-wrapper');
  if (defaultContentWrapper) {
    wrapAncestryText(defaultContentWrapper);
  }
  wrapAncestryText(block);

  // Close dialog when clicking outside
  document.addEventListener('click', function(e) {
    const target = e.target;

    if (!target.closest('.popup-window') && !target.closest('.whats-included')) {
      closeAllDialogs();
    }
  });


  function closeAllDialogs() {
    const allDialogs = document.querySelectorAll('.dialog-wrapper');
    allDialogs.forEach(dialog => {
      dialog.style.display = 'none';
    });
  }
}
