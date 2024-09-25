export default function decorate() {
  const carousel = document.querySelector('.carousel.block > div > div');

  if (carousel) {
    const leftQuote = document.createElement('div');
    leftQuote.classList.add('left-quote');

    const rightQuote = document.createElement('div');
    rightQuote.classList.add('right-quote');

    carousel.appendChild(leftQuote);
    carousel.appendChild(rightQuote);
  }
}
