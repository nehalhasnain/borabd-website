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
        e.preventDefault();
        var firstBad = null;

        fields.forEach(function (input) {
          var msg = validate(input);
          setError(input, msg);
          if (msg && !firstBad) firstBad = input;
        });

        if (firstBad) {
          firstBad.focus();
          firstBad.scrollIntoView({ block: 'center', behavior: 'smooth' });
          return;
        }

        // No backend yet — collect the payload so it can be wired to
        // Supabase / Google Forms / Formspree later without renaming fields.
        var payload = {};
        new FormData(form).forEach(function (v, k) {
          if (payload[k] === undefined) payload[k] = v;
          else if (Array.isArray(payload[k])) payload[k].push(v);
          else payload[k] = [payload[k], v];
        });
        console.info('[BORA] ' + (form.dataset.formName || form.id) + ' submission (demo, not sent):', payload);

        var panel = form.querySelector('.form-success');
        if (panel) {
          panel.classList.add('show');
          panel.setAttribute('role', 'status');
          panel.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
        form.reset();
        fields.forEach(function (input) { setError(input, ''); });
      });
    });
  }

  /* --------------------------------------- deep-link into intern section */
  function initHashFocus() {
    if (window.location.hash === '#intern-registration') {
      var first = document.querySelector('#intern-registration input');
      if (first) window.setTimeout(function () { first.focus({ preventScroll: true }); }, 350);
    }
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
    initYear();
  });
})();
