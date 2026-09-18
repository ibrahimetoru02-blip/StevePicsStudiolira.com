document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navItems = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('header[id], main section[id]');
  const form = document.getElementById('contact-form');
  const formMessage = document.getElementById('form-message');
  const submitButton = form?.querySelector('button[type="submit"]');
  const bookingForm = document.getElementById('booking-form');
  const bookingMessage = document.getElementById('booking-message');
  const bookingSubmitButton = bookingForm?.querySelector('button[type="submit"]');
  const yearEl = document.getElementById('year');
  const backToTopButton = document.getElementById('backToTop');
  const revealItems = document.querySelectorAll('.hero-card, .info-card, .portfolio-card, .stats > div');

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  menuToggle?.addEventListener('click', () => {
    const isOpen = navLinks?.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(Boolean(isOpen)));
  });

  navItems.forEach((link) => {
    link.addEventListener('click', () => {
      navLinks?.classList.remove('open');
      menuToggle?.setAttribute('aria-expanded', 'false');
    });
  });

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navItems.forEach((link) => {
            const targetId = link.getAttribute('href')?.replace('#', '');
            link.classList.toggle('active', targetId === entry.target.id);
          });
        }
      });
    },
    { threshold: 0.35 }
  );

  sections.forEach((section) => sectionObserver.observe(section));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealItems.forEach((item) => {
    item.classList.add('reveal');
    revealObserver.observe(item);
  });

  if (backToTopButton) {
    const toggleBackToTop = () => {
      backToTopButton.classList.toggle('show', window.scrollY > 450);
    };

    window.addEventListener('scroll', toggleBackToTop, { passive: true });
    toggleBackToTop();

    backToTopButton.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  const showFormMessage = (message, type = 'success') => {
    if (!formMessage) return;
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
  };

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const name = formData.get('name')?.toString().trim() || '';
    const email = formData.get('email')?.toString().trim() || '';
    const message = formData.get('message')?.toString().trim() || '';

    if (!name || !email || !message) {
      showFormMessage('Please complete all fields before sending your inquiry.', 'error');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      showFormMessage('Please enter a valid email address.', 'error');
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    showFormMessage('Sending your inquiry...', 'info');

    try {
      const response = await fetch('api/submit.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'inquiry', name, email, message })
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'The inquiry could not be saved.');
      }

      form.reset();
      showFormMessage(result.message, 'success');
    } catch (error) {
      showFormMessage(error.message || 'The inquiry could not be sent. Please try again.', 'error');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Send Inquiry';
    }
  });

  bookingForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(bookingForm);
    const booking = Object.fromEntries(formData.entries());
    bookingSubmitButton.disabled = true;
    bookingSubmitButton.textContent = 'Sending...';
    bookingMessage.textContent = 'Sending your booking request...';
    bookingMessage.className = 'form-message info';

    try {
      const response = await fetch('api/submit.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'booking', ...booking })
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'The booking could not be saved.');
      }

      bookingForm.reset();
      bookingMessage.textContent = result.message;
      bookingMessage.className = 'form-message success';
    } catch (error) {
      bookingMessage.textContent = error.message || 'The booking could not be sent. Please try again.';
      bookingMessage.className = 'form-message error';
    } finally {
      bookingSubmitButton.disabled = false;
      bookingSubmitButton.textContent = 'Send Booking Request';
    }
  });
});
