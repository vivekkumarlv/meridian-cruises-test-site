/**
 * Adobe Launch stub — Fictional Test Site
 * ─────────────────────────────────────────────────────────────────────────────
 * Simulates the Adobe Launch runtime loading AppMeasurement.
 * In real Meridian production: this would be the Launch embed code
 * (https://assets.adobedtm.com/.../launch-XXXXX.min.js) which bundles
 * the AppMeasurement extension, Analytics extension config, and all rules.
 *
 * <!-- Adobe Launch — _satellite not present in test env — this stub replaces it -->
 *
 * What this stub does:
 *   1. Calls s_gi() to initialize the AppMeasurement s object with the report suite(s)
 *   2. Exposes window.s and window._mcs (the alias used in am-config.js)
 *   3. Loads am-config.js (contains all variable assignments and tracking functions)
 *   4. Sets up a minimal _satellite shim so Launch-dependent code doesn't throw
 *
 * What a real Launch embed would additionally do:
 *   - Load the AEP Web SDK (alloy.js) or AppMeasurement library from CDN
 *   - Execute configured rules (page-bottom, DOM-ready, custom events)
 *   - Apply processing rule mappings
 *   - Handle consent (OneTrust integration via Launch extension)
 * ─────────────────────────────────────────────────────────────────────────────
 */

(function() {
  'use strict';

  // ── AppMeasurement s_gi initialiser (stub) ──────────────────────────────────
  // In production Launch, this is provided by the AppMeasurement library bundled
  // into the Launch container. Here we stub it so am-config.js can call it.
  if (typeof window.s_gi !== 'function') {
    window.s_gi = function(account) {
      // Minimal AppMeasurement object stub
      var s = {
        account: account,
        charSet: 'UTF-8',
        currencyCode: 'USD',
        trackingServer: '',
        trackingServerSecure: '',
        usePlugins: true,
        linkTrackVars: '',
        linkTrackEvents: '',
        contextData: {},
        prop1: '', prop3: '', prop10: '', prop20: '',
        eVar3: '', eVar4: '', eVar5: '', eVar6: '', eVar7: '', eVar8: '',
        eVar9: '', eVar10: '', eVar11: '', eVar12: '', eVar15: '',
        eVar22: '', eVar23: '', eVar30: '', eVar35: '',
        eVar45: '', eVar46: '', eVar47: '', eVar48: '', eVar49: '', eVar50: '',
        events: '',
        products: '',
        purchaseID: '',
        visitorID: '',

        // t() — page view beacon (stub; logs to console in test env)
        t: function() {
          var payload = {
            type: 'page_view',
            account: s.account,
            trackingServer: s.trackingServer,
            pageName: s.prop1,
            siteSection: s.prop3,
            events: s.events,
            products: s.products,
            eVars: {
              eVar3: s.eVar3, eVar4: s.eVar4, eVar5: s.eVar5,
              eVar6: s.eVar6, eVar7: s.eVar7, eVar8: s.eVar8,
              eVar9: s.eVar9, eVar10: s.eVar10, eVar15: s.eVar15,
              eVar22: s.eVar22, eVar23: s.eVar23, eVar30: s.eVar30,
              eVar45: s.eVar45, eVar46: s.eVar46, eVar50: s.eVar50
            },
            props: {
              prop1: s.prop1, prop3: s.prop3, prop10: s.prop10, prop20: s.prop20
            },
            contextData: s.contextData,
            visitorID: s.visitorID,
            purchaseID: s.purchaseID,
            timestamp: new Date().toISOString()
          };
          console.log('[Meridian AppMeasurement] s.t() beacon:', payload);
          // In production: this would fire an image beacon or fetch to trackingServer
        },

        // tl() — custom link beacon (stub)
        tl: function(obj, linkType, linkName) {
          var payload = {
            type: 'custom_link',
            linkType: linkType,   // 'd'=download, 'e'=exit, 'o'=other
            linkName: linkName,
            eVar50: s.eVar50,
            timestamp: new Date().toISOString()
          };
          console.log('[Meridian AppMeasurement] s.tl() beacon:', payload);
        }
      };

      // Cache instance (real s_gi caches by account string)
      if (!window._s_gi_cache) window._s_gi_cache = {};
      if (!window._s_gi_cache[account]) window._s_gi_cache[account] = s;
      return window._s_gi_cache[account];
    };
  }

  // ── _satellite shim ─────────────────────────────────────────────────────────
  // Prevents "Cannot read property of undefined" errors in pages that check
  // for _satellite.track() or _satellite.getVar() (common in Launch-dependent code).
  if (typeof window._satellite === 'undefined') {
    window._satellite = {
      track: function(event, detail) {
        console.log('[Meridian Launch stub] _satellite.track:', event, detail);
      },
      getVar: function(varName) {
        console.log('[Meridian Launch stub] _satellite.getVar:', varName);
        return '';
      },
      setVar: function(varName, value) {
        console.log('[Meridian Launch stub] _satellite.setVar:', varName, '=', value);
      },
      buildInfo: {
        // Simulated Launch environment metadata
        turbineBuildDate: '2027-01-15T10:00:00Z',
        turbineVersion: '27.2.3',
        environment: 'development',
        buildDate: '2027-01-15T10:00:00Z'
      },
      environment: {
        id: 'EN1234567890abcdef',
        stage: 'development'
      },
      property: {
        name: 'Meridian Test Property',
        id: 'PR1234567890abcdef'
      },
      // Logger
      logger: {
        log: function() { console.log.apply(console, ['[_satellite]'].concat(Array.prototype.slice.call(arguments))); },
        error: function() { console.error.apply(console, ['[_satellite]'].concat(Array.prototype.slice.call(arguments))); }
      }
    };
  }

  // ── Load am-config.js dynamically ──────────────────────────────────────────
  // In a real Launch container, AppMeasurement config would be bundled inline.
  // Here we load the external file. The script is loaded synchronously-equivalent
  // by placing this stub in <head> before am-config.js.
  // (am-config.js is loaded via a separate <script> tag in each HTML page
  //  after this stub, so window.s_gi is already defined when it runs.)

  console.log('[Meridian Launch stub] Initialised. s_gi stub ready. Waiting for am-config.js to execute.');

})();
