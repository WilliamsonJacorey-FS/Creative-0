// js/aboutPage.js
document.addEventListener('DOMContentLoaded', () => {
  const sectionId = 'section2'; // id used in your HTML for About
  const section = document.getElementById(sectionId);
  if (!section) return; // do nothing if About section not present

  const card = section.querySelector('.profile-card');
  const avatarImg = section.querySelector('.profile-avatar img');

  // Helper: fade-in animation for the card (runs once)
  function fadeInCard() {
    if (!card) return;
    card.style.opacity = card.style.opacity || 0;
    card.style.transform = card.style.transform || 'translateY(6px)';
    // animate using requestAnimationFrame for smoother effect
    requestAnimationFrame(() => {
      card.style.transition = 'opacity 420ms ease, transform 420ms ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    });
  }

  // Lazy-load avatar if it's a data-src pattern
  function ensureAvatarLoaded() {
    if (!avatarImg) return;
    const dataSrc = avatarImg.getAttribute('data-src');
    if (dataSrc && avatarImg.src !== dataSrc) {
      avatarImg.src = dataSrc;
      avatarImg.removeAttribute('data-src');
    }
  }

  // Focus the avatar for keyboard users when entering the section
  function focusAvatar() {
    const avatarWrapper = section.querySelector('.profile-avatar');
    if (avatarWrapper) avatarWrapper.focus();
  }

  // Register handlers with the main tab manager (if available)
  if (window.SiteTabs && typeof window.SiteTabs.register === 'function') {
    window.SiteTabs.register(sectionId, {
      onEnter: (el) => {
        // run fade-in and lazy-load once
        if (!el.dataset.inited) {
          el.dataset.inited = 'true';
          ensureAvatarLoaded();
          fadeInCard();
        }
        // focus avatar for accessibility
        focusAvatar();
      },
      onLeave: (el) => {
        // optional: remove focus when leaving
        const avatarWrapper = el.querySelector('.profile-avatar');
        if (avatarWrapper && document.activeElement === avatarWrapper) {
          avatarWrapper.blur();
        }
      }
    });
  } else {
    // If SiteTabs isn't present, run init immediately
    ensureAvatarLoaded();
    fadeInCard();
  }
});