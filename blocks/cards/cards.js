import { createOptimizedPicture } from '../../scripts/aem.js';

function formatPrice(element) {
  const priceText = element.textContent.trim();
  const priceMatch = priceText.match(/^(.*?)\$(\d+)/);

  if (priceMatch) {
    const preText = priceMatch[1].trim();
    const price = priceMatch[2];

    let formattedPrice = `
    ${preText ? `${preText} ` : ''}
    <strong class="price-amount">
      <span class='dollar-sign'>$</span>
      <span class='price'>${price}</span>
      <sup class='price-asterisk'>*</sup>
    </strong>
  `;

    // Create a wrapper for the original price and savings
    const delElement = element.querySelector('del');
    const saveMatch = priceText.match(/save \$(\d+)/i) || priceText.match(/\$(\d+) off/i);

    if (delElement || saveMatch) {
      let priceInfoWrapper = '<div class="sale">';

      if (delElement) {
        const originalPrice = delElement.textContent.trim();
        priceInfoWrapper += `<del class="original-price">${originalPrice}</del>`;
      }

      if (saveMatch) {
        const saveAmount = saveMatch[1];
        priceInfoWrapper += ` <span class="savings">SAVE $${saveAmount}</span>`;
        priceInfoWrapper += ` <span class="savings-off-style">$${saveAmount} OFF</span>`;
      }

      priceInfoWrapper += '</div>';
      formattedPrice += priceInfoWrapper;
    }

    element.innerHTML = formattedPrice;
    element.classList.add('formatted-price');
  }
}

// normalize text
function normalizeText(text) {
  return text
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'")
    .trim()
    .toLowerCase();
}

// close existing popups and dialogs
function closeExistingPopupsAndDialogs() {
  // close existing popup
  const existingPopup = document.querySelector('.popup-window');
  const existingPopupOverlay = document.querySelector('.popup-overlay');
  if (existingPopup) existingPopup.remove();
  if (existingPopupOverlay) existingPopupOverlay.remove();

  // close existing dialog
  const existingDialog = document.querySelector('.dialog-window');
  const existingDialogOverlay = document.querySelector('.dialog-overlay');

  if (existingDialog) existingDialog.remove();
  if (existingDialogOverlay) existingDialogOverlay.remove();

  // close exisiting triangle
  const existingTriangle = document.querySelector('.dialog-triangle');
  if (existingTriangle) existingTriangle.remove();
}

//  open the popup window
function openPopup(content) {
  // Close any existing popups or dialogs
  closeExistingPopupsAndDialogs();

  const overlay = document.createElement('div');
  overlay.classList.add('popup-overlay');

  const popup = document.createElement('div');
  popup.classList.add('popup-window');

  const closeButton = document.createElement('span');
  closeButton.innerHTML = '&times;';
  closeButton.classList.add('popup-close');
  closeButton.addEventListener('click', () => {
    overlay.remove();
    popup.remove();
  });

  content.forEach((element) => {
    popup.appendChild(element.cloneNode(true));
  });

  popup.prepend(closeButton);
  document.body.appendChild(overlay);
  document.body.appendChild(popup);

  popup.addEventListener('click', (e) => e.stopPropagation());
}

