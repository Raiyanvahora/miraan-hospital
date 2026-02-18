/* ============================================
   Miraan Children & ENT Hospital — script.js
   Mobile-optimized interactions
   ============================================ */

(function () {
  'use strict';

  /* ------------------------------------------
     HELPERS — scroll lock for mobile
     ------------------------------------------ */
  var scrollPos = 0;

  function lockScroll() {
    scrollPos = window.pageYOffset;
    document.body.classList.add('modal-open');
    document.body.style.top = -scrollPos + 'px';
  }

  function unlockScroll() {
    document.body.classList.remove('modal-open');
    document.body.style.top = '';
    window.scrollTo(0, scrollPos);
  }


  /* ------------------------------------------
     1. DEPARTMENT SWITCHER
     ------------------------------------------ */

  // ====== DEPARTMENT DATA — edit services, hours, and visit reasons here ======
  var deptData = {
    children: {
      services: [
        'Newborn & Infant Care',
        'Vaccination & Immunization',
        'Growth & Development Monitoring',
        'Pediatric Infections & Fever',
        'Child Nutrition Counseling',
        'Developmental & Behavioral Assessment',
      ],
      hours:
        'Pediatric consultations available Mon–Sat, 9 AM – 1 PM & 5 PM – 8 PM. Emergency cases accepted 24/7.',
      visit: [
        'Fever persisting beyond 2–3 days',
        'Delayed milestones or speech',
        'Frequent colds or infections',
        'Feeding or weight-gain difficulties',
        'Skin rashes or allergic reactions',
      ],
    },
    ent: {
      services: [
        'Ear Infection & Discharge Treatment',
        'Hearing Assessment & Audiometry',
        'Tonsil & Adenoid Evaluation',
        'Sinus & Nasal Allergy Care',
        'Voice & Throat Disorders',
        'Foreign Body Removal (Ear/Nose/Throat)',
      ],
      hours:
        'ENT specialist available Mon–Sat, 10 AM – 1 PM & 4 PM – 7 PM. Emergencies handled round the clock.',
      visit: [
        'Ear pain, itching, or discharge',
        'Hearing difficulty or ringing',
        'Snoring or mouth breathing in children',
        'Recurrent sore throat or tonsillitis',
        'Nasal blockage or nosebleeds',
      ],
    },
  };

  var tabBtns = document.querySelectorAll('.dept-tab');
  var servicesList = document.getElementById('deptServicesList');
  var hoursEl = document.getElementById('deptHours');
  var visitList = document.getElementById('deptVisitList');
  var deptPanel = document.getElementById('dept-panel');

  function renderDept(key) {
    var dept = deptData[key];
    if (!dept) return;

    servicesList.innerHTML = dept.services
      .map(function (s) { return '<li>' + s + '</li>'; })
      .join('');

    hoursEl.textContent = dept.hours;

    visitList.innerHTML = dept.visit
      .map(function (v) { return '<li>' + v + '</li>'; })
      .join('');

    tabBtns.forEach(function (btn) {
      var isActive = btn.getAttribute('data-dept') === key;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    deptPanel.className = 'dept-panel dept-' + key;
  }

  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      renderDept(btn.getAttribute('data-dept'));
    });
  });

  renderDept('children');


  /* ------------------------------------------
     2. SYMPTOM-TO-ACTION WIDGET
     ------------------------------------------ */

  // ====== SYMPTOM DATA — edit urgency, advice, and labels here ======
  var symptomData = {
    fever: {
      urgency: 'normal',
      label: 'Normal',
      advice:
        'Monitor your child\'s temperature and keep them hydrated. If the fever persists beyond 48 hours, exceeds 102\u00B0F (39\u00B0C), or the child becomes lethargic, schedule a visit with our pediatrician.',
    },
    'ear-pain': {
      urgency: 'same-day',
      label: 'Same Day',
      advice:
        'Ear pain \u2014 especially in children \u2014 can indicate an infection that needs prompt treatment. Avoid inserting anything into the ear. Book a same-day visit with our ENT specialist for evaluation.',
    },
    'sore-throat': {
      urgency: 'normal',
      label: 'Normal',
      advice:
        'A sore throat could be viral or may point to tonsillitis or strep infection. Gargle with warm salt water for relief. If it lasts more than 2 days or is accompanied by fever, visit our clinic.',
    },
    breathing: {
      urgency: 'emergency',
      label: 'Emergency',
      advice:
        'Difficulty breathing requires immediate medical attention. If your child is struggling to breathe, has blue lips, or is wheezing severely, do not wait \u2014 call us or come to the hospital right away.',
    },
    'cold-cough': {
      urgency: 'normal',
      label: 'Normal',
      advice:
        'Colds and coughs are common in children, especially during weather changes. Ensure rest, warm fluids, and steam inhalation. If symptoms persist beyond 5 days or worsen, visit our pediatrician.',
    },
  };

  var symptomBtns = document.querySelectorAll('.symptom-btn');
  var symptomResult = document.getElementById('symptomResult');
  var urgencyTag = document.getElementById('urgencyTag');
  var symptomAdvice = document.getElementById('symptomAdvice');

  symptomBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-symptom');
      var data = symptomData[key];
      if (!data) return;

      symptomBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      urgencyTag.textContent = data.label;
      urgencyTag.className = 'urgency-tag urgency-' + data.urgency;
      symptomAdvice.textContent = data.advice;
      symptomResult.hidden = false;

      // Re-trigger animation
      symptomResult.style.animation = 'none';
      void symptomResult.offsetHeight;
      symptomResult.style.animation = '';

      // Scroll result into view on mobile
      setTimeout(function () {
        symptomResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    });
  });


  /* ------------------------------------------
     3. APPOINTMENT MODAL
     ------------------------------------------ */
  var modal = document.getElementById('apptModal');
  var modalFormWrap = document.getElementById('modalFormWrap');
  var modalSuccess = document.getElementById('modalSuccess');
  var apptForm = document.getElementById('apptForm');

  // Open modal — any element with [data-open-modal]
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-open-modal]');
    if (trigger) {
      e.preventDefault();
      openModal();
    }
  });

  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalDone').addEventListener('click', closeModal);

  // Close on overlay click (not on card itself)
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

  function openModal() {
    modalFormWrap.hidden = false;
    modalSuccess.hidden = true;
    apptForm.reset();
    clearErrors();

    // Close mobile nav if open
    closeNav();

    modal.hidden = false;
    void modal.offsetHeight;
    modal.classList.add('visible');
    lockScroll();

    setTimeout(function () {
      var first = apptForm.querySelector('input, select');
      if (first) first.focus();
    }, 350); /* Wait for slide-up animation */
  }

  function closeModal() {
    modal.classList.remove('visible');
    unlockScroll();
    setTimeout(function () {
      modal.hidden = true;
    }, 300);
  }

  // Validation
  function validateField(input) {
    var name = input.name;
    var val = input.value.trim();
    var errEl = document.getElementById(
      'err' + name.charAt(0).toUpperCase() + name.slice(1)
    );
    if (!errEl) return true;

    var msg = '';
    if (input.required && !val) {
      msg = 'This field is required.';
    } else if (name === 'phone' && val && !/^[0-9]{10}$/.test(val)) {
      msg = 'Enter a valid 10-digit phone number.';
    } else if (name === 'name' && val && val.length < 2) {
      msg = 'Name must be at least 2 characters.';
    } else if (name === 'age' && val && !/\d/.test(val)) {
      msg = 'Please include the age (e.g. "4 years").';
    }

    errEl.textContent = msg;
    input.classList.toggle('invalid', !!msg);
    return !msg;
  }

  function clearErrors() {
    apptForm.querySelectorAll('.field-error').forEach(function (el) {
      el.textContent = '';
    });
    apptForm.querySelectorAll('.invalid').forEach(function (el) {
      el.classList.remove('invalid');
    });
  }

  apptForm.querySelectorAll('input, select').forEach(function (input) {
    input.addEventListener('blur', function () { validateField(input); });
  });

  apptForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var fields = apptForm.querySelectorAll('input[required], select[required]');
    var allValid = true;
    fields.forEach(function (input) {
      if (!validateField(input)) allValid = false;
    });
    if (!allValid) return;

    modalFormWrap.hidden = true;
    modalSuccess.hidden = false;
  });


  /* ------------------------------------------
     4. QUICK APPOINTMENT FORM (hero card)
     ------------------------------------------ */
  var quickForm = document.getElementById('quickApptForm');

  quickForm.addEventListener('submit', function (e) {
    e.preventDefault();

    var nameInput = quickForm.querySelector('[name="name"]');
    var phoneInput = quickForm.querySelector('[name="phone"]');
    var concernInput = quickForm.querySelector('[name="concern"]');
    var valid = true;

    if (!nameInput.value.trim()) {
      nameInput.classList.add('invalid'); valid = false;
    } else { nameInput.classList.remove('invalid'); }

    if (!phoneInput.value.trim() || !/^[0-9]{10}$/.test(phoneInput.value.trim())) {
      phoneInput.classList.add('invalid'); valid = false;
    } else { phoneInput.classList.remove('invalid'); }

    if (!concernInput.value) {
      concernInput.classList.add('invalid'); valid = false;
    } else { concernInput.classList.remove('invalid'); }

    if (!valid) return;

    openModal();

    // Pre-fill the full modal form
    setTimeout(function () {
      var apptName = document.getElementById('apptName');
      var apptPhone = document.getElementById('apptPhone');
      var apptConcern = document.getElementById('apptConcern');
      if (apptName) apptName.value = nameInput.value.trim();
      if (apptPhone) apptPhone.value = phoneInput.value.trim();
      if (apptConcern) {
        apptConcern.querySelectorAll('option').forEach(function (opt) {
          if (opt.value === concernInput.value) apptConcern.value = opt.value;
        });
      }
    }, 50);
  });


  /* ------------------------------------------
     5. MOBILE NAV — full overlay with scroll lock
     ------------------------------------------ */
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('mainNav');
  var navOpen = false;

  function openNav() {
    navOpen = true;
    navToggle.setAttribute('aria-expanded', 'true');
    mainNav.classList.add('open');
    document.body.classList.add('nav-open');
    // Store scroll position
    document.body.style.top = -window.pageYOffset + 'px';
  }

  function closeNav() {
    if (!navOpen) return;
    navOpen = false;
    navToggle.setAttribute('aria-expanded', 'false');
    mainNav.classList.remove('open');
    // Restore scroll
    var top = parseInt(document.body.style.top || '0', 10);
    document.body.classList.remove('nav-open');
    document.body.style.top = '';
    window.scrollTo(0, Math.abs(top));
  }

  navToggle.addEventListener('click', function () {
    if (navOpen) { closeNav(); } else { openNav(); }
  });

  // Close nav when clicking a link
  mainNav.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', closeNav);
  });

  // Close nav on outside click (tap on overlay area)
  document.addEventListener('click', function (e) {
    if (navOpen && !mainNav.contains(e.target) && !navToggle.contains(e.target)) {
      closeNav();
    }
  });

  // Close nav on back button / hash change
  window.addEventListener('hashchange', closeNav);


  /* ------------------------------------------
     6. FLOATING CTA — show after scrolling past hero
     ------------------------------------------ */
  var floatingCta = document.getElementById('floatingCta');
  var hero = document.getElementById('hero');

  function checkScroll() {
    if (!hero || !floatingCta) return;
    var heroBottom = hero.getBoundingClientRect().bottom;
    floatingCta.classList.toggle('visible', heroBottom < 0);
  }

  window.addEventListener('scroll', checkScroll, { passive: true });
  checkScroll();


  /* ------------------------------------------
     7. HEADER SHADOW ON SCROLL
     ------------------------------------------ */
  var header = document.getElementById('siteHeader');

  function headerShadow() {
    if (!header) return;
    header.style.boxShadow =
      window.scrollY > 10 ? '0 2px 12px rgba(28,25,23,.08)' : 'none';
  }

  window.addEventListener('scroll', headerShadow, { passive: true });
  headerShadow();


  /* ------------------------------------------
     8. VIEWPORT HEIGHT FIX (iOS Safari)
     Sets --vh custom property for true viewport height
     ------------------------------------------ */
  function setVH() {
    var vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', vh + 'px');
  }
  setVH();
  window.addEventListener('resize', setVH);
})();
