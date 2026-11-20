/* =========================================================
   Alaaldeen Hammad — Portfolio interactions
   Vanilla JS, no dependencies. (Theme is pre-applied by theme-init.js.)
   ========================================================= */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;

  /* ---------- Theme toggle ---------- */
  var THEME_KEY = "ah-theme";
  var toggle = doc.getElementById("themeToggle");

  function applyTheme(theme) {
    if (theme === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    if (toggle) toggle.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
    var meta = doc.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#101317" : "#f2f5f8");
  }
  applyTheme(root.getAttribute("data-theme") === "dark" ? "dark" : "light");

  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    });
  }

  /* ---------- Header scroll state ---------- */
  var header = doc.getElementById("siteHeader");
  var toTop = doc.getElementById("toTop");
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 12);
    if (toTop) toTop.classList.toggle("is-visible", window.scrollY > 700);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile nav ---------- */
  var navToggle = doc.getElementById("navToggle");
  var mobileNav = doc.getElementById("mobileNav");

  function setNav(open) {
    if (!mobileNav || !navToggle) return;
    mobileNav.hidden = !open;
    doc.body.classList.toggle("nav-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () { setNav(mobileNav.hidden); });
    mobileNav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setNav(false);
    });
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setNav(false);
    });
    window.matchMedia("(min-width: 961px)").addEventListener("change", function (e) {
      if (e.matches) setNav(false);
    });
  }

  /* ---------- Sections as layers ----------
     Each section is a layer. Sticky positioning lets the next one slide over
     the previous, and GSAP ScrollTrigger scrubs the covered layer back and
     dims it. Sticky elements report shifted offsets, so every position used
     for anchors and the scroll spy is the natural (unstuck) top, measured
     from layout and cached in `tops`. */
  var sectionEls = Array.prototype.slice.call(doc.querySelectorAll("main > section[id]"));
  var navLinks = Array.prototype.slice.call(doc.querySelectorAll(".nav__list a"));
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var layered = hasGsap && !reduceMotion;
  var tops = [];

  function measure() {
    var main = doc.getElementById("main");
    var y = main ? main.offsetTop : 0;
    sectionEls.forEach(function (el, i) {
      y += parseFloat(getComputedStyle(el).marginTop) || 0;
      tops[i] = y;
      y += el.offsetHeight;
      if (layered && i < sectionEls.length - 1) {
        // Stick once the bottom edge reaches the viewport bottom (or the top edge reaches 0 for short sections).
        el.style.top = Math.min(0, window.innerHeight - el.offsetHeight) + "px";
      }
    });
  }

  function updateSpy() {
    var line = window.scrollY + window.innerHeight * 0.4;
    var current = null;
    sectionEls.forEach(function (el, i) { if (tops[i] <= line) current = el.id; });
    navLinks.forEach(function (link) {
      link.classList.toggle("is-active", link.getAttribute("href") === "#" + current);
    });
  }

  function goTo(id, smooth) {
    var i = sectionEls.findIndex(function (el) { return el.id === id; });
    if (i < 0) return false;
    window.scrollTo({ top: i === 0 ? 0 : tops[i], behavior: smooth && !reduceMotion ? "smooth" : "auto" });
    return true;
  }

  if (layered) {
    gsap.registerPlugin(ScrollTrigger);
    root.classList.add("has-layers");

    sectionEls.forEach(function (el, i) {
      var dim = doc.createElement("span");
      dim.className = "layer-dim";
      dim.setAttribute("aria-hidden", "true");
      el.appendChild(dim);

      if (i === 0) return;
      gsap.timeline({
        scrollTrigger: { trigger: el, start: "top bottom", end: "top 15%", scrub: true }
      })
        .to(sectionEls[i - 1], { scale: 0.94, ease: "none" }, 0)
        .to(sectionEls[i - 1].querySelector(".layer-dim"), { opacity: 0.6, ease: "none" }, 0);
    });

    Array.prototype.forEach.call(doc.querySelectorAll(".section__title, .contact__title"), function (title) {
      gsap.fromTo(title,
        { clipPath: "inset(0 0 100% 0)", y: 40 },
        { clipPath: "inset(0 0 0% 0)", y: 0, duration: 0.9, ease: "power3.out", clearProps: "clipPath,transform",
          scrollTrigger: { trigger: title, start: "top 85%", once: true } });
    });
  }

  measure();
  updateSpy();
  window.addEventListener("scroll", updateSpy, { passive: true });

  var resizeTimer;
  function remeasure() {
    measure();
    updateSpy();
    if (layered) ScrollTrigger.refresh();
  }
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(remeasure, 150);
  });
  window.addEventListener("load", remeasure);
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(remeasure);

  // Section links scroll to the natural top, not the sticky-shifted one.
  doc.addEventListener("click", function (e) {
    var link = e.target.closest && e.target.closest('a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute("href").slice(1);
    if (goTo(id, true)) {
      e.preventDefault();
      if (history.pushState) history.pushState(null, "", "#" + id);
    }
  });
  if (location.hash) {
    window.addEventListener("load", function () { goTo(location.hash.slice(1), false); });
  }

  /* ---------- Hero stack: legend drives the 3D layers ---------- */
  var stack = doc.getElementById("stack");
  var layerBtns = Array.prototype.slice.call(doc.querySelectorAll(".layer"));
  var pinned = null;

  function showLayer(name) {
    if (!stack) return;
    if (name) stack.setAttribute("data-active", name);
    else stack.removeAttribute("data-active");
  }
  layerBtns.forEach(function (btn) {
    var name = btn.getAttribute("data-layer");
    btn.addEventListener("mouseenter", function () { showLayer(name); });
    btn.addEventListener("focus", function () { showLayer(name); });
    btn.addEventListener("mouseleave", function () { showLayer(pinned); });
    btn.addEventListener("blur", function () { showLayer(pinned); });
    btn.addEventListener("click", function () {
      pinned = pinned === name ? null : name;
      layerBtns.forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.getAttribute("data-layer") === pinned));
      });
      showLayer(pinned);
    });
  });

  /* ---------- Copy email ---------- */
  var copyBtn = doc.getElementById("copyEmail");
  var toast = doc.getElementById("toast");
  var toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-on"); }, 2200);
  }
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var text = copyBtn.getAttribute("data-copy");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          function () { showToast("Email copied"); },
          function () { showToast("Couldn't copy. Select the address and copy it manually."); }
        );
      } else {
        showToast("Copying isn't supported here. Select the address and copy it manually.");
      }
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = doc.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
