const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const consultForm = document.querySelector("[data-consult-form]");
const formStatus = document.querySelector("[data-form-status]");

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      document.body.classList.remove("nav-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

if (consultForm && formStatus) {
  consultForm.addEventListener("submit", (event) => {
    event.preventDefault();
    consultForm.reset();
    formStatus.textContent = "Thanks. Your consult request is ready for the next step.";
  });
}
