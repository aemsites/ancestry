// Helper function to ensure wrapping with modulus
function mod(n, m) {
  return ((n % m) + m) % m;
}

// Handle carousel action for navigation or specific slide selection
function handleCarouselAction(block, direction, targetIndex = null) {
  const itemCount = block.children.length;
  let currentActiveIndex = 0;

  for (let i = 0; i < itemCount; i += 1) {
    if (block.children[i].classList.contains('active')) {
      currentActiveIndex = i;
      break;
    }
  }

  block.children[currentActiveIndex].classList.remove('active');

  const nextActive = targetIndex !== null
    ? targetIndex
    : mod(currentActiveIndex + direction, itemCount);

  if (block.children[nextActive]) {
    block.children[nextActive].classList.add('active');
  }
}

// Add navigation buttons (Previous/Next) to the carousel
export function appendCarouselActions(block) {
  const carouselWrapper = block.parentElement;
  const carouselActions = document.createElement('div');
  carouselActions.classList.add('carousel-actions');

  const prevButton = document.createElement('button');
  prevButton.classList.add('previous');
  prevButton.setAttribute('aria-label', 'Previous');
  prevButton.setAttribute('type', 'button');
  prevButton.innerHTML = '<span class="previous-icon"></span>';

  const nextButton = document.createElement('button');
  nextButton.classList.add('next');
  nextButton.setAttribute('aria-label', 'Next');
  nextButton.setAttribute('type', 'button');
  nextButton.innerHTML = '<span class="next-icon"></span>';

  // Add event listeners to buttons
  prevButton.addEventListener('click', () => handleCarouselAction(block, -1));
  nextButton.addEventListener('click', () => handleCarouselAction(block, 1));

  carouselActions.append(prevButton, nextButton);
  carouselWrapper.append(carouselActions);
}

// Add indicators for each slide in the carousel
export function appendCarouselIndicators(block) {
  [...block.children].forEach((child, i) => {
    const indicatorContainer = document.createElement('ol');
    indicatorContainer.classList.add('indicators');

    [...block.children].forEach((_, index) => {
      const indicator = document.createElement('li');
      if (index === i) indicator.classList.add('active');
      indicator.setAttribute('aria-label', `Slide ${index + 1}`);

      indicator.addEventListener('click', () => handleCarouselAction(block, 0, index));

      indicatorContainer.append(indicator);
    });
    const contentContainer = child.querySelector('div');
    if (contentContainer) {
      contentContainer.appendChild(indicatorContainer);
    }
  });
}

export default function decorate(block) {
  const slides = [...block.children];
  const slideCount = slides.length;

  if (slideCount > 0) {
    slides[0].classList.add('active');
  }

  if (slideCount > 1) {
    appendCarouselActions(block);
    appendCarouselIndicators(block);
  }
}
