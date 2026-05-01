(function initSiteInteractions() {
  const navbar = document.querySelector(".navbar");
  const navToggle = document.querySelector(".nav-toggle");
  const mobileNav = document.getElementById("mobileNav");
  const revealTargets = document.querySelectorAll(".fade-in, .srv-reveal, .hiw-card");
  const root = document.documentElement;
  const LEAD_ENDPOINT = "https://script.google.com/macros/s/AKfycbwM5I0rYz6kvqwvaZ4ALUA1qiPd6xht_GmKg58cIuIWUohoFmqfPhtiosaFxCFPBzgJYg/exec";

  let lastY = window.scrollY;
  let ticking = false;

  function revealOnScroll() {
    if (!revealTargets.length) {
      return;
    }

    const triggerBottom = window.innerHeight * 0.88;
    revealTargets.forEach((el) => {
      if (el.getBoundingClientRect().top < triggerBottom) {
        el.classList.add("active");
      }
    });
  }

  function updateHeader() {
    if (!navbar) {
      return;
    }

    const y = window.scrollY;
    navbar.classList.toggle("scrolled", y > 28);

    if (y > lastY + 6 && y > 120) {
      navbar.classList.add("hidden");
    } else if (y < lastY - 4 || y <= 16) {
      navbar.classList.remove("hidden");
    }

    lastY = y;
  }

  function updateProgress() {
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(100, (window.scrollY / maxScroll) * 100) : 0;
    root.style.setProperty("--scroll-progress", `${progress}%`);
  }

  function onScroll() {
    if (ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(() => {
      revealOnScroll();
      updateHeader();
      updateProgress();
      ticking = false;
    });
  }

  function setActiveLink() {
    const page = window.location.pathname.split("/").pop() || "index.html";
    const allLinks = document.querySelectorAll("nav a[href], #mobileNav a[href]");

    allLinks.forEach((link) => {
      const href = (link.getAttribute("href") || "").split("#")[0];
      const isHomeAnchor = page === "index.html" && href === "index.html";
      if ((href && href === page) || isHomeAnchor) {
        link.classList.add("primary-link");
      }
    });
  }

  function closeMobileNav() {
    if (!mobileNav) {
      return;
    }

    mobileNav.classList.remove("open");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "false");
    }
    document.body.classList.remove("menu-open");
  }

  function openMobileNav() {
    if (!mobileNav) {
      return;
    }

    mobileNav.classList.add("open");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "true");
    }
    document.body.classList.add("menu-open");
  }

  function initMobileNav() {
    if (!navToggle || !mobileNav) {
      return;
    }

    navToggle.addEventListener("click", () => {
      if (mobileNav.classList.contains("open")) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMobileNav);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        closeMobileNav();
      }
    });
  }

  function openPopup() {
    const popup = document.getElementById("popup");
    if (!popup) {
      return;
    }

    popup.style.display = "flex";
    popup.setAttribute("aria-hidden", "false");
  }

  function closePopup() {
    const popup = document.getElementById("popup");
    if (!popup) {
      return;
    }

    popup.style.display = "none";
    popup.setAttribute("aria-hidden", "true");
  }

  function initPopup() {
    const popup = document.getElementById("popup");
    if (!popup) {
      return;
    }

    const openTriggers = document.querySelectorAll('[data-open-popup="partner"]');
    openTriggers.forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        event.preventDefault();
        openPopup();
      });
    });

    const closeTrigger = popup.querySelector("[data-close-popup]");
    if (closeTrigger) {
      closeTrigger.addEventListener("click", closePopup);
    }

    popup.addEventListener("click", (event) => {
      if (event.target === popup) {
        closePopup();
      }
    });
  }

  function initLeadForms() {
    const formMap = {
      founderForm: {
        type: "founder",
        submitText: "Submit Application"
      },
      startupForm: {
        type: "startup",
        submitText: "Join Network"
      },
      manufacturerForm: {
        type: "manufacturer",
        submitText: "Join as Partner"
      },
      serviceForm: {
        type: "service",
        submitText: "Join as Partner"
      }
    };

    Object.entries(formMap).forEach(([formId, config]) => {
      const form = document.getElementById(formId);
      if (!form) {
        return;
      }

      const submitButton = form.querySelector('button[type="submit"]');
      const successMessage = document.getElementById("successMessage");

      form.addEventListener("submit", (event) => {
        event.preventDefault();

        const payload = new FormData(form);
        const phone = String(payload.get("phone") || "").trim();

        if (phone && !/^\d{10}$/.test(phone)) {
          alert("Enter valid 10-digit phone number");
          return;
        }

        payload.forEach((value, key) => {
          if (typeof value === "string") {
            payload.set(key, value.trim());
          }
        });
        payload.set("type", config.type);

        if (submitButton) {
          submitButton.textContent = "Submitting...";
          submitButton.disabled = true;
        }

        fetch(LEAD_ENDPOINT, {
          method: "POST",
          body: payload
        })
          .then((response) => response.text())
          .then(() => {
            form.style.display = "none";
            if (successMessage) {
              successMessage.style.display = "block";
            }
          })
          .catch(() => {
            alert("Something went wrong. Try again.");

            if (submitButton) {
              submitButton.textContent = config.submitText;
              submitButton.disabled = false;
            }
          });
      });
    });
  }

  function initIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    closeMobileNav();

    const popup = document.getElementById("popup");
    if (popup && popup.style.display === "flex") {
      closePopup();
    }
  });

  window.openPopup = openPopup;
  window.closePopup = closePopup;

  initPopup();
  initLeadForms();
  initMobileNav();
  setActiveLink();
  initIcons();
  onScroll();
})();