// open the dialog window
function openDialog(triggerElement, contentElement) {
  closeExistingPopupsAndDialogs();

  const overlay = document.createElement('div');
  overlay.classList.add('dialog-overlay');

  const dialog = document.createElement('div');
  dialog.classList.add('dialog-window');

  const triangle = document.createElement('div');
  triangle.classList.add('dialog-triangle');

  dialog.appendChild(contentElement.cloneNode(true));

  const container = triggerElement.parentElement;

  const computedStyle = window.getComputedStyle(container);
  if (computedStyle.position === 'static' || !computedStyle.position) {
    container.style.position = 'relative';
  }

  container.appendChild(triangle);
  container.appendChild(dialog);
  container.appendChild(overlay);

  let top = triggerElement.offsetTop + triggerElement.offsetHeight;
  let left = triggerElement.offsetLeft - 40;

  const dialogRect = dialog.getBoundingClientRect();
  const containerWidth = container.clientWidth;

  if (left + dialogRect.width > containerWidth) {
    left = containerWidth - dialogRect.width - 10;
  }

  if (left < 0) {
    left = -20;
  }

  const containerHeight = container.clientHeight;
  if (top + dialogRect.height > containerHeight) {
    top = triggerElement.offsetTop - dialogRect.height;
    if (top < 0) {
      top = 10;
    }
  }

  dialog.style.position = 'absolute';
  dialog.style.top = `${top}px`;
  dialog.style.left = `${left}px`;

  triangle.style.position = 'absolute';
  triangle.style.top = `${top + 10}px`;
  triangle.style.left = `${left + 130}px`;

  // close dialog when clicking on the overlay
  overlay.addEventListener('click', () => {
    overlay.remove();
    dialog.remove();
    triangle.remove();
  });

  // close dialog when clicking outside of it
  function onDocumentClick(e) {
    if (!dialog.contains(e.target) && e.target !== triggerElement) {
      dialog.remove();
      overlay.remove();
      triangle.remove();
      document.removeEventListener('click', onDocumentClick);
    }
  }
  document.addEventListener('click', onDocumentClick);

  // prevent clicks inside the dialog from closing it
  dialog.addEventListener('click', (e) => {
    e.stopPropagation();
  });
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
    const accordionWrapper = document.createElement('div');
    accordionWrapper.classList.add('accordion');

    const toggleText = document.createElement('div');
    toggleText.classList.add('accordion-toggle');
    // eslint-disable-next-line quotes
    toggleText.innerHTML = `<sup>§</sup> See offer details <span class='arrow'></span>`;

    const accordionContent = document.createElement('div');
    accordionContent.classList.add('accordion-content');
    accordionContent.style.display = 'none';

    accordionContent.appendChild(subscriptionParagraph.cloneNode(true));

    let nextSibling = subscriptionParagraph.nextElementSibling;
    const siblingsToMove = [];

    while (nextSibling) {
      siblingsToMove.push(nextSibling);
      nextSibling = nextSibling.nextElementSibling;
    }

    siblingsToMove.forEach((sibling) => {
      accordionContent.appendChild(sibling.cloneNode(true));
      sibling.remove();
    });

    toggleText.addEventListener('click', () => {
      if (accordionContent.style.display === 'none') {
        accordionContent.style.display = 'block';
        toggleText.classList.add('expanded');
        // eslint-disable-next-line quotes
        toggleText.innerHTML = `<sup style='font-size: 0.55em; top: -0.9em;'>§</sup> Hide offer details <span class='arrow'></span>`;
      } else {
        accordionContent.style.display = 'none';
        toggleText.classList.remove('expanded');
        // eslint-disable-next-line quotes
        toggleText.innerHTML = `<sup style='font-size: 0.55em; top: -0.9em;'>§</sup> See offer details <span class='arrow'></span>`;
      }
    });

    detailDiv.insertBefore(toggleText, subscriptionParagraph);
    detailDiv.insertBefore(accordionContent, toggleText.nextElementSibling);

    subscriptionParagraph.remove();
  }
}

