/* InWork PoC — منطق المحاكاة التفاعلية. جميع البيانات تجريبية؛ لا يوجد أي إرسال فعلي أو دفع أو تتبع حقيقي. */
(function () {
  'use strict';
  var D = window.INWORK_DATA;

  /* ---------- الخريطة ---------- */
  var map = L.map('map', {
    center: [D.center.lat, D.center.lng],
    zoom: D.center.zoom,
    zoomControl: false,
    attributionControl: true
  });
  map.attributionControl.setPrefix(false);

  var schematicAttrib = 'رسم تخطيطي تقريبي — InWork PoC';
  var osmAttrib = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  // الطبقة المعمارية المدمجة (SVG) — تعمل دائماً لأنها جزء من الصفحة
  function project(lat, lng) {
    var b = D.svgBounds;
    return {
      x: (lng - b.west) / (b.east - b.west) * 1000,
      y: (b.north - lat) / (b.north - b.south) * 700
    };
  }

  function buildSchematicSVG() {
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 1000 700');
    svg.setAttribute('preserveAspectRatio', 'none');

    var bg = document.createElementNS(NS, 'rect');
    bg.setAttribute('width', 1000); bg.setAttribute('height', 700);
    bg.setAttribute('fill', '#F0EBE0');
    svg.appendChild(bg);

    // شبكة خلفية خفيفة
    for (var gx = 0; gx <= 1000; gx += 50) {
      var gl = document.createElementNS(NS, 'line');
      gl.setAttribute('x1', gx); gl.setAttribute('y1', 0);
      gl.setAttribute('x2', gx); gl.setAttribute('y2', 700);
      gl.setAttribute('stroke', '#E4DECF'); gl.setAttribute('stroke-width', '0.6');
      svg.appendChild(gl);
    }
    for (var gy = 0; gy <= 700; gy += 50) {
      var gl2 = document.createElementNS(NS, 'line');
      gl2.setAttribute('x1', 0); gl2.setAttribute('y1', gy);
      gl2.setAttribute('x2', 1000); gl2.setAttribute('y2', gy);
      gl2.setAttribute('stroke', '#E4DECF'); gl2.setAttribute('stroke-width', '0.6');
      svg.appendChild(gl2);
    }

    // الطرق
    D.roads.forEach(function (r) {
      var pts = r.points.map(function (p) { var q = project(p[0], p[1]); return q.x + ',' + q.y; }).join(' ');
      var pl = document.createElementNS(NS, 'polyline');
      pl.setAttribute('points', pts);
      pl.setAttribute('fill', 'none');
      if (r.kind === 'highway') { pl.setAttribute('stroke', '#B84A27'); pl.setAttribute('stroke-width', '7'); pl.setAttribute('stroke-opacity', '0.55'); }
      else if (r.kind === 'axis') { pl.setAttribute('stroke', '#8A8577'); pl.setAttribute('stroke-width', '6'); }
      else { pl.setAttribute('stroke', '#FFFFFF'); pl.setAttribute('stroke-width', '9'); pl.setAttribute('stroke-dasharray', r.kind === 'major' ? '' : '4 3'); }
      pl.setAttribute('stroke-linecap', 'round'); pl.setAttribute('stroke-linejoin', 'round');
      svg.appendChild(pl);

      var mid = r.points[Math.floor(r.points.length / 2)];
      var mp = project(mid[0], mid[1]);
      var t = document.createElementNS(NS, 'text');
      t.setAttribute('x', mp.x); t.setAttribute('y', mp.y - 6);
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('font-size', '10'); t.setAttribute('font-weight', '700');
      t.setAttribute('fill', r.kind === 'highway' ? '#8C3A1E' : '#5B564A');
      t.textContent = r.name;
      svg.appendChild(t);
    });

    // الأحياء والمعالم
    D.neighborhoods.forEach(function (n) {
      var p = project(n.lat, n.lng);
      var blob = document.createElementNS(NS, 'ellipse');
      blob.setAttribute('cx', p.x); blob.setAttribute('cy', p.y);
      blob.setAttribute('rx', 34); blob.setAttribute('ry', 19);
      blob.setAttribute('fill', '#EAE5DC'); blob.setAttribute('stroke', '#DCD6CA');
      blob.setAttribute('stroke-width', '1.5'); blob.setAttribute('fill-opacity', '0.75');
      svg.appendChild(blob);
      var t = document.createElementNS(NS, 'text');
      t.setAttribute('x', p.x); t.setAttribute('y', p.y + 5);
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('font-size', '11'); t.setAttribute('font-weight', '500'); t.setAttribute('fill', '#18181B');
      t.textContent = n.name;
      svg.appendChild(t);
    });

    return svg;
  }

  var schematicOverlay = L.svgOverlay(buildSchematicSVG(),
    [[D.svgBounds.south, D.svgBounds.west], [D.svgBounds.north, D.svgBounds.east]],
    { interactive: false, attribution: schematicAttrib });

  var osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: osmAttrib,
    errorTileUrl: ''
  });

  var osmErrors = 0;
  osmLayer.on('tileerror', function () {
    osmErrors++;
    if (osmErrors >= 4) { setLayer('schematic', true); }
  });

  var currentLayer = 'schematic';
  function setLayer(kind, fromError) {
    currentLayer = kind;
    if (kind === 'osm') {
      if (map.hasLayer(schematicOverlay)) map.removeLayer(schematicOverlay);
      if (!map.hasLayer(osmLayer)) osmLayer.addTo(map);
      mapNote.textContent = 'طبقة OpenStreetMap — خدمة خارجية بأفضل جهد، دون ضمان توافر.';
    } else {
      if (map.hasLayer(osmLayer)) map.removeLayer(osmLayer);
      if (!map.hasLayer(schematicOverlay)) schematicOverlay.addTo(map);
      mapNote.textContent = 'الخريطة المعمارية المدمجة — رسم تخطيطي تقريبي يعمل دون اتصال.';
      if (fromError) showToast('تعذر تحميل بلاطات OpenStreetMap — تم الرجوع تلقائياً للخريطة المعمارية المدمجة.');
    }
    Array.prototype.forEach.call(document.querySelectorAll('[data-layer-btn]'), function (b) {
      b.classList.toggle('active', b.getAttribute('data-layer-btn') === kind);
    });
  }
  schematicOverlay.addTo(map);

  /* ---------- علامة العميل ---------- */
  var clientMarker = L.marker([D.center.lat, D.center.lng], {
    draggable: true,
    icon: L.divIcon({ className: '', html: '<div class="client-pin"></div>', iconSize: [22, 22], iconAnchor: [11, 20] })
  }).addTo(map);
  clientMarker.bindTooltip('موقع العميل (تجريبي) — اسحب أو انقر على الخريطة', { direction: 'top', offset: [0, -18] });

  function nearestHood(lat, lng) {
    var best = null, bestD = Infinity;
    D.neighborhoods.forEach(function (n) {
      var d = Math.pow(n.lat - lat, 2) + Math.pow(n.lng - lng, 2);
      if (d < bestD) { bestD = d; best = n; }
    });
    return best ? best.name : '—';
  }

  var coordsChip = document.getElementById('coordsChip');
  var mapNote = document.getElementById('mapNote');
  function updateClientPos(lat, lng) {
    state.clientLat = lat; state.clientLng = lng;
    state.hood = nearestHood(lat, lng);
    coordsChip.textContent = lat.toFixed(5) + ', ' + lng.toFixed(5) + ' — ' + state.hood;
  }
  clientMarker.on('dragend', function () {
    var p = clientMarker.getLatLng(); updateClientPos(p.lat, p.lng);
  });
  map.on('click', function (e) {
    clientMarker.setLatLng(e.latlng); updateClientPos(e.latlng.lat, e.latlng.lng);
  });

  /* ---------- الحالة ---------- */
  var state = {
    mode: 'client',
    clientLat: D.center.lat, clientLng: D.center.lng, hood: nearestHood(D.center.lat, D.center.lng),
    spec: null, desc: '', pay: 'كاش', path: 'negotiate',
    suggested: null, offers: [], chosen: null, pkg: null,
    tracking: false, techAvailable: true, earnings: 0
  };
  var trackTimer = null, offerTimers = [], techMarker = null, trackLine = null, reqMarkers = [];

  /* ---------- عناصر عامة ---------- */
  var sheet = document.getElementById('bottomSheet');
  var sheetBody = document.getElementById('sheetBody');
  var sheetTitle = document.getElementById('sheetTitle');
  var toast = document.getElementById('toast');
  var toastTimer = null;

  function showToast(msg) {
    toast.textContent = msg; toast.style.display = 'block';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.style.display = 'none'; }, 3800);
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  document.getElementById('sheetHandle').addEventListener('click', function () {
    sheet.classList.toggle('collapsed');
  });

  /* ---------- القائمة الجانبية ---------- */
  var sideMenu = document.getElementById('sideMenu');
  document.getElementById('menuFab').addEventListener('click', function () {
    sideMenu.classList.toggle('open');
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-mode-btn]'), function (b) {
    b.addEventListener('click', function () { setMode(b.getAttribute('data-mode-btn')); });
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-layer-btn]'), function (b) {
    b.addEventListener('click', function () { setLayer(b.getAttribute('data-layer-btn')); });
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-hood]'), function (b) {
    b.addEventListener('click', function () {
      var n = D.neighborhoods.find(function (x) { return x.id === b.getAttribute('data-hood'); });
      if (n) { map.flyTo([n.lat, n.lng], 14); sideMenu.classList.remove('open'); }
    });
  });
  document.getElementById('resetBtn').addEventListener('click', function () { location.reload(); });

  function setMode(m) {
    state.mode = m;
    Array.prototype.forEach.call(document.querySelectorAll('[data-mode-btn]'), function (b) {
      b.classList.toggle('active', b.getAttribute('data-mode-btn') === m);
    });
    document.getElementById('walletLabel').textContent = m === 'tech' ? 'أرباح اليوم (محاكاة)' : 'رصيد المحفظة (محاكاة)';
    document.getElementById('walletValue').textContent = m === 'tech' ? state.earnings + ' ج.م' : '1,250 ج.م';
    clearTracking(); clearReqMarkers();
    if (m === 'tech') renderTechHome(); else renderClientHome();
  }

  /* ---------- وضع العميل ---------- */
  function renderClientHome() {
    sheetTitle.textContent = 'طلب خدمة فنية — محاكاة';
    var specChips = D.specialties.map(function (s) {
      return '<button class="chip' + (state.spec === s.id ? ' active' : '') + '" data-spec="' + s.id + '">' + s.name + '</button>';
    }).join('');
    var payChips = D.paymentMethods.map(function (p) {
      return '<button class="chip' + (state.pay === p ? ' active' : '') + '" data-pay="' + p + '">' + p + '</button>';
    }).join('');
    sheetBody.innerHTML =
      '<div class="field-label">التخصص الفني</div><div class="chip-row">' + specChips + '</div>' +
      '<div class="field-label">وصف العطل</div>' +
      '<textarea class="desc-input" id="descInput" placeholder="مثال: تسريب ماء أسفل الحوض منذ أمس">' + esc(state.desc) + '</textarea>' +
      '<div class="field-label">طريقة الدفع <span class="sim-tag">محاكاة — لا معاملة مالية فعلية</span></div>' +
      '<div class="chip-row">' + payChips + '</div>' +
      '<div class="field-label">مسار الطلب</div>' +
      '<div class="path-tabs">' +
      '<button data-path="negotiate" class="' + (state.path === 'negotiate' ? 'active' : '') + '">تفاوض وعروض أسعار<br><small style="font-weight:400">نمط إندرايف</small></button>' +
      '<button data-path="packages" class="' + (state.path === 'packages' ? 'active' : '') + '">تسعير فوري مضمون<br><small style="font-weight:400">نمط أوبر وكريم</small></button>' +
      '</div>' +
      '<button class="btn-primary" id="goBtn">متابعة الطلب</button>' +
      '<button class="btn-ghost" id="demoBtn">سيناريو تجريبي — تعبئة بنقرة واحدة</button>';

    Array.prototype.forEach.call(sheetBody.querySelectorAll('[data-spec]'), function (b) {
      b.addEventListener('click', function () { state.spec = b.getAttribute('data-spec'); renderClientHome(); });
    });
    Array.prototype.forEach.call(sheetBody.querySelectorAll('[data-pay]'), function (b) {
      b.addEventListener('click', function () { state.pay = b.getAttribute('data-pay'); renderClientHome(); });
    });
    Array.prototype.forEach.call(sheetBody.querySelectorAll('[data-path]'), function (b) {
      b.addEventListener('click', function () { state.path = b.getAttribute('data-path'); renderClientHome(); });
    });
    sheetBody.querySelector('#descInput').addEventListener('input', function (e) { state.desc = e.target.value; });
    sheetBody.querySelector('#goBtn').addEventListener('click', function () {
      if (!state.spec) { showToast('اختر التخصص الفني أولاً.'); return; }
      if (state.path === 'negotiate') renderNegotiate(); else renderPackages();
    });
    sheetBody.querySelector('#demoBtn').addEventListener('click', function () {
      state.spec = 'plumbing'; state.desc = 'تسريب ماء أسفل حوض المطبخ، والحاجة لفني اليوم.'; state.pay = 'كاش';
      state.path = 'negotiate';
      map.flyTo([state.clientLat, state.clientLng], 14);
      renderNegotiate();
      showToast('تمت تعبئة سيناريو تجريبي — كل البيانات محاكاة.');
    });
    sheet.classList.remove('collapsed');
  }

  function currentSpec() { return D.specialties.find(function (s) { return s.id === state.spec; }); }

  function renderNegotiate() {
    var sp = currentSpec();
    sheetTitle.textContent = 'التفاوض وعروض الأسعار — محاكاة';
    sheetBody.innerHTML =
      '<div class="field-label">اقترح سعرك (' + sp.name + ' — ' + esc(state.pay) + ')</div>' +
      '<div class="price-row"><input id="priceInput" type="number" min="0" step="10" placeholder="مثال: ' + sp.fairMin + '" value="' + (state.suggested || '') + '"><span style="font-weight:700">ج.م</span></div>' +
      '<div class="fair-hint" id="fairHint">مؤشر السعر العادل (تجريبي): النطاق الاسترشادي لهذه الخدمة ' + sp.fairMin + '–' + sp.fairMax + ' ج.م</div>' +
      '<button class="btn-primary" id="getOffersBtn">استقبال عروض الفنيين (محاكاة)</button>' +
      '<button class="btn-ghost" id="backBtn">رجوع</button>';

    var hint = sheetBody.querySelector('#fairHint');
    sheetBody.querySelector('#priceInput').addEventListener('input', function (e) {
      var v = parseInt(e.target.value, 10);
      state.suggested = isNaN(v) ? null : v;
      if (isNaN(v)) { hint.className = 'fair-hint'; hint.textContent = 'مؤشر السعر العادل (تجريبي): النطاق الاسترشادي ' + sp.fairMin + '–' + sp.fairMax + ' ج.م'; return; }
      if (v < sp.fairMin) { hint.className = 'fair-hint low'; hint.textContent = 'أقل من النطاق العادل (' + sp.fairMin + '–' + sp.fairMax + ' ج.م) — قد تقل العروض المتاحة. مؤشر تجريبي.'; }
      else if (v > sp.fairMax) { hint.className = 'fair-hint high'; hint.textContent = 'أعلى من النطاق العادل (' + sp.fairMin + '–' + sp.fairMax + ' ج.م). مؤشر تجريبي.'; }
      else { hint.className = 'fair-hint ok'; hint.textContent = 'ضمن النطاق العادل (' + sp.fairMin + '–' + sp.fairMax + ' ج.م). مؤشر تجريبي.'; }
    });
    sheetBody.querySelector('#backBtn').addEventListener('click', renderClientHome);
    sheetBody.querySelector('#getOffersBtn').addEventListener('click', function () {
      if (!state.suggested || state.suggested <= 0) { showToast('أدخل سعراً مقترحاً أولاً.'); return; }
      renderOffersLoading();
    });
  }

  function renderOffersLoading() {
    sheetTitle.textContent = 'جاري استقبال العروض — محاكاة';
    sheetBody.innerHTML = '<div class="offer-card"><div class="meta">يتم الآن عرض طلبك على الفنيين القريبين (محاكاة)…</div></div>';
    state.offers = [];
    offerTimers.forEach(clearTimeout); offerTimers = [];
    var base = state.suggested;
    var offs = [0, 30, 50];
    D.technicians.forEach(function (t, i) {
      offerTimers.push(setTimeout(function () {
        state.offers.push({ tech: t, price: base + offs[i] });
        renderOffers();
      }, 900 * (i + 1)));
    });
  }

  function renderOffers() {
    sheetTitle.textContent = 'العروض الواردة (' + state.offers.length + ' من 3) — محاكاة';
    var cards = state.offers.map(function (o, idx) {
      var t = o.tech;
      return '<div class="offer-card">' +
        '<div class="row1"><span class="tname">' + esc(t.name) + ' <span class="sim-tag">بيانات تجريبية</span></span>' +
        '<span class="price">' + o.price + ' ج.م</span></div>' +
        '<div class="meta">تقييم ' + t.rating + ' ★ (' + t.trips + ' مشواراً تجريبياً) · يبعد ' + t.distKm + ' كم ' +
        (t.b2g ? '· <span class="b2g-badge">✓ تحقق حوكمة B2G</span> <span class="sim-tag">شارة محاكاة</span>' : '· بدون شارة تحقق') + '</div>' +
        '<div class="offer-actions"><button class="accept-btn" data-accept="' + idx + '">قبول العرض</button></div>' +
        '</div>';
    }).join('');
    sheetBody.innerHTML = cards +
      (state.offers.length < 3 ? '<div class="meta" style="font-size:11px;color:var(--muted);margin-top:8px">عروض أخرى في الطريق (محاكاة)…</div>' : '') +
      '<button class="btn-ghost" id="backBtn2">تعديل السعر</button>';
    Array.prototype.forEach.call(sheetBody.querySelectorAll('[data-accept]'), function (b) {
      b.addEventListener('click', function () {
        state.chosen = state.offers[parseInt(b.getAttribute('data-accept'), 10)];
        state.pkg = null;
        startTracking();
      });
    });
    sheetBody.querySelector('#backBtn2').addEventListener('click', renderNegotiate);
  }

  function renderPackages() {
    sheetTitle.textContent = 'باقات التسعير الفوري — أسعار تجريبية';
    var cards = D.packages.map(function (p) {
      return '<div class="pkg-card"><div><div class="pname">' + p.name + '</div>' +
        '<div class="meta">' + p.note + '</div></div>' +
        '<div style="text-align:center"><div class="pprice">' + p.price + ' ج.م</div>' +
        '<button data-pkg="' + p.id + '">حجز فوري</button></div></div>';
    }).join('');
    sheetBody.innerHTML =
      '<div class="fair-hint" style="margin-top:0">أسعار ثابتة تجريبية لغرض العرض — لا حجز ولا دفع فعلي.</div>' +
      cards + '<button class="btn-ghost" id="backBtn3">رجوع</button>';
    Array.prototype.forEach.call(sheetBody.querySelectorAll('[data-pkg]'), function (b) {
      b.addEventListener('click', function () {
        state.pkg = D.packages.find(function (p) { return p.id === b.getAttribute('data-pkg'); });
        state.chosen = { tech: D.technicians[0], price: state.pkg.price };
        startTracking();
      });
    });
    sheetBody.querySelector('#backBtn3').addEventListener('click', renderClientHome);
  }

  /* ---------- التتبع ---------- */
  function startTracking() {
    offerTimers.forEach(clearTimeout); offerTimers = [];
    state.tracking = true;
    var t = state.chosen.tech;
    var from = [t.lat, t.lng];
    var to = [state.clientLat, state.clientLng];

    techMarker = L.marker(from, {
      icon: L.divIcon({ className: '', html: '<div class="tech-pin"></div>', iconSize: [16, 16], iconAnchor: [8, 8] })
    }).addTo(map);
    techMarker.bindTooltip(esc(t.name) + ' (محاكاة)', { direction: 'top', offset: [0, -10] });
    trackLine = L.polyline([from, to], { color: '#B84A27', weight: 3, dashArray: '6 6' }).addTo(map);
    map.flyToBounds(L.latLngBounds([from, to]).pad(0.35));

    var totalSec = 45;          // مدة المحاكاة الفعلية على الشاشة
    var etaStartMin = 12;       // زمن وصول تقديري معروض (تجريبي)
    var t0 = Date.now();
    renderTracking(etaStartMin);

    trackTimer = setInterval(function () {
      var k = Math.min(1, (Date.now() - t0) / (totalSec * 1000));
      var lat = from[0] + (to[0] - from[0]) * k;
      var lng = from[1] + (to[1] - from[1]) * k;
      techMarker.setLatLng([lat, lng]);
      var eta = Math.max(0, Math.ceil(etaStartMin * (1 - k)));
      var etaEl = document.getElementById('etaVal');
      if (etaEl) etaEl.textContent = eta + ' د';
      if (k >= 1) {
        clearInterval(trackTimer); trackTimer = null;
        var st = document.getElementById('trackState');
        if (st) st.textContent = 'وصل الفني (محاكاة) — تحقق من رمز الأمان عند الباب';
        showToast('اكتملت محاكاة الوصول.');
      }
    }, 300);
  }

  function renderTracking(etaMin) {
    var t = state.chosen.tech;
    var src = state.pkg ? 'باقة: ' + state.pkg.name : 'عرض مقبول بعد تفاوض';
    sheetTitle.textContent = 'التتبع الحي — محاكاة';
    sheetBody.innerHTML =
      '<div class="track-status"><div><div style="font-size:13px;font-weight:700" id="trackState">الفني في الطريق (محاكاة)</div>' +
      '<div class="meta" style="font-size:11px;color:var(--muted)">' + esc(t.name) + ' · ' + src + ' · ' + state.chosen.price + ' ج.م · ' + esc(state.pay) + '</div></div>' +
      '<div style="text-align:center"><div class="eta" id="etaVal">' + etaMin + ' د</div>' +
      '<div style="font-size:10px;color:var(--muted)">زمن وصول تقديري تجريبي</div></div></div>' +
      '<div class="pin-box"><div class="pin">' + D.demoPin + '</div>' +
      '<div class="lbl">رمز أمان للتحقق عند الباب — قيمة عرض تجريبي</div></div>' +
      '<div class="track-actions">' +
      '<button class="wa-btn" id="waBtn">تواصل واتساب</button>' +
      '<button id="shareBtn">مشاركة المسار</button>' +
      '<button id="cancelTrackBtn">إنهاء المحاكاة</button></div>' +
      '<div class="fair-hint" style="margin-top:10px">التتبع والموقع المعروضان محاكاة بإحداثيات مختارة يدوياً — لا يتم استخدام موقعك الحقيقي.</div>';

    sheetBody.querySelector('#waBtn').addEventListener('click', function () {
      openDemoModal('تواصل واتساب — عرض تجريبي',
        'طلب InWork (تجريبي)\nالخدمة: ' + currentSpec().name + '\nالفني: ' + t.name + '\nالسعر المتفق عليه: ' + state.chosen.price + ' ج.م\nالمنطقة: ' + state.hood + '\nرمز التحقق: ' + D.demoPin,
        'وضع العرض: لم يتم ربط رقم تواصل فعلي، ولن يتم إرسال أي رسالة. يُضبط الرقم الرسمي عند اعتماد المنصة.');
    });
    sheetBody.querySelector('#shareBtn').addEventListener('click', function () {
      openDemoModal('مشاركة المسار — عرض تجريبي',
        'رابط مشاركة مسار (تجريبي غير فعّال)\nالفني: ' + t.name + '\nمن: ' + t.lat.toFixed(4) + ',' + t.lng.toFixed(4) + '\nإلى: ' + state.clientLat.toFixed(4) + ',' + state.clientLng.toFixed(4) + ' (' + state.hood + ')',
        'لا يتم إنشاء رابط حقيقي أو مشاركة أي موقع في نسخة العرض.');
    });
    sheetBody.querySelector('#cancelTrackBtn').addEventListener('click', function () {
      clearTracking(); renderClientHome();
    });
    sheet.classList.remove('collapsed');
  }

  function clearTracking() {
    state.tracking = false; state.chosen = null; state.pkg = null;
    if (trackTimer) { clearInterval(trackTimer); trackTimer = null; }
    offerTimers.forEach(clearTimeout); offerTimers = [];
    if (techMarker) { map.removeLayer(techMarker); techMarker = null; }
    if (trackLine) { map.removeLayer(trackLine); trackLine = null; }
  }

  /* ---------- وضع الفني ---------- */
  function renderTechHome() {
    sheetTitle.textContent = 'وضع الفني — محاكاة';
    sheetBody.innerHTML =
      '<div class="switch-row"><span style="font-size:13px;font-weight:700">حالة التوفر</span>' +
      '<button class="switch' + (state.techAvailable ? ' on' : '') + '" id="availSwitch" aria-label="حالة التوفر"></button></div>' +
      '<div class="earn-box"><div class="val" id="earnVal">' + state.earnings + ' ج.م</div>' +
      '<div class="lbl">أرباح اليوم — محاكاة، لا تحويلات فعلية</div></div>' +
      '<div class="field-label">طلبات العملاء القريبة <span class="sim-tag">طلبات تجريبية</span></div>' +
      '<div id="reqList"></div>';

    sheetBody.querySelector('#availSwitch').addEventListener('click', function () {
      state.techAvailable = !state.techAvailable;
      this.classList.toggle('on', state.techAvailable);
      if (state.techAvailable) { showRequests(); } else { clearReqMarkers(); sheetBody.querySelector('#reqList').innerHTML = '<div class="meta" style="font-size:12px;color:var(--muted)">أنت غير متاح الآن — الطلبات متوقفة.</div>'; }
    });
    if (state.techAvailable) showRequests();
    sheet.classList.remove('collapsed');
  }

  function showRequests() {
    clearReqMarkers();
    var list = sheetBody.querySelector('#reqList');
    if (!list) return;
    list.innerHTML = D.demoRequests.map(function (r) {
      return '<div class="req-card"><div class="row1"><span class="tname" style="font-size:13px;font-weight:700">' + esc(r.title) + '</span>' +
        '<span class="price" style="font-weight:700;color:var(--olive)">' + r.price + ' ج.م</span></div>' +
        '<div class="meta">' + r.spec + ' · ' + r.area + ' · سعر مقترح من العميل (تجريبي)</div>' +
        '<div class="req-actions">' +
        '<button class="accept-btn" data-acc="' + r.id + '">قبول سعر العميل</button>' +
        '<button class="counter-btn" data-cnt="' + r.id + '" data-add="30">+30</button>' +
        '<button class="counter-btn" data-cnt="' + r.id + '" data-add="50">+50</button>' +
        '<button class="counter-btn" data-cnt="' + r.id + '" data-add="80">+80</button>' +
        '</div><div class="meta" id="st-' + r.id + '"></div></div>';
    }).join('');

    D.demoRequests.forEach(function (r) {
      var m = L.marker([r.lat, r.lng], {
        icon: L.divIcon({ className: '', html: '<div class="req-pin"></div>', iconSize: [16, 16], iconAnchor: [8, 8] })
      }).addTo(map);
      m.bindTooltip(esc(r.title) + ' — ' + r.price + ' ج.م (تجريبي)', { direction: 'top', offset: [0, -10] });
      reqMarkers.push(m);
    });

    Array.prototype.forEach.call(sheetBody.querySelectorAll('[data-acc]'), function (b) {
      b.addEventListener('click', function () {
        var r = D.demoRequests.find(function (x) { return x.id === b.getAttribute('data-acc'); });
        state.earnings += r.price;
        document.getElementById('earnVal').textContent = state.earnings + ' ج.م';
        document.getElementById('walletValue').textContent = state.earnings + ' ج.م';
        document.getElementById('st-' + r.id).innerHTML = '<span style="color:var(--olive);font-weight:700">تم القبول (محاكاة) — أُضيف ' + r.price + ' ج.م لأرباح اليوم.</span>';
      });
    });
    Array.prototype.forEach.call(sheetBody.querySelectorAll('[data-cnt]'), function (b) {
      b.addEventListener('click', function () {
        var r = D.demoRequests.find(function (x) { return x.id === b.getAttribute('data-cnt'); });
        var add = parseInt(b.getAttribute('data-add'), 10);
        var stEl = document.getElementById('st-' + r.id);
        stEl.textContent = 'أُرسل عرض مقابل: ' + (r.price + add) + ' ج.م — بانتظار العميل (محاكاة)…';
        setTimeout(function () {
          var el = document.getElementById('st-' + r.id);
          if (el) {
            el.innerHTML = '<span style="color:var(--olive);font-weight:700">وافق العميل (محاكاة) على ' + (r.price + add) + ' ج.م — أُضيف لأرباح اليوم.</span>';
            state.earnings += r.price + add;
            var ev = document.getElementById('earnVal'); if (ev) ev.textContent = state.earnings + ' ج.م';
            document.getElementById('walletValue').textContent = state.earnings + ' ج.م';
          }
        }, 2000);
      });
    });
  }

  function clearReqMarkers() {
    reqMarkers.forEach(function (m) { map.removeLayer(m); });
    reqMarkers = [];
  }

  /* ---------- النافذة التجريبية ---------- */
  var modalBack = document.getElementById('demoModalBack');
  function openDemoModal(title, msg, note) {
    document.getElementById('demoModalTitle').textContent = title;
    document.getElementById('demoModalMsg').textContent = msg;
    document.getElementById('demoModalNote').textContent = note;
    modalBack.classList.add('open');
  }
  document.getElementById('demoModalClose').addEventListener('click', function () { modalBack.classList.remove('open'); });
  modalBack.addEventListener('click', function (e) { if (e.target === modalBack) modalBack.classList.remove('open'); });

  /* ---------- بدء ---------- */
  updateClientPos(D.center.lat, D.center.lng);
  setLayer('schematic');
  renderClientHome();
})();
