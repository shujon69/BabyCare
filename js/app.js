/* ============================================================
   app.js — চার্ট, রেসিপি কার্ড ও সূচিপত্র রেন্ডার
   ============================================================ */

/* ---------- চার্ট রেন্ডার ---------- */
try { (function () {
  var tw = document.getElementById('chartTabs'), pw = document.getElementById('chartPanels');
  for (var ci = 0; ci < charts.length; ci++) {
    var c = charts[ci];
    var btn = document.createElement('button');
    btn.className = 'tab-btn' + (ci === 0 ? ' active' : '');
    btn.textContent = c.tab;
    btn.setAttribute('data-target', c.id);
    tw.appendChild(btn);
    var panel = document.createElement('div');
    panel.className = 'tab-panel' + (ci === 0 ? ' active' : '');
    panel.id = c.id;
    var rowsHtml = '';
    for (var ri = 0; ri < c.rows.length; ri++) {
      rowsHtml += '<tr><td>' + c.rows[ri][0] + '</td><td>' + c.rows[ri][1] + '</td><td>' + c.rows[ri][2] + '</td><td>' + c.rows[ri][3] + '</td></tr>';
    }
    var okHtml = '';
    for (var oi = 0; oi < c.ok.length; oi++) { okHtml += '<li>' + c.ok[oi] + '</li>'; }
    var avHtml = '';
    for (var ai = 0; ai < c.avoid.length; ai++) { avHtml += '<li>' + c.avoid[ai] + '</li>'; }
    panel.innerHTML = '<div class="chart-card"><div class="chart-head"><div class="tagline"><span>' + c.tab + '</span><span>দৈনিক রুটিন</span></div><h3>' + c.title + '</h3><p>' + c.intro + '</p></div><div class="chart-grid"><div><div class="box-title">দৈনিক খাবারের সময়সূচি</div><div class="table-wrap"><table class="sched"><thead><tr><th>সময়</th><th>খাবার</th><th>পরিমাণ</th><th>টিপস</th></tr></thead><tbody>' + rowsHtml + '</tbody></table></div><div class="foot-note" style="margin-top:20px">' + c.sub + '</div></div><div><div class="side-box ok"><h4><i>OK</i>করবেন</h4><ul>' + okHtml + '</ul></div><div class="side-box avoid"><h4><i>X</i>এড়িয়ে চলুন</h4><ul>' + avHtml + '</ul></div></div></div></div>';
    pw.appendChild(panel);
  }
  tw.addEventListener('click', function (e) {
    var b = e.target.closest('.tab-btn'); if (!b) return;
    var all = tw.querySelectorAll('.tab-btn');
    for (var i = 0; i < all.length; i++) all[i].classList.remove('active');
    b.classList.add('active');
    var pan = pw.querySelectorAll('.tab-panel');
    for (var j = 0; j < pan.length; j++) pan[j].classList.remove('active');
    var t = document.getElementById(b.getAttribute('data-target'));
    if (t) t.classList.add('active');
  });
})(); } catch (err) { console.error(err); }

/* ---------- রেসিপি রেন্ডার (০১–১৭) ---------- */
try { (function () {
  function buildCard(r) {
    var ingRows = '';
    for (var i = 0; i < r.ing.length; i++) {
      ingRows += '<tr><td>' + r.ing[i][0] + '</td><td>' + r.ing[i][1] + '</td><td>' + r.ing[i][2] + '</td></tr>';
    }
    var nutriHtml = '';
    if (r.nutri && r.nutri.length) {
      nutriHtml = '<div class="nutri">';
      for (var n = 0; n < r.nutri.length; n++) {
        nutriHtml += '<div class="nut"><b>' + r.nutri[n][1] + '</b><small>' + r.nutri[n][0] + '</small></div>';
      }
      nutriHtml += '</div>';
    } else {
      nutriHtml = '<p style="color:var(--ink-soft);font-size:15px">উপকরণ-ভিত্তিক পুষ্টি ব্যাখ্যা নিচে।</p>';
    }
    var benHtml = '';
    if (r.benefits && r.benefits.length) {
      benHtml = '<div class="box-title" style="margin-top:30px">পুষ্টিগুণ</div><ul class="benefits">';
      for (var b = 0; b < r.benefits.length; b++) { benHtml += '<li>' + r.benefits[b] + '</li>'; }
      benHtml += '</ul>';
    }
    var factsHtml = '';
    if (r.facts && r.facts.length) {
      factsHtml = '<div class="facts">';
      for (var f = 0; f < r.facts.length; f++) {
        factsHtml += '<div class="fact"><b>' + r.facts[f][1] + '</b> &middot; ' + r.facts[f][0] + '</div>';
      }
      factsHtml += '</div>';
    }
    var hotHtml = r.hot ? '<span class="hot">' + r.hot + '</span>' : '';
    var stepsHtml = '';
    for (var s = 0; s < r.steps.length; s++) { stepsHtml += '<li><p>' + r.steps[s] + '</p></li>'; }
    return '<div class="recipe-head"><div class="tagline"><span>রেসিপি ' + r.n + '</span><span>' + r.age + '</span><span>সময়: ' + r.time + '</span>' + hotHtml + '</div><h3>' + r.title + '</h3><p>' + r.intro + '</p></div><div class="recipe-grid"><div><div class="box-title">উপকরণ ও পরিমাণ</div><div class="table-wrap"><table><thead><tr><th>উপকরণ</th><th>পরিমাণ</th><th>ঘরোয়া মাপ</th></tr></thead><tbody>' + ingRows + '</tbody></table></div><div class="box-title" style="margin-top:30px">প্রতি ১০০ গ্রামে পুষ্টিগুণ</div>' + nutriHtml + benHtml + factsHtml + '</div><div><div class="box-title">প্রস্তুত প্রণালী</div><ol class="steps">' + stepsHtml + '</ol><div class="foot-note">' + r.note + '</div></div></div>';
  }
  var list = document.getElementById('recipeList');
  var all = recipes.concat(extra);
  for (var i = 0; i < all.length; i++) {
    var el = document.createElement('article');
    el.className = 'recipe reveal';
    el.id = all[i].id;
    el.setAttribute('data-n', all[i].n);
    el.innerHTML = buildCard(all[i]);
    list.appendChild(el);
  }
})(); } catch (err) { console.error(err); }

/* ---------- সূচিপত্র রেন্ডার ---------- */
try { (function () {
  var idxGrid = document.getElementById('idxGrid');
  if (!idxGrid) return;
  var items = [], all = recipes.concat(extra);
  for (var i = 0; i < all.length; i++) {
    items.push({ n: all[i].n, t: all[i].title, s: 'রেসিপি · ' + all[i].age, href: '#' + all[i].id });
  }
  items.push({ n: '১৮', t: 'শাগড়া জাতীয় প্রস্তুত মিশ্রণ', s: 'শুকনো মিশ্রণ · সংরক্ষণযোগ্য', href: '#shagara' });
  for (var k = 0; k < items.length; k++) {
    var a = document.createElement('a');
    a.href = items[k].href;
    a.innerHTML = '<div class="n">' + items[k].n + '</div><div class="t">' + items[k].t + '<small>' + items[k].s + '</small></div>';
    idxGrid.appendChild(a);
  }
})(); } catch (err) { console.error(err); }