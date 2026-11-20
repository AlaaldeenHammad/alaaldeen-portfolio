/* Runs in <head> before first paint so the saved theme never flashes.
   Dark is the default; light only applies if the visitor chose it. */
(function () {
  var t = "dark";
  try { t = localStorage.getItem("ah-theme") || "dark"; } catch (e) {}
  if (t === "dark") document.documentElement.setAttribute("data-theme", "dark");
})();
