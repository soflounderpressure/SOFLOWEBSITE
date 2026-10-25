/* SoFlo UnderPressure: attribution, saved-area memory, promo text, sticky mobile bar, welcome-back bar.
   ES5, no dependencies. Every storage access is wrapped. Safe if window.SF (pricing.js) is missing. */
(function () {
  'use strict';
  if (window.__sfSite) return;
  window.__sfSite = 1;

  var DAY = 864e5;
  var PHONE = '3058946336';
  var path = location.pathname || '/';
  var isQuote = /\/instant-quote(\.html)?\/?$/.test(path);
  var isContract = /\/contract(\.html)?\/?$/.test(path);
  var skipBars = isQuote || isContract;

  /* ---------- storage helpers ---------- */
  function get(key, days, tsOf) {
    try {
      var s = window.localStorage.getItem(key);
      if (!s) return null;
      var o = JSON.parse(s);
      if (!o || typeof o !== 'object') return null;
      var ts = tsOf ? tsOf(o) : o.ts;
      if (days && ts && Date.now() - ts > days * DAY) {
        try { window.localStorage.removeItem(key); } catch (e2) {}
        return null;
      }
      return o;
    } catch (e) { return null; }
  }
  function put(key, obj) {
    try { window.localStorage.setItem(key, JSON.stringify(obj)); } catch (e) {}
  }
  function sget(key) {
    try { return window.sessionStorage.getItem(key); } catch (e) { return null; }
  }
  function sput(key, v) {
    try { window.sessionStorage.setItem(key, v); } catch (e) {}
  }

  function SF() { return window.SF && typeof window.SF === 'object' ? window.SF : null; }
  function titleCase(slug) {
    return String(slug || '').replace(/-/g, ' ').replace(/\b[a-z]/g, function (c) { return c.toUpperCase(); });
  }
  function validSlug(s) { return typeof s === 'string' && /^[a-z0-9-]+$/.test(s); }
  function cityNameOf(x) {
    if (!x) return '';
    if (typeof x === 'object') return x.name || (x.slug ? cityNameOf(x.slug) : '');
    var sf = SF();
    try { if (sf && typeof sf.cityName === 'function') { var n = sf.cityName(x); if (n) return n; } } catch (e) {}
    try { if (sf && sf.CITY && sf.CITY[x] && sf.CITY[x][1]) return sf.CITY[x][1]; } catch (e2) {}
    return /^[a-z0-9-]+$/.test(String(x)) ? titleCase(x) : String(x);
  }

  /* ---------- attribution (sfup_attr) ---------- */
  function qs(name) {
    try {
      var m = new RegExp('[?&]' + name + '=([^&#]*)').exec(location.search);
      return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
    } catch (e) { return ''; }
  }
  function cut(s) { return String(s || '').slice(0, 120); }
  function refHost() {
    try {
      var r = document.referrer;
      if (!r) return '';
      var a = document.createElement('a');
      a.href = r;
      if (a.hostname && a.hostname !== location.hostname) return a.hostname.replace(/^www\./, '');
    } catch (e) {}
    return '';
  }
  function touch() {
    var t = {
      src: cut(qs('utm_source')), med: cut(qs('utm_medium')), camp: cut(qs('utm_campaign')),
      term: cut(qs('utm_term')), content: cut(qs('utm_content')),
      gclid: cut(qs('gclid')), fbclid: cut(qs('fbclid')),
      ref: refHost(), landing: path, ts: Date.now()
    };
    if (!t.src && t.ref) {
      t.src = t.ref;
      t.med = /(^|\.)(google|bing|duckduckgo|yahoo|ecosia)\./.test(t.ref + '.') ? 'organic' : 'referral';
    }
    return t;
  }
  function writeAttr() {
    var cur = get('sfup_attr', 90, function (o) { return (o.last && o.last.ts) || (o.first && o.first.ts); });
    var t = touch();
    var hasCampaign = !!(qs('utm_source') || qs('utm_medium') || qs('utm_campaign') || qs('gclid') || qs('fbclid'));
    if (!cur || !cur.first) {
      put('sfup_attr', { first: t, last: t });
    } else if (hasCampaign) {
      put('sfup_attr', { first: cur.first, last: t });
    } else {
      /* keep last as is, but roll its ts so the 90 day window slides while the visitor returns */
      var last = cur.last || cur.first;
      last.ts = Date.now();
      put('sfup_attr', { first: cur.first, last: last });
    }
  }

  /* ---------- saved area (sfup_area) ---------- */
  function readArea() { return get('sfup_area', 90); }
  function writeAreaFromPage() {
    var m = /\/areas\/([a-z0-9-]+?)(?:\.html)?\/?$/.exec(path);
    if (!m) return;
    var slug = m[1];
    var sf = SF();
    var name = '', zone = '';
    try {
      if (sf && sf.CITY && sf.CITY[slug]) {
        zone = sf.CITY[slug][0] || '';
        name = sf.CITY[slug][1] || '';
        if (typeof sf.zoneFor === 'function') zone = sf.zoneFor(slug) || zone;
      } else if (sf && sf.CITY) {
        return; /* not a real city page (e.g. an index) */
      }
    } catch (e) {}
    if (!name) name = titleCase(slug);
    var cur = readArea();
    put('sfup_area', {
      slug: slug, name: name, zone: zone,
      zip: cur && cur.slug === slug && cur.zip ? cur.zip : '',
      ts: Date.now()
    });
  }

  /* ---------- window.sfAttr() ---------- */
  window.sfAttr = function () {
    var out = { area: '', zone: '', zip: '', utm_source: '', utm_medium: '', utm_campaign: '',
      gclid: '', fbclid: '', referrer: '', landing: '', device: 'desktop' };
    try {
      var a = readArea();
      if (a) { out.area = a.name || cityNameOf(a.slug) || ''; out.zone = a.zone || ''; out.zip = a.zip || ''; }
      var at = get('sfup_attr', 90, function (o) { return (o.last && o.last.ts) || (o.first && o.first.ts); });
      if (at) {
        var l = at.last || at.first || {}, f = at.first || {};
        out.utm_source = l.src || f.src || '';
        out.utm_medium = l.med || f.med || '';
        out.utm_campaign = l.camp || f.camp || '';
        out.gclid = l.gclid || f.gclid || '';
        out.fbclid = l.fbclid || f.fbclid || '';
        out.referrer = l.ref || f.ref || '';
        out.landing = l.landing || f.landing || '';
      }
    } catch (e) {}
    try {
      out.device = window.matchMedia && window.matchMedia('(hover:none) and (pointer:coarse)').matches ? 'mobile' : 'desktop';
    } catch (e2) {}
    return out;
  };

  /* ---------- promo text ---------- */
  function fillPromo() {
    var nodes;
    try { nodes = document.querySelectorAll('[data-promo]'); } catch (e) { return; }
    if (!nodes || !nodes.length) return;
    var sf = SF(), txt = '';
    try {
      if (sf && sf.PROMO && typeof sf.promoActive === 'function' && sf.promoActive()) {
        txt = sf.PROMO.label + ': $' + sf.PROMO.amount + ' off your first clean through ' + sf.PROMO.endsText + '.';
      }
    } catch (e2) { txt = ''; }
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = txt;
  }

  /* ---------- sticky mobile bar ---------- */
  function quoteHref() {
    var a = readArea();
    var h = '/instant-quote';
    if (a && validSlug(a.slug)) h += '?area=' + a.slug;
    return h;
  }
  function addBar() {
    if (skipBars || !document.body || document.querySelector('.sfbar')) return;
    var bar = document.createElement('div');
    bar.className = 'sfbar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Quick actions');
    var call = document.createElement('a');
    call.className = 'sfbar-call';
    call.href = 'tel:' + PHONE;
    call.textContent = 'Call or text';
    var go = document.createElement('a');
    go.className = 'sfbar-quote';
    go.href = quoteHref();
    go.textContent = 'Get a free quote';
    bar.appendChild(call);
    bar.appendChild(go);
    document.body.appendChild(bar);
    document.body.className += (document.body.className ? ' ' : '') + 'has-sfbar';
  }

  /* ---------- welcome-back bar ---------- */
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function addWelcome() {
    if (skipBars || !document.body || document.querySelector('.sfwb')) return;
    if (sget('sfup_wb')) return;
    var q = get('sfup_quote', 30);
    if (!q) return;
    var msg = '', linkText = '', href = '';
    if (q.sent) {
      var d = new Date(q.sentAt || q.ts || Date.now());
      if (isNaN(d.getTime())) return;
      msg = 'Welcome back. We have your quote request from ' + MON[d.getMonth()] + ' ' + d.getDate() + '. Questions? ';
      linkText = 'Text us';
      href = 'sms:' + PHONE;
    } else {
      var est = q.est || {};
      var low = Math.round(Number(est.low)), high = Math.round(Number(est.high));
      if (!(low > 0) || !(high > 0)) return;
      var city = cityNameOf(q.area) || cityNameOf(readArea());
      msg = 'Welcome back. Your $' + low + '-$' + high + ' quote' + (city ? ' for ' + city : '') + ' is saved. ';
      linkText = 'Finish it';
      href = '/instant-quote?resume=1';
    }
    var bar = document.createElement('div');
    bar.className = 'sfwb';
    bar.setAttribute('role', 'status');
    var p = document.createElement('p');
    p.appendChild(document.createTextNode(msg));
    var a = document.createElement('a');
    a.href = href;
    a.textContent = linkText;
    p.appendChild(a);
    var x = document.createElement('button');
    x.type = 'button';
    x.className = 'sfwb-x';
    x.setAttribute('aria-label', 'Dismiss');
    x.innerHTML = '&times;';
    x.addEventListener('click', function () {
      if (bar.parentNode) bar.parentNode.removeChild(bar);
    });
    bar.appendChild(p);
    bar.appendChild(x);

    var nav = document.querySelector('.navbar');
    function place() {
      try {
        var top = nav ? Math.round(nav.getBoundingClientRect().bottom + (window.pageYOffset || 0)) : 0;
        bar.style.top = top + 'px';
      } catch (e) {}
    }
    document.body.appendChild(bar);
    place();
    window.addEventListener('resize', place);
    sput('sfup_wb', '1');
  }

  /* ---------- tel / sms click tracking ---------- */
  document.addEventListener('click', function (ev) {
    try {
      var n = ev.target;
      while (n && n !== document) {
        if (n.nodeType === 1 && n.tagName === 'A') break;
        n = n.parentNode;
      }
      if (!n || n === document) return;
      var h = (n.getAttribute('href') || '').toLowerCase();
      if (typeof window.sfTrack !== 'function') return;
      if (h.indexOf('tel:') === 0) window.sfTrack('call_click', { page: path });
      else if (h.indexOf('sms:') === 0) window.sfTrack('sms_click', { page: path });
    } catch (e) {}
  }, false);

  /* ---------- analytics.js (once) ---------- */
  function loadAnalytics() {
    try {
      if (window.sfTrack || document.querySelector('script[data-sf-analytics],script[src*="analytics.js"]')) return;
      var s = document.createElement('script');
      s.src = '/analytics.js?v=20261025';
      s.async = true;
      s.setAttribute('data-sf-analytics', '1');
      (document.head || document.documentElement).appendChild(s);
    } catch (e) {}
  }

  /* ---------- run ---------- */
  function run() {
    try { writeAttr(); } catch (e1) {}
    try { writeAreaFromPage(); } catch (e2) {}
    try { fillPromo(); } catch (e3) {}
    try { addBar(); } catch (e4) {}
    try { addWelcome(); } catch (e5) {}
    loadAnalytics();
  }
  function start() {
    /* pricing.js is needed for promo and area data. If a page did not load it, pull it in once. */
    if (!SF() && !document.querySelector('script[src*="pricing.js"]')) {
      var done = false;
      var go = function () { if (done) return; done = true; run(); };
      try {
        var s = document.createElement('script');
        s.src = '/pricing.js?v=20261025';
        s.onload = go;
        s.onerror = go;
        (document.head || document.documentElement).appendChild(s);
        setTimeout(go, 3000);
      } catch (e) { go(); }
    } else {
      run();
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
