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

  /* ---------- Active nav link (scroll spy) ---------- */
  var sections = Array.prototype.slice.call(doc.querySelectorAll("main section[id]"));
  var navLinks = Array.prototype.slice.call(doc.querySelectorAll(".nav__list a"));

  if ("IntersectionObserver" in window && navLinks.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.getAttribute("id");
        navLinks.forEach(function (link) {
          link.classList.toggle("is-active", link.getAttribute("href") === "#" + id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
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
