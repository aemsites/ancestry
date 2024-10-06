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
    const priceMatch = priceText.match(/only \$(\d+)/i);
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

export default function decorate(block) {
  // Check if the block is inside .section.dna
  const dnaSection = block.closest('.section.dna');

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

    // Only apply to dna page
    if (dnaSection) {
      const cardBodies = li.querySelectorAll('.cards-card-body');
      cardBodies.forEach((cardBody) => {
        if (cardBody) {
          const h2Group = document.createElement('div');
          h2Group.className = 'title';

          const centeredGroup = document.createElement('div');
          centeredGroup.className = 'product';

          const leftAlignedGroup = document.createElement('div');
          leftAlignedGroup.className = 'detail';

          const elements = [...cardBody.children];
          elements.forEach((elem) => {
            if (elem.matches('h2')) {
              h2Group.appendChild(elem);
            } else if (
              (elem.matches('p') && elem.querySelector('picture')) ||
              (elem.matches('p') && elem.textContent.trim().toLowerCase().startsWith('only $')) ||
              elem.classList.contains('button-container') ||
              (elem.matches('p') && elem.textContent.trim().toLowerCase() === "what’s included")
            ) {
              if (elem.textContent.trim().toLowerCase().startsWith('only $')) {
                formatPrice(elem);
              }
              centeredGroup.appendChild(elem);
            } else {
              leftAlignedGroup.appendChild(elem);
            }
          });

          cardBody.innerHTML = '';
          cardBody.appendChild(h2Group);
          cardBody.appendChild(centeredGroup);
          cardBody.appendChild(leftAlignedGroup);
        }
      });
    }

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) =>
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])
    )
  );
  block.textContent = '';
  block.append(ul);

  const defaultContentWrapper = block
    .closest('.cards-container')
    .querySelector('.default-content-wrapper');
  if (defaultContentWrapper) {
    wrapAncestryText(defaultContentWrapper);
  }
  wrapAncestryText(block);
}
