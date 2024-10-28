function mod(n, m) {
  return ((n % m) + m) % m;
}

function updateIndicators(block, activeIndex) {
  const indicators = block.parentElement.querySelectorAll('.carousel-indicators .dot');
  indicators.forEach((dot, index) => {
    dot.classList.toggle('active', index === activeIndex);
  });
}

function createIndicators(block, slideCount) {
  const indicatorContainer = document.createElement('div');
  indicatorContainer.classList.add('carousel-indicators');

  for (let i = 0; i < slideCount; i += 1) {
    const dot = document.createElement('span');
    dot.classList.add('dot');
    if (i === 0) dot.classList.add('active');
    indicatorContainer.appendChild(dot);
  }

  block.parentElement.appendChild(indicatorContainer);
}

function handleCarouselAction(block, direction) {
  const slides = Array.from(block.children);
  const itemCount = slides.length;
  const currentActiveIndex = slides.findIndex((slide) => slide.classList.contains('active'));

  const nextActiveIndex = mod(currentActiveIndex + direction, itemCount);

  slides.forEach((slide) => {
    slide.classList.remove('active', 'previous', 'next');
    slide.style.transition = 'transform 0.2s ease-in-out';
  });

  slides.forEach((slide, index) => {
    if (index === nextActiveIndex) {
      slide.classList.add('active');
      slide.style.zIndex = 2;
    } else if (index === mod(nextActiveIndex - 1, itemCount)) {
      slide.classList.add('previous');
      slide.style.zIndex = 1;
    } else if (index === mod(nextActiveIndex + 1, itemCount)) {
      slide.classList.add('next');
      slide.style.zIndex = 1;
    } else {
      slide.style.zIndex = -1;
    }
  });

  updateIndicators(block, nextActiveIndex);
}

export function appendCarouselActions(block) {
  const carouselWrapper = block.parentElement;

  if (carouselWrapper.querySelector('.carousel-actions')) {
    carouselWrapper.querySelector('.carousel-actions').remove();
  }

  const carouselActions = document.createElement('div');
  carouselActions.classList.add('carousel-actions');

  const prevButton = document.createElement('button');
  prevButton.classList.add('previous');
  prevButton.setAttribute('aria-label', 'Previous');
  prevButton.setAttribute('type', 'button');

  const nextButton = document.createElement('button');
  nextButton.classList.add('next');
  nextButton.setAttribute('aria-label', 'Next');
  nextButton.setAttribute('type', 'button');

  prevButton.addEventListener('click', () => {
    handleCarouselAction(block, -1);
  });

  nextButton.addEventListener('click', () => {
    handleCarouselAction(block, 1);
  });

  carouselActions.append(prevButton, nextButton);
  carouselWrapper.append(carouselActions);
}

export default function decorate(block) {
  const slides = Array.from(block.children);
  const slideCount = slides.length;

  if (slideCount > 1) {
    appendCarouselActions(block);
    createIndicators(block, slideCount);
  }
}
