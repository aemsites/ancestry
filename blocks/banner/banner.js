export default function decorate() {
    const anchors = document.querySelectorAll('.section.expand.banner-container .banner.block a');
  
    anchors.forEach(anchor => {
      if (!anchor.querySelector('span')) {
        const text = anchor.textContent.trim();
        anchor.innerHTML = '';
  
        // Create a span and set the text
        const span = document.createElement('span');
        span.textContent = text;
        anchor.appendChild(span); 
        anchor.classList.add('anchor');
      }
    });
  }