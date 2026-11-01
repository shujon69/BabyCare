/* ============================================================
   tracker.js — দৈনিক ট্র্যাকিং + ইমেজ কার্ড + শেয়ার
   ============================================================ */
try { (function () {
  var babyEl = document.getElementById('babyName'),
      motherEl = document.getElementById('motherName'),
      dobEl = document.getElementById('birthDate'),
      dateEl = document.getElementById('trackDate'),
      selEl = document.getElementById('chartSelect'),
      listEl = document.getElementById('trackList'),
      statsEl = document.getElementById('trackStats'),
      missedEl = document.getElementById('trackMissed'),
      dateLabel = document.getElementById('trackDateLabel'),
      toastEl = document.getElementById('toast');
  var shareModal = document.getElementById('shareModal'),
      shareImg = document.getElementById('shareImg');
  var cachedBlob = null, shareUrl = null;

  for (var i = 0; i < charts.length; i++) {
    var o = document.createElement('option');
    o.value = charts[i].id;
    o.textContent = charts[i].title;
    selEl.appendChild(o);
  }

  function bn(v) {
    return String(v).replace(/\d/g, function (d) { return '০১২৩৪৫৬৭৮৯'.charAt(d); });
  }
  function showToast(m) {
    toastEl.textContent = m;
    toastEl.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () { toastEl.classList.remove('show'); }, 3000);
  }
  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  dateEl.value = todayStr();

  function fmtDate(v) {
    if (!v) return '—';
    try { return new Date(v + 'T00:00:00').toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); }
    catch (e) { return v; }
  }
  function fmtDateShort(v) {
    if (!v) return '—';
    try { return new Date(v + 'T00:00:00').toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }); }
    catch (e) { return v; }
  }
  function calcAge(dobStr, dateStr) {
    if (!dobStr || !dateStr) return '';
    var d1 = new Date(dobStr + 'T00:00:00'), d2 = new Date(dateStr + 'T00:00:00');
    if (isNaN(d1) || isNaN(d2)) return '';
    var months = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
    if (d2.getDate() < d1.getDate()) months--;
    if (months < 0) return '';
    var ref = new Date(d1.getFullYear(), d1.getMonth() + months, d1.getDate());
    var days = Math.max(0, Math.round((d2 - ref) / 86400000));
    if (months < 24) return bn(months) + ' মাস' + (days > 0 ? ' ' + bn(days) + ' দিন' : '');
    var y = Math.floor(months / 12), m = months % 12;
    return bn(y) + ' বছর' + (m ? ' ' + bn(m) + ' মাস' : '');
  }

  function getDone(d) { return (d.doneBy && d.doneBy[selEl.value]) || {}; }
  function tKey() {
    if (!dateEl.value) dateEl.value = todayStr();
    return 'cf_tracker_' + dateEl.value;
  }
  function loadDay() {
    try { return JSON.parse(localStorage.getItem(tKey())) || {}; }
    catch (e) { return {}; }
  }
  function saveDay(d) {
    try { localStorage.setItem(tKey(), JSON.stringify(d)); } catch (e) {}
  }

  try { babyEl.value = localStorage.getItem('cf_baby') || ''; } catch (e) {}
  try { motherEl.value = localStorage.getItem('cf_mother') || ''; } catch (e) {}
  try { dobEl.value = localStorage.getItem('cf_dob') || ''; } catch (e) {}

  function saveProfile() {
    try {
      localStorage.setItem('cf_baby', babyEl.value);
      localStorage.setItem('cf_mother', motherEl.value);
      localStorage.setItem('cf_dob', dobEl.value);
    } catch (e) {}
  }

  function getChart(id) {
    for (var i = 0; i < charts.length; i++) { if (charts[i].id === id) return charts[i]; }
    return charts[0];
  }
  function autoChart() {
    if (!dobEl.value || !dateEl.value) return;
    var d1 = new Date(dobEl.value + 'T00:00:00'), d2 = new Date(dateEl.value + 'T00:00:00');
    if (isNaN(d1) || isNaN(d2)) return;
    var m = (d2.getFullYear() - d1.getFullYear()) * 12 + d2.getMonth() - d1.getMonth();
    if (d2.getDate() < d1.getDate()) m--;
    if (m < 0) return;
    selEl.value = m <= 6 ? 'c6' : m === 7 ? 'c7' : m === 8 ? 'c8' : m <= 10 ? 'c9' : m <= 12 ? 'c10' : 'c11';
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function render() {
    var day = loadDay();
    if (day.chartId) {
      for (var ci = 0; ci < charts.length; ci++) {
        if (charts[ci].id === day.chartId) { selEl.value = day.chartId; break; }
      }
    } else { autoChart(); }
    var chart = getChart(selEl.value);
    var done = getDone(day);
    dateLabel.textContent = fmtDate(dateEl.value);
    var html = '';
    for (var i = 0; i < chart.rows.length; i++) {
      var r = chart.rows[i];
      var isDone = !!done[i];
      var cls = isDone ? ' done' : '';
      var bCls = isDone ? ' on' : '';
      var bTxt = isDone ? 'OK \u2713' : 'OK';
      var tip = (r[3] && r[3] !== '\u2014') ? ' \u00B7 ' + r[3] : '';
      html += '<div class="track-item' + cls + '"><div class="ti-time">' + r[0] + '</div><div class="ti-food">' + r[1] + '<small>পরিমাণ: ' + r[2] + tip + '</small></div><button class="t-btn' + bCls + '" data-i="' + i + '">' + bTxt + '</button></div>';
    }
    listEl.innerHTML = html;
    var total = chart.rows.length, doneCount = 0;
    for (var k = 0; k < total; k++) { if (done[k]) doneCount++; }
    var pct = total ? Math.round(doneCount / total * 100) : 0;
    var ageStr = calcAge(dobEl.value, dateEl.value);
    statsEl.innerHTML = '<div class="ring-pct" style="--p:' + pct + '"><div class="inner">' + bn(pct) + '%</div></div><div class="stat-lines"><div class="sline"><span>মোট</span><b>' + bn(total) + '</b></div><div class="sline"><span>হয়েছে</span><b>' + bn(doneCount) + '</b></div><div class="sline bad"><span>বাকি</span><b>' + bn(total - doneCount) + '</b></div></div><div class="foot-note" style="margin-top:16px">শিশু: <strong>' + esc(babyEl.value || '—') + '</strong> · মা: <strong>' + esc(motherEl.value || '—') + '</strong>' + (ageStr ? '<br>বয়স: <strong>' + ageStr + '</strong>' : '') + '</div>';
    var mHtml = '', anyMissed = false;
    for (var m = 0; m < total; m++) {
      if (!done[m]) {
        anyMissed = true;
        mHtml += '<li><strong>' + chart.rows[m][0] + '</strong> — ' + chart.rows[m][1] + '</li>';
      }
    }
    missedEl.innerHTML = anyMissed ? '<ul>' + mHtml + '</ul>' : '<p class="all-done">দারুণ! সব সম্পন্ন!</p>';
  }

  listEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.t-btn'); if (!btn) return;
    var day = loadDay();
    var done = getDone(day);
    var idx = btn.getAttribute('data-i');
    if (done[idx]) { delete done[idx]; } else { done[idx] = true; }
    day.doneBy = day.doneBy || {};
    day.doneBy[selEl.value] = done;
    day.chartId = selEl.value;
    day.baby = babyEl.value; day.mother = motherEl.value; day.dob = dobEl.value;
    saveDay(day); render();
  });
  dateEl.addEventListener('change', render);
  dobEl.addEventListener('change', function () { saveProfile(); render(); });
  selEl.addEventListener('change', function () {
    var day = loadDay(); day.chartId = selEl.value; saveDay(day); render();
  });
  babyEl.addEventListener('input', function () { saveProfile(); render(); });
  motherEl.addEventListener('input', function () { saveProfile(); render(); });

  /* ---------- Canvas ইমেজ কার্ড ---------- */
  function rr(x2, cx, cy, cw, ch, r) {
    x2.beginPath();
    x2.moveTo(cx + r, cy);
    x2.arcTo(cx + cw, cy, cx + cw, cy + ch, r);
    x2.arcTo(cx + cw, cy + ch, cx, cy + ch, r);
    x2.arcTo(cx, cy + ch, cx, cy, r);
    x2.arcTo(cx, cy, cx + cw, cy, r);
    x2.closePath();
  }
  function ensureFonts() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.all([
      document.fonts.load('400 52px "Tiro Bangla"', 'আ ১'),
      document.fonts.load('600 32px "Hind Siliguri"', 'আ ১'),
      document.fonts.load('700 28px "Anek Bangla"', 'আ ১')
    ]).then(function () { return document.fonts.ready; }).catch(function () {});
  }

  function buildReportCanvas() {
    return ensureFonts().then(function () {
      var chart = getChart(selEl.value);
      var day = loadDay();
      var done = getDone(day);
      var rows = chart.rows.length;
      var total = rows, doneCount = 0;
      for (var i = 0; i < total; i++) { if (done[i]) doneCount++; }
      var pct = total ? Math.round(doneCount / total * 100) : 0;
      var W = 1080, padX = 72;
      var headH = 286, infoPanelH = 344, progPanelH = 240, rowH = 96, footH = 176;
      var H = headH + 36 + infoPanelH + 30 + progPanelH + 34 + 70 + rows * rowH + 22 + footH;
      var cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      var x2 = cv.getContext('2d');
      x2.fillStyle = '#F7F0E1'; x2.fillRect(0, 0, W, H);
      x2.fillStyle = '#1E3B2A'; x2.fillRect(0, 0, W, headH);
      x2.fillStyle = 'rgba(223,162,63,.15)';
      x2.beginPath(); x2.arc(W - 90, 52, 175, 0, Math.PI * 2); x2.fill();
      x2.fillStyle = 'rgba(194,82,45,.22)';
      x2.beginPath(); x2.arc(70, headH - 8, 125, 0, Math.PI * 2); x2.fill();
      x2.strokeStyle = '#DFA23F'; x2.lineWidth = 2; x2.setLineDash([4, 5]);
      x2.beginPath(); x2.arc(padX + 32, 88, 30, 0, Math.PI * 2); x2.stroke(); x2.setLineDash([]);
      x2.fillStyle = '#DFA23F'; x2.beginPath(); x2.arc(padX + 32, 88, 19, 0, Math.PI * 2); x2.fill();
      x2.fillStyle = '#1E3B2A'; x2.beginPath(); x2.arc(padX + 32, 88, 9, 0, Math.PI * 2); x2.fill();
      x2.fillStyle = '#FFFBF2';
      x2.font = '400 52px "Tiro Bangla", serif';
      x2.fillText('দৈনিক খাদ্যের ট্র্যাকিং রিপোর্ট', padX + 84, 102);
      x2.fillStyle = '#DFA23F';
      x2.font = '600 27px "Hind Siliguri", sans-serif';
      x2.fillText('পরিপূরক খাদ্য ও সুস্থ থাকার গাইড  \u00B7  ৬\u2013২৩ মাস+', padX + 84, 150);
      x2.font = '600 26px "Hind Siliguri", sans-serif';
      var chipW = x2.measureText(chart.title).width + 52;
      rr(x2, padX, headH - 100, chipW, 56, 28);
      x2.fillStyle = 'rgba(223,162,63,.22)'; x2.fill();
      x2.fillStyle = '#DFA23F';
      x2.fillText(chart.title, padX + 26, headH - 62);

      var infoY = headH + 36;
      rr(x2, padX, infoY, W - padX * 2, infoPanelH, 26);
      x2.fillStyle = '#FFFBF2'; x2.fill();
      x2.strokeStyle = 'rgba(36,26,15,.12)'; x2.lineWidth = 2; x2.stroke();
      var col1 = padX + 44, col2 = padX + (W - padX * 2) / 2 + 8, colW = (W - padX * 2) / 2 - 70;
      function field(label, value, fx, fy) {
        x2.fillStyle = '#C2522D';
        x2.font = '700 20px "Anek Bangla", sans-serif';
        x2.fillText(label, fx, fy);
        x2.fillStyle = '#241A0F';
        x2.font = '600 33px "Hind Siliguri", sans-serif';
        x2.fillText(value, fx, fy + 47, colW);
      }
      var baby = babyEl.value || '\u2014', mother = motherEl.value || '\u2014';
      var ageStr2 = calcAge(dobEl.value, dateEl.value) || '\u2014';
      field('শিশুর নাম', baby, col1, infoY + 64);
      field('মায়ের নাম', mother, col2, infoY + 64);
      field('জন্ম তারিখ', fmtDateShort(dobEl.value), col1, infoY + 172);
      field('বয়স', ageStr2, col2, infoY + 172);
      field('রিপোর্টের তারিখ', fmtDateShort(dateEl.value), col1, infoY + 280);
      field('চার্ট', chart.tab, col2, infoY + 280);

      var progY = infoY + infoPanelH + 30;
      rr(x2, padX, progY, W - padX * 2, progPanelH, 26);
      x2.fillStyle = '#FFFBF2'; x2.fill();
      x2.strokeStyle = 'rgba(36,26,15,.12)'; x2.lineWidth = 2; x2.stroke();
      var rcx = padX + 180, rcy = progY + progPanelH / 2, rr2 = 86;
      x2.lineWidth = 24;
      x2.strokeStyle = 'rgba(46,91,64,.15)';
      x2.beginPath(); x2.arc(rcx, rcy, rr2, 0, Math.PI * 2); x2.stroke();
      x2.strokeStyle = '#2E5B40'; x2.lineCap = 'round';
      x2.beginPath(); x2.arc(rcx, rcy, rr2, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct / 100); x2.stroke();
      x2.lineCap = 'butt';
      x2.fillStyle = '#2E5B40';
      x2.font = '700 46px "Anek Bangla", sans-serif';
      x2.textAlign = 'center';
      x2.fillText(bn(pct) + '%', rcx, rcy + 8);
      x2.font = '600 19px "Hind Siliguri", sans-serif';
      x2.fillStyle = '#6B5942';
      x2.fillText('সম্পন্ন', rcx, rcy + 42);
      x2.textAlign = 'left';
      var stats = [['মোট', total, '#2E5B40'], ['সম্পন্ন', doneCount, '#2E5B40'], ['বাকি', total - doneCount, '#C2522D']];
      var sx = padX + 340, sy = progY + 42, sw = 182, sh = 156, gap = 18;
      for (var si = 0; si < stats.length; si++) {
        rr(x2, sx + si * (sw + gap), sy, sw, sh, 18);
        x2.fillStyle = '#F7F0E1'; x2.fill();
        x2.strokeStyle = 'rgba(36,26,15,.12)'; x2.lineWidth = 2; x2.stroke();
        x2.fillStyle = stats[si][2];
        x2.font = '700 52px "Anek Bangla", sans-serif';
        x2.textAlign = 'center';
        x2.fillText(bn(stats[si][1]), sx + si * (sw + gap) + sw / 2, sy + 80);
        x2.fillStyle = '#6B5942';
        x2.font = '600 21px "Hind Siliguri", sans-serif';
        x2.fillText(stats[si][0], sx + si * (sw + gap) + sw / 2, sy + 122);
        x2.textAlign = 'left';
      }

      var listY = progY + progPanelH + 34;
      x2.fillStyle = '#241A0F';
      x2.font = '400 38px "Tiro Bangla", serif';
      x2.fillText('আজকের খাবারের তালিকা', padX, listY + 40);
      x2.fillStyle = '#C2522D';
      x2.font = '600 22px "Hind Siliguri", sans-serif';
      x2.textAlign = 'right';
      x2.fillText(fmtDateShort(dateEl.value), W - padX, listY + 38);
      x2.textAlign = 'left';
      var rowTop = listY + 70;
      for (var ri = 0; ri < rows; ri++) {
        var r = chart.rows[ri];
        var isDone = !!done[ri];
        var ry = rowTop + ri * rowH;
        rr(x2, padX, ry + 5, W - padX * 2, rowH - 13, 18);
        x2.fillStyle = isDone ? 'rgba(46,91,64,.10)' : '#FFFBF2'; x2.fill();
        x2.strokeStyle = isDone ? 'rgba(46,91,64,.38)' : 'rgba(36,26,15,.12)'; x2.lineWidth = 2; x2.stroke();
        var cy = ry + rowH / 2;
        x2.beginPath(); x2.arc(padX + 44, cy, 19, 0, Math.PI * 2);
        if (isDone) {
          x2.fillStyle = '#2E5B40'; x2.fill();
          x2.fillStyle = '#FFFBF2';
          x2.font = '700 22px "Hind Siliguri", sans-serif';
          x2.textAlign = 'center';
          x2.fillText('\u2713', padX + 44, cy + 8);
          x2.textAlign = 'left';
        } else {
          x2.strokeStyle = 'rgba(36,26,15,.25)'; x2.lineWidth = 2.5;
          x2.setLineDash([4, 4]); x2.stroke(); x2.setLineDash([]);
        }
        x2.fillStyle = '#C2522D';
        x2.font = '700 23px "Anek Bangla", sans-serif';
        x2.fillText(r[0], padX + 84, cy - 3);
        x2.fillStyle = '#241A0F';
        x2.font = '600 28px "Hind Siliguri", sans-serif';
        x2.fillText(r[1], padX + 270, cy - 4, 380);
        var tip2 = (r[3] && r[3] !== '\u2014') ? r[3] : '';
        if (tip2) {
          x2.fillStyle = '#6B5942';
          x2.font = '400 20px "Hind Siliguri", sans-serif';
          x2.fillText(tip2, padX + 270, cy + 27, 380);
        }
        x2.textAlign = 'right';
        x2.fillStyle = '#2E5B40';
        x2.font = '700 24px "Anek Bangla", sans-serif';
        x2.fillText(r[2], W - padX - 38, cy + 8, 210);
        x2.textAlign = 'left';
      }

      var fy2 = H - footH;
      x2.fillStyle = '#1E3B2A'; x2.fillRect(0, fy2, W, footH);
      x2.fillStyle = 'rgba(223,162,63,.13)';
      x2.beginPath(); x2.arc(W - 110, fy2 + 30, 150, 0, Math.PI * 2); x2.fill();
      x2.fillStyle = '#FFFBF2';
      x2.font = '400 33px "Tiro Bangla", serif';
      x2.fillText('শিশুদের পুষ্টিকর খাদ্য ও সুস্থ থাকার গাইড', padX, fy2 + 62);
      x2.fillStyle = 'rgba(239,230,210,.82)';
      x2.font = '400 23px "Hind Siliguri", sans-serif';
      x2.fillText('সূত্র: FAO/USAID \u00B7 WHO \u00B7 UNICEF \u00B7 NHS  \u00B7  শিশু: ' + (babyEl.value || '\u2014'), padX, fy2 + 108, W - padX * 2);
      x2.fillStyle = '#DFA23F';
      x2.font = '600 21px "Hind Siliguri", sans-serif';
      x2.fillText('স্বাস্থ্য সংক্রান্ত গুরুতর সমস্যায় অবশ্যই চিকিৎসকের পরামর্শ নিন', padX, fy2 + 148, W - padX * 2);
      return cv;
    });
  }

  function downloadBlob(blob) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'meal-tracking-card-' + dateEl.value + '.png';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  }
  function shareText() {
    var chart = getChart(selEl.value);
    var day = loadDay(); var done = getDone(day);
    var total = chart.rows.length, doneCount = 0;
    for (var i = 0; i < total; i++) { if (done[i]) doneCount++; }
    var pct = total ? Math.round(doneCount / total * 100) : 0;
    return 'দৈনিক খাদ্যের ট্র্যাকিং রিপোর্ট\nশিশু: ' + (babyEl.value || '\u2014') + ' | মা: ' + (motherEl.value || '\u2014') + '\nতারিখ: ' + fmtDateShort(dateEl.value) + '\nসম্পন্ন: ' + bn(doneCount) + '/' + bn(total) + ' (' + bn(pct) + '%)';
  }
  function shareTo(platform) {
    var blob = cachedBlob; if (!blob) return;
    var text = shareText(), file = null;
    try { file = new File([blob], 'meal-tracking-card.png', { type: 'image/png' }); } catch (e) {}
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: 'Meal Tracking', text: text }).then(function () {
        showToast('শেয়ার সম্পন্ন');
      })['catch'](function (err) {
        if (err && err.name === 'AbortError') return;
        fallbackShare(blob, text, platform);
      });
      return;
    }
    fallbackShare(blob, text, platform);
  }
  function fallbackShare(blob, text, platform) {
    downloadBlob(blob);
    if (platform === 'wa') {
      window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(text), '_blank');
      showToast('ছবি ডাউনলোড হয়েছে — হোয়াটস্যাপে সংযুক্ত করুন');
    } else {
      window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(location.href.split('#')[0]), '_blank');
      showToast('ছবি ডাউনলোড হয়েছে — ফেইসবুক পোস্টে যুক্ত করুন');
    }
  }

  document.getElementById('downloadBtn').addEventListener('click', function () {
    showToast('কার্ড তৈরি হচ্ছে...');
    buildReportCanvas().then(function (cv) {
      cv.toBlob(function (blob) { downloadBlob(blob); showToast('কার্ড ডাউনলোড হয়েছে'); }, 'image/png');
    });
  });
  document.getElementById('shareBtn').addEventListener('click', function () {
    showToast('কার্ড তৈরি হচ্ছে...');
    buildReportCanvas().then(function (cv) {
      cv.toBlob(function (b) {
        cachedBlob = b;
        if (shareUrl) URL.revokeObjectURL(shareUrl);
        shareUrl = URL.createObjectURL(b);
        shareImg.src = shareUrl;
        shareModal.classList.add('open');
      }, 'image/png');
    });
  });
  document.getElementById('resetBtn').addEventListener('click', function () {
    if (!confirm('রিসেট করবেন?')) return;
    var day = loadDay(); day.doneBy = day.doneBy || {};
    day.doneBy[selEl.value] = {};
    saveDay(day); render();
    showToast('রিসেট হয়েছে');
  });

  function closeShare() { shareModal.classList.remove('open'); }
  document.getElementById('shareClose').addEventListener('click', closeShare);
  shareModal.addEventListener('click', function (e) { if (e.target === shareModal) closeShare(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeShare(); });
  document.getElementById('waBtn').addEventListener('click', function () { closeShare(); shareTo('wa'); });
  document.getElementById('fbBtn').addEventListener('click', function () { closeShare(); shareTo('fb'); });
  document.getElementById('dlImgBtn').addEventListener('click', function () {
    if (cachedBlob) { downloadBlob(cachedBlob); showToast('কার্ড ডাউনলোড হয়েছে'); return; }
    buildReportCanvas().then(function (cv) {
      cv.toBlob(function (blob) { downloadBlob(blob); showToast('কার্ড ডাউনলোড হয়েছে'); }, 'image/png');
    });
  });
  render();
})(); } catch (err) { console.error(err); }