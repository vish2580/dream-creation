(() => {
  // Register GSAP plugins
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  } else {
    console.warn("GSAP or ScrollTrigger not loaded");
  }

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------------------------------------------------------------------------
  // 1. Lenis Inertial Smooth Scrolling
  // ---------------------------------------------------------------------------
  let lenis = null;
  if (typeof Lenis !== "undefined" && !reduce) {
    lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
    window.lenis = lenis;
  }

  // ---------------------------------------------------------------------------
  // 2. Custom Red Cursor Follower with Magnetic Attraction
  // ---------------------------------------------------------------------------
  const cursor = document.getElementById("custom-cursor");
  if (cursor && !reduce) {
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.18, ease: "power3.out" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.18, ease: "power3.out" });

    let isVisible = false;

    window.addEventListener("mousemove", (e) => {
      if (!isVisible) {
        cursor.classList.add("is-visible");
        isVisible = true;
      }
      xTo(e.clientX);
      yTo(e.clientY);
    });

    window.addEventListener("mouseleave", () => {
      cursor.classList.remove("is-visible");
      isVisible = false;
    });

    window.addEventListener("mousedown", () => cursor.classList.add("is-active"));
    window.addEventListener("mouseup", () => cursor.classList.remove("is-active"));

    // Interactive element hover detection
    const interactives = document.querySelectorAll(
      "a, button, .project-row, .award-card, .icard, .pf-strips img, .hero-collage img, .scroll-orb, .to-top"
    );
    interactives.forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
    });
  }

  // ---------------------------------------------------------------------------
  // 3. Navigation Header & Drawer
  // ---------------------------------------------------------------------------
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".menu-toggle");
  const drawer = document.querySelector(".nav-drawer");
  let lastY = 0;

  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY;
      if (header) {
        if (y > 80 && y > lastY) header.classList.add("is-hidden");
        else header.classList.remove("is-hidden");
      }
      lastY = y;
    },
    { passive: true }
  );

  if (toggle && drawer) {
    toggle.addEventListener("click", () => {
      const isOpen = drawer.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen);
    });

    drawer.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        drawer.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && drawer.classList.contains("open")) {
        drawer.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Smooth scroll for all hash links including Book Now
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const hash = anchor.getAttribute("href");
      if (hash && hash !== "#") {
        const target = document.querySelector(hash);
        if (target) {
          e.preventDefault();
          if (drawer) {
            drawer.classList.remove("open");
            if (toggle) toggle.setAttribute("aria-expanded", "false");
          }
          if (lenis) {
            lenis.scrollTo(target, { duration: 1.2 });
          } else {
            target.scrollIntoView({ behavior: "smooth" });
          }
        }
      }
    });
  });

  // FAQ Accordion Toggling
  document.querySelectorAll(".faq-question").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      if (item) {
        const wasActive = item.classList.contains("active");
        document.querySelectorAll(".faq-item").forEach((f) => f.classList.remove("active"));
        if (!wasActive) item.classList.add("active");
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Preloader & Hero Intro Sequence
  // ---------------------------------------------------------------------------
  const preloader = document.getElementById("preloader");
  const countEl = document.getElementById("preloader-count");
  const initialOrb = document.getElementById("hero-initial-orb");
  const scrollOrb = document.getElementById("scroll-orb");

  const brand = document.querySelector(".brand-lockup");
  const kicker = document.querySelector(".hero-kicker");
  const mobileKicker = document.querySelector(".mobile-kicker");
  const meta = document.querySelector(".hero-meta");
  const storiesRow = document.querySelector(".stories-row");
  const youRow = document.querySelector(".you-row");
  const stepRow = document.querySelector(".step-row");
  const stage = document.querySelector(".hero-stage");

  const isMobileHero = window.innerWidth <= 900;
  const heroCollageImgs = gsap.utils.toArray(
    isMobileHero ? ".hero-collage img.mobile-only" : ".hero-collage img.desktop-only"
  );
  const cardRotations = [-2.5, 3.2, -1.8, 2.4, -3.0, 1.8, -2.2, 2.8, -1.5, 0];

  let heroIntroCompleted = false;
  let heroScrollTriggerInitialized = false;
  let introTl = null;

  // Prepare layout IMMEDIATELY so nothing flashes or appears prematurely
  const prepareHeroState = () => {
    // Hide header and all typography, kickers, meta, and buttons immediately
    if (header) gsap.set(header, { opacity: 0, y: -20 });
    if (storiesRow) gsap.set(storiesRow, { y: 35, opacity: 0 });
    if (youRow) gsap.set(youRow, { y: 45, opacity: 0 });
    if (stepRow) gsap.set(stepRow, { y: 55, opacity: 0 });
    if (brand) gsap.set(brand, { y: -20, opacity: 0 });
    if (kicker) gsap.set(kicker, { opacity: 0 });
    if (mobileKicker) gsap.set(mobileKicker, { opacity: 0 });
    if (meta) gsap.set(meta, { opacity: 0 });
    if (scrollOrb) gsap.set(scrollOrb, { xPercent: -50, scale: 0, opacity: 0 });
    if (initialOrb) gsap.set(initialOrb, { opacity: 0, scale: 1 });

    const rect = stage ? stage.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    heroCollageImgs.forEach((img, i) => {
      const ir = img.getBoundingClientRect();
      const stageRect = stage ? stage.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
      const icx = ir.left - stageRect.left + ir.width / 2;
      const icy = ir.top - stageRect.top + ir.height / 2;
      const dx = cx - icx;
      const dy = cy - icy;
      const rot = cardRotations[i % cardRotations.length];

      // Pre-position in the center stack at zero opacity
      gsap.set(img, {
        x: dx,
        y: dy,
        scale: 1.15,
        rotation: rot,
        opacity: 0,
        zIndex: 10 + i,
      });
    });
  };

  prepareHeroState();

  const startHeroIntro = () => {
    introTl = gsap.timeline({
      delay: 0.04,
      onComplete: () => {
        heroIntroCompleted = true;
        setupHeroMouseMovement();
        setupHeroScrollTrigger();
      },
    });

    // 1. Initial glowing red cosmic orb at top center
    if (initialOrb) {
      introTl.to(initialOrb, { opacity: 1, duration: 0.22, ease: "power2.out" }, 0);
      introTl.to(initialOrb, { scale: 1.25, repeat: 1, yoyo: true, duration: 0.2, ease: "power1.inOut" }, 0.1);
    }

    // 2. PHASE 1: FIRST IMAGES SHOWN TOGETHER in center stack!
    // Reveal all images in the center stack together at opacity 1
    introTl.set(heroCollageImgs, { opacity: 1 }, 0.05);

    // Dynamic flip & fanned shuffle establishing the photo collection together
    heroCollageImgs.forEach((img, idx) => {
      const rot = cardRotations[idx % cardRotations.length];
      introTl.fromTo(
        img,
        { scale: 1.22, rotation: rot * 1.6 },
        { scale: 1.15, rotation: rot, duration: 0.18, ease: "power2.out" },
        0.05 + idx * 0.03
      );
    });

    // Visible tactile pause so the user clearly absorbs all images together
    introTl.to({}, { duration: 0.45 });

    // 3. PHASE 2: ALL TOGETHER FLOW OUTWARD to settled perimeter positions
    introTl.to(
      heroCollageImgs,
      {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        duration: 0.9,
        stagger: {
          each: 0.03,
          from: "center",
        },
        ease: "power3.out",
      },
      "+=0.04"
    );

    // Reset collage images to background z-index so typography is 100% unobstructed
    introTl.set(heroCollageImgs, { zIndex: (i) => 2 + i }, "-=0.15");

    // 4. PHASE 3: ONLY AFTER IMAGES HAVE SETTLED OUTWARD -> TEXT COMES IN!
    introTl.to(
      [storiesRow, youRow, stepRow],
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
      },
      "+=0.05"
    );

    introTl.to(
      [brand, kicker, mobileKicker, meta],
      {
        y: 0,
        opacity: 1,
        duration: 0.55,
        stagger: 0.06,
        ease: "power2.out",
      },
      "-=0.4"
    );

    if (header) {
      introTl.to(
        header,
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
        },
        "-=0.4"
      );
    }

    // 5. Initial orb glides down into scroll-orb button position
    if (initialOrb && scrollOrb) {
      const orbRect = scrollOrb.getBoundingClientRect();
      const stageRect = stage ? stage.getBoundingClientRect() : { left: 0, top: 0, height: window.innerHeight };
      const targetY = orbRect.top - stageRect.top + orbRect.height / 2;

      introTl.to(
        initialOrb,
        {
          y: targetY - stageRect.height * 0.15,
          duration: 0.65,
          ease: "power3.inOut",
        },
        "-=0.55"
      );

      introTl.to(
        initialOrb,
        {
          opacity: 0,
          scale: 2.2,
          duration: 0.18,
          ease: "power2.in",
        },
        "-=0.08"
      );

      introTl.to(
        scrollOrb,
        {
          xPercent: -50,
          scale: 1,
          opacity: 1,
          duration: 0.45,
          ease: "back.out(1.8)",
        },
        "-=0.15"
      );
    } else if (scrollOrb) {
      introTl.to(scrollOrb, { xPercent: -50, scale: 1, opacity: 1, duration: 0.45, ease: "back.out(1.8)" }, "-=0.25");
    }

    if (skipPreloader) {
      introTl.progress(1);
    }
  };

  // Skip or fast-forward if user wheels/scrolls early
  window.addEventListener(
    "wheel",
    (e) => {
      if (e.deltaY > 5 && introTl && !heroIntroCompleted) {
        introTl.progress(1);
      }
    },
    { passive: true }
  );

  const urlParams = new URLSearchParams(window.location.search);
  const skipPreloader = urlParams.get("skip_preloader") === "1";

  // Preloader count up with Theatrical Two Curtain Lines Split
  if (preloader && !reduce && !skipPreloader) {
    const leftCurtain = preloader.querySelector(".preloader-curtain.left");
    const rightCurtain = preloader.querySelector(".preloader-curtain.right");
    const obj = { count: 0 };

    gsap.to(obj, {
      count: 100,
      duration: 0.9,
      ease: "power2.out",
      onUpdate: () => {
        if (countEl) countEl.textContent = Math.round(obj.count);
      },
      onComplete: () => {
        const exitTl = gsap.timeline({
          onComplete: () => {
            preloader.remove();
          },
        });

        // 1. Central timer counter shrinks & fades
        if (countEl) {
          exitTl.to(countEl, {
            scale: 0.5,
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
          });
        }

        // 2. The Two Curtain Lines split outward to left and right!
        if (leftCurtain && rightCurtain) {
          exitTl.to(
            leftCurtain,
            {
              xPercent: -100,
              duration: 1.1,
              ease: "power3.inOut",
            },
            "-=0.08"
          );
          exitTl.to(
            rightCurtain,
            {
              xPercent: 100,
              duration: 1.1,
              ease: "power3.inOut",
            },
            "<"
          );
        } else {
          exitTl.to(preloader, { opacity: 0, duration: 0.4 });
        }

        // 3. Start hero cosmic intro explosion as curtains part
        exitTl.call(startHeroIntro, null, "-=0.8");
      },
    });
  } else {
    if (preloader) preloader.remove();
    startHeroIntro();
  }

  // Scroll orb click
  scrollOrb?.addEventListener("click", () => {
    const target = document.querySelector(".tagline");
    if (lenis && target) {
      lenis.scrollTo(target, { duration: 1.2 });
    } else if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });

  // Hero Mouse Movement & Velocity Stretchiness Animation (0:10 to 0:12 in video)
  function setupHeroMouseMovement() {
    const isMobile = window.innerWidth <= 900;
    const imgs = gsap.utils.toArray(
      isMobile ? ".hero-collage img.mobile-only" : ".hero-collage img.desktop-only"
    );
    if (!imgs.length) return;

    // Organic 3D parallax depth map
    const depths = [
      { x: -35, y: -25 }, // h1
      { x: 28, y: -30 },  // h2
      { x: 42, y: -18 },  // h3
      { x: -38, y: 16 },  // h4
      { x: 32, y: 22 },   // h5
      { x: -48, y: 32 },  // h6
      { x: -26, y: 38 },  // h7
      { x: 16, y: 12 },   // h8
      { x: 48, y: 32 },   // h9
      { x: 26, y: 44 },   // h10
    ];

    const cardAnimators = imgs.map((img, i) => {
      const d = depths[i % depths.length];
      return {
        img,
        depth: d,
        xTo: gsap.quickTo(img, "x", { duration: 0.6, ease: "power3.out" }),
        yTo: gsap.quickTo(img, "y", { duration: 0.6, ease: "power3.out" }),
        scaleXTo: gsap.quickTo(img, "scaleX", { duration: 0.35, ease: "power2.out" }),
        scaleYTo: gsap.quickTo(img, "scaleY", { duration: 0.35, ease: "power2.out" }),
        skewXTo: gsap.quickTo(img, "skewX", { duration: 0.45, ease: "power2.out" }),
        skewYTo: gsap.quickTo(img, "skewY", { duration: 0.45, ease: "power2.out" }),
      };
    });

    let prevX = window.innerWidth / 2;
    let prevY = window.innerHeight / 2;
    let returnTimer = null;

    window.addEventListener("mousemove", (e) => {
      // Only active when hero is near the viewport
      if (window.scrollY > window.innerHeight * 1.1) return;

      const w = window.innerWidth;
      const h = window.innerHeight;
      const nx = (e.clientX - w / 2) / (w / 2); // -1 to +1
      const ny = (e.clientY - h / 2) / (h / 2); // -1 to +1

      const vx = e.clientX - prevX;
      const vy = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;

      const speed = Math.hypot(vx, vy);
      // Dynamic stretchiness effect proportional to mouse velocity
      const stretch = Math.min(speed * 0.0025, 0.12);
      const skewX = Math.max(-8, Math.min(8, -vx * 0.12));
      const skewY = Math.max(-6, Math.min(6, -vy * 0.08));

      cardAnimators.forEach((item) => {
        // Multi-depth parallax shift
        item.xTo(nx * item.depth.x);
        item.yTo(ny * item.depth.y);

        // Elastic velocity stretchiness
        item.scaleXTo(1 + stretch);
        item.scaleYTo(1 - stretch * 0.4);
        item.skewXTo(skewX);
        item.skewYTo(skewY);
      });

      // Spring smoothly back to rest when mouse stops moving
      clearTimeout(returnTimer);
      returnTimer = setTimeout(() => {
        cardAnimators.forEach((item) => {
          item.scaleXTo(1);
          item.scaleYTo(1);
          item.skewXTo(0);
          item.skewYTo(0);
        });
      }, 140);
    });

    // Hover magnification on individual cards
    imgs.forEach((img) => {
      img.addEventListener("mouseenter", () => {
        gsap.to(img, { scale: 1.1, zIndex: 35, duration: 0.35, ease: "power2.out" });
      });
      img.addEventListener("mouseleave", () => {
        gsap.to(img, { scale: 1, zIndex: "", duration: 0.45, ease: "power2.out" });
      });
    });
  };

  // ---------------------------------------------------------------------------
  // 5. Hero ScrollTrigger Pinned Scrub & Split (0:10 to 0:12 in video)
  // ---------------------------------------------------------------------------
  function setupHeroScrollTrigger() {
    if (heroScrollTriggerInitialized || reduce) return;
    heroScrollTriggerInitialized = true;

    // Ensure elements are cleanly settled before recording ScrollTrigger initial values
    gsap.set(".scroll-orb", { xPercent: -50, scale: 1, opacity: 1 });
    gsap.set([storiesRow, youRow, stepRow, brand, kicker, mobileKicker, meta], { opacity: 1, y: 0 });

    const heroTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".hero",
        pin: ".hero-stage",
        start: "top top",
        end: "+=130%",
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    // Left typography splits left; Right typography splits right; Center card zooms and fades
    heroTl.to(".hero-text-memories", { xPercent: -90, opacity: 0, ease: "power2.inOut" }, 0);
    heroTl.to(".stories-row .dash", { xPercent: 120, opacity: 0, ease: "power2.inOut" }, 0);
    heroTl.to(".hero-text-you", { xPercent: -85, opacity: 0, ease: "power2.inOut" }, 0);
    heroTl.to(".hero-center-card", { scale: 1.15, opacity: 0, ease: "power2.inOut" }, 0);
    heroTl.to(".hero-text-can", { xPercent: 85, opacity: 0, ease: "power2.inOut" }, 0);
    heroTl.to(".hero-text-never", { xPercent: -75, yPercent: 30, opacity: 0, ease: "power2.inOut" }, 0);
    heroTl.to(".hero-text-forget", { xPercent: 75, yPercent: 30, opacity: 0, ease: "power2.inOut" }, 0);
    heroTl.to(".brand-lockup, .hero-kicker, .mobile-kicker", { y: -80, opacity: 0, ease: "power2.inOut" }, 0);
    heroTl.to(".hero-meta", { y: 60, opacity: 0, ease: "power2.inOut" }, 0);
    heroTl.to(".scroll-orb", { scale: 0, opacity: 0, ease: "power2.inOut" }, 0);

    // Left hero cards - stretch outwards to left and STAY VISIBLE through 0:10-0:12
    heroTl.to(".h1, .h4, .h6, .h7, .mh1, .mh4, .mh5, .mh6", {
      xPercent: -65,
      yPercent: 18,
      scale: 1.08,
      stagger: 0.02,
      ease: "power2.inOut",
    }, 0);

    // Right hero cards - stretch outwards to right and STAY VISIBLE through 0:10-0:12
    heroTl.to(".h2, .h3, .h5, .h8, .h9, .h10, .mh2, .mh3, .mh7, .mh8", {
      xPercent: 65,
      yPercent: -18,
      scale: 1.08,
      stagger: 0.02,
      ease: "power2.inOut",
    }, 0);

    // Fade out gently only at the end of the hero scrub (0.75 -> 1.0) as tagline arrives
    heroTl.to(".hero-collage img", {
      opacity: 0,
      duration: 0.25,
      ease: "power1.in",
    }, 0.75);

    ScrollTrigger.refresh();
  };

  // ---------------------------------------------------------------------------
    // Initialize Hero ScrollTrigger first so page pin spacers are registered in exact DOM order
  setupHeroScrollTrigger();

  // ---------------------------------------------------------------------------
  // 6. Tagline / Manifesto Section (Pinned Line-by-Line Scroll Scrub Animation)
  // ---------------------------------------------------------------------------
  if (!reduce) {
    const tagline = document.querySelector(".tagline");
    const statSpans = gsap.utils.toArray(".tagline-stats .clip > span");
    const spike = document.querySelector(".tagline-spike");
    const bullet = document.querySelector(".tagline-bullet");
    const tRows = gsap.utils.toArray(".tagline .t-row");

    // Flat arrays for each row
    const r0 = tRows[0] ? gsap.utils.toArray(tRows[0].querySelectorAll(".clip > span")) : [];
    const r1 = tRows[1] ? gsap.utils.toArray(tRows[1].querySelectorAll(".clip > span")) : [];
    const r2 = tRows[2] ? gsap.utils.toArray(tRows[2].querySelectorAll(".clip > span")) : [];
    const r3 = tRows[3] ? gsap.utils.toArray(tRows[3].querySelectorAll(".clip > span")) : [];
    const r4 = tRows[4] ? gsap.utils.toArray(tRows[4].querySelectorAll(".clip > span")) : [];

    // Starting states: words tucked below their overflow clips
    gsap.set(statSpans, { yPercent: 110, opacity: 0 });
    if (spike) gsap.set(spike, { scale: 0, opacity: 0 });
    if (bullet) gsap.set(bullet, { scale: 0, opacity: 0 });
    [r0, r1, r2, r3, r4].forEach((spans) => {
      gsap.set(spans, { yPercent: 115, opacity: 0 });
    });

    const taglineTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".tagline",
        pin: true,
        start: "top top",
        end: "+=90%",
        scrub: 0.6,
        onUpdate: (self) => {
          const p = self.progress;
          // Row-by-row red underline activation matching line reveals
          if (tRows[1]) {
            if (p >= 0.22) tRows[1].classList.add("row-active");
            else tRows[1].classList.remove("row-active");
          }
          if (tRows[2]) {
            if (p >= 0.38) tRows[2].classList.add("row-active");
            else tRows[2].classList.remove("row-active");
          }
          if (tRows[4]) {
            if (p >= 0.65) tRows[4].classList.add("row-active");
            else tRows[4].classList.remove("row-active");
          }
        },
      },
    });

    // 0. Top Stats Bar: "MOMENTS THAT MATTER" & "7+ YEARS OF EXPERIENCE"
    taglineTl.fromTo(statSpans, { yPercent: 70, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.03, duration: 0.18, ease: "power2.out" }, 0.0);
    if (spike) {
      taglineTl.fromTo(spike, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.16, ease: "back.out(1.5)" }, 0.02);
    }

    // 1. Line 1: "WE ARE A TEAM OF"
    taglineTl.fromTo(r0, { yPercent: 80, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.025, duration: 0.20, ease: "power2.out" }, 0.08);

    // 2. Line 2: "Visionary EVENT PLANNERS"
    taglineTl.fromTo(r1, { yPercent: 80, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.025, duration: 0.22, ease: "power2.out" }, 0.22);
    if (bullet) {
      taglineTl.fromTo(bullet, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.18, ease: "back.out(1.5)" }, 0.24);
    }

    // 3. Line 3: "& Creative THINKERS,"
    taglineTl.fromTo(r2, { yPercent: 80, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.025, duration: 0.22, ease: "power2.out" }, 0.38);

    // 4. Line 4: "COMMITTED TO CREATING"
    taglineTl.fromTo(r3, { yPercent: 80, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.02, duration: 0.20, ease: "power2.out" }, 0.52);

    // 5. Line 5: "Moments THAT matter."
    taglineTl.fromTo(r4, { yPercent: 80, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.025, duration: 0.22, ease: "power2.out" }, 0.66);

    // 6. Hold fully settled in view before unpinning
    taglineTl.to({}, { duration: 0.24 }, 0.90);
  }

  // ---------------------------------------------------------------------------
  // 7. Services 3D Pinned Stage (Scrolling Effect: Lines Come From Down to Up)
  // ---------------------------------------------------------------------------
  if (!reduce) {
    const posters = gsap.utils.toArray(".stage-posters .stage-poster");
    const videoWraps = gsap.utils.toArray(".service-card .card-video-wrap");
    const cardVideos = gsap.utils.toArray(".service-card video");
    const textBgs = gsap.utils.toArray(".stage-text-bg-track .text-bg-item");
    const leftLines = gsap.utils.toArray(".service-col-left .service-line-item");
    const rightLines = gsap.utils.toArray(".service-col-right .service-line-item");
    const card = document.querySelector(".service-card");

    const numSlides = Math.min(posters.length, leftLines.length, rightLines.length);

    // Initialize starting states
    if (leftLines[0]) gsap.set(leftLines[0], { yPercent: 0, opacity: 1 });
    if (rightLines[0]) gsap.set(rightLines[0], { yPercent: 0, opacity: 1 });
    if (textBgs[0]) gsap.set(textBgs[0], { yPercent: 0, opacity: 0.65 });
    if (videoWraps[0]) gsap.set(videoWraps[0], { clipPath: "inset(0% 0 0 0)" });

    posters.forEach((p, idx) => {
      gsap.set(p, {
        zIndex: idx + 1,
        opacity: idx === 0 ? 0.85 : 0,
        clipPath: "inset(0% 0 0 0)",
      });
    });

    for (let i = 1; i < numSlides; i++) {
      if (leftLines[i]) gsap.set(leftLines[i], { yPercent: 120, opacity: 0 });
      if (rightLines[i]) gsap.set(rightLines[i], { yPercent: 120, opacity: 0 });
      if (textBgs[i]) gsap.set(textBgs[i], { yPercent: 120, opacity: 0 });
      if (videoWraps[i]) gsap.set(videoWraps[i], { clipPath: "inset(100% 0 0 0)" });
    }

    // Ensure all card videos run continuously without stutter or pause
    function startCardVideo(v) {
      if (!v) return;
      v.muted = true;
      v.defaultMuted = true;
      v.playsInline = true;
      v.loop = true;
      const playPromise = v.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          const tryPlay = () => {
            v.play().catch(() => {});
          };
          window.addEventListener("scroll", tryPlay, { once: true, passive: true });
          window.addEventListener("pointerdown", tryPlay, { once: true, passive: true });
          window.addEventListener("touchstart", tryPlay, { once: true, passive: true });
        });
      }
    }

    // Start all card videos immediately and when near viewport
    cardVideos.forEach((v) => startCardVideo(v));
    ScrollTrigger.create({
      trigger: ".services",
      start: "top 90%",
      onEnter: () => cardVideos.forEach((v) => startCardVideo(v)),
    });

    const pinEndPercent = Math.max(240, (numSlides - 1) * 85 + 50);
    const svcTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".services-pin",
        pin: true,
        start: "top top",
        end: `+=${pinEndPercent}%`,
        scrub: 1,
        onUpdate: (self) => {
          const p = self.progress;
          // Keep active video running smoothly
          cardVideos.forEach((v) => {
            if (v.paused) v.play().catch(() => {});
          });

          if (card) {
            const rotY = (p - 0.5) * 18;
            const rotX = Math.sin(p * Math.PI * 2) * 3;
            gsap.set(card, { rotateY: rotY, rotateX: rotX, rotateZ: rotY * 0.15 });
          }
        },
      },
    });

    // Dynamic roll transitions for all slides from down to up with changing background poster!
    for (let i = 0; i < numSlides - 1; i++) {
      const t = i * 1.0 + 0.25;
      // Current slide exits upward
      svcTl.to(leftLines[i], { yPercent: -120, opacity: 0, ease: "power2.inOut", duration: 0.7 }, t);
      svcTl.to(rightLines[i], { yPercent: -120, opacity: 0, ease: "power2.inOut", duration: 0.7 }, t);
      svcTl.to(textBgs[i], { yPercent: -120, opacity: 0, ease: "power2.inOut", duration: 0.7 }, t);
      if (posters[i]) {
        svcTl.to(posters[i], { opacity: 0, ease: "power2.inOut", duration: 0.7 }, t);
      }

      // Next slide enters from down to up
      svcTl.to(leftLines[i + 1], { yPercent: 0, opacity: 1, ease: "power2.inOut", duration: 0.75 }, t + 0.05);
      svcTl.to(rightLines[i + 1], { yPercent: 0, opacity: 1, ease: "power2.inOut", duration: 0.75 }, t + 0.05);
      svcTl.to(textBgs[i + 1], { yPercent: 0, opacity: 0.65, ease: "power2.inOut", duration: 0.75 }, t + 0.05);
      if (videoWraps[i + 1]) svcTl.to(videoWraps[i + 1], { clipPath: "inset(0% 0 0 0)", ease: "power2.inOut", duration: 0.8 }, t);
      if (posters[i + 1]) {
        svcTl.to(posters[i + 1], { opacity: 0.85, ease: "power2.inOut", duration: 0.75 }, t + 0.05);
      }
    }

    // Settle on final slide before leaving pin
    svcTl.to({}, { duration: 0.35 }, (numSlides - 1) * 1.0 + 0.05);
  }

  // ---------------------------------------------------------------------------
  // 8. Projects Section (Mahakumbh Reveal & Row Floating Cursor Previews)
  // ---------------------------------------------------------------------------
  const projectStrips = gsap.utils.toArray(".pf-strips img");
  const pfTitle = document.querySelector(".pf-copy h2");
  const pfYear = document.querySelector(".pf-year");

  if (!reduce) {
    if (projectStrips.length) {
      gsap.from(projectStrips, {
        scrollTrigger: {
          trigger: ".project-featured",
          start: "top 75%",
        },
        y: 80,
        opacity: 0,
        duration: 1.1,
        stagger: 0.08,
        ease: "power3.out",
      });
    }

    if (pfTitle) {
      gsap.from(pfTitle, {
        scrollTrigger: {
          trigger: ".project-featured",
          start: "top 75%",
        },
        y: 50,
        opacity: 0,
        duration: 1.0,
        ease: "power3.out",
      });
    }

    if (pfYear) {
      gsap.from(pfYear, {
        scrollTrigger: {
          trigger: ".project-featured",
          start: "top 72%",
        },
        y: 50,
        opacity: 0,
        duration: 1.0,
        delay: 0.1,
        ease: "power3.out",
      });
    }
  }

  // Interactive Floating Cursor Preview for project rows
  const projectRows = gsap.utils.toArray(".project-row");
  if (projectRows.length && !reduce) {
    projectRows.forEach((row) => {
      const preview = row.querySelector(".row-preview");
      if (!preview) return;

      const pxTo = gsap.quickTo(preview, "x", { duration: 0.35, ease: "power3.out" });
      const pyTo = gsap.quickTo(preview, "y", { duration: 0.35, ease: "power3.out" });
      let prevMouseX = 0;

      row.addEventListener("mouseenter", (e) => {
        prevMouseX = e.clientX;
        pxTo(e.clientX);
        pyTo(e.clientY);
        gsap.to(preview, {
          opacity: 1,
          scale: 1,
          duration: 0.35,
          ease: "power3.out",
          overwrite: "auto",
        });
      });

      row.addEventListener("mousemove", (e) => {
        const vx = e.clientX - prevMouseX;
        prevMouseX = e.clientX;
        const tilt = gsap.utils.clamp(-14, 14, vx * 0.45);

        pxTo(e.clientX + 30);
        pyTo(e.clientY - 20);
        gsap.to(preview, { rotation: tilt, duration: 0.2, ease: "power1.out" });
      });

      row.addEventListener("mouseleave", () => {
        gsap.to(preview, {
          opacity: 0,
          scale: 0.8,
          rotation: 0,
          duration: 0.25,
          ease: "power2.in",
          overwrite: "auto",
        });
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 9. Impact Section (Continuous 3D Running Conveyor & High-Speed Rolling Odometer)
  // ---------------------------------------------------------------------------
  const impact = document.querySelector(".impact");
  const impactStrip = document.getElementById("impact-strip");
  const odoPeople = document.getElementById("odo-people");
  const odoInteractions = document.getElementById("odo-interactions");
  const odoSatisfaction = document.getElementById("odo-satisfaction");

  // Function to create vertical tumbler odometer with spinning blur and lock
  const runOdometer = (el, targetNum, duration = 1.6) => {
    if (!el) return;
    el.innerHTML = "";
    const str = targetNum.toString();
    const digitEls = [];

    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (/\d/.test(char)) {
        const col = document.createElement("span");
        col.className = "odo-col";
        col.style.cssText = "display:inline-block; height:1.05em; overflow:hidden; vertical-align:baseline; line-height:1.05em;";

        const ribbon = document.createElement("span");
        ribbon.className = "odo-ribbon";
        ribbon.style.cssText = "display:flex; flex-direction:column; will-change:transform;";

        const targetDigit = parseInt(char, 10);
        // Create repeating reels for rapid spinning tumbler effect
        const rounds = 3 + i * 2;
        let html = "";
        for (let r = 0; r < rounds; r++) {
          for (let d = 0; d <= 9; d++) {
            html += `<span style="height:1.05em; line-height:1.05em; display:block;">${d}</span>`;
          }
        }
        for (let d = 0; d <= targetDigit; d++) {
          html += `<span style="height:1.05em; line-height:1.05em; display:block;">${d}</span>`;
        }
        ribbon.innerHTML = html;
        col.appendChild(ribbon);
        el.appendChild(col);

        const totalItems = rounds * 10 + targetDigit + 1;
        const targetIndex = totalItems - 1;
        digitEls.push({ ribbon, targetIndex, totalItems });
      } else {
        const s = document.createElement("span");
        s.textContent = char;
        el.appendChild(s);
      }
    }

    digitEls.forEach((item, idx) => {
      gsap.fromTo(
        item.ribbon,
        { yPercent: 0 },
        {
          yPercent: -((item.targetIndex / item.totalItems) * 100),
          duration: duration + idx * 0.25,
          ease: "power3.out",
          delay: idx * 0.05,
        }
      );
    });
  };

  let odoTriggered = false;
  const triggerImpactOdometers = () => {
    if (odoTriggered) return;
    odoTriggered = true;
    runOdometer(odoPeople, 1, 1.4);
    runOdometer(odoInteractions, 500, 1.8);
    runOdometer(odoSatisfaction, 100, 2.2);
  };

  // Continuous running images strip in Impact (images running in left continuously in speed)
  if (impactStrip) {
    let stripX = 0;
    const baseSpeed = 1.9; // steady continuous speed
    let extraSpeed = 0;

    if (lenis) {
      lenis.on("scroll", (e) => {
        extraSpeed = Math.min(Math.abs(e.velocity) * 1.8, 24);
      });
    } else {
      let lastY = window.scrollY;
      window.addEventListener(
        "scroll",
        () => {
          const dy = Math.abs(window.scrollY - lastY);
          extraSpeed = Math.min(dy * 0.6, 22);
          lastY = window.scrollY;
        },
        { passive: true }
      );
    }

    const animateImpactConveyor = () => {
      const halfWidth = impactStrip.scrollWidth / 2;
      if (halfWidth > 0) {
        stripX -= baseSpeed + extraSpeed;
        if (stripX <= -halfWidth) {
          stripX += halfWidth;
        }
        impactStrip.style.transform = `translate3d(${stripX}px, -50%, 0)`;
      }
      extraSpeed *= 0.94; // smooth inertia decay
      requestAnimationFrame(animateImpactConveyor);
    };
    requestAnimationFrame(animateImpactConveyor);
  }

  if (impact && !reduce) {
    ScrollTrigger.create({
      trigger: ".impact",
      pin: true,
      start: "top top",
      end: "+=150%",
      onEnter: () => triggerImpactOdometers(),
      onEnterBack: () => triggerImpactOdometers(),
    });
  } else {
    triggerImpactOdometers();
  }

  // ---------------------------------------------------------------------------
  // 10. Gallery Scatter Band (3D Fly-Through Tunnel)
  // ---------------------------------------------------------------------------
  const gallery = document.querySelector(".gallery-band");
  const galleryImgs = gsap.utils.toArray(".gallery-scatter img");
  if (gallery && galleryImgs.length && !reduce) {
    const galleryTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".gallery-band",
        pin: true,
        start: "top top",
        end: "+=180%",
        scrub: 1,
      },
    });

    const scatterCoords = [
      { x: -32, y: -24, zStart: -600, zEnd: 400 },
      { x: 18, y: -28, zStart: -450, zEnd: 550 },
      { x: -16, y: 14, zStart: -300, zEnd: 650 },
      { x: 32, y: 16, zStart: -500, zEnd: 500 },
      { x: -36, y: 8, zStart: -400, zEnd: 600 },
      { x: 8, y: -10, zStart: -700, zEnd: 350 },
      { x: -12, y: -22, zStart: -550, zEnd: 450 },
      { x: 26, y: -6, zStart: -350, zEnd: 700 },
    ];

    galleryImgs.forEach((img, i) => {
      const coord = scatterCoords[i % scatterCoords.length];
      gsap.set(img, {
        xPercent: coord.x * 2.2,
        yPercent: coord.y * 2.2,
        z: coord.zStart,
        scale: 0.6,
        opacity: 0.4,
      });

      galleryTl.to(
        img,
        {
          z: coord.zEnd,
          scale: 1.25,
          opacity: 1,
          ease: "none",
        },
        0
      );
    });
  }

  // ---------------------------------------------------------------------------
  // 11. Awards & Recognitions (3D Fan Arc Deck)
  // ---------------------------------------------------------------------------
  const awards = document.querySelector(".awards-block");
  const awardCards = gsap.utils.toArray(".awards-stack .award-card");
  const awLeft = document.querySelector(".awards-title .aw-left");
  const awRight = document.querySelector(".awards-title .aw-right");
  const awTitle = document.querySelector(".awards-title");

  if (awards && awardCards.length && !reduce && window.innerWidth > 900) {
    // Pin the awards block directly on desktop so subsequent sections NEVER overlap or bleed
    const awardsTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".awards-block",
        pin: true,
        start: "top top",
        end: "+=190%",
        scrub: 1,
        anticipatePin: 1,
      },
    });

    // Realistic card stack initial configuration (cards stacked together in center deck)
    const initialStack = [
      { xPercent: -50, y: 48, rot: -10, scale: 0.92 },
      { xPercent: -50, y: 36, rot: -6,  scale: 0.94 },
      { xPercent: -50, y: 24, rot: -3,  scale: 0.96 },
      { xPercent: -50, y: 14, rot: 0,   scale: 0.98 },
      { xPercent: -50, y: 6,  rot: 2,   scale: 0.99 },
      { xPercent: -50, y: 0,  rot: 4,   scale: 1.0 },
    ];

    // Broad rainbow arc coordinates for all 6 testimonial slides
    const fanParams = [
      { xPercent: -230, y: 70,  rot: -22, scale: 0.96 },
      { xPercent: -145, y: 20,  rot: -13, scale: 0.98 },
      { xPercent: -65,  y: -15, rot: -4,  scale: 1.0 },
      { xPercent: 15,   y: -15, rot: 4,   scale: 1.0 },
      { xPercent: 95,   y: 20,  rot: 13,  scale: 0.98 },
      { xPercent: 180,  y: 70,  rot: 22,  scale: 0.96 },
    ];

    awardCards.forEach((card, i) => {
      const init = initialStack[i] || { xPercent: -50, y: 0, rot: 0, scale: 1 };
      gsap.set(card, {
        xPercent: init.xPercent,
        y: init.y,
        rotation: init.rot,
        scale: init.scale,
        transformOrigin: "center bottom",
      });
    });

    // Animate title: slide in from left and right as section enters
    if (awLeft && awRight) {
      awardsTl.fromTo(awLeft, { x: -120, opacity: 0.3 }, { x: 0, opacity: 1, ease: "power2.out", duration: 0.28 }, 0);
      awardsTl.fromTo(awRight, { x: 120, opacity: 0.3 }, { x: 0, opacity: 1, ease: "power2.out", duration: 0.28 }, 0);
      awardsTl.to(awTitle, { y: -85, opacity: 0.2, ease: "power1.inOut", duration: 0.55 }, 0.45);
    }

    // Fan cards out smoothly into arc
    awardCards.forEach((card, i) => {
      const p = fanParams[i % fanParams.length];

      // Phase 1: cards fan out into the arch
      awardsTl.to(
        card,
        {
          xPercent: p.xPercent,
          y: p.y,
          rotation: p.rot,
          scale: p.scale,
          duration: 0.75,
          ease: "power2.out",
        },
        0.1
      );

      // Phase 2: as user scrolls deeper, fanned cards glide upward smoothly
      awardsTl.to(
        card,
        {
          y: p.y - 150,
          duration: 0.5,
          ease: "power1.inOut",
        },
        0.5
      );

      // Card hover lift with z-index elevation
      card.addEventListener("mouseenter", () => {
        gsap.to(card, {
          y: p.y - 45,
          scale: p.scale * 1.08,
          duration: 0.35,
          ease: "power2.out",
          overwrite: "auto",
        });
      });

      card.addEventListener("mouseleave", () => {
        gsap.to(card, {
          y: p.y,
          scale: p.scale,
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto",
        });
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 12. Trusted By (Our Partners in Success) & Design Process
  // ---------------------------------------------------------------------------
  const partnerCards = gsap.utils.toArray(".partners-logo-grid .partner-card");
  if (partnerCards.length && !reduce) {
    gsap.from(partnerCards, {
      scrollTrigger: {
        trigger: ".trusted",
        start: "top 82%",
      },
      y: 28,
      opacity: 0,
      stagger: 0.045,
      duration: 0.7,
      ease: "power2.out",
    });
  }

  // ---------------------------------------------------------------------------
  // 13. The Grand Closer Red Split Curtains ("DREAM CREATIONS: TURNING YOUR DREAMS...")
  // ---------------------------------------------------------------------------
  const closer = document.getElementById("closer");
  const leftDoor = document.querySelector(".red-split .half.left");
  const rightDoor = document.querySelector(".red-split .half.right");
  const toTopBtn = document.getElementById("to-top");

  if (closer && leftDoor && rightDoor && !reduce) {
    // Initial states: doors open outside screen
    gsap.set(leftDoor, { xPercent: -100 });
    gsap.set(rightDoor, { xPercent: 100 });
    if (toTopBtn) gsap.set(toTopBtn, { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 });

    const closerTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".closer",
        start: "top 60%",
        end: "bottom bottom",
        scrub: 0.35,
      },
    });

    // Slide red curtains shut smoothly as closer fills viewport, locking cleanly at 100% bottom
    closerTl.to(leftDoor, { xPercent: 0, ease: "power2.inOut", duration: 0.85 }, 0);
    closerTl.to(rightDoor, { xPercent: 0, ease: "power2.inOut", duration: 0.85 }, 0);

    // Pop in "Top ↑" button cleanly below curtain tagline
    if (toTopBtn) {
      closerTl.to(
        toTopBtn,
        { xPercent: -50, yPercent: -50, scale: 1, opacity: 1, ease: "back.out(1.8)", duration: 0.35 },
        0.65
      );
    }
  }

  // Scroll to top with Lenis
  toTopBtn?.addEventListener("click", () => {
    if (leftDoor && rightDoor) {
      gsap.to(leftDoor, { xPercent: -100, duration: 0.8, ease: "power3.inOut" });
      gsap.to(rightDoor, { xPercent: 100, duration: 0.8, ease: "power3.inOut" });
    }
    if (lenis) {
      lenis.scrollTo(0, {
        duration: 2.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  // Contact form submission feedback
  const form = document.querySelector(".contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = form.querySelector("button");
      if (btn) {
        const prev = btn.textContent;
        btn.textContent = "✓ Message Sent";
        gsap.fromTo(btn, { scale: 0.95 }, { scale: 1, duration: 0.3 });
        setTimeout(() => (btn.textContent = prev), 2000);
      }
    });
  }

  // Refresh ScrollTrigger once everything is mounted & scroll to URL hash if present
  setTimeout(() => {
    if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
    if (window.location.hash) {
      const target = document.querySelector(window.location.hash);
      if (target) {
        const prevBehavior = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = "auto";
        const top = target.getBoundingClientRect().top + window.scrollY;
        if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
        window.scrollTo({ top, behavior: "instant" });
        document.documentElement.style.scrollBehavior = prevBehavior;
        if (typeof ScrollTrigger !== "undefined") ScrollTrigger.update();
      }
    }
  }, 550);
})();
