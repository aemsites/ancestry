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
  const embedYoutubeModal = main.querySelectorAll('a[href*="youtube"]');

  embedYoutubeModal.forEach((linkElement) => {
    const href = linkElement.getAttribute('href');
    linkElement.setAttribute('data-popup', 'true');
    linkElement.setAttribute('data-youtube-video-url', href);
  });

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
      } else if (fragmentModalParent) {
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
  const REFERENCE_TOKENS = /(✓\s*ᐩ|✓ᐩ|✓|ⓘ|ᐩ|✕|\w+[®™℠]|\*+|[†‡¤∞§])/;

  const createReplacementNode = (() => {
    const cache = new Map();
    return (text) => {
      if (cache.has(text)) {
        return cache.get(text).cloneNode(true);
      }

      let replacementNode;
      switch (text) {
        case '✓':
          replacementNode = document.createElement('span');
          replacementNode.className = 'tick';
          break;
        case '✓ᐩ':
        case '✓ ᐩ':
          replacementNode = document.createElement('span');
          replacementNode.className = 'tickplus';
          break;
        case 'ᐩ':
          replacementNode = document.createElement('span');
          replacementNode.className = 'plus';
          break;
        case 'ⓘ':
          replacementNode = document.createElement('span');
          replacementNode.className = 'icon-infor';
          break;
        case '✕':
          replacementNode = document.createElement('span');
          replacementNode.className = 'cross';
          break;
        default: {
          const symbol = text.slice(-1);
          if (['®', '™', '℠'].includes(symbol)) {
            const keyword = text.slice(0, -1);
            const span = document.createElement('span');
            if (keyword) {
              span.appendChild(document.createTextNode(keyword));
            }
            const trademarkSpan = document.createElement('span');
            trademarkSpan.className = 'trademark';
            trademarkSpan.textContent = symbol;
            span.appendChild(trademarkSpan);
            replacementNode = span;
          } else {
            const supSpan = document.createElement('span');
            supSpan.className = 'superscript';
            supSpan.textContent = text;
            replacementNode = supSpan;
          }
          break;
        }
      }

      cache.set(text, replacementNode.cloneNode(true));
      return replacementNode;
    };
  })();

  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        const parent = node.parentNode;

        if (parent.nodeType === Node.ELEMENT_NODE) {
          const tagName = parent.tagName.toLowerCase();
          if (['script', 'style', 'textarea', 'code', 'pre'].includes(tagName)) {
            return NodeFilter.FILTER_REJECT;
          }

          if (parent.classList.contains('button-container')
            || parent.classList.contains('button') || parent.tagName === 'SUP'
            || parent.isContentEditable || parent.hasAttribute('contenteditable')) {
            return NodeFilter.FILTER_REJECT;
          }
        }
        return REFERENCE_TOKENS.test(node.nodeValue)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP;
      },
    },
  );

  const processNodes = (deadline) => {
    const chunk = [];
    let node = walker.nextNode();

    while (node && chunk.length < 50
      && (deadline.timeRemaining() > 0 || deadline.didTimeout)) {
      chunk.push(node);
      node = walker.nextNode();
    }

    if (chunk.length === 0) {
      return false;
    }

    chunk.forEach((textNode) => {
      const parts = textNode.nodeValue.split(REFERENCE_TOKENS);
      if (parts.length <= 1) return;

      const fragment = document.createDocumentFragment();
      parts.forEach((part) => {
        if (!part) return;
        if (REFERENCE_TOKENS.test(part)) {
          fragment.appendChild(createReplacementNode(part));
        } else {
          fragment.appendChild(document.createTextNode(part));
        }
      });

      textNode.parentNode.replaceChild(fragment, textNode);
    });

    return true;
  };

  const scheduleProcessing = () => {
    const processChunk = (deadline) => {
      if (processNodes(deadline)) {
        requestIdleCallback(processChunk, { timeout: 1000 });
      }
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(processChunk, { timeout: 1000 });
    } else {
      const fallbackDeadline = {
        timeRemaining: () => true,
        didTimeout: false,
      };
      const fallbackProcess = () => {
        if (processNodes(fallbackDeadline)) {
          setTimeout(fallbackProcess, 0);
        }
      };
      setTimeout(fallbackProcess, 0);
    }
  };
  scheduleProcessing();
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

export function createVideoIframe(videoUrl) {
  function getYouTubeVideoId(url) {
    const regExp = /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[1].length === 11) ? match[1] : null;
  }

  function getEmbedUrl(videoId, videoParams) {
    return `https://www.youtube.com/embed/${videoId}?${videoParams.toString()}`;
  }

  try {
    let embedUrl = videoUrl;
    const videoParams = new URLSearchParams({
      controls: 1,
      rel: 0,
      modestbranding: 1,
    });

    const videoId = getYouTubeVideoId(videoUrl);
    embedUrl = getEmbedUrl(videoId, videoParams);

    const iframe = document.createElement('iframe');
    iframe.setAttribute('src', embedUrl);
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('allow', 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    return iframe;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error in createVideoIframe: ${error.message}`);
    return null;
  }
}

export function getYoutubeThumbnail(videoUrl) {
  try {
    const url = new URL(videoUrl);
    let videoId = '';
    if (url.hostname === 'youtu.be') {
      videoId = url.pathname.slice(1);
    } else if (url.hostname.includes('youtube.com') && url.searchParams.has('v')) {
      videoId = url.searchParams.get('v');
    } else if (url.pathname.includes('/embed/')) {
      [, videoId] = url.pathname.split('/embed/');
    }

    if (!videoId) throw new Error('Invalid video ID');
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error in getYoutubeThumbnail: ${error.message}`);
    return null;
  }
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
