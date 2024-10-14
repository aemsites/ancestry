export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

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

    const images = document.querySelectorAll('.text-content img');

    images.forEach((img) => {
      if (img.hasAttribute('data-icon-name')) {
        img.parentElement.parentElement.classList.add('icon-wrapper');
      }
    });

    const textContent = row.querySelector('.text-content');
  });
}
