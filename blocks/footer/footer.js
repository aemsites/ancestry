import { getMetadata } from '../../scripts/aem.js';
import { getLanguageFromPath, isHomepageUrl } from '../../scripts/scripts.js';
import { loadFragment } from '../fragment/fragment.js';

function createOptGroup(select, mainItem, subItems) {
  const groupLabel = mainItem.firstChild.textContent.trim();
  const optGroup = document.createElement('optgroup');
  optGroup.label = groupLabel;

  subItems.forEach((link) => {
    const opt = document.createElement('option');
    opt.value = link.href;
    opt.textContent = link.textContent;
    optGroup.appendChild(opt);
  });

  select.appendChild(optGroup);
}

function appendOptions(select, subItems) {
  subItems.forEach((link) => {
    const opt = document.createElement('option');
    const currentPath = window.location.pathname;
    const url = new URL(link.href);
    const selectedLanguage = getLanguageFromPath(url.pathname);
    let pathAfterLanguage;
    const segs = currentPath.split('/');
    if (segs.length > 2) {
      pathAfterLanguage = segs.slice(2).join('/');
    }
    const newHref = `/${selectedLanguage}/${pathAfterLanguage}`;
    opt.value = newHref;
    opt.textContent = link.textContent;
    select.appendChild(opt);
  });
}

function wrapAndReplace(listWrapper, select, className, isHideLanguageDropdown) {
  const div = document.createElement('div');
  div.classList.add(`${className}-div`);
  div.appendChild(select);
  div.insertBefore(listWrapper.previousElementSibling, select);

  listWrapper.replaceWith(div);

  if (className === 'select-language' && isHideLanguageDropdown) {
    div.style.display = 'none';
  }
}

function addChangeEvent(select) {
  select.addEventListener('change', (event) => {
    if (event.target.value) {
      window.location.href = event.target.value;
    }
  });
}

function convertListToDropdown(listWrappers, isHideLanguageDropdown) {
  listWrappers.forEach((listWrapper) => {
    const select = document.createElement('select');
    const mainItems = listWrapper.querySelectorAll(':scope > li');
    let className;

    mainItems.forEach((mainItem) => {
      const subList = mainItem.querySelector('ul');
      const subItems = subList ? subList.querySelectorAll('li a') : mainItem.querySelectorAll('a');

      if (subItems.length > 0) {
        if (subList) {
          className = 'select-other-sites';
          createOptGroup(select, mainItem, subItems);
        } else {
          className = 'select-language';
          appendOptions(select, subItems);
        }
      }
    });

    if (className) {
      select.classList.add(className);
      wrapAndReplace(listWrapper, select, className, isHideLanguageDropdown);
      addChangeEvent(select);
    }
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta || (isHomepageUrl() ? '/footer' : '/footer-product');
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  block.append(footer);

  const isHideLanguageDropdown = block.querySelector('.footer-select').dataset.hideLanguage === 'true';
  convertListToDropdown(block.querySelectorAll('.footer-select > div > ul'), isHideLanguageDropdown);
}
