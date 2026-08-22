(function () {
  var WA_NUMBER = '972535261436';

  function buildWaHref(tourName) {
    var text = tourName
      ? 'היי, אני מעוניין/ת בטיול "' + tourName + '", אפשר לתאם?'
      : 'היי, אני רוצה לתאם טיול';
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text);
  }

  document.querySelectorAll('[data-wa-tour]').forEach(function (el) {
    el.setAttribute('href', buildWaHref(el.getAttribute('data-wa-tour')));
  });

  // FAQ accordion
  document.querySelectorAll('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      var answer = btn.nextElementSibling;
      document.querySelectorAll('.faq-question').forEach(function (other) {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          other.nextElementSibling.style.maxHeight = null;
        }
      });
      btn.setAttribute('aria-expanded', String(!expanded));
      answer.style.maxHeight = expanded ? null : answer.scrollHeight + 'px';
    });
  });

  // Scroll reveal, with a setTimeout fallback in case IntersectionObserver
  // never fires (e.g. a hidden/backgrounded tab during automated checks).
  var revealEls = document.querySelectorAll('.reveal');
  var revealed = false;
  function revealAll() {
    if (revealed) return;
    revealed = true;
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
    // Fallback: if nothing has revealed within 1.5s (e.g. observer stalled
    // because the document is hidden), just show everything.
    setTimeout(function () {
      var anyVisible = document.querySelector('.reveal.is-visible');
      if (!anyVisible) revealAll();
    }, 1500);
  } else {
    revealAll();
  }

  // Day-trip film: click-to-play only, never autoplay. The <video> has
  // preload="none" and starts `hidden`, and a real <img loading="lazy">
  // serves as the visible poster, so the 63.9MB .mp4 makes zero network
  // requests until this real <button> is actually activated (click or
  // keyboard). Once pressed: swap the poster image out for the video,
  // hand it real native controls, and move focus onto it so a keyboard
  // user can keep controlling playback (pause, seek) afterwards.
  var daytripBtn = document.querySelector('.daytrip-play-btn');
  var daytripVideo = document.querySelector('.daytrip-video');
  var daytripPoster = document.querySelector('.daytrip-poster');
  if (daytripBtn && daytripVideo && daytripPoster) {
    daytripBtn.addEventListener('click', function () {
      daytripPoster.hidden = true;
      daytripVideo.hidden = false;
      daytripVideo.setAttribute('controls', '');
      daytripVideo.setAttribute('tabindex', '0');
      var playPromise = daytripVideo.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
      daytripBtn.hidden = true;
      daytripVideo.focus();
    });
  }

  // Floating WhatsApp button appears after scrolling past the hero
  var waFloat = document.getElementById('waFloat');
  var hero = document.querySelector('.hero');
  if (waFloat && hero) {
    var toggleFloat = function () {
      var heroBottom = hero.getBoundingClientRect().bottom;
      if (heroBottom < 80) {
        waFloat.classList.add('visible');
      } else {
        waFloat.classList.remove('visible');
      }
    };
    window.addEventListener('scroll', toggleFloat, { passive: true });
    toggleFloat();
  }
})();
