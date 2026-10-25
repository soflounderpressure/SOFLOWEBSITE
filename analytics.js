/* SoFlo UnderPressure measurement loader. Fill the IDs below to turn a tool on.
   While an ID is blank, nothing for that tool is loaded. window.sfTrack is always defined and safe to call. */
(function () {
  'use strict';
  var GA4_ID = '';         /* e.g. G-XXXXXXXXXX */
  var ADS_ID = '';         /* e.g. AW-XXXXXXXXX */
  var META_PIXEL_ID = '';  /* numeric pixel id */
  var CLARITY_ID = '';     /* Microsoft Clarity project id */

  function inject(src) {
    try {
      var s = document.createElement('script');
      s.async = true;
      s.src = src;
      (document.head || document.documentElement).appendChild(s);
    } catch (e) {}
  }

  try {
    if (GA4_ID || ADS_ID) {
      window.dataLayer = window.dataLayer || [];
      if (typeof window.gtag !== 'function') {
        window.gtag = function () { window.dataLayer.push(arguments); };
      }
      window.gtag('js', new Date());
      if (GA4_ID) window.gtag('config', GA4_ID);
      if (ADS_ID) window.gtag('config', ADS_ID);
      inject('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA4_ID || ADS_ID));
    }
  } catch (e1) {}

  try {
    if (META_PIXEL_ID && typeof window.fbq !== 'function') {
      var n = window.fbq = function () {
        if (n.callMethod) n.callMethod.apply(n, arguments); else n.queue.push(arguments);
      };
      if (!window._fbq) window._fbq = n;
      n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
      inject('https://connect.facebook.net/en_US/fbevents.js');
      window.fbq('init', META_PIXEL_ID);
      window.fbq('track', 'PageView');
    }
  } catch (e2) {}

  try {
    if (CLARITY_ID && typeof window.clarity !== 'function') {
      window.clarity = function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
      inject('https://www.clarity.ms/tag/' + encodeURIComponent(CLARITY_ID));
    }
  } catch (e3) {}

  /* Events used on this site: quote_start, quote_area, quote_price_seen, quote_submit,
     call_click, sms_click, text_me_quote, plan_select */
  window.sfTrack = function (name, params) {
    try {
      if (!name) return;
      params = params && typeof params === 'object' ? params : {};
      if (typeof window.gtag === 'function') window.gtag('event', name, params);
      if (typeof window.fbq === 'function') window.fbq('trackCustom', name, params);
    } catch (e) {}
  };
})();
