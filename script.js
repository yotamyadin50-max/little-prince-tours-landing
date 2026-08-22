(function () {
  var WA_NUMBER = '972535261436';

  // Click/UTM tracking (final-improvement-plan.md section 6, "QA and launch":
  // "מעקב קליקים על וואטסאפ, UTM/מספור"): every wa.me link gets its own
  // utm_campaign so a real click from the hero, a specific tour card, the
  // final-cta section, or the floating button is distinguishable later, per
  // its own data-utm-campaign attribute in index.html. No analytics tool
  // reads these params yet (a real, separate gap already flagged in
  // _process/115-marketing-manager-plan.md), that is not this fix's job,
  // the params themselves are the explicit, already-approved deliverable.
  function buildWaHref(tourName, utmCampaign) {
    var text = tourName
      ? 'היי, אני מעוניין/ת בטיול "' + tourName + '", אפשר לתאם?'
      : 'היי, אני רוצה לתאם טיול';
    var params = [
      'utm_source=site',
      'utm_medium=cta',
      'utm_campaign=' + encodeURIComponent(utmCampaign || 'other'),
      'text=' + encodeURIComponent(text)
    ];
    return 'https://wa.me/' + WA_NUMBER + '?' + params.join('&');
  }

  document.querySelectorAll('[data-wa-tour]').forEach(function (el) {
    el.setAttribute('href', buildWaHref(el.getAttribute('data-wa-tour'), el.getAttribute('data-utm-campaign')));
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

  // Minimal contact form (final-page-copy.md section 9, "סגירה": "טופס
  // מינימלי (למי שלא בוואטסאפ)"). No backend on this static site, so this
  // builds a real mailto: link from the field values and shows a visible
  // success message on submit, the exact same real, working pattern already
  // shipped in the sibling O-output/15-yariv-avraham-tours/site/script.js's
  // #contactForm handler. The form's own action="mailto:...", plus native
  // required/pattern validation on the inputs, remain a true native
  // fallback: with JS disabled, the browser still blocks an invalid submit
  // (empty name, malformed phone, no tour picked) and still opens the
  // visitor's mail client via the form's own action when it is valid.
  var contactForm = document.getElementById('contactForm');
  var contactSuccess = document.getElementById('formSuccess');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      // Honeypot: a real visitor never sees or fills this field (hidden via
      // .hp-field, aria-hidden, tabindex="-1"); a bot that fills every field
      // trips this and gets a silent no-op, no mailto, no success message.
      var honeypot = document.getElementById('website');
      if (honeypot && honeypot.value) {
        e.preventDefault();
        return;
      }
      // This handler only runs once the form already passed native
      // required/pattern validation (an invalid native submit never fires
      // this 'submit' event at all), so the values below are already valid.
      var name = document.getElementById('fullName').value.trim();
      var phone = document.getElementById('phone').value.trim();
      var tour = document.getElementById('tour').value;
      var body = 'שם מלא: ' + name + '\nטלפון: ' + phone + '\nטיול מבוקש: ' + tour;
      var mailto = 'mailto:yariva74@gmail.com?subject=' + encodeURIComponent('פנייה מהאתר: ' + tour) + '&body=' + encodeURIComponent(body);
      e.preventDefault();
      window.location.href = mailto;
      if (contactSuccess) contactSuccess.classList.add('is-visible');
    });
  }
})();
