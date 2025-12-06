// js/main.js
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('header nav');
  const links = Array.from(document.querySelectorAll('header nav a[href^="#"]'));
  const sections = links
    .map(a => document.getElementById(a.getAttribute('href').slice(1)))
    .filter(Boolean);

  let currentActive = null;
  const handlers = {}; // { sectionId: { onEnter, onLeave } }
  let lastVisibleId = null;

  // Public API for per-section scripts
  window.SiteTabs = {
    register: (id, { onEnter, onLeave } = {}) => {
      handlers[id] = { onEnter, onLeave };
    },
    activate: (id) => {
      const link = document.querySelector(`header nav a[href="#${id}"]`);
      if (link) link.click();
    }
  };

  // Click + smooth scroll + set active
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActive(link);
      // call onEnter immediately for programmatic clicks
      const h = handlers[id];
      if (h && typeof h.onEnter === 'function') h.onEnter(target);
    });

    // keyboard activation
    link.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        link.click();
      }
    });

    // hover preview (temporary highlight)
    link.addEventListener('mouseenter', () => {
      links.forEach(l => l.classList.remove('preview'));
      link.classList.add('preview');
    });
    link.addEventListener('mouseleave', () => {
      link.classList.remove('preview');
      if (currentActive) currentActive.classList.add('active');
    });
  });

  function setActive(link) {
    links.forEach(l => l.classList.remove('active'));
    currentActive = link;
    if (currentActive) currentActive.classList.add('active');
  }

  // IntersectionObserver to update active link while scrolling and call handlers
  if ('IntersectionObserver' in window && sections.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.id;
        const link = document.querySelector(`header nav a[href="#${id}"]`);
        if (!link) return;

        if (entry.isIntersecting) {
          setActive(link);

          // call onEnter for this section
          const h = handlers[id];
          if (h && typeof h.onEnter === 'function') h.onEnter(entry.target);

          // call onLeave for previously visible section
          if (lastVisibleId && lastVisibleId !== id) {
            const prev = handlers[lastVisibleId];
            if (prev && typeof prev.onLeave === 'function') prev.onLeave(document.getElementById(lastVisibleId));
          }

          lastVisibleId = id;
        }
      });
    }, {
      root: null,
      rootMargin: '-35% 0% -35% 0%',
      threshold: 0
    });

    sections.forEach(s => observer.observe(s));
  } else {
    if (links[0]) setActive(links[0]);
  }

  // Initialize: set first link active after a short delay
  if (links.length > 0) {
    setTimeout(() => setActive(links[0]), 100);
  }
});