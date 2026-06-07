/**
 * LocalRank Pro — app.js
 */

(function () {
  'use strict';

  // 1. NAVBAR

  (function initNavbar() {
    const siteHeader = document.getElementById('navbar');   // site-header element
    const hamburger  = document.getElementById('hamburger-btn');
    const navEl      = document.getElementById('primary-nav');

    if (!siteHeader || !hamburger || !navEl) return;

    // Scroll: smoothly ramp navbar opacity from 0 → 1 over the first 80px of scroll
    const RAMP_PX = 80; // px over which navbar fades from transparent to full white
    const onScroll = function () {
      const y = window.scrollY;
      const t = Math.min(y / RAMP_PX, 1);            // 0 … 1

      // Toggle .scrolled class so the CSS transition takes over at top
      if (t >= 1) {
        siteHeader.classList.add('scrolled');
        // Clear inline styles so CSS rules take over cleanly
        const navbar = siteHeader.querySelector('.navbar');
        if (navbar) {
          navbar.style.background  = '';
          navbar.style.borderColor = '';
          navbar.style.boxShadow   = '';
        }
      } else {
        siteHeader.classList.remove('scrolled');
        // Manually drive the opacity in the transition zone
        const navbar = siteHeader.querySelector('.navbar');
        if (navbar) {
          navbar.style.background    = `rgba(255,255,255,${t})`;
          navbar.style.borderColor   = `rgba(209,218,255,${t})`;
          navbar.style.boxShadow     = t > 0
            ? `0 2px ${Math.round(t * 16)}px rgba(0,23,69,${t * 0.07})`
            : 'none';
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Hamburger toggle — toggle on site-header
    hamburger.addEventListener('click', function () {
      const isOpen = siteHeader.classList.toggle('nav-open');
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close mobile nav when a nav link is clicked
    const navLinks = navEl.querySelectorAll('.nav-link');
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        siteHeader.classList.remove('nav-open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    // Close mobile nav on outside click
    document.addEventListener('click', function (e) {
      if (siteHeader.classList.contains('nav-open') &&
          !siteHeader.contains(e.target)) {
        siteHeader.classList.remove('nav-open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }());

  // 2. STAT COUNTER ANIMATION

  (function initStatCounters() {
    const statEls = document.querySelectorAll('.stat__number[data-target]');
    if (!statEls.length) return;

    // Animate a number from 0 to target

    function animateCounter(el) {
      const target   = parseInt(el.getAttribute('data-target'), 10);
      const duration = 1600;
      const start    = performance.now();

      function step(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased    = 1 - Math.pow(1 - progress, 3);
        const current  = Math.round(eased * target);

        el.textContent = current;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target;
        }
      }

      requestAnimationFrame(step);
    }

    // Special case: stat-rating shows "4.8" not "48"
    const ratingEl = document.getElementById('stat-rating');

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);

          if (entry.target === ratingEl) {
            // Animate 0 → 48 then display as 4.8
            const el       = entry.target;
            const target   = 48;
            const duration = 1600;
            const start    = performance.now();

            function step(now) {
              const elapsed  = now - start;
              const progress = Math.min(elapsed / duration, 1);
              const eased    = 1 - Math.pow(1 - progress, 3);
              const current  = Math.round(eased * target);
              el.textContent = (current / 10).toFixed(1);
              if (progress < 1) requestAnimationFrame(step);
            }

            requestAnimationFrame(step);
          } else {
            animateCounter(entry.target);
          }
        });
      }, { threshold: 0.3 });

      statEls.forEach(function (el) { observer.observe(el); });
    } else {
      // Fallback: set values without animation
      statEls.forEach(function (el) {
        const target = parseInt(el.getAttribute('data-target'), 10);
        if (el === ratingEl) {
          el.textContent = '4.8';
        } else {
          el.textContent = target;
        }
      });
    }
  }());

  // 3. SCROLL REVEAL ANIMATIONS

  (function initReveal() {
    // Mark elements for reveal
    const revealTargets = [
      '.service-card',
      '.why-card',
      '.process-step',
      '.big-stat',
      '.case-card',
      '.testimonial-card',
      '.pricing-card',
      '.faq-item',
      '.section-header',
    ];

    revealTargets.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el, i) {
        el.classList.add('reveal');
        const delay = Math.min(i, 5);
        if (delay > 0) el.classList.add('reveal-delay-' + delay);
      });
    });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

      document.querySelectorAll('.reveal').forEach(function (el) {
        observer.observe(el);
      });
    } else {
      // Fallback: reveal everything immediately
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('visible');
      });
    }
  }());

  // 4. PRICING TOGGLE

  (function initPricingToggle() {
    const monthlyBtn  = document.getElementById('toggle-monthly');
    const yearlyBtn   = document.getElementById('toggle-yearly');
    const priceAmounts = document.querySelectorAll('.price-amount');

    if (!monthlyBtn || !yearlyBtn || !priceAmounts.length) return;

    function setMode(mode) {
      priceAmounts.forEach(function (el) {
        const monthly = el.getAttribute('data-monthly');
        const yearly  = el.getAttribute('data-yearly');

        if (!monthly || !yearly) return;

        // Animate price change
        el.style.opacity   = '0';
        el.style.transform = 'translateY(-8px)';

        setTimeout(function () {
          // Use textContent — secure
          el.textContent = mode === 'monthly' ? monthly : yearly;
          el.style.opacity   = '1';
          el.style.transform = 'translateY(0)';
        }, 150);
      });

      if (mode === 'monthly') {
        monthlyBtn.classList.add('toggle-btn--active');
        yearlyBtn.classList.remove('toggle-btn--active');
        monthlyBtn.setAttribute('aria-pressed', 'true');
        yearlyBtn.setAttribute('aria-pressed', 'false');
      } else {
        yearlyBtn.classList.add('toggle-btn--active');
        monthlyBtn.classList.remove('toggle-btn--active');
        yearlyBtn.setAttribute('aria-pressed', 'true');
        monthlyBtn.setAttribute('aria-pressed', 'false');
      }
    }

    // Smooth price transition
    priceAmounts.forEach(function (el) {
      el.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
    });

    monthlyBtn.addEventListener('click', function () { setMode('monthly'); });
    yearlyBtn.addEventListener('click',  function () { setMode('yearly');  });
  }());

  // 5. FAQ ACCORDION

  (function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(function (item) {
      const btn    = item.querySelector('.faq-item__question');
      const answer = item.querySelector('.faq-item__answer');

      if (!btn || !answer) return;

      btn.addEventListener('click', function () {
        const isExpanded = btn.getAttribute('aria-expanded') === 'true';

        // Close all others
        faqItems.forEach(function (other) {
          const ob = other.querySelector('.faq-item__question');
          const oa = other.querySelector('.faq-item__answer');
          if (ob && oa && ob !== btn) {
            ob.setAttribute('aria-expanded', 'false');
            oa.setAttribute('hidden', '');
          }
        });

        // Toggle this one
        if (isExpanded) {
          btn.setAttribute('aria-expanded', 'false');
          answer.setAttribute('hidden', '');
        } else {
          btn.setAttribute('aria-expanded', 'true');
          answer.removeAttribute('hidden');
        }
      });
    });
  }());

  // 6. CONTACT FORM VALIDATION

  (function initContactForm() {
    const form        = document.getElementById('contact-form');
    const successEl   = document.getElementById('form-success');
    const submitBtn   = document.getElementById('form-submit-btn');

    if (!form || !successEl || !submitBtn) return;

    /* ---- Validation helpers ---- */

    function setError(inputId, errorId, message) {
      const input = document.getElementById(inputId);
      const error = document.getElementById(errorId);
      if (!input || !error) return;

      input.classList.add('error');
      error.textContent = message;
      input.setAttribute('aria-describedby', errorId);
    }

    function clearError(inputId, errorId) {
      const input = document.getElementById(inputId);
      const error = document.getElementById(errorId);
      if (!input || !error) return;

      input.classList.remove('error');
      error.textContent = '';
      input.removeAttribute('aria-describedby');
    }

    function isValidEmail(value) {
      // RFC 5321-simplified allow-list pattern
      return /^[^\s@]{1,64}@[^\s@]{1,253}\.[^\s@]{2,}$/.test(value);
    }

    function isValidUrl(value) {
      if (!value) return true; // URL is optional
      try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch (_) {
        return false;
      }
    }

    function validateForm() {
      let valid = true;

      // Name
      const name = document.getElementById('field-name');
      clearError('field-name', 'error-name');
      if (!name || !name.value.trim()) {
        setError('field-name', 'error-name', 'Please enter your name.');
        valid = false;
      } else if (name.value.trim().length > 100) {
        setError('field-name', 'error-name', 'Name must be 100 characters or fewer.');
        valid = false;
      }

      // Email
      const email = document.getElementById('field-email');
      clearError('field-email', 'error-email');
      if (!email || !email.value.trim()) {
        setError('field-email', 'error-email', 'Please enter your email address.');
        valid = false;
      } else if (!isValidEmail(email.value.trim())) {
        setError('field-email', 'error-email', 'Please enter a valid email address.');
        valid = false;
      }

      // City
      const city = document.getElementById('field-city');
      clearError('field-city', 'error-city');
      if (!city || !city.value.trim()) {
        setError('field-city', 'error-city', 'Please enter your city.');
        valid = false;
      }

      // Website (optional but must be valid URL if provided)
      const website = document.getElementById('field-website');
      clearError('field-website', 'error-website');
      if (website && website.value.trim() && !isValidUrl(website.value.trim())) {
        setError('field-website', 'error-website', 'Please enter a valid URL (e.g. https://mybusiness.com).');
        valid = false;
      }

      // Business type
      const btype = document.getElementById('field-type');
      clearError('field-type', 'error-type');
      if (!btype || !btype.value) {
        setError('field-type', 'error-type', 'Please select your business type.');
        valid = false;
      }

      return valid;
    }

    // Real-time clear errors on input
    ['field-name',    'field-email',
     'field-city',   'field-website',
     'field-type'].forEach(function (id) {
      const el = document.getElementById(id);
      if (!el) return;

      const errorId = 'error-' + id.replace('field-', '');
      el.addEventListener('input', function () {
        clearError(id, errorId);
      });
    });

    // Submit handler
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      if (!validateForm()) return;

      // Disable submit while "processing"
      submitBtn.disabled = true;
      // SECURE: textContent — no innerHTML
      submitBtn.textContent = 'Sending…';

      try {
        // Collect form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Send to AWS Lambda API
        const response = await fetch('https://gjtn9lelk3.execute-api.us-east-1.amazonaws.com/default/yw2-contact-form', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          // Show success and hide form
          form.reset(); // clear all fields
          form.setAttribute('hidden', '');
          successEl.removeAttribute('hidden');
          successEl.focus();

          // Reset button listener
          const resetBtn = document.getElementById('form-reset-btn');
          if (resetBtn) {
            resetBtn.onclick = function () {
              successEl.setAttribute('hidden', '');
              form.removeAttribute('hidden');
              submitBtn.disabled = false;
              submitBtn.textContent = 'Get My Free SEO Audit';
            };
          }
        } else {
          throw new Error('Server returned an error');
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        alert('There was an error sending your request. Please try again later.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Get My Free SEO Audit';
      }
    });
  }());

  // 7. FOOTER YEAR

  (function initFooterYear() {
    const yearEl = document.getElementById('footer-year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }());

  // 8. SMOOTH SCROLL

  (function initSmoothScroll() {
    if (CSS.supports('scroll-behavior', 'smooth')) return; // native handles it

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }());

  // 9. ACTIVE NAV LINK

  (function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!sections.length || !navLinks.length) return;

    const onScroll = function () {
      let current = '';

      sections.forEach(function (section) {
        const top = section.getBoundingClientRect().top;
        if (top <= 130) {
          current = section.getAttribute('id');
        }
      });

      navLinks.forEach(function (link) {
        const href = link.getAttribute('href');
        if (href === '#' + current) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }());

  // 10. OFFER MODAL

  (function initOfferModal() {
    const modal = document.getElementById('offer-modal');
    const closeBtn = document.getElementById('offer-close-btn');
    const ctaBtn = document.getElementById('offer-cta-btn');

    if (!modal || !closeBtn || !ctaBtn) return;

    // Check session storage so it doesn't annoy users on every refresh during a single session
    if (sessionStorage.getItem('yw2_offer_seen')) {
      return;
    }

    function closeModal() {
      modal.classList.remove('is-visible');
      modal.setAttribute('aria-hidden', 'true');
      sessionStorage.setItem('yw2_offer_seen', 'true');
    }

    // Show modal after 5 seconds (give users time to see the page first)
    setTimeout(function () {
      modal.classList.add('is-visible');
      modal.removeAttribute('aria-hidden');
    }, 5000);

    // Close on X click
    closeBtn.addEventListener('click', closeModal);

    // Close on CTA click (will also scroll to contact)
    ctaBtn.addEventListener('click', closeModal);

    // Close on outside click
    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        closeModal();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-visible')) {
        closeModal();
      }
    });
  }());

}());
