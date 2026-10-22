/**
 * AppMeasurement configuration — Fictional Test Site
 * ─────────────────────────────────────────────────────────────────────────────
 * This file simulates a real-world AppMeasurement implementation for
 * Meridian Cruises, with intentional patterns that exercise all
 * LV Tag Pilot migration scanner detection features.
 *
 * INTENTIONAL ERRORS are marked: // intentional: [reason]
 * ─────────────────────────────────────────────────────────────────────────────
 */

/* global s_gi */

// ── s-object alias (intentional: tests sObjectAlias detection) ────────────────
// In real Meridian implementation the s object is aliased to avoid naming conflicts
// with third-party scripts. Migration scanner must detect this alias.
var _mcs = s_gi("mertest1,mertest2"); // intentional: sObjectAlias = "_mcs"
window._mcs = _mcs;
window.s = _mcs; // also expose as window.s for compatibility

// ── Multi-suite (intentional: tests multi-suite detection) ────────────────────
_mcs.account = "mertest1,mertest2"; // intentional: multi-suite — secondary suite "mertest2" should map to separate datastream or report suite config

// ── First-party collection domain (intentional: tests domain detection) ───────
_mcs.trackingServer = "analytics.meridian-test.com"; // intentional: first-party domain — migration note: configure edge domain forwarding in AEP
_mcs.trackingServerSecure = "analytics.meridian-test.com";

// ── Standard AppMeasurement settings ─────────────────────────────────────────
_mcs.charSet = "UTF-8";
_mcs.currencyCode = "USD";
_mcs.usePlugins = true;
_mcs.linkTrackVars = "eVar50";
_mcs.linkTrackEvents = "None";

// ── Plugin library ────────────────────────────────────────────────────────────
// Three plugins detected. Migration scanner should flag plugin usage and
// recommend native XDM equivalents or custom code actions.

/**
 * getQueryParam — extract URL query parameter value
 * intentional: plugin — migration note: use AEP Web SDK getQueryParam Data Element
 * @param {string} queryParam - parameter name to extract
 * @returns {string} parameter value or empty string
 */
function getQueryParam(queryParam) {
  // intentional: plugin stub
  var urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(queryParam) || "";
}

/**
 * getPageName — auto-generate page name from URL path
 * intentional: plugin — migration note: use custom code Data Element or XDM web.webPageDetails.name
 * @param {string} delimiter - separator character (e.g. ":")
 * @param {string} account - site identifier
 * @param {number} pathSplit - how many path segments to include
 * @returns {string} formatted page name
 */
function getPageName(delimiter, account, pathSplit) {
  // intentional: plugin stub
  var pathParts = window.location.pathname.replace(/\/$/, '').split('/').filter(Boolean);
  var parts = pathParts.slice(0, pathSplit);
  if (parts.length === 0) parts = ['home'];
  return account + delimiter + parts.join(delimiter);
}

/**
 * p_fo — once-per-page execution guard
 * intentional: plugin — migration note: handled natively by AEP rule "run once" scope
 * @param {string} fn - function identifier
 * @returns {boolean} true only on first call per page session
 */
function p_fo(fn) {
  // intentional: plugin stub
  if (!window._mcsPFO) window._mcsPFO = {};
  if (!window._mcsPFO[fn]) {
    window._mcsPFO[fn] = 1;
    return true;
  }
  return false;
}

// ── Page-level variables (fire on every page) ─────────────────────────────────
_mcs.prop1 = getPageName(":", "mc", 2); // page name via plugin — high cardinality, suggests prop→eVar for path reporting
_mcs.prop3 = "";   // site section — overridden per page (set below in page-specific functions)
_mcs.eVar15 = "";  // Voyager tier (Bronze/Silver/Gold/Platinum) — low cardinality (4 values), suggests eVar→prop candidate
_mcs.eVar22 = "";  // booking step (1–7 values) — low cardinality, suggests eVar→prop candidate for funnel analysis

// ── Entry page / campaign tracking ───────────────────────────────────────────
// intentional: prop→eVar candidate — prop10 tracks entry page URL but has no
// expiration/attribution; migration scanner should suggest converting to eVar
// with "visit" expiration for campaign landing page attribution.
if (document.referrer === "" || getQueryParam("utm_source")) {
  _mcs.prop10 = window.location.href; // entry page URL — intentional: prop→eVar candidate (needs visit-level attribution)
  _mcs.eVar3 = getQueryParam("utm_source") || "direct"; // campaign source
  _mcs.eVar4 = getQueryParam("utm_campaign") || "";     // campaign name
  _mcs.eVar11 = getQueryParam("utm_medium") || "";      // campaign medium
  _mcs.eVar12 = getQueryParam("utm_content") || "";     // campaign content
}

