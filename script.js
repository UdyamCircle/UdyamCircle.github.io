(function initSiteInteractions() {
  const navbar = document.querySelector(".navbar");
  const revealTargets = document.querySelectorAll(".fade-in, .srv-reveal, .hiw-card");
  const root = document.documentElement;

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

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    const popup = document.getElementById("popup");
    if (popup && popup.style.display === "flex") {
      popup.style.display = "none";
    }
  });

  onScroll();
})();
