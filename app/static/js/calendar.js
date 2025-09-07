document.addEventListener("DOMContentLoaded", function () {
  // find the calendar element
  var calendarEl = document.getElementById("calendar");
  if (!calendarEl) {
    // stop early and log so you know why nothing happened
    console.error(
      "calendar element not found (#calendar). Make sure the element exists in the DOM."
    );
    return;
  }

  // the element that visually contains the calendar (usually .calendar-area)
  var wrapper = calendarEl.parentElement;

  /**
   * Read a CSS variable (like --header-height) and return a number (px).
   * If the var doesn't exist or can't be parsed, return the fallback.
   */
  function cssVarNumber(name, fallback) {
    var raw = getComputedStyle(document.documentElement).getPropertyValue(name);
    if (!raw) return fallback;
    var n = parseFloat(raw);
    return isNaN(n) ? fallback : n;
  }

  /**
   * Compute the pixel height we want FullCalendar to use:
   * - measure wrapper height (the available visual space)
   * - subtract toolbar height (so the grid fills what's left)
   * - if computed value is too small, fall back to viewport-based calculation
   * - clamp to a reasonable minimum and return an integer px value
   */
  function computeDesiredHeight() {
    // wrapper height in pixels (visible area for calendar)
    var wrapperH = Math.max(0, wrapper.getBoundingClientRect().height);

    // FullCalendar toolbar (if present) takes vertical space at top
    var toolbar = calendarEl.querySelector(".fc-toolbar");
    var toolbarH = toolbar ? toolbar.getBoundingClientRect().height : 0;

    // available height for the calendar grid
    var desired = wrapperH - toolbarH;

    // fallback: if computed value is suspiciously small, use viewport minus CSS vars
    if (desired < 200) {
      var header = cssVarNumber("--header-height", 64); // default header height
      var footer = cssVarNumber("--footer-height", 36); // default footer height
      var gutter = cssVarNumber("--gutter", 16); // default gutter
      desired = window.innerHeight - header - footer - 2 * gutter;
    }

    // enforce a sane minimum (so calendar is usable) and return integer px
    desired = Math.max(300, Math.round(desired));
    return desired;
  }

  /**
   * Initialization logic:
   * - compute desired height
   * - create FullCalendar with numeric height (forces it to fill that px)
   * - render and then force an update/redraw a little later (helps when fonts/styles load)
   * - respond to window resize by recomputing and applying new height
   */


  function initCalendar() {
    var h = computeDesiredHeight();

    var calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: "dayGridMonth",
      // numeric pixel height forces FullCalendar to exactly use that height
      height: h,
      contentHeight: h,
      // useful options to avoid inner scrollbars and react to resize
      expandRows: true,
      handleWindowResize: true,
      events: "/api/activities",
     


      // INTERACTIONS
      dateClick: function (info) {
        var dateInput = document.getElementById("date");
        if (dateInput) dateInput.value = info.dateStr;
      
        //Try to open the modal (bootstrap 5)
        var el = document.getElementById("addModal");
        if (el && window.bootstrap && bootstrap.Modal) {
          var modal = bootstrap.Modal.getOrCreateInstance(el, {
            backdrop: "static",
            keyboard: false,
          });
          modal.show();
        }
        //fallback, if bootstrap not available, use the endpoint
        else {
          window.location.href = "/add?date=" + info.dateStr;
        }
      },
    });

     // Edit and Delete Interactions
    eventClick: function (info) {
      info.jsEvent.preventDefault();


    

      fetch(`/activities/${info.event.id}/partial`)
        .then(res => res.text())
        .then(html => {
      // 🔹 Inject the rendered HTML into the modal body
      document.querySelector('#activityModal .modal-body').innerHTML = html;

      // 🔹 Update footer buttons
      document.getElementById('editBtn').href = `/activities/${info.event.id}/edit`;
      document.getElementById('deleteBtn').href = `/activities/${info.event.id}/delete`;

      // 🔹 Show modal
      new bootstrap.Modal(document.getElementById('activityModal')).show();
    })
    .catch(err => console.error(err));
}

    // small delay to allow fonts/images to settle, then update size
    setTimeout(function () {
      calendar.updateSize();
    }, 80);

    // when the window changes size, recompute height and update the calendar
    window.addEventListener("resize", function () {
      var newH = computeDesiredHeight();
      calendar.setOption("height", newH);
      calendar.updateSize();
    });
  }

  /**
   * Defensive startup:
   * - sometimes the wrapper height reads zero immediately (fonts/styles not loaded,
   *   or the layout hasn't settled). Retry several times with short delays.
   * - after a few tries give up waiting and initialize anyway (with fallbacks).
   */
  var tries = 0;
  function waitThenInit() {
    var wrapperHeight = wrapper.getBoundingClientRect().height;
    if (wrapperHeight > 0 || tries > 10) {
      // either we have a measured height, or we tried enough times — initialize
      initCalendar();
    } else {
      // wait a bit and try again
      tries++;
      setTimeout(waitThenInit, 60); // 60ms
    }
  }

  // start the defensive initialization sequence
  waitThenInit();
});