// ── DOM scraping example ──────────────────────────────────────────────────────
// intentional: isDomScraped — eVar9 is populated by reading .cabin-price text
// from the DOM at runtime. Migration scanner should flag this and suggest
// using a dataLayer variable or an AEP Data Element with a cleaner data source.
var priceEl = document.querySelector(".cabin-price");
if (priceEl) {
  _mcs.eVar9 = priceEl.textContent.trim(); // intentional: DOM scraped → suggest dataLayer push instead
}

// ── contextData variables (some duplicated from eVars) ────────────────────────
// intentional: duplicate_tracking — these contextData keys carry the same values
// as their corresponding eVars. Migration scanner should flag the duplication
// and recommend consolidating to a single XDM field mapping.
// Note: eVar15 is also sourced via processing rule server-side (see comment below)
_mcs.contextData = _mcs.contextData || {};
_mcs.contextData["voyage_id"]       = _mcs.eVar5 || "";  // intentional: duplicate of eVar5 — same value tracked in two places
_mcs.contextData["cabin_category"]  = _mcs.eVar9 || "";  // intentional: duplicate of eVar9 (DOM scraped) — same value tracked in two places
_mcs.contextData["voyager_tier"]    = _mcs.eVar15 || ""; // intentional: isProcessingRuleSourced — in prod, a processing rule writes contextData["voyager_tier"] → eVar15 server-side; scanner should flag the round-trip

// ── Voyage detail page tracking ───────────────────────────────────────────────
/**
 * trackVoyageDetail — fires on cruise-detail.html
 * Includes s.products with merchandising eVar (intentional).
 * @param {string} voyageId - voyage ID (e.g. "MC-AK001")
 * @param {string} voyageName - full voyage name
 * @param {string} itinerary - itinerary region (e.g. "Alaska")
 */
window.trackVoyageDetail = function(voyageId, voyageName, itinerary) {
  _mcs.prop3  = "Cruise Detail";
  _mcs.eVar5  = voyageId + ";binding=list;event1";  // intentional: merchandising eVar with binding=list and event binding
  _mcs.eVar6  = voyageName;    // voyage name — expiration: visit
  _mcs.eVar7  = itinerary;     // itinerary region (Alaska / Caribbean / Europe)
  _mcs.eVar8  = "Verandah";   // default cabin category selection
  // eVar9 is also set by DOM scraping above — intentional: same dimension tracked two ways (conflict test)
  _mcs.events = "prodView";

  // intentional: s.products with merchandising eVar inline
  // Migration scanner should detect products string format and convert to
  // XDM productListItems with productListItems.SKU and commerce.productViews
  _mcs.products = "Cruises;" + voyageName + ";1;0;event1=0;eVar5=" + voyageId + "|eVar9=Verandah";

  _mcs.t();
};

// ── Booking funnel step tracking ──────────────────────────────────────────────
/**
 * trackBookingStep — fires on book-step1 through book-step4
 * intentional: eVar22 low cardinality (1–7) → eVar→prop candidate
 * @param {number} step - step number (1–7)
 * @param {string} stepName - human-readable step label
 */
window.trackBookingStep = function(step, stepName) {
  _mcs.prop3  = "Booking";
  _mcs.eVar22 = step.toString();  // intentional: eVar22 low cardinality (7 distinct values) → eVar→prop candidate for funnel analysis
  _mcs.eVar23 = stepName;
  _mcs.events = "event5";         // funnel step event
  _mcs.t();
};

// ── Booking complete (conversion) ─────────────────────────────────────────────
/**
 * trackBookingComplete — fires on booking-confirmation.html
 * intentional: s.products MISSING quantity segment (products_completeness test)
 * @param {string} bookingId - confirmation number (e.g. "MC-2027-08921")
 * @param {number} totalRevenue - total booking value in USD
 * @param {string} cabinCategory - cabin type (e.g. "Verandah")
 * @param {string} voyageId - voyage ID (e.g. "MC-AK001")
 */
