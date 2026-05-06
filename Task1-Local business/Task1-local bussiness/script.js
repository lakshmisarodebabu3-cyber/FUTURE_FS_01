/**
 * BREW HAVEN CAFÉ — script.js  (FULLY FIXED VERSION)
 * ─────────────────────────────────────────────────────────────
 * FIXES IN THIS VERSION:
 *  1. VALIDATION — phone strictly 10 digits, no 11+ allowed
 *  2. VALIDATION — date blocks today AND past dates (only future)
 *  3. VALIDATION — name blocks numbers/symbols, letters only
 *  4. VALIDATION — real-time inline error under each field
 *  5. MENU TABS  — Food & Desserts now work correctly
 *  6. SUCCESS MSG — green box shows reliably after booking
 * ─────────────────────────────────────────────────────────────
 */

document.addEventListener('DOMContentLoaded', () => {


  /* ══════════════════════════════════════════════════════════
     1. NAVBAR — scroll effect
  ══════════════════════════════════════════════════════════ */
  const navbar      = document.getElementById('navbar');
  const scrollTopBtn = document.getElementById('scrollTop');


  /* ══════════════════════════════════════════════════════════
     GLOBAL IMAGE ERROR HANDLER
     If ANY menu card image fails to load (deleted/broken URL),
     this automatically replaces it with a styled placeholder
     so the card never shows a broken image icon.
  ══════════════════════════════════════════════════════════ */
  document.querySelectorAll('.menu-card-img img').forEach(img => {
    img.addEventListener('error', function () {
      // Create a nice café-coloured placeholder
      this.style.display    = 'none';
      const parent          = this.parentElement;
      parent.style.background = 'linear-gradient(135deg, #c8956c, #a0522d)';
      parent.style.display    = 'flex';
      parent.style.alignItems = 'center';
      parent.style.justifyContent = 'center';
      // Show a coffee emoji as the placeholder
      const placeholder       = document.createElement('div');
      placeholder.textContent = '☕';
      placeholder.style.cssText = 'font-size:3.5rem;opacity:.5;';
      parent.appendChild(placeholder);
    });
    // Trigger error check for already-broken images
    if (img.complete && img.naturalWidth === 0) {
      img.dispatchEvent(new Event('error'));
    }
  });

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) navbar.classList.add('scrolled');
    else                     navbar.classList.remove('scrolled');

    if (scrollTopBtn) {
      if (window.scrollY > 400) scrollTopBtn.classList.add('visible');
      else                      scrollTopBtn.classList.remove('visible');
    }
  }, { passive: true });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  /* ══════════════════════════════════════════════════════════
     2. MOBILE HAMBURGER
  ══════════════════════════════════════════════════════════ */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('active', isOpen);
      const [s0, s1, s2] = hamburger.querySelectorAll('span');
      if (isOpen) {
        s0.style.transform = 'rotate(45deg) translate(5px, 5px)';
        s1.style.opacity   = '0';
        s2.style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        s0.style.transform = s2.style.transform = '';
        s1.style.opacity   = '';
      }
    });
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.querySelectorAll('span').forEach(s => {
          s.style.transform = s.style.opacity = '';
        });
      });
    });
  }


  /* ══════════════════════════════════════════════════════════
     3. MENU TABS — Coffee / Food / Desserts
     FIX: use inline style directly — no CSS class conflicts
  ══════════════════════════════════════════════════════════ */
  const tabBtns     = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  // On page load: show first tab, hide all others
  tabContents.forEach((tab, i) => {
    tab.style.display = i === 0 ? 'grid' : 'none';
  });

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab; // 'coffee' | 'food' | 'desserts'

      // Highlight clicked button, un-highlight others
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Show matching tab, hide all others
      tabContents.forEach(tab => {
        if (tab.id === 'tab-' + target) {
          tab.style.display   = 'grid';
          tab.style.animation = 'fadeInUp 0.35s ease both';
        } else {
          tab.style.display = 'none';
        }
      });
    });
  });


  /* ══════════════════════════════════════════════════════════
     4. BOOKING FORM — FULLY FIXED VALIDATION
  ══════════════════════════════════════════════════════════ */

  // --- 4a. Set today as the MINIMUM date ---
  // FIX: min = tomorrow so user cannot pick today OR past dates
  const dateInput = document.getElementById('date');
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);      // add 1 day
    const yyyy = tomorrow.getFullYear();
    const mm   = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd   = String(tomorrow.getDate()).padStart(2, '0');
    dateInput.setAttribute('min', `${yyyy}-${mm}-${dd}`);

    // Set max = 90 days from today
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 90);
    const yyyy2 = maxDate.getFullYear();
    const mm2   = String(maxDate.getMonth() + 1).padStart(2, '0');
    const dd2   = String(maxDate.getDate()).padStart(2, '0');
    dateInput.setAttribute('max', `${yyyy2}-${mm2}-${dd2}`);
  }

  // --- 4b. Helper: show inline error under a field ---
  function showFieldError(inputEl, message) {
    clearFieldError(inputEl);
    inputEl.style.borderColor = '#b33030';
    const err = document.createElement('span');
    err.className   = 'field-error';
    err.textContent = '⚠ ' + message;
    err.style.cssText = 'color:#b33030;font-size:.8rem;margin-top:4px;display:block;font-weight:600;';
    inputEl.parentNode.appendChild(err);
  }

  function clearFieldError(inputEl) {
    inputEl.style.borderColor = '';
    const existing = inputEl.parentNode.querySelector('.field-error');
    if (existing) existing.remove();
  }

  function showFieldOk(inputEl) {
    clearFieldError(inputEl);
    inputEl.style.borderColor = '#2d7a4f';
  }

  // --- 4c. Live validation as user types ---

  // NAME: letters, spaces, dots and hyphens only — no numbers
  const nameInput = document.getElementById('name');
  if (nameInput) {
    nameInput.addEventListener('input', () => {
      const val = nameInput.value.trim();
      if (val.length === 0) {
        clearFieldError(nameInput);
      } else if (val.length < 2) {
        showFieldError(nameInput, 'Name must be at least 2 characters.');
      } else if (!/^[a-zA-Z\s.\-']+$/.test(val)) {
        showFieldError(nameInput, 'Name must contain letters only — no numbers or symbols.');
      } else {
        showFieldOk(nameInput);
      }
    });
  }

  // PHONE: STRICTLY exactly 10 digits — no more, no less
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    // Block any non-numeric keys while typing
    phoneInput.addEventListener('keypress', (e) => {
      if (!/[0-9]/.test(e.key)) e.preventDefault();
    });

    // Block paste of non-numeric content
    phoneInput.addEventListener('paste', (e) => {
      const pasted = (e.clipboardData || window.clipboardData).getData('text');
      if (!/^[0-9]+$/.test(pasted)) e.preventDefault();
    });

    phoneInput.addEventListener('input', () => {
      // Strip any non-digits that slipped through
      phoneInput.value = phoneInput.value.replace(/[^0-9]/g, '');

      // Enforce max 10 characters
      if (phoneInput.value.length > 10) {
        phoneInput.value = phoneInput.value.slice(0, 10);
      }

      const val = phoneInput.value;
      if (val.length === 0) {
        clearFieldError(phoneInput);
      } else if (val.length < 10) {
        showFieldError(phoneInput, `Phone needs ${10 - val.length} more digit(s). Currently ${val.length}/10.`);
      } else if (val.length === 10) {
        showFieldOk(phoneInput);
      }
    });
  }

  // DATE: validate on change
  if (dateInput) {
    dateInput.addEventListener('change', () => {
      const selected  = new Date(dateInput.value);
      const today     = new Date();
      today.setHours(0, 0, 0, 0);

      if (!dateInput.value) {
        showFieldError(dateInput, 'Please select a date.');
      } else if (selected <= today) {
        showFieldError(dateInput, 'Please select a future date (not today or the past).');
        dateInput.value = ''; // clear the invalid date
      } else {
        showFieldOk(dateInput);
      }
    });
  }

  // GUESTS: validate on change
  const guestsInput = document.getElementById('guests');
  if (guestsInput) {
    guestsInput.addEventListener('change', () => {
      if (!guestsInput.value) {
        showFieldError(guestsInput, 'Please select number of guests.');
      } else {
        showFieldOk(guestsInput);
      }
    });
  }

  // TIME: validate on change
  const timeInput = document.getElementById('time');
  if (timeInput) {
    timeInput.addEventListener('change', () => {
      if (!timeInput.value) {
        showFieldError(timeInput, 'Please select a time slot.');
      } else {
        showFieldOk(timeInput);
      }
    });
  }

  // --- 4d. Final validation on submit ---
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      let hasError = false;

      // Validate Name
      const nameVal = nameInput ? nameInput.value.trim() : '';
      if (nameVal.length < 2) {
        showFieldError(nameInput, 'Name must be at least 2 characters.');
        hasError = true;
      } else if (!/^[a-zA-Z\s.\-']+$/.test(nameVal)) {
        showFieldError(nameInput, 'Name must contain letters only — no numbers or symbols.');
        hasError = true;
      }

      // Validate Phone — MUST be EXACTLY 10 digits
      const phoneVal = phoneInput ? phoneInput.value.replace(/[^0-9]/g, '') : '';
      if (phoneVal.length === 0) {
        showFieldError(phoneInput, 'Phone number is required.');
        hasError = true;
      } else if (phoneVal.length !== 10) {
        showFieldError(phoneInput, `Phone must be exactly 10 digits. You entered ${phoneVal.length} digit(s).`);
        hasError = true;
      } else if (!/^[6-9][0-9]{9}$/.test(phoneVal)) {
        // Indian mobile numbers start with 6, 7, 8, or 9
        showFieldError(phoneInput, 'Enter a valid Indian mobile number (starts with 6, 7, 8, or 9).');
        hasError = true;
      }

      // Validate Guests
      if (!guestsInput || !guestsInput.value) {
        showFieldError(guestsInput, 'Please select number of guests.');
        hasError = true;
      }

      // Validate Date — must be future date only
      if (!dateInput || !dateInput.value) {
        showFieldError(dateInput, 'Please select a booking date.');
        hasError = true;
      } else {
        const selected = new Date(dateInput.value);
        const today    = new Date();
        today.setHours(0, 0, 0, 0);
        if (selected <= today) {
          showFieldError(dateInput, 'Booking date must be a future date (not today).');
          hasError = true;
        }
      }

      // Validate Time
      if (!timeInput || !timeInput.value) {
        showFieldError(timeInput, 'Please select a time slot.');
        hasError = true;
      }

      // If any error — stop form, scroll to first error
      if (hasError) {
        e.preventDefault();
        const firstErr = bookingForm.querySelector('.field-error');
        if (firstErr) {
          firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // All valid — show loading on button
      const submitBtn = bookingForm.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Confirming your booking...';
        submitBtn.disabled  = true;
      }
    });
  }


  /* ══════════════════════════════════════════════════════════
     5. SUCCESS / ERROR MESSAGE after PHP redirect
     FIX: runs after 200ms delay to ensure DOM is settled
  ══════════════════════════════════════════════════════════ */
  setTimeout(() => {
    const params     = new URLSearchParams(window.location.search);
    const status     = params.get('status');
    const successMsg = document.getElementById('successMsg');
    const errorMsg   = document.getElementById('errorMsg');
    const errorText  = document.getElementById('errorText');

    if (status === 'success' && successMsg) {
      successMsg.style.display    = 'flex';
      successMsg.style.opacity    = '1';
      successMsg.style.visibility = 'visible';

      // Scroll to booking section to see the message
      setTimeout(() => {
        const sec = document.getElementById('booking');
        if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);

      // Remove ?status=success from browser URL bar
      window.history.replaceState({}, document.title,
        window.location.pathname + '#booking');

    } else if (status === 'error' && errorMsg) {
      errorMsg.style.display    = 'flex';
      errorMsg.style.opacity    = '1';
      errorMsg.style.visibility = 'visible';

      const msg = params.get('msg');
      if (msg && errorText) errorText.textContent = decodeURIComponent(msg);

      setTimeout(() => {
        const sec = document.getElementById('booking');
        if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);

      window.history.replaceState({}, document.title,
        window.location.pathname + '#booking');
    }
  }, 200);


  /* ══════════════════════════════════════════════════════════
     6. SCROLL REVEAL — animate sections as they scroll in
  ══════════════════════════════════════════════════════════ */
  const revealEls = document.querySelectorAll(
    '.menu-card, .testimonial-card, .gallery-item, ' +
    '.contact-card, .value-item, .section-header, ' +
    '.booking-info, .booking-form-wrap, .about-content'
  );

  revealEls.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = Math.min(i * 70, 350) + 'ms';
  });

  new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 }).observe
    ? new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' })
        [Symbol.iterator]
      : null;

  // Simpler fallback observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  revealEls.forEach(el => observer.observe(el));


  /* ══════════════════════════════════════════════════════════
     7. ORDER NOW BUTTONS — visual feedback
  ══════════════════════════════════════════════════════════ */
  document.querySelectorAll('.btn-sm').forEach(btn => {
    btn.addEventListener('click', () => {
      const original = btn.textContent;
      btn.textContent     = '✓ Added!';
      btn.style.background = '#2d7a4f';
      setTimeout(() => {
        btn.textContent     = original;
        btn.style.background = '';
      }, 1500);
    });
  });


  /* ══════════════════════════════════════════════════════════
     8. ACTIVE NAV HIGHLIGHT on scroll
  ══════════════════════════════════════════════════════════ */
  const navLinkEls = document.querySelectorAll('.nav-link');
  new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinkEls.forEach(link => {
          link.style.fontWeight =
            link.getAttribute('href') === '#' + entry.target.id ? '700' : '500';
        });
      }
    });
  }, { threshold: 0.45 }).observe
    ? document.querySelectorAll('section[id]').forEach(s =>
        new IntersectionObserver((entries) => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              navLinkEls.forEach(l => {
                l.style.fontWeight = l.getAttribute('href') === '#' + e.target.id ? '700' : '500';
              });
            }
          });
        }, { threshold: 0.45 }).observe(s)
      )
    : null;

}); // END DOMContentLoaded