/* ============================================================
   main.js — মেনু, স্ক্রল, রিভিল অ্যানিমেশন, নেভ হাইলাইট
   ============================================================ */
(function () {
  /* ---------- মোবাইল মেনু ---------- */
  var menuBtn = document.getElementById('menuBtn'),
      navLinks = document.getElementById('navLinks');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', function () {
      var o = navLinks.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', o ? 'true' : 'false');
    });
    var links = navLinks.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function () {
        navLinks.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    }
  }

  /* ---------- স্ক্রল প্রোগ্রেস + টপ বোতাম ---------- */
  var progress = document.getElementById('progress'),
      toTop = document.getElementById('toTop');
  function onScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    if (toTop) toTop.classList.toggle('show', window.scrollY > 620);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- রিভিল অ্যানিমেশন ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e, i) {
      if (e.isIntersecting) {
        e.target.style.transitionDelay = (Math.min(i, 5) * 70) + 'ms';
        e.target.classList.add('in');
        io.unobserve(e.target);
        (function (t) { setTimeout(function () { t.style.transitionDelay = ''; }, 1000); })(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  var reveals = document.querySelectorAll('.reveal');
  for (var r = 0; r < reveals.length; r++) { io.observe(reveals[r]); }

  /* ---------- নেভ হাইলাইট ---------- */
  var navMap = {};
  var navAnchors = document.querySelectorAll('.nav-links a');
  for (var n = 0; n < navAnchors.length; n++) {
    var id = navAnchors[n].getAttribute('href').slice(1);
    if (id) navMap[id] = navAnchors[n];
  }
  var secObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        var keys = Object.keys(navMap);
        for (var k = 0; k < keys.length; k++) { navMap[keys[k]].classList.remove('active'); }
        var link = navMap[e.target.id];
        if (link) link.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  var sections = document.querySelectorAll('section[id]');
  for (var s = 0; s < sections.length; s++) { secObs.observe(sections[s]); }

  /* ---------- সেফটি ফলব্যাক ---------- */
  setTimeout(function () {
    var pending = document.querySelectorAll('.reveal:not(.in)');
    for (var p = 0; p < pending.length; p++) { pending[p].classList.add('in'); }
  }, 5000);
})();