import { loadCSS, loadScript } from '../../scripts/aem.js';

function fixFooter(oldFooter) {
  const ancFooter = oldFooter.querySelector('#footer');
  if (!ancFooter) {
    oldFooter.setAttribute('data-block-status', 'loaded');
  } else {
    ancFooter.setAttribute('data-block-status', 'loaded');
  }
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  // const footerMeta = getMetadata('footer');
  // const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  // const fragment = await loadFragment(footerPath);

  const ancResp = await fetch('https://navigation.ancestry.com/footer/0/1.0/standard/en-us/false', {
    mode: 'cors',
  });

  if (!ancResp.ok) {
    console.error('Failed to load Ancestry footer');
  }

  const ancJson = await ancResp.json();

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  footer.id = 'FooterRegion';
  footer.innerHTML = ancJson[0].Views[0].Content;
  // while (fragment.firstElementChild) footer.append(fragment.firstElementChild);
  fixFooter(footer);

  block.append(footer);
  await loadCSS(ancJson[0].Resources[0].Src);
  await loadScript('../../scripts/footer-f2f29243.js', { type: 'text/javascript' });
}
