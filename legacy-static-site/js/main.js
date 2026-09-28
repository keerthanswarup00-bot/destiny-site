// Destiny Studio — shared behavior across all pages.
// Every block is null-guarded so pages only get what they need:
// #mobilemenu + #burger (all pages), #coverflow (home only).

document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav toggle
  const burger = document.getElementById('burger');
  const menu = document.getElementById('mobilemenu');
  if (burger && menu) {
    burger.addEventListener('click', () => {
      menu.classList.toggle('open');
      burger.classList.toggle('open');
    });
    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        menu.classList.remove('open');
        burger.classList.remove('open');
      });
    });
  }

  // Scroll reveal
  try {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(e => io.observe(e));
  } catch (e) { /* IntersectionObserver unsupported — content stays visible */ }

  // Coverflow (home): scale the card nearest the track center
  const track = document.getElementById('coverflow');
  if (track) {
    const items = Array.from(track.querySelectorAll('.cf-item'));
    const update = () => {
      const trackRect = track.getBoundingClientRect();
      const center = trackRect.left + trackRect.width / 2;
      items.forEach(it => {
        const r = it.getBoundingClientRect();
        const near = Math.abs(center - (r.left + r.width / 2)) < r.width * 0.6;
        it.classList.toggle('active', near);
      });
    };
    let queued = false;
    track.addEventListener('scroll', () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; update(); });
    });
    window.addEventListener('resize', update);
    update();
  }
});
