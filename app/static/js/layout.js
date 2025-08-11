// static/js/layout.js
(function () {
  function syncLayoutVars() {
    const nav = document.getElementById("top-nav");
    const footer = document.getElementById("site-footer");
    const sidebar = document.getElementById("sidebar");

    const navH = nav ? nav.offsetHeight : 64;
    const footerH = footer ? footer.offsetHeight : 36;
    const sidebarW =
      sidebar && window.getComputedStyle(sidebar).display !== "none"
        ? sidebar.offsetWidth
        : 0;

    document.documentElement.style.setProperty("--header-height", navH + "px");
    document.documentElement.style.setProperty(
      "--footer-height",
      footerH + "px"
    );
    document.documentElement.style.setProperty(
      "--sidebar-width",
      sidebarW + "px"
    );
  }

  let t;
  function notifyReady() {
    document.dispatchEvent(new Event("layout:ready"));
  }
  function notifyChange() {
    document.dispatchEvent(new Event("layout:change"));
  }

  window.addEventListener("DOMContentLoaded", function () {
    syncLayoutVars();
    // short delay to let fonts/images settle
    setTimeout(function () {
      syncLayoutVars();
      notifyReady();
    }, 200);
  });

  window.addEventListener("resize", function () {
    clearTimeout(t);
    t = setTimeout(function () {
      syncLayoutVars();
      notifyChange();
    }, 80);
  });
})();
