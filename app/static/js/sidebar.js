document.querySelectorAll(".nav-toggle").forEach(function (btn) {
  btn.addEventListener("click", function (e) {
    e.preventDefault();
    document.documentElement.classList.toggle("openNav");
    btn.classList.toggle("active");
  });
});
