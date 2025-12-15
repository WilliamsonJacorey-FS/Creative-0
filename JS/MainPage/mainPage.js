// mainPage.js
// Consolidated navigation and About initialization script.
// - Exposes SiteTabs for per-section lifecycle hooks
// - Smooth scrolling, keyboard access, and active link updates
// - Centers Socials on enter; About initializes once (no hover grow)
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    /* Navigation setup */
    const links = Array.from(document.querySelectorAll('header nav a[href^="#"]'));
    const sections = links
      .map(a => document.getElementById(a.getAttribute('href').slice(1)))
      .filter(Boolean);

    let currentActive = null;
    const handlers = {};
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

    function setActive(link) {
      links.forEach(l => l.classList.remove('active'));
      currentActive = link;
      if (currentActive) currentActive.classList.add('active');
    }

    // Attach click and keyboard handlers to nav links
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const id = link.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (!target) return;
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActive(link);

        const h = handlers[id];
        if (h && typeof h.onEnter === 'function') h.onEnter(target);
      });

      link.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          link.click();
        }
      });

      link.addEventListener('mouseenter', () => {
        links.forEach(l => l.classList.remove('preview'));
        link.classList.add('preview');
      });
      link.addEventListener('mouseleave', () => {
        link.classList.remove('preview');
        if (currentActive) currentActive.classList.add('active');
      });
    });

    // IntersectionObserver to update active link and call handlers
    if ('IntersectionObserver' in window && sections.length) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const id = entry.target.id;
          const link = document.querySelector(`header nav a[href="#${id}"]`);
          if (!link) return;

          if (entry.isIntersecting) {
            setActive(link);

            const h = handlers[id];
            if (h && typeof h.onEnter === 'function') h.onEnter(entry.target);

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

    // Ensure a link is active shortly after load
    if (links.length > 0) {
      setTimeout(() => setActive(links[0]), 100);
    }

    /* About initialization */
    const ABOUT_ID = 'section2';
    function runOnce(el, key, fn) {
      if (!el) return;
      if (el.dataset[key]) return;
      el.dataset[key] = 'true';
      fn();
    }
    function animateCardIn(card) {
      if (!card) return;
      card.style.opacity = card.style.opacity || '0';
      card.style.transform = card.style.transform || 'translateY(8px)';
      requestAnimationFrame(() => {
        card.style.transition = 'opacity 420ms ease, transform 420ms ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      });
    }
    function lazyLoadImage(img) {
      if (!img) return;
      const dataSrc = img.getAttribute('data-src');
      if (!dataSrc) return;
      img.setAttribute('loading', 'lazy');
      if (img.src !== dataSrc) {
        img.src = dataSrc;
        img.removeAttribute('data-src');
      }
    }
    function focusAvatar(section) {
      if (!section) return;
      const wrapper = section.querySelector('.profile-avatar');
      if (!wrapper) return;
      if (!wrapper.hasAttribute('tabindex')) wrapper.setAttribute('tabindex', '0');
      wrapper.focus();
    }
    function blurAvatar(section) {
      if (!section) return;
      const wrapper = section.querySelector('.profile-avatar');
      if (!wrapper) return;
      if (document.activeElement === wrapper) wrapper.blur();
    }
    function initAboutOnce(section) {
      if (!section) return;
      runOnce(section, 'aboutInited', () => {
        const card = section.querySelector('.profile-card');
        const avatarWrapper = section.querySelector('.profile-avatar');
        const avatarImg = avatarWrapper ? avatarWrapper.querySelector('img') : null;

        if (card) {
          card.style.opacity = card.style.opacity || '0';
          card.style.transform = card.style.transform || 'translateY(8px)';
        }

        lazyLoadImage(avatarImg);
        animateCardIn(card);

        if (avatarWrapper) {
          if (!avatarWrapper.hasAttribute('tabindex')) avatarWrapper.setAttribute('tabindex', '0');
          avatarWrapper.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              avatarWrapper.classList.toggle('active');
            }
          });
        }
      });
    }

    const aboutSection = document.getElementById(ABOUT_ID);
    if (aboutSection) {
      if (window.SiteTabs && typeof window.SiteTabs.register === 'function') {
        window.SiteTabs.register(ABOUT_ID, {
          onEnter: (el) => {
            initAboutOnce(el);
            focusAvatar(el);
          },
          onLeave: (el) => {
            blurAvatar(el);
          }
        });
      } else {
        initAboutOnce(aboutSection);
        focusAvatar(aboutSection);
      }
    }

    /* Socials centering behavior */
    const SOCIALS_ID = 'section4';
    function centerSection(el) {
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const firstInteractive = el.querySelector('a,button,[tabindex]');
      if (firstInteractive) firstInteractive.focus({ preventScroll: true });
    }

    if (window.SiteTabs && typeof window.SiteTabs.register === 'function') {
      window.SiteTabs.register(SOCIALS_ID, {
        onEnter: (el) => {
          centerSection(el);
        },
        onLeave: () => {}
      });
    } else {
      const socialsLink = document.querySelector('header nav a[href="#section4"]');
      const socialsSection = document.getElementById(SOCIALS_ID);
      if (socialsLink && socialsSection) {
        socialsLink.addEventListener('click', (e) => {
          e.preventDefault();
          centerSection(socialsSection);
        });
      }
    }

    // Debug helper
    Object.defineProperty(window, '__siteTabsHandlers', {
      value: handlers,
      writable: false,
      configurable: true,
      enumerable: false
    });
  });
})();
