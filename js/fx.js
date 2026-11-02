/* ============================================================
   fx.js — রিপল, কনফেটি, হিরো ভাসমান আইকন, ১০০% উদযাপন
   ============================================================ */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COLORS = ['#F0468C', '#9333EA', '#14B89C', '#2F9BF3', '#FFB020', '#FF7A59'];
  var GLYPHS = ['♥', '✦', '★', '●', '✿', '▲'];

  /* ---- কনফেটি ---- */
  function confetti(x, y, n) {
    if (reduce) return;
    n = n || 16;
    for (var i = 0; i < n; i++) {
      var s = document.createElement('span'), ang = Math.random() * Math.PI * 2, dist = 50 + Math.random() * 110;
      s.className = 'fx-conf';
      s.textContent = GLYPHS[i % GLYPHS.length];
      s.style.cssText = 'left:' + x + 'px;top:' + y + 'px;color:' + COLORS[i % COLORS.length] +
        ';--s:' + (11 + Math.random() * 12) + 'px;--dx:' + Math.cos(ang) * dist + 'px;--dy:' + (Math.sin(ang) * dist - 40) +
        'px;--r:' + (Math.random() * 540 - 270) + 'deg;--t:' + (0.9 + Math.random() * 0.6) + 's';
      document.body.appendChild(s);
      (function (el) { setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1700); })(s);
    }
  }
  window.bcConfetti = confetti;

  /* ---- বাটনে রিপল ---- */
  document.addEventListener('pointerdown', function (e) {
    var b = e.target.closest && e.target.closest('.btn,.t-btn,.tab-btn');
    if (!b || reduce) return;
    var r = b.getBoundingClientRect(), d = Math.max(r.width, r.height), s = document.createElement('span');
    s.className = 'fx-ripple';
    s.style.cssText = 'width:' + d + 'px;height:' + d + 'px;left:' + (e.clientX - r.left - d / 2) + 'px;top:' + (e.clientY - r.top - d / 2) + 'px';
    b.appendChild(s);
    setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 720);
  }, { passive: true });

  /* ---- "OK" / মাইলস্টোন টিক করলে কনফেটি (লিস্ট নতুন করে আঁকা হলেও কাজ করে) ---- */
  function doneCount() { return document.querySelectorAll('.track-item.done,.ms-item.done').length; }
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('#trackList .t-btn, .ms-item');
    if (!t) return;
    var before = doneCount(), x = e.clientX, y = e.clientY;
    if (!x && !y) { var r = t.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }
    setTimeout(function () {
      if (doneCount() > before) {
        confetti(x, y, 14);
        var d = document.querySelectorAll('.track-item.done,.ms-item.done');
        var el = d[d.length - 1]; /* সবচেয়ে কাছেরটাতে পপ */
        var best = null, bd = 1e9;
        [].forEach.call(d, function (n) { var b = n.getBoundingClientRect(), dd = Math.abs(b.top + b.height / 2 - y); if (dd < bd) { bd = dd; best = n; } });
        el = best || el; if (el) { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
      }
    }, 60);
  }, true);

  /* ---- ১০০% হলে বড় উদযাপন ---- */
  var stats = document.getElementById('trackStats'), celebrated = false;
  if (stats && window.MutationObserver) {
    new MutationObserver(function () {
      var inner = stats.querySelector('.inner');
      var txt = inner ? inner.textContent.replace(/[^০-৯0-9]/g, '') : '';
      var done = txt === '১০০' || txt === '100';
      if (done && !celebrated) {
        celebrated = true;
        var r = stats.getBoundingClientRect();
        for (var k = 0; k < 4; k++) (function (k) { setTimeout(function () { confetti(r.left + r.width * (0.2 + 0.2 * k), r.top + 40, 20); }, k * 180); })(k);
      }
      if (!done) celebrated = false;
    }).observe(stats, { childList: true, subtree: true, characterData: true });
  }

  /* ---- হিরোতে ভাসমান শিশু-খাবারের আইকন ---- */
  var hero = document.querySelector('.hero');
  if (hero && !reduce) {
    var icons = ['🍼', '🥣', '🍌', '🥕', '🍎', '⭐', '🥑', '💗'], pos = [[4, 8], [90, 6], [8, 70], [92, 62], [48, 3], [30, 92], [70, 90], [60, 40]], html = '';
    for (var i = 0; i < icons.length; i++) {
      html += '<span style="--x:' + pos[i][0] + '%;--y:' + pos[i][1] + '%;--s:' + (22 + (i * 5) % 14) + 'px;--d:' + (5 + (i * 3) % 5) + 's;--dl:' + (-i * 0.9) + 's;--dx:' + ((i % 2 ? 1 : -1) * (14 + i * 3)) + 'px">' + icons[i] + '</span>';
    }
    var fx = document.createElement('div'); fx.className = 'hero-fx'; fx.setAttribute('aria-hidden', 'true'); fx.innerHTML = html;
    hero.insertBefore(fx, hero.firstChild);
  }
})();
