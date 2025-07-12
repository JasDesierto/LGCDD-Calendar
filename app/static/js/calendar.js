document.addEventListener("DOMContentLoaded", function () {
  var calendarEl = document.getElementById("calendar");
  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    height: "100%",
    expandRows: true,
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