function decorateDnaCards(block) {
  const firstDiv = block.querySelector(':scope > div:first-child');
  const secondDiv = block.querySelector(':scope > div:nth-child(2)');

  const popupDivs = secondDiv ? [...secondDiv.children] : [];

  if (secondDiv) {
    secondDiv.remove();
  }

  const productDivs = [...firstDiv.children];
  const ul = document.createElement('ul');

  productDivs.forEach((productDiv, index) => {
    const productContainer = document.createElement('div');
    productContainer.classList.add('cards-card-body');

    const productElements = [...productDiv.children];

    const titleDiv = document.createElement('div');
    titleDiv.classList.add('title');
    let idx = 0;
    for (; idx < productElements.length; idx += 1) {
      const elem = productElements[idx];
      if (elem.tagName === 'H2' || elem.tagName === 'H3') {
        titleDiv.appendChild(elem);
      } else {
        break;
      }
    }
    if (titleDiv.children.length > 0) {
      productContainer.appendChild(titleDiv);
    }

    const productGroup = document.createElement('div');
    productGroup.classList.add('product');

    for (; idx < productElements.length; idx += 1) {
      const elem = productElements[idx];

      const linkElement = elem.querySelector('a');
      if (linkElement && normalizeText(linkElement.textContent).includes('buy now')) {
        elem.classList.add('buy-now-button');
        productGroup.appendChild(elem);
        idx += 1;
        break;
      }

      productGroup.appendChild(elem);
    }

    productGroup.querySelectorAll('p').forEach((p) => {
      formatPrice(p);
    });

    if (productGroup.children.length > 0) {
      productContainer.appendChild(productGroup);
    }

    if (block.classList.contains('popup')) {
      while (idx < productElements.length) {
        const elem = productElements[idx];
        idx += 1;

        const italicElement = elem.querySelector('em');
        if (italicElement) {
          const linkElement = elem.querySelector('a');
          const correspondingPopupDiv = popupDivs[index];
          const popupContent = correspondingPopupDiv ? [...correspondingPopupDiv.children] : [];

          if (linkElement) {
            linkElement.classList.add('expand-link');

            const expandDiv = document.createElement('div');
            expandDiv.classList.add('expand');
            expandDiv.appendChild(linkElement);

            linkElement.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              openPopup(popupContent);
            });

            productContainer.appendChild(expandDiv);
          } else {
            const popupLink = document.createElement('a');
            popupLink.href = '#';
            popupLink.textContent = elem.textContent.trim();
            popupLink.classList.add('expand-link');

            popupLink.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              openPopup(popupContent);
            });

            const expandDiv = document.createElement('div');
            expandDiv.classList.add('expand');
            expandDiv.appendChild(popupLink);

            productContainer.appendChild(expandDiv);
          }
        } else {
          idx -= 1;
          break;
        }
      }
    }

    const detailGroup = document.createElement('div');
    detailGroup.classList.add('detail');
    for (; idx < productElements.length; idx += 1) {
      detailGroup.appendChild(productElements[idx]);
    }

    if (detailGroup.children.length > 0) {
      productContainer.appendChild(detailGroup);
    }

    const detailUls = detailGroup.querySelectorAll('ul');
    detailUls.forEach((detailUl) => {
      const lis = detailUl.querySelectorAll(':scope > li');

      lis.forEach((li) => {
        const innerUl = li.querySelector(':scope > ul');
        if (innerUl) {
          innerUl.remove();

          const container = document.createElement('div');
          container.classList.add('dialog-container');
          container.style.position = 'relative';

          li.parentNode.replaceChild(container, li);
          container.appendChild(li);

          const infoIcon = document.createElement('span');
          infoIcon.classList.add('icon-infor');

          li.appendChild(infoIcon);
          li.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            openDialog(li, innerUl);
          });
        }
      });
    });

    ul.appendChild(productContainer);

    if (block.classList.contains('accordion')) {
      setupAccordion(productContainer);
    }
  });

  block.innerHTML = '';
  block.appendChild(ul);
}

export default function decorate(block) {
  const isDnaSection = block.closest('.section.dna');
  if (isDnaSection) {
    decorateDnaCards(block);
  } else {
    const ul = document.createElement('ul');
    [...block.children].forEach((row) => {
      const li = document.createElement('li');
      while (row.firstElementChild) li.append(row.firstElementChild);

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
      ul.append(li);
    });

    ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
    block.textContent = '';
    block.append(ul);
  }
}
