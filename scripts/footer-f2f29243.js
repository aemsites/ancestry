!(function () {
  (() => {
    function e() {
      return !document.documentElement.classList.contains('_tab-nav');
    }

    function t({
      target: t,
    }) {
      if (!e()) {
        const e = t.closest('form');
        e && e.classList.add('footerShowGo');
      }
    }

    function o(e) {
      e.preventDefault(), window.location = e.target.action;
    }

    function n({
      currentTarget: t,
    }) {
      const o = new URLSearchParams(window.location.search);
      if (o.set('locale', t.value.toUpperCase()), e()) {
        if (window.location.search = o, window.utag && window.utag.link) {
          const e = t.options[t.selectedIndex].getAttribute('data-tracking-name');
          const o = window.utag.data && window.utag.data.geo || (function () {
            const e = window.location.hostname.split('.');
            let t = 'com';
            return t = e.length > 3 ? e[3] : e[2], t === 'com' ? 'us' : t;
          }());
          window.utag.link({
            link_name: `ancestry ${o}: footer : language select`,
            action: `ancestry ${o}: footer : language : ${e}`,
            mix_event_name: 'language_dropdown_selection',
            link_value: e,
            dropdown_selection: `footer : language : ${e}`,
          });
        }
      } else document.getElementById('footerLanguage').setAttribute('action', `?${o}`);
    }

    function i({
      currentTarget: t,
    }) {
      if (e() ? window.location = t.value : document.getElementById('footerSites').setAttribute('action', t.value), window.utag && window.utag.link) {
        const e = t.options[t.selectedIndex].getAttribute('data-tracking-name');
        window.utag.link({
          mix_event_name: 'country_dropdown_selection',
          dropdown_selection: `site dropdown : ${e}`,
          link_value: e,
        });
      }
    }

    function a() {
      s.classList.remove('infiniteFooterAnimated'), s.offsetHeight;
      const e = s.getBoundingClientRect().height;
      c.style.setProperty('--ui-footer-height', `${Math.floor(e)}px`), s.offsetHeight, s.classList.add('infiniteFooterAnimated');
    }
    let c; let r; let
      s;
    const d = document.querySelectorAll('.page')[0]?.classList.contains('infiniteScroll');
    window.footer = window.footer || {}, window.footer._footerDocument = window.footer._footerDocument || window.document,
    (function (e) {
      c = e, d && (r = document.getElementById('infiniteFooterButton'), s = document.querySelector('#footer'), r.removeAttribute('hidden'), s.classList.add('infiniteFooter'), a(), r.addEventListener('click', (() => {
        s.dataset.open ? (delete s.dataset.open, r.setAttribute('aria-expanded', 'false')) : (s.dataset.open = !0, r.setAttribute('aria-expanded', 'true'));
      })), new ResizeObserver((() => a())).observe(s)),
      (function () {
        const e = document.getElementById('footerSelects');
        e.addEventListener('focusin', t), e.addEventListener('submit', o), document.getElementById('footerSitesSelect').addEventListener('change', i), document.getElementById('footerLanguageSelect').addEventListener('change', n);
      }()),
      (function () {
        const e = document.getElementById('footer-link-ccpadonotsellshare');
        e && fetch('\n' +
          'https://www.ancestry.com/api/privacy/consent-info').then(((t) => {
          t.json().then(((t) => {
            t.consentPolicyId === 'cpra' && e.parentNode.classList.remove('noDisplay');
          }));
        })).catch(((e) => {
          console && console.error && console.error(`Failed to load consent policy: ${e}`);
        }));
      }());
    }(window.footer._footerDocument.getElementById('FooterRegion').querySelector('ui-custom[type="global-footer"]')));
  })();
}()); // # sourceMappingURL=footer.js.map
