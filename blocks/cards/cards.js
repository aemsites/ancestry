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

function normalizeText(text) {
  return text
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, '\'')
    .trim()
    .toLowerCase();
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
        toggleText.innerHTML = `<sup style='font-size: 0.55em; top: -0.9em;'>§</sup> Hide offer details <span class='arrow'></span>`;
      } else {
        accordionContent.style.display = 'none';
        toggleText.classList.remove('expanded');
        toggleText.innerHTML = `<sup style='font-size: 0.55em; top: -0.9em;'>§</sup> See offer details <span class='arrow'></span>`;
      }
    });

    detailDiv.insertBefore(toggleText, subscriptionParagraph);
    detailDiv.insertBefore(accordionContent, toggleText.nextElementSibling);

    subscriptionParagraph.remove();
  }
}

function isCTAButton(element) {
  const linkElement = element.querySelector('a');
  if (!linkElement || !linkElement.classList.contains('button')) return false;

  const buttonText = normalizeText(linkElement.textContent);
  const ctaPhrases = ['buy', 'comprar'];
  return ctaPhrases.some((phrase) => buttonText.includes(phrase));
}

function decorateDnaCards(block) {
  const firstDiv = block.querySelector(':scope > div:first-child');

  const productDivs = [...firstDiv.children];
  const ul = document.createElement('ul');

  productDivs.forEach((productDiv) => {
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

      if (isCTAButton(elem)) {
        elem.classList.add('cta-button');
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

    const detailGroup = document.createElement('div');
    detailGroup.classList.add('detail');
    for (; idx < productElements.length; idx += 1) {
      detailGroup.appendChild(productElements[idx]);
    }

    if (detailGroup.children.length > 0) {
      productContainer.appendChild(detailGroup);
    }
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
