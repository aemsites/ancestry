import { createOptimizedPicture } from '../../scripts/aem.js';

function wrapAncestryText(element) {
  const ancestryRegex = /AncestryDNA|Ancestry/g;
  function traverseNodes(node) {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
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

export default function decorate(block) {
  /* change to ul, li */
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

  const defaultContentWrapper = block.closest('.cards-container').querySelector('.default-content-wrapper');
  if (defaultContentWrapper) {
    wrapAncestryText(defaultContentWrapper);
  }
  wrapAncestryText(block);
}
