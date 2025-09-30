document.addEventListener("DOMContentLoaded", function () {
  // find the calendar element
  const calendarEl = document.getElementById("calendar");
  if (!calendarEl) {
    console.error("calendar element not found (#calendar).");
    return;
  }

  // container around the calendar
  const wrapper = calendarEl.parentElement;
  if (!wrapper) {
    console.error("No parent wrapper for #calendar.");
    return;
  }

  // helpers
  function cssVarNumber(name, fallback) {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(
      name
    );
    if (!raw) return fallback;
    const n = parseFloat(raw);
    return Number.isNaN(n) ? fallback : n;
  }

  function computeDesiredHeight() {
    const wrapperH = Math.max(0, wrapper.getBoundingClientRect().height);
    // toolbar exists only after render; pre-render this will be 0 (that’s okay)
    const toolbar = calendarEl.querySelector(".fc-toolbar");
    const toolbarH = toolbar ? toolbar.getBoundingClientRect().height : 0;

    let desired = wrapperH - toolbarH;
    if (desired < 200) {
      const header = cssVarNumber("--header-height", 64);
      const footer = cssVarNumber("--footer-height", 36);
      const gutter = cssVarNumber("--gutter", 16);
      desired = window.innerHeight - header - footer - 2 * gutter;
    }
    return Math.max(300, Math.round(desired));
  }

  let calendar; // <-- hoisted so timers/listeners can see it

  function initCalendar() {
    const h = computeDesiredHeight();

    calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: "dayGridMonth",
      height: h,
      // contentHeight: h, // optional; height alone usually suffices
      expandRows: true,
      handleWindowResize: true,
      events: "/api/activities",

      // INTERACTIONS
      dateClick(info) {
        const dateInput = document.getElementById("date");
        if (dateInput) dateInput.value = info.dateStr;

        const el = document.getElementById("addModal");
        if (el && window.bootstrap && bootstrap.Modal) {
          const modal = bootstrap.Modal.getOrCreateInstance(el, {
            backdrop: "static",
            keyboard: false,
          });
          modal.show();
        } else {
          window.location.href =
            "/add?date=" + encodeURIComponent(info.dateStr);
        }
      },

      // Edit and Delete Interactions
      async eventClick(info) {
        info.jsEvent.preventDefault();

        try {
          const res = await fetch(
            `/activities/${encodeURIComponent(info.event.id)}/partial`
          );
          const html = await res.text();

          const modalBody = document.querySelector(
            "#activityModal .modal-body"
          );
          if (!modalBody) throw new Error("Modal body not found");
          modalBody.innerHTML = html;

          const editBtn = document.getElementById("editBtn");
          if (editBtn)
            editBtn.href = `/activities/${encodeURIComponent(
              info.event.id
            )}/edit`;
          const deleteBtn = document.getElementById("deleteBtn");
          if (deleteBtn)
            deleteBtn.href = `/activities/${encodeURIComponent(
              info.event.id
            )}/delete`;

          const modalEl = document.getElementById("activityModal");
          if (!modalEl) throw new Error("#activityModal not found");
          bootstrap.Modal.getOrCreateInstance(modalEl).show();
        } catch (err) {
          console.error(err);
        }
      },
    });

    calendar.render();

    // let fonts/layout settle, then recompute and update size
    setTimeout(() => {
      try {
        calendar.setOption("height", computeDesiredHeight());
        calendar.updateSize();
      } catch (e) {}
    }, 80);

    // update on resize
    window.addEventListener("resize", () => {
      if (!calendar) return;
      const newH = computeDesiredHeight();
      calendar.setOption("height", newH);
      calendar.updateSize();
    });
  }

  // defensive startup — wait until wrapper has a non-zero height
  let tries = 0;
  function waitThenInit() {
    const wrapperHeight = wrapper.getBoundingClientRect().height;
    if (wrapperHeight > 0 || tries > 10) {
      initCalendar();
    } else {
      tries++;
      setTimeout(waitThenInit, 60);
    }
  }

  waitThenInit();
});
