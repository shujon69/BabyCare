/* ============================================================
   features.js — সার্চ, প্রিয়, প্রিন্ট, SW, মাইলস্টোন, রিমাইন্ডার, থিম
   ============================================================ */
try { (function () {
  var $ = function (id) { return document.getElementById(id); };
  function bn(v) {
    return String(v).replace(/\d/g, function (d) { return '০১২৩৪৫৬৭৮৯'.charAt(d); });
  }
  function en(v) {
    return String(v).replace(/[০-৯]/g, function (d) { return '০১২৩৪৫৬৭৮৯'.indexOf(d); });
  }
  function get(k, def) {
    try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? def : v; }
    catch (e) { return def; }
  }
  function put(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function toast(m) {
    var t = document.getElementById('toast'); if (!t) return;
    t.textContent = m; t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.classList.remove('show'); }, 3000);
  }

  var all = recipes.concat(extra), byId = {};
  for (var i = 0; i < all.length; i++) byId[all[i].id] = all[i];

  /* ---------- রেসিপি: প্রিয় ও সার্চ ---------- */
  var favs = get('cf_favs', {}), favOnly = false;
  var arts = document.querySelectorAll('#recipeList .recipe');
  for (var a = 0; a < arts.length; a++) {
    var h = arts[a].querySelector('.recipe-head'), d = document.createElement('div');
    d.className = 'rbtns';
    d.innerHTML = '<button type="button" class="t-btn" data-act="fav" data-id="' + arts[a].id + '"></button>';
    if (h) h.appendChild(d);
  }
  function refreshBtns() {
    var bs = document.querySelectorAll('.rbtns .t-btn');
    for (var i = 0; i < bs.length; i++) {
      var on = !!favs[bs[i].getAttribute('data-id')];
      bs[i].textContent = on ? '♥ প্রিয়' : '♡ প্রিয় করুন';
      bs[i].classList.toggle('on', on);
    }
  }
  function filter() {
    var q = $('rSearch').value.trim().toLowerCase(),
        age = parseInt($('rAge').value || '0', 10), n = 0;
    var list = document.querySelectorAll('#recipeList .recipe');
    for (var i = 0; i < list.length; i++) {
      var r = byId[list[i].id], m = en(r.age).match(/\d+/),
          start = m ? parseInt(m[0], 10) : 6;
      var ok = (!q || list[i].textContent.toLowerCase().indexOf(q) > -1) &&
               (!age || start <= age) &&
               (!favOnly || favs[list[i].id]);
      list[i].style.display = ok ? '' : 'none';
      if (ok) n++;
    }
    $('rCount').textContent = n ? bn(n) + ' টি রেসিপি' : 'কোনো রেসিপি পাওয়া যায়নি';
  }
  $('recipeList').addEventListener('click', function (e) {
    var b = e.target.closest('.rbtns .t-btn'); if (!b) return;
    var id = b.getAttribute('data-id');
    if (favs[id]) delete favs[id]; else favs[id] = 1;
    put('cf_favs', favs); refreshBtns(); filter();
  });
  $('rSearch').addEventListener('input', filter);
  $('rAge').addEventListener('change', filter);
  $('rFav').addEventListener('click', function () {
    favOnly = !favOnly;
    this.classList.toggle('active', favOnly);
    filter();
  });

  /* ---------- প্রিন্ট ---------- */
  $('printChart').addEventListener('click', function () {
    document.body.classList.add('print-chart');
    setTimeout(function () { window.print(); }, 100);
  });
  window.addEventListener('afterprint', function () {
    document.body.classList.remove('print-chart');
  });

  /* ---------- Service Worker ---------- */
  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js')['catch'](function () {});
    });
  }

  /* ==================== মাইলস্টোন চেকলিস্ট ==================== */
  var msGroups = [
    {
      age: '৬–৭ মাস', title: 'শুরুর ধাপ', items: [
        { id: 'ms11', t: 'মাথা স্থির রেখে ধরে থাকে', d: 'হাতে ধরে বসলে মাথা স্থির থাকে, ধীরে উল্টো হয়।' },
        { id: 'ms12', t: 'খাবারে আগ্রহ দেখায়', d: 'পরিবার খাওয়া দেখে এগিয়ে আসে, মুখ খোলে।' },
        { id: 'ms13', t: 'চামচ থেকে খাবার গ্রহণ করে', d: 'ঠোঁট বন্ধ করে চামচ থেকে খাবার নেয়।' },
        { id: 'ms14', t: 'মুখ থেকে খাবার বের করা কমে', d: 'প্যালাডিং রিফ্লেক্স দুর্বল হয় — ঘন খাবার মুখে রাখতে পারে।' },
        { id: 'ms15', t: 'অল্পক্ষণ বসে থাকে', d: 'সাহায্যে বা হেলান দিয়ে কিছুক্ষণ বসে থাকে।' }
      ]
    },
    {
      age: '৮–৯ মাস', title: 'নড়াচড়া ও টেক্সচার', items: [
        { id: 'ms21', t: 'নিজে বসে থাকে', d: 'সাহায্য ছাড়া কিছুক্ষণ বসে থাকে।' },
        { id: 'ms22', t: 'হামাগুড়ি/কুস্কুসানো শুরু', d: 'পেট বা হাত-পায়ের সাহায্যে এগোয়।' },
        { id: 'ms23', t: 'আঙুলে ছোট জিনিস তোলে', d: 'বুড়ো আঙুল-তর্জনী দিয়ে ছোট জিনিস ধরে।' },
        { id: 'ms24', t: 'হাতে ধরে খাবার মুখে নেয়', d: 'নিজে হাতে ধরে মুখে খাবার নিতে পারে।' },
        { id: 'ms25', t: 'মোটা টেক্সচার ও নরম টুকরো খায়', d: 'কামড়ানোর চেষ্টা করে, চিবিয়ে খায়।' }
      ]
    },
    {
      age: '১০–১২ মাস', title: 'দাঁড়ানো ও যোগাযোগ', items: [
        { id: 'ms31', t: 'আসবার ধরে দাঁড়ায়', d: 'চেয়ার/সোফা ধরে দাঁড়ায়; কিছু শিশু এই সময় হাঁটতে শুরু করে।' },
        { id: 'ms32', t: '"মা", "বা" জাতীয় শব্দ বলে', d: 'অর্থসহ শব্দ ব্যবহার শুরু করে।' },
        { id: 'ms33', t: 'নিজে খাবার নিতে চায়', d: 'হাতে ধরে বা চামচ নিয়ে নিজে খাওয়ার চেষ্টা করে।' },
        { id: 'ms34', t: 'নরম টুকরো ও ফিঙ্গার ফুড খায়', d: 'আঙুলে ধরে মুখে নেয়, ভালোভাবে চিবায়।' },
        { id: 'ms35', t: 'ইঙ্গিত বা শব্দে চাহিদা জানায়', d: 'হাত দেখায়, শব্দ করে বা তাকিয়ে প্রয়োজন জানায়।' }
      ]
    },
    {
      age: '১৩–১৮ মাস', title: 'হাঁটা ও নিজে খাওয়া', items: [
        { id: 'ms41', t: 'স্বাধীনভাবে হাঁটে', d: 'সাহায্য ছাড়া হেঁটে যায়; মাঝে মাঝে হোঁচট খাওয়া স্বাভাবিক।' },
        { id: 'ms42', t: 'কয়েকটি শব্দ বলে ও নির্দেশ মানে', d: '"দে", "লও" জাতীয় শব্দ; সহজ নির্দেশ অনুসরণ করে।' },
        { id: 'ms43', t: 'চামচ নিয়ে খাওয়ার চেষ্টা করে', d: 'নিজে চামচ নেয়; কিছুটা ঢেলে ফেললেও চেষ্টা চালিয়ে যায়।' },
        { id: 'ms44', t: 'পারিবারিক খাবার গ্রহণ করে', d: 'কম লবণ-মশলায় পরিবারের খাবার ধীরে ধীরে খায়।' },
        { id: 'ms45', t: 'কাপ ধরে পানি পান করে', d: 'দুই হাতে কাপ ধরে নিজে পান করে (মাঝে মাঝে ঢালতে পারে)।' }
      ]
    },
    {
      age: '১৯–২৪ মাস', title: 'ভাষা ও দক্ষতা', items: [
        { id: 'ms51', t: 'দুই শব্দের বাক্য বলে', d: 'যেমন — "খাবা দে", "বাবা আয়"।' },
        { id: 'ms52', t: 'সিঁড়ি উঠে-নামে ও লাফায়', d: 'ধরে বা সাহায্যে সিঁড়ি; দুই পায়ে লাফ দেয়।' },
        { id: 'ms53', t: 'চামচ দিয়ে প্রায় নিজে খায়', d: 'কিছুটা ঢেলে ফেললেও নিজে খাওয়ার চেষ্টা করে।' },
        { id: 'ms54', t: 'ফিঙ্গার ফুডে দক্ষ হয়', d: 'নিজে ধরে খায়; খাদ্য আগ্রহের ওঠানামা স্বাভাবিক।' },
        { id: 'ms55', t: 'নকল খেলা ও রঙ-আকৃতিতে আগ্রহ', d: 'ফোন করা, রান্নার নকল — শেখার স্বাভাবিক ধাপ।' }
      ]
    }
  ];
  var msDone = get('cf_milestones', {});
  var msWrap = document.getElementById('milestoneWrap');

  function renderMilestones() {
    if (!msWrap) return;
    var total = 0, doneCount = 0, html = '';
    for (var g = 0; g < msGroups.length; g++) {
      var G = msGroups[g], gc = 0, items = '';
      for (var i = 0; i < G.items.length; i++) {
        var it = G.items[i]; total++;
        var d = !!msDone[it.id]; if (d) { doneCount++; gc++; }
        items += '<button type="button" class="ms-item' + (d ? ' done' : '') + '" data-id="' + it.id + '" aria-pressed="' + (d ? 'true' : 'false') + '">'
          + '<span class="ms-box">' + (d ? '\u2713' : '') + '</span>'
          + '<span class="ms-text"><strong>' + it.t + '</strong><small>' + it.d + '</small></span></button>';
      }
      var pct = Math.round(gc / G.items.length * 100);
      html += '<div class="ms-group"><div class="ms-ghead"><h4>' + G.age + ' <span>' + G.title + '</span></h4><div class="ms-bar"><i style="width:' + pct + '%"></i></div><b>' + bn(gc) + '/' + bn(G.items.length) + '</b></div><div class="ms-list">' + items + '</div></div>';
    }
    msWrap.innerHTML = html;
    var st = document.getElementById('msSumText');
    if (st) st.innerHTML = 'মোট ' + bn(total) + ' টি ধাপ · সম্পন্ন ' + bn(doneCount) + ' টি';
    var sb = document.getElementById('msSumBar');
    if (sb) sb.style.width = (total ? Math.round(doneCount / total * 100) : 0) + '%';
  }

  if (msWrap) {
    msWrap.addEventListener('click', function (e) {
      var b = e.target.closest('.ms-item'); if (!b) return;
      var id = b.getAttribute('data-id');
      if (msDone[id]) delete msDone[id]; else msDone[id] = 1;
      put('cf_milestones', msDone);
      renderMilestones();
    });
  }
  var msReset = document.getElementById('msReset');
  if (msReset) {
    msReset.addEventListener('click', function () {
      if (!confirm('সব মাইলস্টোন আন-টিক করবেন?')) return;
      msDone = {}; put('cf_milestones', msDone);
      renderMilestones();
      toast('মাইলস্টোন রিসেট হয়েছে');
    });
  }
  renderMilestones();

  /* ==================== খাবারের রিমাইন্ডার ==================== */
  var remDefault = {
    enabled: false,
    items: [
      { time: '06:30', label: 'সকালের দুধ বা হালকা খাবার', on: true },
      { time: '09:30', label: 'সকালের প্রধান খাবার / নাস্তা', on: true },
      { time: '12:30', label: 'দুপুরের খাবার', on: true },
      { time: '15:30', label: 'বিকেলের নাস্তা', on: true },
      { time: '18:30', label: 'সন্ধ্যার খাবার', on: true },
      { time: '20:00', label: 'রাতের খাবার ও দুধ', on: true }
    ]
  };
  var rem = get('cf_reminders', null) || remDefault;
  var remList = document.getElementById('remList');

  function renderRem() {
    if (!remList) return;
    var html = '';
    for (var i = 0; i < rem.items.length; i++) {
      var it = rem.items[i];
      html += '<div class="rem-item">'
        + '<input type="time" value="' + it.time + '" data-i="' + i + '" data-f="time" aria-label="রিমাইন্ডারের সময়">'
        + '<input type="text" value="' + esc(it.label) + '" data-i="' + i + '" data-f="label" aria-label="কোন খাবার" placeholder="কোন খাবার">'
        + '<button type="button" class="t-btn' + (it.on ? ' on' : '') + '" data-act="on" data-i="' + i + '">' + (it.on ? 'চালু' : 'বন্ধ') + '</button>'
        + '<button type="button" class="t-btn" data-act="del" data-i="' + i + '" aria-label="মুছুন">✕</button>'
        + '</div>';
    }
    remList.innerHTML = html;
    updateRemStatus();
  }

  function updateRemStatus() {
    var el = document.getElementById('remStatus'), btn = document.getElementById('remToggle');
    if (!el || !btn) return;
    var perm = ('Notification' in window) ? Notification.permission : 'unsupported';
    var pTxt = perm === 'granted' ? 'নোটিফিকেশনের অনুমতি দেওয়া হয়েছে'
      : perm === 'denied' ? 'নোটিফিকেশন ব্লক করা আছে — ব্রাউজার সেটিংস থেকে অনুমতি দিন'
      : perm === 'default' ? 'অনুমতি এখনো দেওয়া হয়নি'
      : 'এই ব্রাউজারে নোটিফিকেশন সাপোর্ট নেই';
    btn.textContent = rem.enabled ? 'রিমাইন্ডার বন্ধ করুন' : 'রিমাইন্ডার চালু করুন';
    el.innerHTML = '<strong>' + (rem.enabled ? '\u25CF রিমাইন্ডার চালু (' + bn(rem.items.length) + ' টি)' : '\u25CB রিমাইন্ডার বন্ধ') + '</strong> · ' + pTxt
      + '<br>ব্রাউজারের ট্যাব বা ইনস্টল করা অ্যাপ খোলা থাকলে সময়মতো নোটিফিকেশন আসবে। ব্যাটারি সেভার/ব্রাউজার সেটিংসে নোটিফিকেশন ব্লক থাকলে কাজ করবে না।';
  }

  function requestPerm(cb) {
    if (!('Notification' in window)) { cb('unsupported'); return; }
    var fired = false;
    function once(p) { if (fired) return; fired = true; cb(p); }
    try {
      var r = Notification.requestPermission(once);
      if (r && typeof r.then === 'function') { r.then(once)['catch'](function () { once('denied'); }); }
    } catch (e) { once('denied'); }
  }

  function notify(title, body) {
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.getRegistration) {
        navigator.serviceWorker.getRegistration().then(function (reg) {
          if (reg && reg.showNotification) {
            reg.showNotification(title, { body: body, icon: 'icon-192.png', badge: 'icon-192.png', tag: 'cf-rem', renotify: true });
          } else {
            new Notification(title, { body: body });
          }
        })['catch'](function () {
          try { new Notification(title, { body: body }); } catch (e2) {}
        });
      } else {
        new Notification(title, { body: body });
      }
    } catch (e) {}
  }

  if (remList) {
    remList.addEventListener('input', function (e) {
      var el = e.target; if (!el.getAttribute) return;
      var i = parseInt(el.getAttribute('data-i'), 10), f = el.getAttribute('data-f');
      if (isNaN(i) || !f || !rem.items[i]) return;
      if (f === 'time') rem.items[i].time = el.value || '12:00';
      if (f === 'label') rem.items[i].label = el.value;
      put('cf_reminders', rem);
    });
    remList.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var i = parseInt(b.getAttribute('data-i'), 10);
      if (isNaN(i) || !rem.items[i]) return;
      var act = b.getAttribute('data-act');
      if (act === 'on') rem.items[i].on = !rem.items[i].on;
      if (act === 'del') rem.items.splice(i, 1);
      put('cf_reminders', rem); renderRem();
    });
  }

  var remAdd = document.getElementById('remAdd');
  if (remAdd) {
    remAdd.addEventListener('click', function () {
      rem.items.push({ time: '12:00', label: 'খাবারের সময়', on: true });
      put('cf_reminders', rem); renderRem();
    });
  }

  var remToggle = document.getElementById('remToggle');
  if (remToggle) {
    remToggle.addEventListener('click', function () {
      if (!('Notification' in window)) { toast('এই ব্রাউজারে নোটিফিকেশন সাপোর্ট নেই'); return; }
      if (rem.enabled) {
        rem.enabled = false; put('cf_reminders', rem); updateRemStatus();
        toast('রিমাইন্ডার বন্ধ হয়েছে'); return;
      }
      requestPerm(function (p) {
        if (p === 'granted') {
          rem.enabled = true; put('cf_reminders', rem); updateRemStatus();
          toast('রিমাইন্ডার চালু হয়েছে');
          notify('রিমাইন্ডার চালু হয়েছে', 'সময়মতো খাবারের নোটিফিকেশন পাবেন।');
        } else {
          updateRemStatus();
          toast('নোটিফিকেশনের অনুমতি পাওয়া যায়নি');
        }
      });
    });
  }

  var remTest = document.getElementById('remTest');
  if (remTest) {
    remTest.addEventListener('click', function () {
      if (!('Notification' in window)) { toast('এই ব্রাউজারে নোটিফিকেশন সাপোর্ট নেই'); return; }
      requestPerm(function (p) {
        if (p === 'granted') {
          notify('পরীক্ষামূলক নোটিফিকেশন', 'রিমাইন্ডার ঠিকমতো কাজ করছে।');
          toast('নোটিফিকেশন পাঠানো হয়েছে');
        } else {
          toast('নোটিফিকেশনের অনুমতি দেওয়া হয়নি');
        }
      });
    });
  }

  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function checkRem() {
    if (!rem.enabled) return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    var now = new Date();
    var hhmm = pad2(now.getHours()) + ':' + pad2(now.getMinutes());
    var dayKey = 'cf_remfired_' + now.getFullYear() + '-' + pad2(now.getMonth() + 1) + '-' + pad2(now.getDate());
    var fired = get(dayKey, []);
    for (var i = 0; i < rem.items.length; i++) {
      var it = rem.items[i];
      var fid = it.time + '|' + it.label;
      if (it.on && it.time === hhmm && fired.indexOf(fid) < 0) {
        fired.push(fid);
        notify('খাবারের সময় — ' + it.label, it.time + ' · শিশুর পরিপূরক খাদ্য/দুধের সময় হয়েছে।');
      }
    }
    put(dayKey, fired);
  }
  setInterval(checkRem, 20000);
  checkRem();
  renderRem();

  /* ==================== ডার্ক মোড ==================== */
  var themeBtn = document.getElementById('themeBtn');
  function applyTheme(t, persist) {
    document.documentElement.setAttribute('data-theme', t);
    if (themeBtn) themeBtn.setAttribute('aria-label', t === 'dark' ? 'লাইট মোড' : 'ডার্ক মোড');
    if (persist) { try { localStorage.setItem('cf_theme', t); } catch (e) {} }
  }
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      applyTheme(cur === 'dark' ? 'light' : 'dark', true);
      toast(cur === 'dark' ? 'লাইট মোড চালু' : 'ডার্ক মোড চালু');
    });
    try {
      var saved = localStorage.getItem('cf_theme');
      if (saved === 'dark' || saved === 'light') applyTheme(saved, false);
    } catch (e) {}
    try {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      var onScheme = function (e) {
        var s = null;
        try { s = localStorage.getItem('cf_theme'); } catch (err) {}
        if (s !== 'dark' && s !== 'light') applyTheme(e.matches ? 'dark' : 'light', false);
      };
      if (mq.addEventListener) mq.addEventListener('change', onScheme);
      else if (mq.addListener) mq.addListener(onScheme);
    } catch (e) {}
  }

  refreshBtns(); filter();
})(); } catch (err) { console.error(err); }