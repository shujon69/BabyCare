/* ============================================================
   app-shell.js — অ্যাপের মতো অভিজ্ঞতা: বটম ট্যাব, "আরও" শিট, ইনস্টল,
   অফলাইন সূচক, আপডেট বার্তা, স্প্ল্যাশ। আগের JS ফাইলে হাত দেয় না।
   ============================================================ */
(function () {
  'use strict';

  var APP_NAME = 'শিশু খাদ্য গাইড';
  var isStandalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var root = document.documentElement;

  function $(id) { return document.getElementById(id); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; }
  function buzz(ms) { try { if (navigator.vibrate) navigator.vibrate(ms || 8); } catch (e) {} }
  function el(html) { var d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }

  /* ---------- স্প্ল্যাশ বন্ধ ---------- */
  (function () {
    var sp = document.querySelector('.app-splash');
    if (!sp) return;
    var t0 = Date.now();
    function hide() {
      var wait = Math.max(0, 900 - (Date.now() - t0));
      setTimeout(function () {
        sp.classList.add('hide');
        setTimeout(function () { root.classList.remove('splash-on'); if (sp.parentNode) sp.parentNode.removeChild(sp); }, 450);
      }, wait);
    }
    if (document.readyState === 'complete') hide(); else window.addEventListener('load', hide);
  })();

  /* ---------- বটম ট্যাব বার ---------- */
  var ICON = {
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
    chart: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="2.5"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    track: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.7 2.7L16 9.5"/></svg>',
    recipe: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12h18a9 9 0 0 1-18 0z"/><path d="M8 8.5c0-1.6 1-1.6 1-3.2M12 8.5c0-1.6 1-1.6 1-3.2M16 8.5c0-1.6 1-1.6 1-3.2"/></svg>',
    more: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle class="dots" cx="5" cy="12" r="1.7"/><circle class="dots" cx="12" cy="12" r="1.7"/><circle class="dots" cx="19" cy="12" r="1.7"/></svg>'
  };

  var tabs = el(
    '<nav class="app-tabs" id="appTabs" aria-label="প্রধান মেনু">' +
      '<a class="app-tab" href="#top" data-tab="home">' + ICON.home + '<span>হোম</span></a>' +
      '<a class="app-tab" href="#chart" data-tab="chart">' + ICON.chart + '<span>চার্ট</span></a>' +
      '<a class="app-tab" href="#tracker" data-tab="track">' + ICON.track + '<span>ট্র্যাকিং</span></a>' +
      '<a class="app-tab" href="#recipes" data-tab="recipe">' + ICON.recipe + '<span>রেসিপি</span></a>' +
      '<button class="app-tab" type="button" id="appMore" data-tab="more" aria-haspopup="dialog">' + ICON.more + '<span>আরও</span></button>' +
    '</nav>'
  );
  document.body.appendChild(tabs);

  var tabEls = {};
  [].forEach.call(tabs.querySelectorAll('.app-tab'), function (t) { tabEls[t.getAttribute('data-tab')] = t; });
  [].forEach.call(tabs.querySelectorAll('a.app-tab'), function (a) { a.addEventListener('click', function () { buzz(); }); });

  /* কোন সেকশন কোন ট্যাবের অধীনে */
  var SECTION_TAB = [
    ['top', 'home'], ['intro', 'home'], ['chart', 'chart'],
    ['tracker', 'track'], ['milestone', 'track'],
    ['what', 'more'], ['quality', 'more'],
    ['index', 'recipe'], ['recipes', 'recipe'], ['shagara', 'recipe'],
    ['tips', 'more'], ['source', 'more']
  ];
  var ticking = false;
  function updateActive() {
    ticking = false;
    var current = 'home';
    if (window.scrollY > 160) {
      for (var i = 0; i < SECTION_TAB.length; i++) {
        var s = $(SECTION_TAB[i][0]);
        if (s && s.getBoundingClientRect().top <= 140) current = SECTION_TAB[i][1];
      }
    }
    for (var k in tabEls) { if (tabEls.hasOwnProperty(k)) tabEls[k].classList.toggle('on', k === current); }
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(updateActive); } }, { passive: true });
  window.addEventListener('hashchange', function () { setTimeout(updateActive, 60); });
  updateActive();

  /* ---------- "আরও" বটম শিট ---------- */
  var bg = el('<div class="app-sheet-bg" id="appSheetBg"></div>');
  var sheet = el(
    '<div class="app-sheet" id="appSheet" role="dialog" aria-modal="true" aria-label="আরও">' +
      '<div class="grip"></div>' +
      '<h4>সব বিভাগ</h4>' +
      '<div class="sheet-grid">' +
        '<a href="#milestone"><i>🌱</i>মাইলস্টোন</a>' +
        '<a href="#index"><i>📑</i>সূচিপত্র</a>' +
        '<a href="#what"><i>🥣</i>পরিপূরক খাদ্য কী?</a>' +
        '<a href="#quality"><i>🧼</i>খাদ্যের মান</a>' +
        '<a href="#shagara"><i>🌾</i>শাগড়া মিশ্রণ</a>' +
        '<a href="#tips"><i>💚</i>সুস্থ থাকার টিপস</a>' +
        '<a href="#source"><i>📚</i>উৎসসূত্র</a>' +
        '<a href="#reminders"><i>⏰</i>রিমাইন্ডার</a>' +
      '</div>' +
      '<h4>অ্যাপ</h4>' +
      '<button class="sheet-row" type="button" id="shInstall" hidden><i>📲</i><span>ফোনে ইনস্টল করুন<small>হোম স্ক্রিনে অ্যাপ আইকন, অফলাইনেও চলবে</small></span></button>' +
      '<button class="sheet-row" type="button" id="shTheme"><i>🌓</i><span>ডার্ক / লাইট মোড</span></button>' +
      '<button class="sheet-row" type="button" id="shShare"><i>🔗</i><span>অ্যাপটি শেয়ার করুন<small>অন্য মায়েদের পাঠান</small></span></button>' +
      '<button class="sheet-row" type="button" id="shUpdate"><i>🔄</i><span>আপডেট আছে কিনা দেখুন</span></button>' +
      '<div class="sheet-ver">' + APP_NAME + ' · সূত্র: FAO · USAID · WHO · UNICEF</div>' +
    '</div>'
  );
  document.body.appendChild(bg);
  document.body.appendChild(sheet);

  function openSheet() { root.classList.add('sheet-open'); buzz(); }
  function closeSheet() { root.classList.remove('sheet-open'); }
  $('appMore').addEventListener('click', function () { root.classList.contains('sheet-open') ? closeSheet() : openSheet(); });
  bg.addEventListener('click', closeSheet);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSheet(); });
  [].forEach.call(sheet.querySelectorAll('.sheet-grid a'), function (a) { a.addEventListener('click', closeSheet); });

  $('shTheme').addEventListener('click', function () { var b = $('themeBtn'); if (b) b.click(); closeSheet(); });

  $('shShare').addEventListener('click', function () {
    var data = { title: APP_NAME, text: '৬–২৩ মাসের শিশুর জন্য রেসিপি, দৈনিক চার্ট ও ট্র্যাকিং — ফ্রি অ্যাপ', url: location.origin + location.pathname };
    if (navigator.share) { navigator.share(data)['catch'](function () {}); }
    else if (navigator.clipboard) { navigator.clipboard.writeText(data.url).then(function () { snack('লিংক কপি হয়েছে'); }); }
    closeSheet();
  });

  $('shUpdate').addEventListener('click', function () {
    closeSheet();
    if (!navigator.serviceWorker) { location.reload(); return; }
    navigator.serviceWorker.getRegistration().then(function (r) {
      if (r) r.update().then(function () { snack('সর্বশেষ ভার্সন চেক করা হয়েছে ✔', null, 2500); });
      else location.reload();
    });
  });

  /* ---------- স্ন্যাকবার ---------- */
  var snackEl = el('<div class="app-snack" id="appSnack" role="status"><span></span><button type="button" hidden></button></div>');
  document.body.appendChild(snackEl);
  var snackTimer;
  function snack(msg, actionLabel, ms, onAction, cls) {
    var sp = snackEl.querySelector('span'), bt = snackEl.querySelector('button');
    sp.textContent = msg;
    snackEl.className = 'app-snack show' + (cls ? ' ' + cls : '');
    if (actionLabel) { bt.hidden = false; bt.textContent = actionLabel; bt.onclick = function () { snackEl.classList.remove('show'); if (onAction) onAction(); }; }
    else { bt.hidden = true; bt.onclick = null; }
    clearTimeout(snackTimer);
    if (ms) snackTimer = setTimeout(function () { snackEl.classList.remove('show'); }, ms);
  }

  /* ---------- অফলাইন / অনলাইন ---------- */
  function goOffline() { snack('অফলাইন — সেভ করা তথ্য দেখা যাচ্ছে', null, 0, null, 'offline'); }
  window.addEventListener('offline', goOffline);
  window.addEventListener('online', function () { snack('আবার অনলাইনে ফিরেছেন ✔', null, 2200); });
  if (navigator.onLine === false) goOffline();

  /* ---------- ইনস্টল ---------- */
  var deferred = null;
  var installCard = el(
    '<div class="app-install" id="appInstall" role="dialog" aria-label="অ্যাপ ইনস্টল">' +
      '<img src="icon-192.png" alt="">' +
      '<div class="t"><b>অ্যাপ হিসেবে ইনস্টল করুন</b><span id="instMsg">হোম স্ক্রিনে রাখুন, অফলাইনেও চলবে</span></div>' +
      '<button class="go" type="button" id="instGo">ইনস্টল</button>' +
      '<button class="x" type="button" id="instX" aria-label="বন্ধ করুন">✕</button>' +
    '</div>'
  );
  document.body.appendChild(installCard);
  var shInstall = $('shInstall');

  function dismissedRecently() { var t = parseInt(store('bc_install_dismiss') || '0', 10); return t && (Date.now() - t) < 7 * 864e5; }
  function hideInstallCard() { installCard.classList.remove('show'); }

  function runInstall() {
    if (deferred) {
      deferred.prompt();
      deferred.userChoice.then(function () { deferred = null; shInstall.hidden = true; hideInstallCard(); });
    } else if (isIOS) {
      snack('Safari-তে Share (⬆) চেপে "Add to Home Screen" বাছুন', null, 7000);
    }
  }

  if (!isStandalone) {
    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault(); deferred = e; shInstall.hidden = false;
      if (!dismissedRecently()) setTimeout(function () { if (deferred) installCard.classList.add('show'); }, 5000);
    });
    if (isIOS) {
      shInstall.hidden = false;
      $('instMsg').textContent = 'Safari-তে Share (⬆) → "Add to Home Screen"';
      $('instGo').textContent = 'দেখুন';
      if (!dismissedRecently()) setTimeout(function () { installCard.classList.add('show'); }, 6000);
    }
    window.addEventListener('appinstalled', function () { deferred = null; shInstall.hidden = true; hideInstallCard(); snack('অ্যাপ ইনস্টল হয়েছে 🎉', null, 3000); });
  }
  $('instGo').addEventListener('click', function () { runInstall(); if (isIOS && !deferred) hideInstallCard(); });
  $('instX').addEventListener('click', function () { store('bc_install_dismiss', String(Date.now())); hideInstallCard(); });
  shInstall.addEventListener('click', function () { closeSheet(); runInstall(); });

  /* ---------- টেবিল → কার্ড: প্রতিটি সেলে হেডার লেবেল বসানো ---------- */
  function labelTables() {
    var tables = document.querySelectorAll('#chartPanels table, #recipeList table');
    [].forEach.call(tables, function (t) {
      var ths = [].map.call(t.querySelectorAll('thead th'), function (th) { return th.textContent.trim(); });
      [].forEach.call(t.querySelectorAll('tbody tr'), function (tr) {
        [].forEach.call(tr.children, function (td, i) {
          if (ths[i] && td.getAttribute('data-label') !== ths[i]) td.setAttribute('data-label', ths[i]);
          var empty = /^[—–-]?$/.test(td.textContent.trim());
          if (empty && i > 0) td.setAttribute('data-empty', ''); else td.removeAttribute('data-empty');
        });
      });
      t.classList.add('rt-stack');
    });
  }
  labelTables();
  var lblTimer;
  ['chartPanels', 'recipeList'].forEach(function (id) {
    var n = $(id); if (!n || !window.MutationObserver) return;
    new MutationObserver(function () { clearTimeout(lblTimer); lblTimer = setTimeout(labelTables, 30); })
      .observe(n, { childList: true, subtree: true });
  });

  /* চার্টের সক্রিয় ট্যাব সোয়াইপ-বারে দৃশ্যমান রাখা */
  var ct = $('chartTabs');
  if (ct) ct.addEventListener('click', function () {
    setTimeout(function () {
      var a = ct.querySelector('.tab-btn.active');
      if (a && a.scrollIntoView) { try { a.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }); } catch (e) {} }
    }, 40);
  });

  /* ---------- সার্ভিস ওয়ার্কার আপডেট ---------- */
  if ('serviceWorker' in navigator) {
    var hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (hadController) snack('নতুন আপডেট এসেছে', 'রিলোড', 0, function () { location.reload(); });
      hadController = true;
    });
    /* অ্যাপ আবার খুললে (সর্বোচ্চ ৩০ মিনিটে একবার) আপডেট খোঁজা */
    var lastCheck = 0;
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState !== 'visible' || Date.now() - lastCheck < 30 * 60 * 1000) return;
      lastCheck = Date.now();
      navigator.serviceWorker.getRegistration().then(function (r) { if (r) r.update()['catch'](function () {}); });
    });
  }
})();
