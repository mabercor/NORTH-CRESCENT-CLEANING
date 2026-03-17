/**
 * North Crescent Facility Solutions Inc
 * Main JavaScript — Navigation, Animations, Form
 */

(function () {
  'use strict';

  /* ─── Language preference (declared first — used by form handler) ── */
  var currentLang = localStorage.getItem('nc_lang') || 'en';

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
        submitBtn.textContent = currentLang === 'fr' ? 'Envoi en cours…' : 'Sending…';
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
              formSuccess.textContent = currentLang === 'fr'
                ? '✅ Merci! Nous avons reçu votre demande et vous répondrons bientôt.'
                : '✅ Thank you! We received your request and will get back to you shortly.';
              formSuccess.style.display = 'block';
            }
          } else {
            return response.json().then(function (data) {
              var msg =
                data.errors && data.errors.length
                  ? data.errors.map(function (err) { return err.message; }).join(', ')
                  : (currentLang === 'fr'
                      ? 'Une erreur est survenue. Veuillez réessayer.'
                      : 'There was an error sending your message. Please try again.');
              showFormError('⚠️ ' + msg);
            });
          }
        })
        .catch(function () {
          showFormError(currentLang === 'fr'
            ? '⚠️ Erreur réseau. Vérifiez votre connexion et réessayez.'
            : '⚠️ Network error. Please check your connection and try again.');
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = currentLang === 'fr' ? 'Envoyer ma demande →' : 'Send My Request →';
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

  /* ─── Language Toggle (EN ↔ FR) ───────────────────────────── */
  /* currentLang is declared at the top of this IIFE */

  /* key-based translations for [data-i18n] elements */
  var i18n = {
    en: {
      'skip': 'Skip to main content',
      'nav.about': 'About', 'nav.services': 'Services',
      'nav.gallery': 'Gallery',
      'nav.whyus': 'Why Us', 'nav.reviews': 'Reviews',
      'nav.areas': 'Areas', 'nav.contact': 'Contact',
      'nav.cta': 'Get a Free Quote',
      'mobile.about': 'About Us', 'mobile.services': 'Services',
      'mobile.gallery': 'Gallery',
      'mobile.whyus': 'Why Choose Us', 'mobile.reviews': 'Reviews',
      'mobile.areas': 'Service Areas', 'mobile.contact': 'Contact',
      'gallery.label': 'Our Work', 'gallery.heading': 'Real Results, Real Spaces',
      'gallery.subheading': 'From spotless homes to sparkling commercial spaces — see the North Crescent difference for yourself.',
      'gallery.cat1': 'Residential',    'gallery.cap1': 'Residential Cleaning — Moncton, NB',
      'gallery.cat2': 'Exterior',       'gallery.cap2': 'Snow Removal — Residential Exterior',
      'gallery.cat3': 'Post-Construction','gallery.cap3': 'Post-Construction Cleaning — New Build',
      'gallery.cat4': 'Commercial',     'gallery.cap4': 'Commercial Cleaning — Office & Retail',
      'gallery.cat5': 'Institutional',  'gallery.cap5': 'Institutional Cleaning — School & Public Spaces',
      'gallery.cat6': 'Building Services','gallery.cap6': 'Professional Hallway & Common Area Cleaning',
      'gallery.ctaText': 'Every photo represents a satisfied client and a promise kept.',
      'gallery.ctaBtn': 'Book Your Clean Today →',
      'footer.gallery': 'Gallery'
    },
    fr: {
      'skip': 'Passer au contenu principal',
      'nav.about': 'À propos', 'nav.services': 'Services',
      'nav.gallery': 'Galerie',
      'nav.whyus': 'Pourquoi nous', 'nav.reviews': 'Avis',
      'nav.areas': 'Zones', 'nav.contact': 'Contact',
      'nav.cta': 'Devis gratuit',
      'mobile.about': 'À propos de nous', 'mobile.services': 'Services',
      'mobile.gallery': 'Galerie',
      'mobile.whyus': 'Pourquoi nous choisir', 'mobile.reviews': 'Avis',
      'mobile.areas': 'Zones desservies', 'mobile.contact': 'Contact',
      'gallery.label': 'Notre travail', 'gallery.heading': 'Résultats réels, espaces réels',
      'gallery.subheading': 'Des maisons impeccables aux espaces commerciaux étincelants — voyez la différence North Crescent par vous-même.',
      'gallery.cat1': 'Résidentiel',      'gallery.cap1': 'Nettoyage résidentiel — Moncton, NB',
      'gallery.cat2': 'Extérieur',        'gallery.cap2': 'Déneigement — Extérieur résidentiel',
      'gallery.cat3': 'Après construction','gallery.cap3': 'Nettoyage après construction — Nouvelle construction',
      'gallery.cat4': 'Commercial',       'gallery.cap4': 'Nettoyage commercial — Bureau et commerce',
      'gallery.cat5': 'Institutionnel',   'gallery.cap5': 'Nettoyage institutionnel — École et espaces publics',
      'gallery.cat6': 'Services immeuble','gallery.cap6': 'Nettoyage professionnel des couloirs et aires communes',
      'gallery.ctaText': 'Chaque photo représente un client satisfait et une promesse tenue.',
      'gallery.ctaBtn': 'Réservez votre nettoyage →',
      'footer.gallery': 'Galerie'
    }
  };

  /**
   * Replace the largest (by trimmed length) bare text node inside el.
   * Used for elements that mix text with child elements
   * (e.g. hero badge, trust items, FAQ buttons, areas-note).
   */
  function setTextNode(el, text) {
    var best = null;
    Array.prototype.forEach.call(el.childNodes, function (n) {
      if (n.nodeType === 3 &&
          (!best || n.textContent.trim().length > best.textContent.trim().length)) {
        best = n;
      }
    });
    if (best) { best.textContent = ' ' + text + ' '; }
  }

  /* selector-based translations for elements without data-i18n */
  var domTrans = [
    /* ── Hero ──────────────────────────────────────────────── */
    { s: '#hero .hero-badge',
      en: { tn: 'Serving Moncton & Surrounding Area' },
      fr: { tn: 'Desservant Moncton et les environs' } },
    { s: '#hero h1',
      en: { h: 'Spotless Spaces.<br /><span class="accent">Zero Stress.</span><br />Every Single Time.' },
      fr: { h: 'Espaces impeccables.<br /><span class="accent">Zéro stress.</span><br />À chaque visite.' } },
    { s: '.hero-subheadline',
      en: { t: 'From busy family homes to commercial offices and Airbnb rentals — North Crescent Facility Solutions delivers consistent, detail-oriented cleaning so you can focus on what matters most.' },
      fr: { t: 'Des maisons familiales aux bureaux commerciaux et aux locations Airbnb — North Crescent Facility Solutions offre un nettoyage constant et minutieux pour que vous puissiez vous concentrer sur l\'essentiel.' } },
    { s: '#hero .hero-actions .btn-primary',
      en: { t: '✨ Get a Free Quote' }, fr: { t: '✨ Obtenir un devis' } },
    { s: '#hero .btn-outline',
      en: { t: 'View Services' }, fr: { t: 'Voir les services' } },
    { s: '.hero-trust .trust-item:nth-child(1)',
      en: { tn: 'Fully Insured' }, fr: { tn: 'Pleinement assuré' } },
    { s: '.hero-trust .trust-item:nth-child(2)',
      en: { tn: 'Professional Standards' }, fr: { tn: 'Standards professionnels' } },
    { s: '.hero-trust .trust-item:nth-child(3)',
      en: { tn: 'Punctual & Reliable' }, fr: { tn: 'Ponctuel et fiable' } },
    { s: '.hero-trust .trust-item:nth-child(4)',
      en: { tn: 'Fast Response' }, fr: { tn: 'Réponse rapide' } },

    /* ── About ──────────────────────────────────────────────── */
    { s: '#about .section-label',
      en: { t: 'About Us' }, fr: { t: 'À propos de nous' } },
    { s: '#about-heading',
      en: { h: 'Built on Responsibility,<br />Driven by Attention to Detail' },
      fr: { h: 'Fondée sur la responsabilité,<br />guidée par le souci du détail' } },
    { s: '.about-badge .badge-text span',
      en: { t: 'Years of trusted service' }, fr: { t: 'Ans de service de confiance' } },
    { s: '.about-content .lead',
      en: { t: 'At North Crescent Facility Solutions Inc, we believe that a truly clean space isn\'t just about appearances — it\'s about creating an environment where you feel calm, safe, and proud.' },
      fr: { t: 'Chez North Crescent Facility Solutions Inc, nous croyons qu\'un espace vraiment propre ne se résume pas à l\'apparence — il s\'agit de créer un environnement où vous vous sentez calme, en sécurité et fier.' } },
    { s: '.about-content > p:nth-child(4)',
      en: { h: 'Based in Moncton, New Brunswick, we serve homeowners, property managers, businesses, and short-term rental hosts across <strong>Moncton, Dieppe, Riverview, and Shediac</strong>. Our team shows up on time, follows a consistent process, and doesn\'t leave until the job is done right.' },
      fr: { h: 'Basés à Moncton, Nouveau-Brunswick, nous desservons les propriétaires, gestionnaires d\'immeubles, entreprises et hôtes de locations courte durée à travers <strong>Moncton, Dieppe, Riverview et Shediac</strong>. Notre équipe arrive à l\'heure, suit un processus rigoureux et ne part pas avant que le travail soit bien fait.' } },
    { s: '.about-content > p:nth-child(5)',
      en: { t: 'We take full responsibility for every space we enter. You\'ll never have to double-check our work or follow up — because reliability and accountability are at the core of everything we do.' },
      fr: { t: 'Nous assumons l\'entière responsabilité de chaque espace où nous intervenons. Vous n\'aurez jamais à vérifier notre travail — car la fiabilité et l\'imputabilité sont au cœur de tout ce que nous faisons.' } },
    { s: '.value-item:nth-child(1) h4',
      en: { t: 'Attention to Detail' }, fr: { t: 'Souci du détail' } },
    { s: '.value-item:nth-child(1) p',
      en: { t: 'No corner overlooked, no surface skipped.' }, fr: { t: 'Aucun coin oublié, aucune surface ignorée.' } },
    { s: '.value-item:nth-child(2) h4',
      en: { t: 'Fully Insured' }, fr: { t: 'Pleinement assuré' } },
    { s: '.value-item:nth-child(2) p',
      en: { t: 'Peace of mind with every visit.' }, fr: { t: 'Tranquillité d\'esprit à chaque visite.' } },
    { s: '.value-item:nth-child(3) h4',
      en: { t: 'Consistent & Reliable' }, fr: { t: 'Constant et fiable' } },
    { s: '.value-item:nth-child(3) p',
      en: { t: 'Same high standard, every single time.' }, fr: { t: 'Le même niveau élevé, à chaque fois.' } },
    { s: '.value-item:nth-child(4) h4',
      en: { t: 'Eco-Friendly Options' }, fr: { t: 'Options écologiques' } },
    { s: '.value-item:nth-child(4) p',
      en: { t: 'Safe for your family, pets & the planet.' }, fr: { t: 'Sans danger pour votre famille, vos animaux et la planète.' } },

    /* ── Services ───────────────────────────────────────────── */
    { s: '#services .section-label',
      en: { t: 'Our Services' }, fr: { t: 'Nos services' } },
    { s: '#services-heading',
      en: { h: 'Cleaning Solutions Tailored<br />to Every Space &amp; Need' },
      fr: { h: 'Solutions de nettoyage<br />adaptées à chaque espace et besoin' } },
    { s: '#services .section-header > p',
      en: { t: 'Whether you need a quick refresh or a comprehensive deep clean, we have the expertise and the team to deliver outstanding results.' },
      fr: { t: 'Que vous ayez besoin d\'un rafraîchissement rapide ou d\'un nettoyage en profondeur, nous avons l\'expertise et l\'équipe pour offrir des résultats exceptionnels.' } },
    { s: '.services-grid .service-card:nth-child(1) .service-problem',
      en: { t: 'For homeowners who value their time' }, fr: { t: 'Pour les propriétaires qui valorisent leur temps' } },
    { s: '.services-grid .service-card:nth-child(1) h3',
      en: { t: 'Residential Cleaning' }, fr: { t: 'Nettoyage résidentiel' } },
    { s: '.services-grid .service-card:nth-child(1) p:not(.service-problem)',
      en: { t: 'Come home to a spotless, fresh-smelling space without lifting a finger. We handle kitchens, bathrooms, bedrooms, and living areas with meticulous care — so you can reclaim your weekends and enjoy a healthier home.' },
      fr: { t: 'Rentrez chez vous dans un espace impeccable et frais sans lever le petit doigt. Nous nous occupons des cuisines, salles de bain, chambres et salons avec soin — pour que vous profitiez d\'une maison plus saine.' } },
    { s: '.services-grid .service-card:nth-child(2) .service-problem',
      en: { t: 'When surface cleaning just isn\'t enough' }, fr: { t: 'Quand le nettoyage de surface ne suffit pas' } },
    { s: '.services-grid .service-card:nth-child(2) h3',
      en: { t: 'Deep Cleaning' }, fr: { t: 'Nettoyage en profondeur' } },
    { s: '.services-grid .service-card:nth-child(2) p:not(.service-problem)',
      en: { t: 'Grease behind appliances, grime in tile grout, dust in forgotten corners — our deep clean tackles every hidden spot. Ideal for seasonal refresh, after renovations, or a thorough reset from top to bottom.' },
      fr: { t: 'Graisse derrière les appareils, saleté dans les joints, poussière dans les coins oubliés — notre nettoyage en profondeur s\'attaque à chaque recoin. Idéal pour un rafraîchissement saisonnier, après des rénovations ou une remise à neuf complète.' } },
    { s: '.services-grid .service-card:nth-child(3) .service-problem',
      en: { t: 'Protect your deposit — impress the next tenant' }, fr: { t: 'Protégez votre dépôt — impressionnez le prochain locataire' } },
    { s: '.services-grid .service-card:nth-child(3) h3',
      en: { t: 'Move-In / Move-Out Cleaning' }, fr: { t: 'Nettoyage emménagement / déménagement' } },
    { s: '.services-grid .service-card:nth-child(3) p:not(.service-problem)',
      en: { t: 'Moving is already stressful. Let us take cleaning off your plate. We thoroughly clean every room so you can hand back the keys with confidence, recover your full deposit, or welcome new tenants into a pristine property.' },
      fr: { t: 'Déménager est déjà stressant. Laissez-nous prendre en charge le nettoyage. Nous nettoyons chaque pièce en profondeur pour que vous puissiez remettre les clés en toute confiance et récupérer votre dépôt complet.' } },
    { s: '.services-grid .service-card:nth-child(4) .service-problem',
      en: { t: 'For businesses that can\'t afford downtime' }, fr: { t: 'Pour les entreprises qui ne peuvent se permettre d\'interruptions' } },
    { s: '.services-grid .service-card:nth-child(4) h3',
      en: { t: 'Commercial & Office Cleaning' }, fr: { t: 'Nettoyage commercial et de bureaux' } },
    { s: '.services-grid .service-card:nth-child(4) p:not(.service-problem)',
      en: { t: 'A clean office boosts productivity and makes a strong first impression on clients. We work around your schedule — early mornings, evenings, or weekends — to keep your workspace hygienic, professional, and ready for business every day.' },
      fr: { t: 'Un bureau propre augmente la productivité et fait une forte première impression. Nous travaillons selon votre horaire — tôt le matin, le soir ou le week-end — pour garder votre espace de travail hygiénique et prêt chaque jour.' } },
    { s: '.services-grid .service-card:nth-child(5) .service-problem',
      en: { t: 'From construction site to move-in ready' }, fr: { t: 'Du chantier de construction au prêt à emménager' } },
    { s: '.services-grid .service-card:nth-child(5) h3',
      en: { t: 'Post-Construction Cleaning' }, fr: { t: 'Nettoyage après construction' } },
    { s: '.services-grid .service-card:nth-child(5) p:not(.service-problem)',
      en: { t: 'Dust, debris, and adhesive residue left by construction crews can be overwhelming. Our post-construction team removes every trace — surfaces, floors, windows, and fixtures — transforming your newly built or renovated space into a clean, welcoming environment.' },
      fr: { t: 'La poussière, les débris et les résidus laissés par les équipes de construction peuvent être accablants. Notre équipe enlève toute trace — surfaces, planchers, fenêtres et accessoires — transformant votre espace rénové en un environnement propre et accueillant.' } },
    { s: '.services-grid .service-card:nth-child(6) .service-problem',
      en: { t: '5-star turnovers that keep guests coming back' }, fr: { t: 'Rotations 5 étoiles qui fidélisent les clients' } },
    { s: '.services-grid .service-card:nth-child(6) h3',
      en: { t: 'Airbnb / Short-Term Rental Cleaning' }, fr: { t: 'Nettoyage Airbnb / location courte durée' } },
    { s: '.services-grid .service-card:nth-child(6) p:not(.service-problem)',
      en: { t: 'Your ratings depend on cleanliness. We coordinate with your booking calendar to deliver fast, thorough turnovers between guests — fresh linens, stocked essentials, and a hotel-quality presentation that earns 5-star reviews and repeat bookings.' },
      fr: { t: 'Vos évaluations dépendent de la propreté. Nous coordonnons avec votre calendrier pour des rotations rapides et complètes — linge frais, essentiels approvisionnés et une présentation de qualité hôtelière pour des avis 5 étoiles.' } },

    /* ── Why Us ─────────────────────────────────────────────── */
    { s: '#why-us .section-label',
      en: { t: 'Why Choose Us' }, fr: { t: 'Pourquoi nous choisir' } },
    { s: '#why-us-heading',
      en: { t: 'The North Crescent Difference' }, fr: { t: 'La différence North Crescent' } },
    { s: '#why-us .section-header > p',
      en: { t: 'Plenty of companies claim to clean. We prove it with results you can see and a reliability you can count on.' },
      fr: { t: 'Beaucoup d\'entreprises prétendent nettoyer. Nous le prouvons avec des résultats visibles et une fiabilité sur laquelle vous pouvez compter.' } },
    { s: '.why-grid .why-item:nth-child(1) h3',
      en: { t: 'Punctual Every Time' }, fr: { t: 'Ponctuel à chaque fois' } },
    { s: '.why-grid .why-item:nth-child(1) p',
      en: { t: 'We show up when we say we will. Your time is valuable — we respect it with consistent, on-time arrivals and no last-minute cancellations.' },
      fr: { t: 'Nous arrivons quand nous le disons. Votre temps est précieux — nous le respectons avec des arrivées ponctuelles et sans annulations de dernière minute.' } },
    { s: '.why-grid .why-item:nth-child(2) h3',
      en: { t: 'Detail-Oriented Cleaning' }, fr: { t: 'Nettoyage minutieux' } },
    { s: '.why-grid .why-item:nth-child(2) p',
      en: { t: 'We don\'t cut corners — literally. Every edge, every surface, every overlooked spot is part of our standard checklist, not an afterthought.' },
      fr: { t: 'Nous ne coupons pas les coins ronds — littéralement. Chaque bord, chaque surface, chaque endroit négligé fait partie de notre liste de contrôle standard.' } },
    { s: '.why-grid .why-item:nth-child(3) h3',
      en: { t: 'Flexible Scheduling' }, fr: { t: 'Horaires flexibles' } },
    { s: '.why-grid .why-item:nth-child(3) p',
      en: { t: 'Mornings, evenings, weekdays, or weekends — we work around your life and your business needs, not the other way around.' },
      fr: { t: 'Matins, soirs, jours de semaine ou week-ends — nous nous adaptons à votre vie et vos besoins, pas l\'inverse.' } },
    { s: '.why-grid .why-item:nth-child(4) h3',
      en: { t: 'Professional Standards' }, fr: { t: 'Standards professionnels' } },
    { s: '.why-grid .why-item:nth-child(4) p',
      en: { t: 'Our team is trained, vetted, and held to strict quality standards. We treat every home and business as if it were our own.' },
      fr: { t: 'Notre équipe est formée, vérifiée et soumise à des normes de qualité strictes. Nous traitons chaque maison et entreprise comme si c\'était la nôtre.' } },
    { s: '.why-grid .why-item:nth-child(5) h3',
      en: { t: 'Satisfaction Guaranteed' }, fr: { t: 'Satisfaction garantie' } },
    { s: '.why-grid .why-item:nth-child(5) p',
      en: { t: 'Not 100% satisfied? We come back to make it right — no arguments, no extra charge. Your peace of mind is our commitment.' },
      fr: { t: 'Pas 100 % satisfait? Nous revenons corriger — sans discussion, sans frais supplémentaires. Votre tranquillité d\'esprit est notre engagement.' } },
    { s: '.why-grid .why-item:nth-child(6) h3',
      en: { t: 'Fully Insured & Trusted' }, fr: { t: 'Pleinement assuré et de confiance' } },
    { s: '.why-grid .why-item:nth-child(6) p',
      en: { t: 'We are fully insured so you can open your door to us with complete confidence. Your property and privacy are always protected.' },
      fr: { t: 'Nous sommes pleinement assurés pour que vous puissiez nous ouvrir votre porte en toute confiance. Votre propriété et votre vie privée sont toujours protégées.' } },

    /* ── Testimonials ───────────────────────────────────────── */
    { s: '#testimonials .section-label',
      en: { t: 'Client Reviews' }, fr: { t: 'Avis clients' } },
    { s: '#testimonials-heading',
      en: { t: 'What Our Clients Say' }, fr: { t: 'Ce que disent nos clients' } },
    { s: '#testimonials .section-header > p',
      en: { t: 'We let our results speak for themselves — but our clients are happy to speak up too.' },
      fr: { t: 'Nous laissons nos résultats parler d\'eux-mêmes — mais nos clients sont heureux de prendre la parole aussi.' } },
    { s: '.testimonials-cta > p',
      en: { t: 'Join dozens of satisfied homeowners and businesses in the Greater Moncton area.' },
      fr: { t: 'Rejoignez des dizaines de propriétaires et d\'entreprises satisfaits dans la grande région de Moncton.' } },
    { s: '.testimonials-cta .btn-primary',
      en: { t: 'Book Your First Clean →' }, fr: { t: 'Réservez votre premier nettoyage →' } },

    /* ── Service Areas ──────────────────────────────────────── */
    { s: '.areas-list-wrapper .section-label',
      en: { t: 'Service Areas' }, fr: { t: 'Zones desservies' } },
    { s: '#areas-heading',
      en: { t: 'We Come to You' }, fr: { t: 'Nous nous déplaçons chez vous' } },
    { s: '.areas-list-wrapper .subtitle',
      en: { t: 'Based in Moncton, we proudly serve the Greater Moncton region and surrounding communities.' },
      fr: { t: 'Basés à Moncton, nous desservons fièrement la grande région de Moncton et les communautés environnantes.' } },
    { s: '.area-card:nth-child(1) .area-label',
      en: { t: 'HQ City' }, fr: { t: 'Ville principale' } },
    { s: '.area-card:nth-child(2) .area-label',
      en: { t: 'Covered' }, fr: { t: 'Couverte' } },
    { s: '.area-card:nth-child(3) .area-label',
      en: { t: 'Covered' }, fr: { t: 'Couverte' } },
    { s: '.area-card:nth-child(4) .area-label',
      en: { t: 'Covered' }, fr: { t: 'Couverte' } },
    { s: '.areas-note',
      en: { tn: 'Not sure if we cover your area? Call or text us — we may be able to help!' },
      fr: { tn: 'Pas sûr si nous desservons votre zone? Appelez ou écrivez-nous — nous pourrons peut-être vous aider!' } },

    /* ── CTA ────────────────────────────────────────────────── */
    { s: '#cta-heading',
      en: { h: 'Ready for a Cleaner Space<br />and More Free Time?' },
      fr: { h: 'Prêt pour un espace plus propre<br />et plus de temps libre?' } },
    { s: '#cta .cta-content > p',
      en: { t: 'Stop spending your evenings and weekends scrubbing. Let North Crescent Facility Solutions handle the hard work — and give you back the time and energy you deserve.' },
      fr: { t: 'Arrêtez de passer vos soirées et week-ends à frotter. Laissez North Crescent Facility Solutions s\'occuper du travail difficile — et récupérez le temps et l\'énergie que vous méritez.' } },
    { s: '#cta .btn-white',
      en: { t: '🚀 Request Your Free Quote Today' }, fr: { t: '🚀 Demandez votre devis gratuit' } },
    { s: '#cta .btn-outline',
      en: { t: '📞 Call Us Now' }, fr: { t: '📞 Appelez-nous' } },
    { s: '.cta-trust-item:nth-child(1)',
      en: { t: '✅ No obligation' }, fr: { t: '✅ Sans obligation' } },
    { s: '.cta-trust-item:nth-child(2)',
      en: { t: '✅ Fast response' }, fr: { t: '✅ Réponse rapide' } },
    { s: '.cta-trust-item:nth-child(3)',
      en: { t: '✅ Fully insured' }, fr: { t: '✅ Pleinement assuré' } },
    { s: '.cta-trust-item:nth-child(4)',
      en: { t: '✅ Satisfaction guaranteed' }, fr: { t: '✅ Satisfaction garantie' } },

    /* ── Contact ────────────────────────────────────────────── */
    { s: '#contact .section-label',
      en: { t: 'Contact Us' }, fr: { t: 'Contactez-nous' } },
    { s: '#contact-heading',
      en: { t: 'Get Your Free Quote' }, fr: { t: 'Obtenez votre devis gratuit' } },
    { s: '#contact .section-header > p',
      en: { t: 'Fill in the form and we\'ll get back to you within a few hours. Prefer to reach us directly? We\'re just a call, text, or message away.' },
      fr: { t: 'Remplissez le formulaire et nous vous répondrons dans quelques heures. Vous préférez nous contacter directement? Nous sommes à portée d\'un appel ou d\'un message.' } },
    { s: '.contact-info h3',
      en: { t: 'Let\'s Get Your Space Cleaned' }, fr: { t: 'Faisons nettoyer votre espace' } },
    { s: '.contact-info > p',
      en: { t: 'Whether you\'re booking your first clean or need a recurring schedule, we make it simple to get started. Reach out through any channel — we respond fast.' },
      fr: { t: 'Que vous réserviez votre premier nettoyage ou que vous ayez besoin d\'un horaire récurrent, nous facilitons le démarrage. Contactez-nous par n\'importe quel canal — nous répondons rapidement.' } },
    { s: '.contact-item:nth-child(1) .contact-item-text span',
      en: { t: 'Phone / Text / WhatsApp' }, fr: { t: 'Téléphone / SMS / WhatsApp' } },
    { s: '.contact-item:nth-child(2) .contact-item-text span',
      en: { t: 'Email' }, fr: { t: 'Courriel' } },
    { s: '.contact-item:nth-child(3) .contact-item-text span',
      en: { t: 'WhatsApp' }, fr: { t: 'WhatsApp' } },
    { s: '.contact-item:nth-child(3) .contact-item-text a',
      en: { t: 'Message us on WhatsApp' }, fr: { t: 'Écrivez-nous sur WhatsApp' } },
    { s: '.contact-item:nth-child(4) .contact-item-text span:first-child',
      en: { t: 'Location' }, fr: { t: 'Emplacement' } },
    { s: '.contact-form-card h3',
      en: { t: 'Request a Free Quote' }, fr: { t: 'Demander un devis gratuit' } },
    { s: '.form-subtitle',
      en: { t: 'We\'ll respond within a few hours — usually much faster.' },
      fr: { t: 'Nous répondrons dans quelques heures — généralement bien plus vite.' } },
    { s: 'label[for="name"]',
      en: { t: 'Full Name *' }, fr: { t: 'Nom complet *' } },
    { s: '#name',
      en: { p: 'Jane Smith' }, fr: { p: 'Jean Dupont' } },
    { s: 'label[for="phone"]',
      en: { t: 'Phone Number *' }, fr: { t: 'Numéro de téléphone *' } },
    { s: 'label[for="email"]',
      en: { t: 'Email Address *' }, fr: { t: 'Adresse courriel *' } },
    { s: 'label[for="service"]',
      en: { t: 'Service Needed *' }, fr: { t: 'Service requis *' } },
    { s: '#service option[value=""]',
      en: { t: 'Select a service…' }, fr: { t: 'Choisissez un service…' } },
    { s: '#service option[value="Residential Cleaning"]',
      en: { t: 'Residential Cleaning' }, fr: { t: 'Nettoyage résidentiel' } },
    { s: '#service option[value="Deep Cleaning"]',
      en: { t: 'Deep Cleaning' }, fr: { t: 'Nettoyage en profondeur' } },
    { s: '#service option[value="Move-In / Move-Out Cleaning"]',
      en: { t: 'Move-In / Move-Out Cleaning' }, fr: { t: 'Nettoyage emménagement / déménagement' } },
    { s: '#service option[value="Commercial & Office Cleaning"]',
      en: { t: 'Commercial & Office Cleaning' }, fr: { t: 'Nettoyage commercial et de bureaux' } },
    { s: '#service option[value="Post-Construction Cleaning"]',
      en: { t: 'Post-Construction Cleaning' }, fr: { t: 'Nettoyage après construction' } },
    { s: '#service option[value="Airbnb / Short-Term Rental Cleaning"]',
      en: { t: 'Airbnb / Short-Term Rental Cleaning' }, fr: { t: 'Nettoyage Airbnb / location courte durée' } },
    { s: '#service option[value="Other / Not Sure"]',
      en: { t: 'Other / Not Sure' }, fr: { t: 'Autre / Je ne sais pas' } },
    { s: 'label[for="message"]',
      en: { t: 'Additional Details' }, fr: { t: 'Détails supplémentaires' } },
    { s: '#message',
      en: { p: 'Tell us about your space, preferred schedule, or any special requirements…' },
      fr: { p: 'Parlez-nous de votre espace, de l\'horaire préféré ou de toute exigence particulière…' } },
    { s: '#form-submit-btn',
      en: { t: 'Send My Request →' }, fr: { t: 'Envoyer ma demande →' } },
    { s: '.form-note',
      en: { t: '🔒 Your information is safe and will never be shared.' },
      fr: { t: '🔒 Vos informations sont sécurisées et ne seront jamais partagées.' } },

    /* ── FAQ ────────────────────────────────────────────────── */
    { s: '#faq .section-label',
      en: { t: 'FAQ' }, fr: { t: 'FAQ' } },
    { s: '#faq-heading',
      en: { t: 'Frequently Asked Questions' }, fr: { t: 'Questions fréquemment posées' } },
    { s: '#faq .section-header > p',
      en: { h: 'Everything you need to know before booking your first clean. Still have questions? <a href="#contact" class="faq-contact-link">Contact us</a> — we\'re happy to help.' },
      fr: { h: 'Tout ce que vous devez savoir avant de réserver votre premier nettoyage. Vous avez encore des questions? <a href="#contact" class="faq-contact-link">Contactez-nous</a> — nous sommes là pour vous aider.' } },
    { s: '[aria-controls="faq-answer-1"]',
      en: { tn: 'Do I need to be home during the cleaning?' },
      fr: { tn: 'Dois-je être à la maison pendant le nettoyage?' } },
    { s: '#faq-answer-1 p',
      en: { t: 'Not at all! Many of our clients provide us with a key or door code and go about their day. We are fully insured and trusted. Of course, if you prefer to be home, that\'s perfectly fine too.' },
      fr: { t: 'Pas du tout! Beaucoup de nos clients nous laissent une clé ou un code d\'accès et vaquent à leurs occupations. Nous sommes pleinement assurés et dignes de confiance. Si vous préférez être à la maison, c\'est tout à fait acceptable aussi.' } },
    { s: '[aria-controls="faq-answer-2"]',
      en: { tn: 'What cleaning products do you use?' },
      fr: { tn: 'Quels produits de nettoyage utilisez-vous?' } },
    { s: '#faq-answer-2 p',
      en: { t: 'We use professional-grade, effective cleaning products. We also offer eco-friendly and pet-safe options upon request — just let us know when you book and we\'ll bring the right supplies for your home.' },
      fr: { t: 'Nous utilisons des produits de nettoyage professionnels et efficaces. Nous offrons également des options écologiques et sans danger pour les animaux sur demande — indiquez-le simplement lors de votre réservation.' } },
    { s: '[aria-controls="faq-answer-3"]',
      en: { tn: 'How do I get a price / quote?' },
      fr: { tn: 'Comment puis-je obtenir un prix / devis?' } },
    { s: '#faq-answer-3 p',
      en: { h: 'Simply fill out the quote form on this page, call/text us at <a href="tel:+14288880542">(428) 888-0542</a>, or message us on WhatsApp. We\'ll get back to you quickly with a custom quote based on your space and needs — no obligation.' },
      fr: { h: 'Remplissez simplement le formulaire sur cette page, appelez-nous au <a href="tel:+14288880542">(428) 888-0542</a>, ou écrivez-nous sur WhatsApp. Nous vous répondrons rapidement avec un devis personnalisé — sans obligation.' } },
    { s: '[aria-controls="faq-answer-4"]',
      en: { tn: 'How long does a cleaning take?' },
      fr: { tn: 'Combien de temps dure un nettoyage?' } },
    { s: '#faq-answer-4 p',
      en: { t: 'It depends on the size of your space and the type of service. A standard residential clean for a 2-bedroom home typically takes 2–3 hours. A deep clean or move-out clean may take longer. We\'ll give you an estimated time when we provide your quote.' },
      fr: { t: 'Cela dépend de la taille de votre espace et du type de service. Un nettoyage résidentiel standard pour une maison de 2 chambres prend généralement 2 à 3 heures. Un nettoyage en profondeur ou de déménagement peut prendre plus de temps. Nous vous donnerons une estimation lors de votre devis.' } },
    { s: '[aria-controls="faq-answer-5"]',
      en: { tn: 'Are you insured?' },
      fr: { tn: 'Êtes-vous assurés?' } },
    { s: '#faq-answer-5 p',
      en: { t: 'Yes — North Crescent Facility Solutions Inc is fully insured. You can open your door with complete peace of mind knowing that your property is protected on every visit.' },
      fr: { t: 'Oui — North Crescent Facility Solutions Inc est pleinement assurée. Vous pouvez ouvrir votre porte en toute tranquillité d\'esprit, sachant que votre propriété est protégée à chaque visite.' } },
    { s: '[aria-controls="faq-answer-6"]',
      en: { tn: 'What if I\'m not satisfied with the clean?' },
      fr: { tn: 'Que faire si je ne suis pas satisfait du nettoyage?' } },
    { s: '#faq-answer-6 p',
      en: { t: 'Your satisfaction is our commitment. If something isn\'t right, contact us within 24 hours and we\'ll come back to make it right — at no extra charge, no questions asked.' },
      fr: { t: 'Votre satisfaction est notre engagement. Si quelque chose ne va pas, contactez-nous dans les 24 heures et nous reviendrons corriger — sans frais supplémentaires, sans questions.' } },
    { s: '[aria-controls="faq-answer-7"]',
      en: { tn: 'How often should I schedule cleaning?' },
      fr: { tn: 'À quelle fréquence devrais-je planifier le nettoyage?' } },
    { s: '#faq-answer-7 p',
      en: { t: 'It depends on your lifestyle and needs. Most families choose bi-weekly (every 2 weeks) for regular maintenance. Weekly cleaning is popular for busy households or pet owners. Monthly deep cleans are great for lighter-use spaces. We\'ll help you figure out the best schedule.' },
      fr: { t: 'Cela dépend de votre mode de vie. La plupart des familles choisissent bimensuel (toutes les 2 semaines) pour l\'entretien régulier. Le nettoyage hebdomadaire est populaire pour les foyers chargés ou avec des animaux. Nous vous aiderons à trouver le meilleur horaire.' } },
    { s: '[aria-controls="faq-answer-8"]',
      en: { tn: 'Do you bring your own equipment and supplies?' },
      fr: { tn: 'Apportez-vous votre propre équipement et fournitures?' } },
    { s: '#faq-answer-8 p',
      en: { t: 'Yes! We arrive fully equipped with professional-grade tools and all necessary cleaning supplies. You don\'t need to provide anything — just let us in and we\'ll take care of the rest.' },
      fr: { t: 'Oui! Nous arrivons entièrement équipés avec des outils professionnels et toutes les fournitures de nettoyage nécessaires. Vous n\'avez rien à fournir — laissez-nous simplement entrer et nous nous occupons du reste.' } },

    /* ── Footer ─────────────────────────────────────────────── */
    { s: '.footer-brand > p',
      en: { t: 'Professional, reliable, and detail-oriented cleaning services for homes and businesses across the Greater Moncton area.' },
      fr: { t: 'Services de nettoyage professionnels, fiables et minutieux pour les maisons et entreprises de la grande région de Moncton.' } },
    { s: '.footer-col:nth-child(2) h4',
      en: { t: 'Services' }, fr: { t: 'Services' } },
    { s: '.footer-col:nth-child(2) li:nth-child(1) a',
      en: { t: 'Residential Cleaning' }, fr: { t: 'Nettoyage résidentiel' } },
    { s: '.footer-col:nth-child(2) li:nth-child(2) a',
      en: { t: 'Deep Cleaning' }, fr: { t: 'Nettoyage en profondeur' } },
    { s: '.footer-col:nth-child(2) li:nth-child(3) a',
      en: { t: 'Move-In / Move-Out' }, fr: { t: 'Emménagement / Déménagement' } },
    { s: '.footer-col:nth-child(2) li:nth-child(4) a',
      en: { t: 'Commercial Cleaning' }, fr: { t: 'Nettoyage commercial' } },
    { s: '.footer-col:nth-child(2) li:nth-child(5) a',
      en: { t: 'Post-Construction' }, fr: { t: 'Après construction' } },
    { s: '.footer-col:nth-child(2) li:nth-child(6) a',
      en: { t: 'Airbnb Cleaning' }, fr: { t: 'Nettoyage Airbnb' } },
    { s: '.footer-col:nth-child(3) h4',
      en: { t: 'Company' }, fr: { t: 'Entreprise' } },
    { s: '.footer-col:nth-child(3) li:nth-child(1) a',
      en: { t: 'About Us' }, fr: { t: 'À propos de nous' } },
    { s: '.footer-col:nth-child(3) li:nth-child(2) a',
      en: { t: 'Why Choose Us' }, fr: { t: 'Pourquoi nous choisir' } },
    { s: '.footer-col:nth-child(3) li:nth-child(3) a',
      en: { t: 'Reviews' }, fr: { t: 'Avis' } },
    { s: '.footer-col:nth-child(3) li:nth-child(4) a',
      en: { t: 'FAQ' }, fr: { t: 'FAQ' } },
    { s: '.footer-col:nth-child(3) li:nth-child(5) a',
      en: { t: 'Service Areas' }, fr: { t: 'Zones desservies' } },
    { s: '.footer-col:nth-child(3) li:nth-child(6) a',
      en: { t: 'Get a Quote' }, fr: { t: 'Obtenir un devis' } },
    { s: '.footer-col:nth-child(4) h4',
      en: { t: 'Contact' }, fr: { t: 'Contact' } },
    { s: '.footer-bottom-legal',
      en: { t: 'Professional Cleaning Services — Moncton, NB, Canada' },
      fr: { t: 'Services de nettoyage professionnels — Moncton, NB, Canada' } }
  ];

  /* Apply a language to the entire page */
  function applyLang(lang) {
    /* 1. data-i18n keyed elements */
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (i18n[lang] && i18n[lang][key] !== undefined) {
        el.textContent = i18n[lang][key];
      }
    });

    /* 2. selector-based elements */
    domTrans.forEach(function (entry) {
      var els = document.querySelectorAll(entry.s);
      if (!els.length) { return; }
      var val = entry[lang];
      if (!val) { return; }
      els.forEach(function (el) {
        if (val.h !== undefined)  { el.innerHTML   = val.h; }
        else if (val.t !== undefined)  { el.textContent = val.t; }
        else if (val.tn !== undefined) { setTextNode(el, val.tn); }
        else if (val.p !== undefined)  { el.placeholder = val.p; }
      });
    });

    /* 3. Footer copyright (preserve year) */
    var yr = new Date().getFullYear();
    var copyrightEl = document.querySelector('.footer-bottom > p');
    if (copyrightEl) {
      copyrightEl.textContent = lang === 'fr'
        ? '\u00a9 ' + yr + ' North Crescent Facility Solutions Inc. Tous droits r\u00e9serv\u00e9s. Moncton, Nouveau-Brunswick, Canada.'
        : '\u00a9 ' + yr + ' North Crescent Facility Solutions Inc. All rights reserved. Moncton, New Brunswick, Canada.';
    }

    /* 4. html[lang] attribute */
    document.documentElement.lang = lang;

    /* 5. Update toggle button labels */
    var nextLang  = lang === 'en' ? 'fr' : 'en';
    var nextFlag  = lang === 'en' ? '\ud83c\uddeb\ud83c\uddf7' : '\ud83c\uddec\ud83c\udde7';
    var nextLabel = lang === 'en' ? 'FR' : 'EN';
    var nextAria  = lang === 'en'
      ? 'Switch to French / Passer en fran\u00e7ais'
      : 'Switch to English / Passer en anglais';
    [document.getElementById('lang-toggle'),
     document.getElementById('lang-toggle-mobile')].forEach(function (btn) {
      if (!btn) { return; }
      var flagEl  = btn.querySelector('.lang-flag');
      var labelEl = btn.querySelector('.lang-label');
      if (flagEl)  { flagEl.textContent  = nextFlag; }
      if (labelEl) { labelEl.textContent = nextLabel; }
      btn.setAttribute('aria-label', nextAria);
    });

    /* 6. Persist */
    localStorage.setItem('nc_lang', lang);
    currentLang = lang;
  }

  /* Wire up both toggle buttons */
  (function () {
    function toggle() { applyLang(currentLang === 'en' ? 'fr' : 'en'); }
    var btn1 = document.getElementById('lang-toggle');
    var btn2 = document.getElementById('lang-toggle-mobile');
    if (btn1) { btn1.addEventListener('click', toggle); }
    if (btn2) { btn2.addEventListener('click', toggle); }
    /* Apply saved / default language on load */
    applyLang(currentLang);
  }());

  /* ─── Gallery Lightbox ───────────────────────────────────── */
  (function () {
    var lightbox  = document.getElementById('gallery-lightbox');
    var lbImg     = document.getElementById('gallery-lb-img');
    var lbCaption = document.getElementById('gallery-lb-caption');
    var lbClose   = document.getElementById('gallery-lb-close');
    var lbBackdrop = lightbox ? lightbox.querySelector('.gallery-lb-backdrop') : null;

    if (!lightbox) { return; }

    function openLightbox(src, alt, caption) {
      lbImg.src = src;
      lbImg.alt = alt;
      lbCaption.textContent = caption || '';
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      if (lbClose) { lbClose.focus(); }
    }

    function closeLightbox() {
      lightbox.hidden = true;
      document.body.style.overflow = '';
      lbImg.src = '';
    }

    /* Open on gallery item click */
    document.querySelectorAll('.gallery-item').forEach(function (item) {
      item.addEventListener('click', function () {
        var img     = item.querySelector('img');
        var captionKey = currentLang === 'fr' ? 'data-caption-fr' : 'data-caption-en';
        var caption = item.getAttribute(captionKey) || item.getAttribute('data-caption-en') || '';
        if (img) { openLightbox(img.src, img.alt, caption); }
      });
      /* Keyboard: Enter / Space */
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          item.click();
        }
      });
    });

    /* Close button */
    if (lbClose) { lbClose.addEventListener('click', closeLightbox); }

    /* Click on backdrop */
    if (lbBackdrop) { lbBackdrop.addEventListener('click', closeLightbox); }

    /* Escape key */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lightbox.hidden) { closeLightbox(); }
    });
  }());

})();
