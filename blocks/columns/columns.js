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

  // Loop through each row in the block
  [...block.children].forEach((row) => {
    const contentBlocks = [...row.children];

    // Apply classes to text and image columns
    contentBlocks.forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        col.classList.add('columns-img-col');
      } else {
        col.classList.add('text-content');
      }
    });

    // Rearrange columns: text-content before columns-img-col
    const textContent = row.querySelector('.text-content');
    const imgContent = row.querySelector('.columns-img-col');
    if (textContent && imgContent) {
      row.innerHTML = '';
      row.appendChild(textContent);
      row.appendChild(imgContent);
    }

    // Process textContent to wrap 'Ancestry' in a span
    if (textContent) {
      wrapAncestryText(textContent);
    }
  });
}