window.trackBookingComplete = function(bookingId, totalRevenue, cabinCategory, voyageId) {
  _mcs.prop3  = "Booking Confirmation";
  _mcs.eVar5  = voyageId + ";binding=list;purchase";  // intentional: merchandising eVar — binding to purchase event
  _mcs.eVar9  = cabinCategory;
  _mcs.eVar10 = bookingId;

  // intentional: products string MISSING quantity field (should be "Cruises;name;qty;revenue;...")
  // This produces: "Cruises;Alaska 7-Night Inside Passage;;3498;event1=3498;eVar5=MC-AK001"
  // The empty segment between name and revenue is the missing quantity (should be "1").
  // Migration scanner products_completeness check should flag this.
  _mcs.products   = "Cruises;Alaska 7-Night Inside Passage;;" + totalRevenue + ";event1=" + totalRevenue + ";eVar5=" + voyageId;
  _mcs.events     = "purchase,event1,event2";
  _mcs.purchaseID = bookingId;   // dedup key
  _mcs.t();
};

// ── Search page tracking ──────────────────────────────────────────────────────
/**
 * trackSearch — fires on cruises.html
 * intentional: prop20 duplicates eVar45 (same search query in both prop and eVar)
 * @param {string} query - search query string
 * @param {number} resultsCount - number of results returned
 * @param {object} filters - active filter selections
 */
window.trackSearch = function(query, resultsCount, filters) {
  _mcs.prop3  = "Cruise Search";
  _mcs.eVar45 = query;              // search query — eVar for attribution (visit expiration)
  _mcs.eVar46 = resultsCount.toString(); // result count
  _mcs.prop20 = query;              // intentional: duplicate of eVar45 — same search query tracked as both prop and eVar; migration scanner should flag duplicate_tracking and suggest consolidating to one XDM field

  if (filters) {
    _mcs.eVar47 = filters.destination || "";
    _mcs.eVar48 = filters.duration    || "";
    _mcs.eVar49 = filters.priceRange  || "";
  }

  _mcs.events = "event10";          // internal search event
  _mcs.t();
};

// ── Voyager Club (loyalty) login tracking ──────────────────────────────────
/**
 * trackLogin — fires on account.html after simulated login
 * intentional: visitorID set directly (legacy stitching approach)
 * @param {string} voyagersId - Voyager Club member ID
 * @param {string} tier - Voyager tier (Bronze/Silver/Gold/Platinum)
 */
window.trackLogin = function(voyagersId, tier) {
  _mcs.prop3   = "Account";
  _mcs.eVar15  = tier;      // intentional: eVar15 Voyager tier — low cardinality (Bronze/Silver/Gold/Platinum = 4 values) → eVar→prop candidate
  _mcs.visitorID = voyagersId; // intentional: direct visitorID set (legacy identity stitching) — migration note: replace with ECID via Web SDK setConsent + identityMap

  _mcs.events  = "event15"; // login event
  _mcs.t();
};

// ── Shore excursion cart tracking ─────────────────────────────────────────────
/**
 * trackExcursionAdd — fires when "Add" button is clicked on shore-excursions.html
 * @param {string} excursionId - excursion product ID
 * @param {string} excursionName - excursion name
 * @param {number} price - excursion price in USD
 */
window.trackExcursionAdd = function(excursionId, excursionName, price) {
  _mcs.prop3    = "Shore Excursions";
  _mcs.events   = "scAdd,event6";   // shopping cart add + excursion-specific event
  _mcs.products = "Excursions;" + excursionName + ";1;" + price;
  _mcs.t();
};

// ── Custom link / CTA tracking ────────────────────────────────────────────────
/**
 * trackCTA — fires on branded CTA link clicks (custom link calls)
 * @param {string} ctaName - CTA label (e.g. "Book Now — Alaska")
 * @param {string} destination - target URL
 */
window.trackCTA = function(ctaName, destination) {
  _mcs.eVar50 = ctaName;           // CTA label — stored for reporting
  _mcs.tl(this, 'o', ctaName);    // custom link ("o" = other link)
};

// ── Login-wall variable (eVar30) ──────────────────────────────────────────────
// intentional: eVar30 is only set inside account.html (after login), making it
// invisible to the migration scanner during unauthenticated crawl.
// Migration scanner should flag eVar30 as "unverified — seen in rule code only"
// and note "requires authenticated session to validate".
// This block executes on ALL pages but the actual value is only set on account.html.
// (The trackLogin function above sets it contextually via the page.)

// ── Destination page tracking ─────────────────────────────────────────────────
window.trackDestination = function(port, region) {
  _mcs.prop3 = "Destinations";
  _mcs.eVar7 = region || "Alaska"; // itinerary/region eVar
  _mcs.eVar35 = port || "";        // port name
  _mcs.t();
};

