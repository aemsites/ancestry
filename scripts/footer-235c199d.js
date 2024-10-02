! function() {
  "use strict";

  function e() {
    return document.documentElement.classList.contains("mouseEvents")
  }

  function t({
               target: t
             }) {
    if (!e()) {
      const e = t.closest("form");
      e && e.classList.add("footerShowGo")
    }
  }

  function n(e) {
    e.preventDefault(), window.location = e.target.action
  }

  function o({
               detail: e
             }) {
    const t = e.map((e => `<option id="OS_${e.code}" data-tracking-name="${e.code}" value="${e.code}" ${e.isActive?"selected":""}>${e.text.replace("*","")}</option>`)).join("");
    document.getElementById("footerLanguage").classList.remove("noDisplay"), document.getElementById("footer").classList.add("withLangs"), document.getElementById("footerLanguageSelect").innerHTML = t
  }

  function a({
               currentTarget: t
             }) {
    const n = new URLSearchParams(window.location.search);
    if (n.set("locale", t.value.toUpperCase()), e()) {
      if (window.location.search = n, window.utag && window.utag.link) {
        const e = t.options[t.selectedIndex].getAttribute("data-tracking-name"),
          n = window.utag.data && window.utag.data.geo || function() {
            const e = window.location.hostname.split(".");
            let t = "com";
            return t = 3 < e.length ? e[3] : e[2], "com" === t ? "us" : t
          }();
        window.utag.link({
          link_name: `ancestry ${n}: footer : language select`,
          action: `ancestry ${n}: footer : language : ${e}`,
          mix_event_name: "language_dropdown_selection",
          link_value: e,
          dropdown_selection: `footer : language : ${e}`
        })
      }
    } else document.getElementById("footerLanguage").setAttribute("action", `?${n}`)
  }

  function i({
               currentTarget: t
             }) {
    if (e() ? window.location = t.value : document.getElementById("footerSites").setAttribute("action", t.value), window.utag && window.utag.link) {
      const e = t.options[t.selectedIndex].getAttribute("data-tracking-name");
      window.utag.link({
        mix_event_name: "country_dropdown_selection",
        dropdown_selection: `site dropdown : ${e}`,
        link_value: e
      })
    }
  }

  function c(e, t) {
    e.classList.remove("infiniteFooterAnimated"), e.offsetHeight;
    const n = e?.getBoundingClientRect().height;
    t.style.setProperty("--ui-footer-height", `${Math.floor(n)}px`), e.offsetHeight, e.classList.add("infiniteFooterAnimated")
  }

  function d() {
    ((e, t, n) => {
      const o = +new Date + (t || 2e3);
      n = n || 100;
      const a = (i, c) => {
        const d = e();
        d ? i(d) : +new Date < o ? setTimeout(a, n, i, c) : c(new Error(`timed out for ${e}: ${t}, ${n}`))
      };
      return new Promise(a)
    })((() => document.getElementById("footerSelects")), 14e3, 100).then((() => {
      ! function() {
        const e = document.getElementById("infiniteFooterButton"),
          d = document.getElementById("footerSelects"),
          r = document.getElementById("footer"),
          s = document.getElementById("FooterRegion");
        d.addEventListener("focusin", t), d.addEventListener("submit", n), document.getElementById("footerSitesSelect")?.addEventListener("change", i), document.getElementById("footerLanguageSelect")?.addEventListener("change", a), document.addEventListener("languageToggleReady", o, !0), document.querySelector(".page.infiniteScroll") && (r.classList.add("infiniteFooter"), c(r, s), e.addEventListener("click", (() => {
          r.dataset.open ? (delete r.dataset.open, e.setAttribute("aria-expanded", "false")) : (r.dataset.open = !0, e.setAttribute("aria-expanded", "true"))
        })), new ResizeObserver((() => c(r, s))).observe(r));
        fetch("https://www.ancestry.com/api/privacy/consent-info").then((e => {
          e.json().then((e => {
            const t = e.consentPolicyId,
              n = document.getElementById("footer-link-ccpadonotsellshare");
            "cpra" === t && n && n.parentNode.classList.remove("noDisplay");
            const o = e.notices?.filter((e => "waPrivacyNotice" === e.id));
            o && 0 < o.length && document.getElementById("footerLegal").insertAdjacentHTML("beforeend", `<li class="footerLegalLink"><a id="footer-link-waprivacy" href="${o[0].link}" rel="noreferrer">${o[0].displayText}</a></li>`)
          }))
        })).catch((e => {
          console.error(`Failed to load consent policy: ${e}`)
        })), document.dispatchEvent(new CustomEvent("footerLoaded"))
      }()
    })).catch((e => {
      console && console.error && console.error("footerSelects was not found in the dom: ", e)
    }))
  }
  "loading" === document.readyState ? document.addEventListener("DOMContentLoaded", d) : d()
}();
