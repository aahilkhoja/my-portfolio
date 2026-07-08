document.addEventListener('DOMContentLoaded', () => {
  const loader = document.querySelector('.loader');
  const menuToggle = document.querySelector('.menu-toggle');
  const navOverlay = document.querySelector('.nav-overlay');
  const navLinks = document.querySelectorAll('.nav-links a');
  const backToTopBtn = document.getElementById('backToTop');
  const yearEls = document.querySelectorAll('.footer-year');

  setTimeout(() => {
    if (loader) loader.classList.add('hide');
  }, 750);

  if (yearEls.length) {
    const year = new Date().getFullYear();
    yearEls.forEach(el => { el.textContent = year; });
  }

  // Scroll progress bar
  const scrollProgress = document.createElement('div');
  scrollProgress.className = 'scroll-progress';
  scrollProgress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(scrollProgress);

  const updateScrollProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = `${pct}%`;
  };

  updateScrollProgress();
  window.addEventListener('scroll', updateScrollProgress);
  window.addEventListener('resize', updateScrollProgress);

  if (menuToggle && navOverlay) {
    const toggleMenu = () => {
      menuToggle.classList.toggle('active');
      navOverlay.classList.toggle('active');

      const isExpanded = menuToggle.classList.contains('active');
      menuToggle.setAttribute('aria-expanded', isExpanded);
      document.body.style.overflow = isExpanded ? 'hidden' : '';
    };

    menuToggle.addEventListener('click', toggleMenu);

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (menuToggle.classList.contains('active')) {
          toggleMenu();
        }
      });
    });
  }

  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Hide the button once the footer scrolls into view so it doesn't sit
    // on top of the footer's social icons in the bottom-right corner.
    const siteFooter = document.querySelector('.site-footer');

    if (siteFooter && 'IntersectionObserver' in window) {
      const footerObserver = new IntersectionObserver(entries => {
        backToTopBtn.classList.toggle('footer-visible', entries[0].isIntersecting);
      }, { threshold: 0 });

      footerObserver.observe(siteFooter);
    }
  }

  // Scroll reveal
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length) {
    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

      revealEls.forEach(el => revealObserver.observe(el));
    } else {
      revealEls.forEach(el => el.classList.add('is-visible'));
    }
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;

  // Contextual hotspot cursor — the system cursor is left alone everywhere;
  // elements with a data-cursor label get a small trailing tag (styled like
  // Figma's prototype hotspot hints) naming what will happen on click.
  if (isFinePointer && !prefersReducedMotion) {
    const cursorTag = document.createElement('div');
    cursorTag.className = 'cursor-tag';
    const cursorLabel = document.createElement('span');
    cursorTag.appendChild(cursorLabel);
    document.body.appendChild(cursorTag);

    document.addEventListener('mousemove', e => {
      cursorTag.style.left = `${e.clientX}px`;
      cursorTag.style.top = `${e.clientY}px`;
    });

    document.addEventListener('mouseover', e => {
      const target = e.target.closest('[data-cursor]');
      if (target) {
        cursorLabel.textContent = target.getAttribute('data-cursor');
        cursorTag.classList.add('is-active');
      }
    });

    document.addEventListener('mouseout', e => {
      const target = e.target.closest('[data-cursor]');
      if (target && !e.relatedTarget?.closest('[data-cursor]')) {
        cursorTag.classList.remove('is-active');
      }
    });
  }

  // Magnetic buttons
  if (isFinePointer && !prefersReducedMotion) {
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  // Project card tilt
  if (isFinePointer && !prefersReducedMotion) {
    document.querySelectorAll('.project-card').forEach(card => {
      const visual = card.querySelector('.project-visual');
      if (!visual) return;

      card.addEventListener('mousemove', e => {
        const rect = visual.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        visual.style.transform = `scale(0.985) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg)`;
      });

      card.addEventListener('mouseleave', () => {
        visual.style.transform = '';
      });
    });
  }

  // Contact form (mailto handoff, no backend)
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();

      const name = contactForm.querySelector('#name').value.trim();
      const email = contactForm.querySelector('#email').value.trim();
      const projectType = contactForm.querySelector('#projectType').value;
      const message = contactForm.querySelector('#message').value.trim();

      const subject = encodeURIComponent(`Project Inquiry from ${name}`);
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\nProject Type: ${projectType}\n\n${message}`
      );

      window.location.href = `mailto:aahilkhoja123@gmail.com?subject=${subject}&body=${body}`;
    });
  }
});