// ── Generic page view (called on pages without specific tracking) ──────────────
window.trackPage = function(siteSection) {
  _mcs.prop3 = siteSection || "";
  _mcs.t();
};

// ── MODULE 3: Processing Rules Simulation ──────────────────────────────────────
// In a real property, these contextData keys would be mapped to eVars via
// server-side processing rules. The scanner should detect s.contextData
// and flag that these variables may be sourced via processing rules.
_mcs.contextData["voyage_id"] = "VOY-" + Math.floor(Math.random() * 9999);
_mcs.contextData["cabin_class"] = document.querySelector('[data-cabin]')?.dataset.cabin ?? "economy";
_mcs.contextData["booking_source"] = "direct";
// eVar5 is intentionally NOT set in client code — it comes from processing rule:
// contextData['voyage_id'] → eVar5
// eVar12 is NOT set here — comes from: contextData['cabin_class'] → eVar12
// ─────────────────────────────────────────────────────────────────────────────

// ── MODULE 5: A4T Simulation ───────────────────────────────────────────────────
// Simulates Adobe Target injecting TNT: experiment data into eVar25.
// In a real property, at.js does this automatically via the AdobeAnalytics module.
_mcs.eVar25 = "TNT:178432:0:N/A:1|TNT:178433:2:C:1";  // eVar25 = A4T experiment data

// Simulate window.adobe.target presence (at.js stub)
window.adobe = window.adobe || {};
window.adobe.target = {
  VERSION: "2.11.4",
  getOffer: function() {},
  applyOffer: function() {},
  applyOffers: function() {},
};

// s.tnt is also set directly in some older A4T implementations:
_mcs.tnt = _mcs.eVar25;
// ─────────────────────────────────────────────────────────────────────────────

// ── MODULE 6: Media Analytics / Heartbeat Simulation ──────────────────────────
if (window.location.pathname.includes("video")) {
  // Simulate s.Media (Heartbeat SDK pattern)
  var s = window._mcs || window.s || {};
  s.Media = s.Media || {
    open: function(name, length, id) { console.log('[Meridian Stub] Media.open:', name, length, id); },
    play: function(name, offset) { console.log('[Meridian Stub] Media.play:', name, offset); },
    stop: function(name, offset) { console.log('[Meridian Stub] Media.stop:', name, offset); },
    close: function(name) { console.log('[Meridian Stub] Media.close:', name); }
  };
  s.Media.open("Meridian Cruise Highlights", 240, "video_player_1");
  s.Media.play("Meridian Cruise Highlights", 0);

  // Also set pe=ss to simulate network hit pattern (for documentation)
  // Actual pe=ss hits are fired by Heartbeat SDK to /b/ss/ — simulated here
  // for the scanner's custom code pattern detection
  var _mediaHit = function() {
    _mcs.linkTrackVars = "events,eVar10";
    _mcs.linkTrackEvents = "event10";
    _mcs.pe = "ss";        // Heartbeat hit marker
    _mcs.pev3 = "ss";
    // ms_* variables
    _mcs.contextData["ms_s"] = "3";     // seconds played
    _mcs.contextData["ms_v"] = "100";   // volume
    _mcs.contextData["ms_l"] = "0";     // is live
  };
}
// ─────────────────────────────────────────────────────────────────────────────

// ── MODULE 8: Audience Manager / SSF Simulation ───────────────────────────────
// s.audienceManagerServer triggers DIL/SSF detection
_mcs.audienceManagerServer = "meridian-cruises.demdex.net";
_mcs.audienceManagerServerSecure = "meridian-cruises.demdex.net";

// DIL stub — scanner looks for DIL.create() call
window.DIL = window.DIL || {
  version: "9.4",
  create: function(config) {
    console.log('[Meridian Stub] DIL.create called:', config);
    return { api: {} };
  }
};
DIL.create({
  partner: "meridiancruises",
  visitorService: { namespace: "MERIDIAN_ORG_ID@AdobeOrg" }
});
// ─────────────────────────────────────────────────────────────────────────────

// ── MODULE 9: _satellite direct calls ────────────────────────────────────────
// These calls bypass the Launch rules system and call Launch API directly.
// Scanner detects these patterns in rule custom code.
// In a real property this would be in a custom code rule action.
// Here simulated for detection testing:
if (typeof _satellite !== 'undefined') {
  _satellite.track("booking_step_1");                    // direct track call
  var cabinGrade = _satellite.getVar("Cabin Grade DE"); // direct DE read
  _satellite.setVar("booking_timestamp", Date.now());   // direct setVar
}
// ─────────────────────────────────────────────────────────────────────────────
