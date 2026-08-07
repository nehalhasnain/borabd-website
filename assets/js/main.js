/* BORA — shared behaviour. Vanilla JS, no dependencies. */
(function () {
  'use strict';

  /* ---------------------------------------------------- mobile navigation */
  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('primary-nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? '\u2715' : '\u2630';
    });

    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A' && window.innerWidth <= 860) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = '\u2630';
      }
    });
  }

  /* ------------------------------------------- mark the active nav item */
  function initActiveLink() {
    var here = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('#primary-nav a').forEach(function (a) {
      var target = a.getAttribute('href');
      if (!target) return;
      if (target.split('#')[0] === here) a.setAttribute('aria-current', 'page');
    });
  }

  /* -------------------------------------------------------- form helpers */
  function setError(input, message) {
    var wrapper = input.closest('.field') || input.parentElement;
    var slot = wrapper ? wrapper.querySelector('.field-error') : null;
    if (slot) slot.textContent = message || '';
    input.classList.toggle('invalid', Boolean(message));
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }

  function validate(input) {
    var value = (input.value || '').trim();
    var type = input.type;

    if (input.hasAttribute('required')) {
      if (type === 'checkbox' && !input.checked) return 'This confirmation is required.';
      if (type !== 'checkbox' && !value) return 'This field is required.';
    }
    if (!value) return '';

    if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      return 'Enter a valid email address.';
    }
    if (type === 'url' && !/^https?:\/\/[^\s.]+\.[^\s]{2,}$/.test(value)) {
      return 'Enter a full URL starting with http:// or https://';
    }
    if (type === 'tel' && !/^[0-9+()\-\s]{7,20}$/.test(value)) {
      return 'Enter a valid phone number.';
    }
    if (input.minLength > 0 && value.length < input.minLength) {
      return 'Please write at least ' + input.minLength + ' characters (' + value.length + ' so far).';
    }
    return '';
  }

  function initForms() {
    document.querySelectorAll('form[data-validate]').forEach(function (form) {
      var fields = form.querySelectorAll('input, select, textarea');

      fields.forEach(function (input) {
        input.addEventListener('blur', function () { setError(input, validate(input)); });
        input.addEventListener('input', function () {
          if (input.classList.contains('invalid')) setError(input, validate(input));
        });
      });

      form.addEventListener('submit', function (e) {
        var firstBad = null;

        fields.forEach(function (input) {
          var msg = validate(input);
          setError(input, msg);
          if (msg && !firstBad) firstBad = input;
        });

        if (firstBad) {
          e.preventDefault();
          firstBad.focus();
          firstBad.scrollIntoView({ block: 'center', behavior: 'smooth' });
          return;
        }

        // Form is valid — submit directly to FormSubmit.co endpoint
      });
    });

    // Auto-show success panel if redirected back after submission
    if (window.location.search.indexOf('submitted=true') !== -1) {
      var panel = document.querySelector('.form-success');
      if (panel) {
        panel.classList.add('show');
        panel.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
    });
  }

  /* --------------------------------------- deep-link into intern section */
  function initHashFocus() {
    if (window.location.hash === '#intern-registration') {
      var first = document.querySelector('#intern-registration input');
      if (first) window.setTimeout(function () { first.focus({ preventScroll: true }); }, 350);
    }
  }

  /* ------------------------------------ interactive animated mentorship tree */
  function initHeroTree() {
    var container = document.getElementById('hero-tree');
    var replayBtn = document.getElementById('replay-tree-btn');
    var counterEl = document.getElementById('tree-counter');
    var phaseEl = document.getElementById('tree-phase-text');
    if (!container) return;

    var step2Lines = container.querySelectorAll('.line-step-2');
    var step3Lines = container.querySelectorAll('.line-step-3');
    var step2Nodes = container.querySelectorAll('.node-step-2');
    var step3Nodes = container.querySelectorAll('.node-step-3');
    var step4Node = container.querySelector('.node-step-4');
    var step2Statuses = container.querySelectorAll('.status-step2');
    var timerIds = [];
    var isLooping = true;

    function clearTimers() {
      timerIds.forEach(function (id) { clearTimeout(id); });
      timerIds = [];
    }

    function resetTree() {
      clearTimers();
      step2Lines.forEach(function (el) { el.classList.remove('line-active'); });
      step3Lines.forEach(function (el) { el.classList.remove('line-active'); });
      step2Nodes.forEach(function (el) { el.classList.remove('active-node'); });
      step3Nodes.forEach(function (el) { el.classList.remove('active-node'); });
      if (step4Node) step4Node.classList.remove('active-node');
      step2Statuses.forEach(function (el) { el.textContent = 'Learns \u2192 Publishes'; });
      if (counterEl) counterEl.textContent = '1 Researcher';
      if (phaseEl) phaseEl.textContent = '1 Mentor starts the cohort';
    }

    function runAnimationCycle() {
      resetTree();

      // Step 2: 1 Mentor -> 2 Interns (1000ms)
      timerIds.push(setTimeout(function () {
        step2Lines.forEach(function (el) { el.classList.add('line-active'); });
        step2Nodes.forEach(function (el) { el.classList.add('active-node'); });
        if (counterEl) counterEl.textContent = '3 Researchers';
        if (phaseEl) phaseEl.textContent = '1 Mentor trains 2 interns';
      }, 1000));

      // Step 3: Interns publish & become Mentors -> 4 new Interns (2500ms)
      timerIds.push(setTimeout(function () {
        step2Statuses.forEach(function (el) { el.textContent = 'Published! Now Mentors'; });
        step3Lines.forEach(function (el) { el.classList.add('line-active'); });
        step3Nodes.forEach(function (el) { el.classList.add('active-node'); });
        if (counterEl) counterEl.textContent = '7 Researchers';
        if (phaseEl) phaseEl.textContent = 'Interns publish & return as mentors';
      }, 2500));

      // Step 4: Exponential explosion (4000ms)
      timerIds.push(setTimeout(function () {
        if (step4Node) step4Node.classList.add('active-node');
        if (counterEl) counterEl.textContent = '256+ Researchers';
        if (phaseEl) phaseEl.textContent = 'Exponential self-sustaining growth';
      }, 4000));

      // Schedule next continuous cycle (7500ms)
      timerIds.push(setTimeout(function () {
        if (isLooping) {
          runAnimationCycle();
        }
      }, 7500));
    }

    if (replayBtn) {
      replayBtn.addEventListener('click', function () {
        isLooping = true;
        runAnimationCycle();
      });
    }

    runAnimationCycle();
  }

  /* ------------------------------------------------ current year in footer */
  function initYear() {
    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initActiveLink();
    initForms();
    initHashFocus();
    initHeroTree();
    initYear();
  });
})();
