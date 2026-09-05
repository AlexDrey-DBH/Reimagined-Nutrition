const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const forms = document.querySelectorAll("[data-site-form]");

const supportTerms = document.querySelectorAll(".pill-list .tooltip-term");

function positionSupportTooltip(term) {
  const bubble = term.querySelector(".tooltip-bubble");
  if (!bubble) return;
  const viewportWidth = document.documentElement.clientWidth;
  const bounds = term.getBoundingClientRect();
  const width = bubble.getBoundingClientRect().width || Math.min(300, viewportWidth - 48);
  const termCenter = bounds.left + bounds.width / 2;
  const center = Math.max(24 + width / 2, Math.min(termCenter, viewportWidth - 24 - width / 2));
  bubble.style.setProperty("--tooltip-left", `${center - bounds.left}px`);
  bubble.style.setProperty("--tooltip-arrow", `${Math.max(14, Math.min(width - 14, termCenter - center + width / 2))}px`);
}

supportTerms.forEach((term, index) => {
  const bubble = term.querySelector(".tooltip-bubble");
  if (!bubble) return;
  bubble.id ||= `support-tooltip-${index + 1}`;
  bubble.setAttribute("role", "tooltip");
  term.setAttribute("aria-describedby", bubble.id);
  term.addEventListener("pointerenter", () => positionSupportTooltip(term));
  term.addEventListener("focus", () => positionSupportTooltip(term));
});

if (supportTerms.length) {
  window.addEventListener("resize", () => supportTerms.forEach(positionSupportTooltip));
}

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
