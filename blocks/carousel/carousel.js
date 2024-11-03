function mod(n, m) {
  return ((n % m) + m) % m;
}

function getSlides(block) {
  return Array.from(block.children).filter((child) => child.nodeType === Node.ELEMENT_NODE);
}

function updateIndicators(block, activeIndex) {
  const indicatorContainer = block.parentElement.querySelector('.carousel-indicators');
  if (indicatorContainer) {
    const indicators = indicatorContainer.querySelectorAll('.dot');
    indicators.forEach((dot, index) => {
      dot.classList.toggle('active', index === activeIndex);
    });
  }
}

function goToSlide(block, targetIndex) {
  const slides = getSlides(block);
  const itemCount = slides.length;

  slides.forEach((slide, index) => {
    const focusableElements = slide.querySelectorAll(
      'a[href], button, input, select, textarea, [tabindex]',
    );

    if (index === targetIndex) {
      slide.classList.add('active');
      slide.classList.remove('previous', 'next');
      slide.style.transform = 'translateX(0%)';
      slide.style.zIndex = 2;
      slide.setAttribute('aria-hidden', 'false');

      focusableElements.forEach((el) => {
        el.removeAttribute('tabindex');
        el.setAttribute('aria-hidden', 'false');
      });
    } else {
      slide.classList.remove('active');
      slide.setAttribute('aria-hidden', 'true');

      slide.classList.toggle('previous', index === mod(targetIndex - 1, itemCount));
      slide.classList.toggle('next', index === mod(targetIndex + 1, itemCount));
      slide.style.transform = index === mod(targetIndex - 1, itemCount)
        ? 'translateX(-90%)'
        : 'translateX(90%)';
      slide.style.zIndex = 1;

      focusableElements.forEach((el) => {
        el.setAttribute('tabindex', '-1');
        el.setAttribute('aria-hidden', 'true');
      });
    }
  });

  updateIndicators(block, targetIndex);
}

export function createIndicators(block, slideCount) {
  const existingIndicators = block.parentElement.querySelector('.carousel-indicators');
  if (existingIndicators) {
    existingIndicators.remove();
  }
  const indicatorContainer = document.createElement('div');
  indicatorContainer.classList.add('carousel-indicators');

  for (let i = 0; i < slideCount; i += 1) {
    const dotButton = document.createElement('button');
    dotButton.classList.add('dot');
    dotButton.setAttribute('type', 'button');
    dotButton.setAttribute('aria-label', `Slide ${i + 1}`);
    dotButton.addEventListener('click', () => {
      goToSlide(block, i);
    });
    if (i === 0) dotButton.classList.add('active');
    indicatorContainer.appendChild(dotButton);
  }

  block.parentElement.appendChild(indicatorContainer);
}

function handleCarouselAction(block, direction) {
  const slides = getSlides(block);
  const itemCount = slides.length;
  const currentActiveIndex = slides.findIndex((slide) => slide.classList.contains('active'));

  const nextActiveIndex = mod(currentActiveIndex + direction, itemCount);

  goToSlide(block, nextActiveIndex);
}

export function appendCarouselActions(block) {
  const carouselWrapper = block.parentElement;

  const existingActions = carouselWrapper.querySelector('.carousel-actions');
  if (existingActions) {
    existingActions.remove();
  }

  const carouselActions = document.createElement('div');
  carouselActions.classList.add('carousel-actions');

  const prevButton = document.createElement('button');
  prevButton.classList.add('previous');
  prevButton.setAttribute('aria-label', 'Previous Slide');
  prevButton.setAttribute('type', 'button');
  prevButton.setAttribute('aria-controls', block.id);

  const nextButton = document.createElement('button');
  nextButton.classList.add('next');
  nextButton.setAttribute('aria-label', 'Next Slide');
  nextButton.setAttribute('type', 'button');
  nextButton.setAttribute('aria-controls', block.id);

  prevButton.tabIndex = 0;
  nextButton.tabIndex = 0;

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
  const slides = getSlides(block);
  const slideCount = slides.length;

  if (!block.id) {
    block.id = `carousel-${Math.random().toString(36).substr(2, 9)}`;
  }

  block.setAttribute('role', 'region');
  block.setAttribute('aria-label', 'Image Carousel');
  block.setAttribute('aria-live', 'polite');

  slides.forEach((slide, index) => {
    const focusableElements = slide.querySelectorAll(
      'a[href], button, input, select, textarea, [tabindex]',
    );

    slide.classList.add('slide');
    // slide.style.transition = 'transform 0.5s ease-in-out';

    if (index === 0) {
      slide.classList.add('active');
      slide.style.transform = 'translateX(0%)';
      slide.style.zIndex = 2;
      slide.setAttribute('aria-hidden', 'false');

      focusableElements.forEach((el) => {
        el.removeAttribute('tabindex');
        el.setAttribute('aria-hidden', 'false');
      });
    } else {
      slide.classList.remove('active');
      slide.setAttribute('aria-hidden', 'true');

      slide.classList.toggle('previous', index === slideCount - 1);
      slide.classList.toggle('next', index === 1);
      slide.style.transform = index === slideCount - 1
        ? 'translateX(-90%)'
        : 'translateX(90%)';
      slide.style.zIndex = 1;

      focusableElements.forEach((el) => {
        el.setAttribute('tabindex', '-1');
        el.setAttribute('aria-hidden', 'true');
      });
    }
  });

  if (slideCount > 1) {
    appendCarouselActions(block);
    createIndicators(block, slideCount);
  } else {
    block.parentElement.classList.add('single-slide');
  }
}
