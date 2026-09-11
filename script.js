document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navItems = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('header[id], main section[id]');
  const form = document.getElementById('contact-form');
  const formMessage = document.getElementById('form-message');
  const submitButton = form?.querySelector('button[type="submit"]');
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

  form?.addEventListener('submit', (event) => {
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
    showFormMessage('Thank you! We are preparing your inquiry.', 'info');

    window.setTimeout(() => {
      try {
        const savedInquiries = JSON.parse(localStorage.getItem('stevepic-inquiries') || '[]');
        savedInquiries.push({
          name,
          email,
          message,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('stevepic-inquiries', JSON.stringify(savedInquiries));
      } catch (error) {
        console.warn('Unable to save inquiry locally:', error);
      }

      // Open the user's default email app with a pre-filled message.
      try {
        const studioEmail = 'ibrahimetoru02@gmail.com';
        const subject = encodeURIComponent(`Inquiry from ${name}`);
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
        const mailto = `mailto:${studioEmail}?subject=${subject}&body=${body}`;
        // Use location.href so mobile devices open the mail app reliably.
        window.location.href = mailto;
        form.setAttribute('action', mailto);
      } catch (err) {
        console.warn('Could not open mail client:', err);
      }

      form.reset();
      submitButton.disabled = false;
      submitButton.textContent = 'Send Inquiry';
      showFormMessage(`Thanks, ${name}! We will get back to you shortly.`, 'success');
    }, 1200);
  });
});
