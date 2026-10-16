/* SoFlo forms: live validation, greyed-out submit, optional multi-step.
   Opt in with data-validate on a form (or any wrapper). Field rules come from markup:
     required · type=email · type=tel (10 digits) · data-zip (5 digits)
     data-fullname (first + last) · data-match="#otherId" · data-oneof="group" (at least one in group)
   Buttons: data-submit (whole form) · data-next / data-back inside [data-step-panel]s of a [data-steps] wrapper.
   Messages appear under a field once it has been left (or typed in), then update on every keystroke. */
(function () {
  var MSG = {
    req: 'Required',
    email: 'Enter a valid email, like name@email.com',
    tel: 'Phone number needs 10 digits',
    zip: 'ZIP code is 5 digits',
    full: 'Type your first and last name',
    match: "Doesn't match",
    oneof: 'Add a phone or email so we can reach you',
    check: 'Check this box to continue'
  };

  function digits(v) { return (v || '').replace(/\D/g, ''); }
  function val(el) { return (el.value || '').trim(); }
  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }

  function fieldsIn(root) {
    return [].filter.call(root.querySelectorAll('input,select,textarea'), function (f) {
      return f.type !== 'hidden' && f.type !== 'submit' && f.type !== 'button' &&
        !f.classList.contains('hp') && !f.classList.contains('nav-toggle') && f.id !== 'company';
    });
  }

  function label(el) {
    if (el.getAttribute('data-oneof')) return el.getAttribute('data-oneof-label') || 'Phone or email';
    var l = el.id && document.querySelector('label[for="' + el.id + '"]');
    if (!l) { var p = el.closest('.field,.form-group,.form-row,div'); l = p && p.querySelector('label'); }
    var t = l ? l.textContent : (el.placeholder || el.name || 'a field');
    t = t.replace(/\*|\(optional\)/gi, '').replace(/\s+/g, ' ').trim();
    return el.type === 'checkbox' ? 'Agreement checkbox' : t;
  }

  function check(el, scope) {
    var v = val(el), t = (el.getAttribute('type') || '').toLowerCase(), req = el.hasAttribute('required');
    if (t === 'checkbox') return req && !el.checked ? MSG.check : '';
    if (!v) {
      var grp = el.getAttribute('data-oneof');
      if (grp) {
        var any = [].some.call(scope.querySelectorAll('[data-oneof="' + grp + '"]'), function (f) { return val(f); });
        return any ? '' : MSG.oneof;
      }
      return req ? MSG.req : '';
    }
    if (t === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return MSG.email;
    if (t === 'tel') { var d = digits(v); if (!(d.length === 10 || (d.length === 11 && d.charAt(0) === '1'))) return MSG.tel; }
    if (el.hasAttribute('data-zip') && !/^\d{5}$/.test(v)) return MSG.zip;
    if (el.hasAttribute('data-fullname') && v.split(/\s+/).length < 2) return MSG.full;
    var mt = el.getAttribute('data-match');
    if (mt) { var o = document.querySelector(mt); if (o && val(o) !== v) return el.getAttribute('data-match-msg') || MSG.match; }
    return '';
  }

  function msgEl(el) {
    if (el._msg) return el._msg;
    var m = document.createElement('div');
    m.className = 'field-msg';
    m.setAttribute('aria-live', 'polite');
    var anchor = el.type === 'checkbox' ? (el.closest('.agree-checkbox-row') || el.parentNode) : el;
    anchor.insertAdjacentElement('afterend', m);
    if (el.id) { m.id = el.id + '-msg'; el.setAttribute('aria-describedby', m.id); }
    el._msg = m;
    return m;
  }

  function render(el, scope) {
    var e = check(el, scope), show = !!el._touched, m = msgEl(el);
    m.textContent = show ? e : '';
    el.classList.toggle('is-invalid', !!(show && e));
    el.classList.toggle('is-valid', !e && el.type !== 'checkbox' && !!val(el));
    el.setAttribute('aria-invalid', show && e ? 'true' : 'false');
  }

  function renderRelated(el, scope) {
    render(el, scope);
    var g = el.getAttribute('data-oneof');
    if (g) [].forEach.call(scope.querySelectorAll('[data-oneof="' + g + '"]'), function (o) { if (o !== el) render(o, scope); });
    if (el.id) [].forEach.call(scope.querySelectorAll('[data-match="#' + el.id + '"]'), function (o) { if (o._touched) render(o, scope); });
  }

  function allValid(list, scope) { return list.every(function (f) { return !check(f, scope); }); }
  function missing(list, scope) { return uniq(list.filter(function (f) { return check(f, scope); }).map(label)); }

  function hint(btn, miss) {
    var h = btn._hint;
    if (!h) { h = document.createElement('p'); h.className = 'form-hint'; btn.insertAdjacentElement('afterend', h); btn._hint = h; }
    h.textContent = miss.length ? 'Still needed: ' + miss.join(', ') : '';
  }

  function update(scope) {
    if (scope.hasAttribute('data-steps')) {
      var panel = scope.querySelector('[data-step-panel].on'), nx = panel && panel.querySelector('[data-next]');
      if (nx) { var pl = fieldsIn(panel), ok = allValid(pl, scope); nx.disabled = !ok; hint(nx, ok ? [] : missing(pl, scope)); }
    }
    var sb = scope.querySelector('[data-submit]');
    if (sb) {
      var host = scope.hasAttribute('data-steps') ? scope.querySelector('[data-step-panel].on') : scope;
      if (host && host.contains(sb)) {
        var all = fieldsIn(scope), ok2 = allValid(all, scope);
        sb.disabled = !ok2;
        hint(sb, ok2 ? [] : missing(all, scope));
      }
    }
  }

  function initSteps(scope) {
    var panels = [].slice.call(scope.querySelectorAll('[data-step-panel]')), i = 0;
    var prog = scope.querySelector('[data-progress]');
    function show(n) {
      i = Math.max(0, Math.min(n, panels.length - 1));
      panels.forEach(function (p, k) { p.classList.toggle('on', k === i); });
      if (prog) {
        var lab = prog.querySelector('.fs-label'), fill = prog.querySelector('.fs-fill');
        if (lab) lab.textContent = 'Step ' + (i + 1) + ' of ' + panels.length + ' · ' + (panels[i].getAttribute('data-title') || '');
        if (fill) fill.style.width = ((i + 1) / panels.length * 100) + '%';
      }
      update(scope);
    }
    scope.addEventListener('click', function (e) {
      var nx = e.target.closest('[data-next]'), bk = e.target.closest('[data-back]');
      if (nx) {
        e.preventDefault();
        var pl = fieldsIn(panels[i]);
        pl.forEach(function (f) { f._touched = true; render(f, scope); });
        if (allValid(pl, scope)) { show(i + 1); scope.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      }
      if (bk) { e.preventDefault(); show(i - 1); }
    });
    show(0);
  }

  function init(scope) {
    fieldsIn(scope).forEach(function (f) {
      msgEl(f);
      var ev = (f.type === 'checkbox' || f.tagName === 'SELECT') ? 'change' : 'input';
      f.addEventListener(ev, function () {
        if (val(f) || f.type === 'checkbox') f._touched = true;
        renderRelated(f, scope); update(scope);
      });
      f.addEventListener('blur', function () { f._touched = true; renderRelated(f, scope); update(scope); });
    });
    scope.addEventListener('focusin', function () { update(scope); });
    if (scope.hasAttribute('data-steps')) initSteps(scope);
    var form = scope.tagName === 'FORM' ? scope : scope.closest('form');
    if (form) {
      form.setAttribute('novalidate', '');
      form.addEventListener('submit', function (e) {
        var all = fieldsIn(scope);
        if (!allValid(all, scope)) {
          e.preventDefault(); e.stopImmediatePropagation();
          all.forEach(function (f) { f._touched = true; render(f, scope); });
          update(scope);
        }
      }, true);
    }
    update(scope);
  }

  function boot() { [].forEach.call(document.querySelectorAll('[data-validate]'), init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
