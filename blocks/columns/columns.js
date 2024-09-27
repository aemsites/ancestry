// Function to wrap 'Ancestry' in a span with class 'ancestry' within a given element
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
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  /* Altenate color pattern */
  const backgroundClasses = ['bg-color-1', 'bg-color-2', 'bg-color-3', 'bg-color-2'];

  [...block.children].forEach((row, index) => {
    const contentBlocks = [...row.children];
    const bgClass = backgroundClasses[index % backgroundClasses.length];
    row.classList.add(bgClass);

    // Apply classes to text and image columns
    contentBlocks.forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        col.classList.add('columns-img-col');
      } else {
        col.classList.add('text-content');
      }
    });

    const images = document.querySelectorAll('.text-content img');

    images.forEach((img) => {
      if (img.hasAttribute('data-icon-name')) {
        img.parentElement.parentElement.classList.add('icon-wrapper');
      }
    });

    const textContent = row.querySelector('.text-content');
    if (textContent) {
      wrapAncestryText(textContent);
    }
  });
}
