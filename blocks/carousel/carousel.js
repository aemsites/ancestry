function mod(n, m) {
  return ((n % m) + m) % m;
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

  const positions = {
    active: 'translateX(0%)',
    previous: 'translateX(-90%)',
    next: 'translateX(90%)',
  };

  // Update classes and transforms
  slides.forEach((slide, index) => {
    if (index === nextActiveIndex) {
      slide.classList.add('active');
      slide.style.transform = positions.active;
      slide.style.zIndex = 2;
    } else if (index === mod(nextActiveIndex - 1, itemCount)) {
      slide.classList.add('previous');
      slide.style.transform = positions.previous;
      slide.style.zIndex = 1;
    } else if (index === mod(nextActiveIndex + 1, itemCount)) {
      slide.classList.add('next');
      slide.style.transform = positions.next;
      slide.style.zIndex = 1;
    } else {
      slide.style.transform = `translateX(${direction * 200}%)`;
      slide.style.zIndex = -1;
    }
  });
}

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

  prevButton.addEventListener('click', () => handleCarouselAction(block, -1));
  nextButton.addEventListener('click', () => handleCarouselAction(block, 1));

  carouselActions.append(prevButton, nextButton);
  carouselWrapper.append(carouselActions);
}

export default function decorate(block) {
  const slides = Array.from(block.children);
  const slideCount = slides.length;

  if (slideCount > 0) {
    slides.forEach((slide, index) => {
      slide.style.transition = 'none';
      if (index === 0) {
        slide.classList.add('active');
        slide.style.transform = 'translateX(0%)';
        slide.style.zIndex = 2;
      } else if (index === 1) {
        slide.classList.add('next');
        slide.style.transform = 'translateX(90%)';
        slide.style.zIndex = 1;
      } else if (index === slideCount - 1) {
        slide.classList.add('previous');
        slide.style.transform = 'translateX(-90%)';
        slide.style.zIndex = 1;
      } else {
        slide.style.transform = 'translateX(200%)';
        slide.style.zIndex = -1;
      }
    });
  }

  if (slideCount > 1) {
    appendCarouselActions(block);
  }
}
