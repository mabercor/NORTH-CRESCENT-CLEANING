/**
 * North Crescent Facility Solutions Inc
 * Main JavaScript — Navigation, Animations, Form
 */

(function () {
  'use strict';

  /* ─── Navbar scroll behaviour ─────────────────────────── */
  const navbar = document.getElementById('navbar');

  function handleNavbarScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  /* ─── Mobile menu ──────────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileClose = document.getElementById('mobile-close');
  const mobileLinks = document.querySelectorAll('.mobile-menu a');

  function openMenu() {
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    /* Move focus inside the menu */
    var firstFocusable = mobileMenu.querySelector('button, a, [tabindex="0"]');
    if (firstFocusable) firstFocusable.focus();
  }

  function closeMenu() {
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.focus();
  }

  /* Trap focus inside mobile menu while open */
  if (mobileMenu) {
    mobileMenu.addEventListener('keydown', function (e) {
      if (!mobileMenu.classList.contains('open')) return;
      var focusable = Array.from(mobileMenu.querySelectorAll('button, a, [tabindex="0"]'));
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
      if (e.key === 'Escape') {
        closeMenu();
      }
    });
  }

  if (hamburger) hamburger.addEventListener('click', openMenu);
  if (mobileClose) mobileClose.addEventListener('click', closeMenu);
  mobileLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  /* ─── Scroll-to-top button ─────────────────────────────── */
  var scrollTopBtn = document.getElementById('scroll-top');

  function handleScrollTop() {
    if (window.scrollY > 400) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  }

  if (scrollTopBtn) {
    window.addEventListener('scroll', handleScrollTop, { passive: true });
    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ─── Intersection Observer for fade-in animations ─────── */
  var fadeElements = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    fadeElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    /* Fallback: show all elements immediately */
    fadeElements.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ─── Smooth scroll for anchor links ─────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        var navHeight = navbar ? navbar.offsetHeight : 70;
        var top = targetEl.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  /* ─── Active nav link highlight ───────────────────────────── */
  var sections = document.querySelectorAll('section[id]');
  var navLinksAll = document.querySelectorAll('.nav-links a');

  function setActiveLink() {
    var scrollPos = window.scrollY + 100;
    sections.forEach(function (section) {
      var top = section.offsetTop;
      var bottom = top + section.offsetHeight;
      var id = section.getAttribute('id');
      if (scrollPos >= top && scrollPos < bottom) {
        navLinksAll.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', setActiveLink, { passive: true });

  /* ─── Contact form — Formspree submission ──────────────────── */
  var contactForm = document.getElementById('contact-form');
  var formSuccess = document.getElementById('form-success');
  var formError = document.getElementById('form-error');
  var submitBtn = document.getElementById('form-submit-btn');

  function showFormError(msg) {
    if (formError) {
      formError.textContent = msg;
      formError.style.display = 'block';
    }
  }

  function clearFormError() {
    if (formError) {
      formError.textContent = '';
      formError.style.display = 'none';
    }
  }

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearFormError();

      var formData = new FormData(contactForm);

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }

      fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      })
        .then(function (response) {
          if (response.ok) {
            contactForm.reset();
            contactForm.style.display = 'none';
            if (formSuccess) {
              formSuccess.textContent = '✅ Thank you! We received your request and will get back to you shortly.';
              formSuccess.style.display = 'block';
            }
          } else {
            return response.json().then(function (data) {
              var msg =
                data.errors && data.errors.length
                  ? data.errors.map(function (err) { return err.message; }).join(', ')
                  : 'There was an error sending your message. Please try again.';
              showFormError('⚠️ ' + msg);
            });
          }
        })
        .catch(function () {
          showFormError('⚠️ Network error. Please check your connection and try again.');
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send My Request →';
          }
        });
    });
  }

  /* ─── Year in footer ───────────────────────────────────── */
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ─── FAQ accordion ─────────────────────────────────────── */
  var faqButtons = document.querySelectorAll('.faq-question');

  faqButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      var answerId = btn.getAttribute('aria-controls');
      var answer = document.getElementById(answerId);

      /* Close all other open items first */
      faqButtons.forEach(function (other) {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          var otherId = other.getAttribute('aria-controls');
          var otherAnswer = document.getElementById(otherId);
          if (otherAnswer) otherAnswer.hidden = true;
          var icon = other.querySelector('.faq-icon');
          if (icon) icon.textContent = '+';
        }
      });

      /* Toggle the clicked item */
      var nowExpanded = !expanded;
      btn.setAttribute('aria-expanded', String(nowExpanded));
      if (answer) answer.hidden = !nowExpanded;
      var btnIcon = btn.querySelector('.faq-icon');
      if (btnIcon) btnIcon.textContent = nowExpanded ? '−' : '+';
    });
  });
})();
