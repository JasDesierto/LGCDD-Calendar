document.addEventListener("DOMContentLoaded", function () {
  var calendarEl = document.getElementById("calendar");
  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    height: "100%", //fills container
    contentHeight: "auto", //shrink to fit
    expandRows: true, //prevent horizontal scroll
    handleWindowResize: true,
    events: "/api/activities",

    dateClick: function (info) {
      window.location.href = `/add?date=${info.dateStr}`;
    },

    eventClick: function (info) {
      window.location.href = "/calendar_activity/" + info.event.id;
    },
  });
  calendar.render();
});
