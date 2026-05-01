(function initSiteInteractions() {
  const navbar = document.querySelector(".navbar");
  const navToggle = document.querySelector(".nav-toggle");
  const mobileNav = document.getElementById("mobileNav");
  const revealTargets = document.querySelectorAll(".fade-in, .srv-reveal, .hiw-card");
  const root = document.documentElement;

  const LEAD_ENDPOINT = "https://script.google.com/macros/s/AKfycbwM5I0rYz6kvqwvaZ4ALUA1qiPd6xht_GmKg58cIuIWUohoFmqfPhtiosaFxCFPBzgJYg/exec";

  let lastY = window.scrollY;
  let ticking = false;

  /* =========================
     SCROLL REVEAL
  ========================== */
  function revealOnScroll() {
    const triggerBottom = window.innerHeight * 0.88;

    revealTargets.forEach((el) => {
      if (el.getBoundingClientRect().top < triggerBottom) {
        el.classList.add("active");
      }
    });
  }

  /* =========================
     NAVBAR BEHAVIOR (FIXED)
  ========================== */
  function updateHeader() {
    if (!navbar) return;

    const y = window.scrollY;

    // Add shadow/background
    navbar.classList.toggle("scrolled", y > 30);

    // Prevent jitter (important)
    if (Math.abs(y - lastY) < 8) return;

    // Hide on scroll down
    if (y > lastY && y > 120) {
      navbar.classList.add("hidden");
    } 
    // Show on scroll up
    else if (y < lastY || y <= 20) {
      navbar.classList.remove("hidden");
    }

    lastY = y;
  }

  /* =========================
     SCROLL PROGRESS
  ========================== */
  function updateProgress() {
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 
      ? Math.min(100, (window.scrollY / maxScroll) * 100) 
      : 0;

    root.style.setProperty("--scroll-progress", `${progress}%`);
  }

  function onScroll() {
    if (ticking) return;

    ticking = true;

    requestAnimationFrame(() => {
      revealOnScroll();
      updateHeader();
      updateProgress();
      ticking = false;
    });
  }

  /* =========================
     ACTIVE NAV LINK
  ========================== */
  function setActiveLink() {
    const page = window.location.pathname.split("/").pop() || "index.html";
    const links = document.querySelectorAll("nav a[href], #mobileNav a[href]");

    links.forEach((link) => {
      const href = (link.getAttribute("href") || "").split("#")[0];

      if (href === page || (page === "index.html" && href === "index.html")) {
        link.classList.add("primary-link");
      }
    });
  }

  /* =========================
     MOBILE NAV
  ========================== */
  function closeMobileNav() {
    if (!mobileNav) return;

    mobileNav.classList.remove("open");
    navToggle?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  }

  function openMobileNav() {
    if (!mobileNav) return;

    mobileNav.classList.add("open");
    navToggle?.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-open");
  }

  function initMobileNav() {
    if (!navToggle || !mobileNav) return;

    navToggle.addEventListener("click", () => {
      mobileNav.classList.contains("open") ? closeMobileNav() : openMobileNav();
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMobileNav);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) closeMobileNav();
    });
  }

  /* =========================
     POPUP
  ========================== */
  function openPopup() {
    const popup = document.getElementById("popup");
    if (!popup) return;

    popup.style.display = "flex";
  }

  function closePopup() {
    const popup = document.getElementById("popup");
    if (!popup) return;

    popup.style.display = "none";
  }

  function initPopup() {
    const popup = document.getElementById("popup");
    if (!popup) return;

    document.querySelectorAll('[data-open-popup="partner"]').forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        openPopup();
      });
    });

    popup.addEventListener("click", (e) => {
      if (e.target === popup) closePopup();
    });
  }

  /* =========================
     FORMS (OPTIMIZED)
  ========================== */
  function initLeadForms() {
    const formMap = {
      founderForm: { type: "founder", submitText: "Submit Application" },
      startupForm: { type: "startup", submitText: "Join Network" },
      manufacturerForm: { type: "manufacturer", submitText: "Join as Partner" },
      serviceForm: { type: "service", submitText: "Join as Partner" }
    };

    Object.entries(formMap).forEach(([formId, config]) => {
      const form = document.getElementById(formId);
      if (!form) return;

      const btn = form.querySelector('button[type="submit"]');
      const success = document.getElementById("successMessage");

      form.addEventListener("submit", (e) => {
        e.preventDefault();

        const data = new FormData(form);
        const phone = (data.get("phone") || "").trim();

        if (phone && !/^\d{10}$/.test(phone)) {
          alert("Enter valid 10-digit phone number");
          return;
        }

        data.set("type", config.type);

        if (btn) {
          btn.textContent = "Submitting...";
          btn.disabled = true;
        }

        fetch(LEAD_ENDPOINT, {
          method: "POST",
          body: data
        })
          .then(() => {
            form.style.display = "none";
            if (success) success.style.display = "block";
          })
          .catch(() => {
            alert("Something went wrong.");
            if (btn) {
              btn.textContent = config.submitText;
              btn.disabled = false;
            }
          });
      });
    });
  }

  /* =========================
     ICONS
  ========================== */
  function initIcons() {
    window.lucide?.createIcons();
  }

  /* =========================
     EVENTS
  ========================== */
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMobileNav();
      closePopup();
    }
  });

  window.openPopup = openPopup;
  window.closePopup = closePopup;

  /* =========================
     INIT
  ========================== */
  initPopup();
  initLeadForms();
  initMobileNav();
  setActiveLink();
  initIcons();
  onScroll();

})();
