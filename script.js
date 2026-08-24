const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const forms = document.querySelectorAll("[data-site-form]");

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

forms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const status = form.querySelector("[data-form-status]");
    const message = form.getAttribute("data-success-message") || "Thank you. Ali will review this and follow up with the right next step.";
    form.reset();
    if (status) {
      status.textContent = message;
    }
  });
});

const statAnimationGroups = document.querySelectorAll("[data-stat-animations]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function formatStatCount(element, value) {
  const prefix = element.dataset.countPrefix || "";
  const suffix = element.dataset.countSuffix || "";
  return `${prefix}${value}${suffix}`;
}

function animateStatCount(element) {
  const target = Number(element.dataset.countTo);
  const duration = Number(element.dataset.countDuration) || 1200;

  if (!Number.isFinite(target) || reduceMotion) {
    element.textContent = formatStatCount(element, target);
    return;
  }

  const start = performance.now();

  function updateCount(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = formatStatCount(element, Math.round(target * eased));

    if (progress < 1) {
      window.requestAnimationFrame(updateCount);
    }
  }

  window.requestAnimationFrame(updateCount);
}

function revealStatAnimations(group) {
  group.classList.add("is-visible");
  group.querySelectorAll("[data-count-up]").forEach(animateStatCount);
}

function primeStatAnimations(group) {
  if (reduceMotion) {
    return;
  }

  group.querySelectorAll("[data-count-up]").forEach((element) => {
    element.textContent = formatStatCount(element, 0);
  });
}

if (statAnimationGroups.length) {
  statAnimationGroups.forEach(primeStatAnimations);

  if ("IntersectionObserver" in window) {
    const statObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          revealStatAnimations(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    statAnimationGroups.forEach((group) => statObserver.observe(group));
  } else {
    statAnimationGroups.forEach(revealStatAnimations);
  }
}
