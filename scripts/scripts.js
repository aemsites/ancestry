import {
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  sampleRUM,
} from './aem.js';

const LANGUAGES = new Set(['en', 'es']);
let language;

export function decorateTooltipAndModalLinks(main) {
  const links = main.querySelectorAll('a[href^="#"]');

  links.forEach((linkElement) => {
    const href = linkElement.getAttribute('href');
    const id = href.substring(1);

    const targetElement = document.getElementById(id);

    if (targetElement) {
      const modalParent = targetElement.closest('.modal');
      const tooltipParent = targetElement.closest('.tooltips');
      const fragmentModalParent = targetElement.closest('.fragment');
      if (modalParent) {
        linkElement.setAttribute('data-popup', 'true');
      } else if (tooltipParent) {
        linkElement.setAttribute('data-tooltip', 'true');
        linkElement.setAttribute('data-tooltip-id', id);
      } else if(fragmentModalParent) {
        linkElement.setAttribute('data-popup', 'true');
        linkElement.setAttribute('data-fragment-id', id);
        fragmentModalParent.setAttribute('data-fragment-id', id);
        fragmentModalParent.setAttribute('data-popup-content', true);
      } else {
        // eslint-disable-next-line no-console
        console.log(`No matching container for link: ${linkElement}`);
      }
    } else {
      // eslint-disable-next-line no-console
      console.error(`Target element with ID ${id} not found for link: ${linkElement}`);
    }
  });
}

export function decorateTrademarks(container) {
  const REFERENCE_TOKENS = /(\w+®|\w+™|\w+℠|\*+|[†‡¤∞§ⓘ]|\(\d+\)|✓\s*ᐩ|✓|ᐩ)/g;
  [...container.querySelectorAll('p, a, li, h1, h2, h3, h4, h5, h6, strong')]
    .filter((el) => !el.closest('.button-container') && !el.querySelector('.button'))
    .forEach((el) => {
      const nodes = Array.from(el.childNodes);
      nodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const modifiedContent = node.textContent.replace(REFERENCE_TOKENS, (token) => {
            switch (token) {
              case '✓':
                /* eslint-disable quotes */
                return `<span class='tick'></span>`;
              case '✓ᐩ':
                /* eslint-disable quotes */
                return `<span class='tickplus'></span>`;
              case 'ᐩ':
                /* eslint-disable quotes */
                return `<span class='plus'></span>`;
              case 'ⓘ':
                /* eslint-disable quotes */
                return `<span class='icon-infor'></span>`;
              default:
                if (/®|™|℠/.test(token)) {
                  const keyword = token.slice(0, -1);
                  const symbol = token.slice(-1);
                  return `<span class='keyword'>${keyword}<sup class="trademark">${symbol}</sup></span>`;
                }
                return `<sup class='superscript'>${token}</sup>`;
            }
          });
          if (modifiedContent !== node.textContent) {
            const wrapper = document.createElement('span');
            wrapper.innerHTML = modifiedContent;
            node.replaceWith(...wrapper.childNodes);
          }
        }
      });
    });
}

export function getLanguageFromPath(pathname) {
  const segs = pathname.split('/');
  if (segs.length > 1) {
    const l = segs[1];
    if (LANGUAGES.has(l)) {
      language = l;
    }
  }

  if (language === undefined) {
    language = 'en'; // default to English
  }

  return language;
}

export function isHomepageUrl(curPath = window.location.pathname) {
  return curPath === `/${getLanguageFromPath(curPath)}/`;
}

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

function addBackgroundImageToSections(main) {
  main.querySelectorAll(':scope > div').forEach((section) => {
    const meta = section.dataset;
    Object.keys(meta).forEach((key) => {
      if (key.startsWith('backgroundImage')) {
        const url = meta[key];
        if (url) {
          section.style.backgroundImage = `url(${url})`;
        }
      }
    });
  });
}



/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateTrademarks(main);
  decorateButtons(main);
  decorateTooltipAndModalLinks(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  addBackgroundImageToSections(main);
  decorateBlocks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  sampleRUM.enhance();

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
