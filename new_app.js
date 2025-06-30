// HIGHTOUCH EVENTS APP.JS FILE –– LAST UPDATED: 6/30/2025 AT 4:07 PM PT //
// VERSION 4.4

// Safe init: Enable debugging in development mode only if htevents is loaded
function safeInitHightouch(retries = 10) {
    if (window.htevents && typeof window.htevents.debug === 'function') {
        window.htevents.debug(false);
    } else if (retries > 0) {
        setTimeout(() => safeInitHightouch(retries - 1), 300); // Retry every 300ms
    } else {
        console.warn('Hightouch SDK not loaded: window.htevents is undefined.');
    }
}

safeInitHightouch();

// VARIABLE: EVENT_ID
function generateEventID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

// VARIABLE: SESSION_ID
function getSessionId() {
const key = 'ht_session_id';
let sessionId = sessionStorage.getItem(key);
if (!sessionId) {
    sessionId = 'sess-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem(key, sessionId);
}
return sessionId;
}

  // VARIABLE: EXTERNAL_ID
function getExternalId() {
    // --- Get a cookie value by name ---
    function getCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
        }
        return null;
    }

    // --- Set a cookie with expiration and root domain scoping ---
    function setCookie(name, value, days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }

        var hostParts = location.hostname.split('.');
        var rootDomain = hostParts.slice(-2).join('.'); // e.g., sevenrooms.com

        var cookieStr = name + "=" + encodeURIComponent(value) +
                        expires +
                        "; path=/" +
                        "; domain=" + rootDomain +
                        "; SameSite=Lax";

        document.cookie = cookieStr;
    }

    // --- Get URL parameter ---
    function getQueryParam(param) {
        return new URLSearchParams(window.location.search).get(param);
    }

    // --- Generate a new random string for ID ---
    function generateRandomString(length) {
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var result = '';
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    // --- Main logic for external_id ---
    var urlValue = getQueryParam('external_id');
    var cookieValue = getCookie('external_id');
    var finalValue;

    if (urlValue) {
        finalValue = urlValue;
        setCookie('external_id', finalValue, 365);
    } else if (cookieValue) {
        finalValue = cookieValue;
    } else {
        finalValue = generateRandomString(16);
        setCookie('external_id', finalValue, 365);
    }

    return finalValue;
}

// VARIABLE: DEVICE_ID
function getDeviceId() {
    const key = 'device_id';
    let deviceId = localStorage.getItem(key);
    if (!deviceId) {
      deviceId = 'dev-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem(key, deviceId);
    }
    return deviceId;
  }

  // VARIABLE: _FBC COOKIE
  function getFbc() {
    const COOKIE_NAME = '_fbc';
  
    function getCookie(name) {
      const nameEQ = name + "=";
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(nameEQ) === 0) {
          return c.substring(nameEQ.length);
        }
      }
      return null;
    }
  
    function getUrlParam(param) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
    }
  
    let fbc = getCookie(COOKIE_NAME);
    if (fbc) return fbc;
  
    const fbclid = getUrlParam('fbclid');
    if (fbclid) {
      const timestamp = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
      fbc = `fb.1.${timestamp}.${fbclid}`;
      document.cookie = `${COOKIE_NAME}=${fbc}; path=/; max-age=${6 * 30 * 24 * 60 * 60}; SameSite=Lax`; // 6 months
      return fbc;
    }
  
    return null;
  }

  // VARIABLE: _FBP COOKIE
  function getFbp() {
    const COOKIE_NAME = '_fbp';
  
    function getCookie(name) {
      const nameEQ = name + "=";
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(nameEQ) === 0) {
          return c.substring(nameEQ.length);
        }
      }
      return null;
    }
  
    let fbp = getCookie(COOKIE_NAME);
    if (fbp) return fbp;
  
    const timestamp = Math.floor(Date.now() / 1000);
    const randomId = Math.floor(Math.random() * 1e10); // 10-digit random number
    fbp = `fb.1.${timestamp}.${randomId}`;
  
    document.cookie = `${COOKIE_NAME}=${fbp}; path=/; max-age=${6 * 30 * 24 * 60 * 60}; SameSite=Lax`;
  
    return fbp;
  }

// VARIABLE: _SCID COOKIE
function getSCID() {
    const name = '_scid=';
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
        if (cookie.startsWith(name)) {
        return cookie.substring(name.length);
      }
    }
    return null;
  }

  // VARIABLE: _TTP COOKIE
  function getTTP() {
    const name = '_ttp=';
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
        if (cookie.startsWith(name)) {
        return cookie.substring(name.length);
      }
    }
    return null;
  }

  // VARIABLE: TTCLID
  function getTtclid() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('ttclid') || null;
  }

  function getScCID() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('ScCiD') || null;
  }

  // VARIABLE: IP_DATA
  async function fetchIpAndGeoData() {
    const ipData = {};
  
    try {
      const ipv4Response = await fetch('https://api.ipify.org?format=json');
      const ipv4Data = await ipv4Response.json();
      ipData.ipv4 = ipv4Data.ip;
  
      try {
        const ipv6Response = await fetch('https://api64.ipify.org?format=json');
        const ipv6Data = await ipv6Response.json();
        ipData.ipv6 = ipv6Data.ip;
      } catch (ipv6Error) {
        console.warn("IPv6 fetch failed or not supported.");
      }
  
      const geoResponse = await fetch(`https://ipapi.co/${ipv4Data.ip}/json/`);
      const geoData = await geoResponse.json();
  
      ipData.geo = {
        country: geoData.country_name,
        region: geoData.region,
        city: geoData.city,
        postal: geoData.postal
      };
  
    } catch (error) {
      console.error("Error fetching IP and geo data:", error);
    }
  
    return ipData;
  }


// FUNCTION: getEventData
async function getEventData()  {
    const urlParams = new URLSearchParams(window.location.search);
    const ipData = await fetchIpAndGeoData();
    const fbc = getFbc();
    const fbp = getFbp();
    const scid = getSCID();
    const ScCid = getScCID();
    const ttp = getTTP();
    const ttclid = getTtclid();
    const external_id = getExternalId();
    const event_id = generateEventID();
    const session_id = getSessionId();
    const device_id = getDeviceId();

    return {
        userInfo: {
            external_id: external_id,
            device_id: device_id,
            ipData: ipData,
            fbp: fbp,
            ttp: ttp,
            scid: scid,
        },
        eventInfo: {
            event_id: event_id,
            session_id: session_id,
            fbc: fbc,
            ttclid: ttclid,
            ScCid: ScCid,
            utmParameters: {
                source: urlParams.get('utm_source'),
                medium: urlParams.get('utm_medium'),
                campaign: urlParams.get('utm_campaign'),
                id: urlParams.get('utm_id'),
                term: urlParams.get('utm_term'),
                content: urlParams.get('utm_content'),
                ad_id: urlParams.get('ad_id'),
                adset_id: urlParams.get('adset_id'),
                campaign_id: urlParams.get('campaign_id'),
                ad_name: urlParams.get('ad_name'),
                adset_name: urlParams.get('adset_name'),
                campaign_name: urlParams.get('campaign_name'),
                placement: urlParams.get('placement'),
                site_source_name: urlParams.get('site_source_name'),
                gclid: urlParams.get('gclid'),
                gbraid: urlParams.get('gbraid'),
                wbraid: urlParams.get('wbraid'),

            }
        }
    };
}  

// Initialize IndexedDB
function initializeIndexedDB(callback) {
    var request = indexedDB.open("CookieBackupDB", 1);
    request.onupgradeneeded = function(event) {
        var db = event.target.result;
        if (!db.objectStoreNames.contains("cookies")) {
            db.createObjectStore("cookies", { keyPath: "name" });
        }
    };
    request.onsuccess = function(event) {
        callback(null, event.target.result);
    };
    request.onerror = function(event) {
        callback("IndexedDB initialization error: " + event.target.error, null);
    };
}

// Store a cookie in IndexedDB
function storeInIndexedDB(db, cookieName, cookieValue, callback) {
    try {
        var transaction = db.transaction(["cookies"], "readwrite");
        var store = transaction.objectStore("cookies");
        var request = store.put({ name: cookieName, value: cookieValue });
        request.onsuccess = function() {
            callback(null);
        };
        request.onerror = function(event) {
            callback("IndexedDB store error: " + event.target.error);
        };
    } catch (err) {
        callback("IndexedDB transaction error: " + err);
    }
}

// Retrieve a cookie from IndexedDB
function retrieveFromIndexedDB(db, cookieName, callback) {
    try {
        var transaction = db.transaction(["cookies"], "readonly");
        var store = transaction.objectStore("cookies");
        var request = store.get(cookieName);
        request.onsuccess = function(event) {
            if (event.target.result) {
                callback(null, event.target.result.value);
            } else {
                callback(null, null);
            }
        };
        request.onerror = function(event) {
            callback("IndexedDB retrieval error: " + event.target.error, null);
        };
    } catch (err) {
        callback("IndexedDB transaction error: " + err, null);
    }
}

// Extend cookies with multiple backup methods
function extendCookiesWithBackup(cookiesToHandle) {
    // Initialize IndexedDB
    initializeIndexedDB(function(error, db) {
        if (error) {
            console.error(error);
            return;
        }

        // Determine the domain dynamically
        var domain = window.location.hostname.indexOf("localhost") !== -1
            ? "" // No domain for localhost
            : window.location.hostname.split('.').length > 2 
                ? "." + window.location.hostname.split('.').slice(-2).join('.')
                : window.location.hostname;

        for (var i = 0; i < cookiesToHandle.length; i++) {
            (function(cookie) {
                var name = cookie.name;
                var lifetimeInSeconds = cookie.lifetimeInSeconds;

                // Retrieve the cookie value
                var cookies = document.cookie.split("; ");
                var cookieValue = null;

                for (var j = 0; j < cookies.length; j++) {
                    var cookiePair = cookies[j].split("=");
                    if (cookiePair[0] === name) {
                        cookieValue = decodeURIComponent(cookiePair[1]);
                        break;
                    }
                }

                if (cookieValue !== null) {
                    // If the cookie exists
                    var now = new Date();
                    var newExpiryDate = new Date(now.getTime() + lifetimeInSeconds * 1000);

                    // Extend the cookie
                    document.cookie = name + "=" + encodeURIComponent(cookieValue) + 
                        "; expires=" + newExpiryDate.toUTCString() + 
                        "; path=/;" + (domain ? " domain=" + domain : "") + "; SameSite=Lax; Secure";

                    // Browser backup
                    var backupName = "backup_" + name;
                    document.cookie = backupName + "=" + encodeURIComponent(cookieValue) + 
                        "; expires=" + newExpiryDate.toUTCString() + 
                        "; path=/;" + (domain ? " domain=" + domain : "") + "; SameSite=Lax; Secure";

                    // Local Storage backup
                    localStorage.setItem(backupName, cookieValue);

                    // IndexedDB backup
                    storeInIndexedDB(db, name, cookieValue, function(error) {
                        if (error) {
                            console.error(error);
                        }
                    });
                } else {
                    // If the cookie does not exist

                    // Step 1: Attempt to restore from browser backup
                    var backupName = "backup_" + name;
                    var backupValue = null;

                    for (var k = 0; k < cookies.length; k++) {
                        var backupPair = cookies[k].split("=");
                        if (backupPair[0] === backupName) {
                            backupValue = decodeURIComponent(backupPair[1]);
                            break;
                        }
                    }

                    if (backupValue !== null) {
                        var now = new Date();
                        var newExpiryDate = new Date(now.getTime() + lifetimeInSeconds * 1000);

                        document.cookie = name + "=" + encodeURIComponent(backupValue) + 
                            "; expires=" + newExpiryDate.toUTCString() + 
                            "; path=/;" + (domain ? " domain=" + domain : "") + "; SameSite=Lax; Secure";
                    } else {
                        // Step 2: Attempt to restore from Local Storage
                        var localBackupValue = localStorage.getItem(backupName);
                        if (localBackupValue !== null) {
                            var now = new Date();
                            var newExpiryDate = new Date(now.getTime() + lifetimeInSeconds * 1000);

                            document.cookie = name + "=" + encodeURIComponent(localBackupValue) + 
                                "; expires=" + newExpiryDate.toUTCString() + 
                                "; path=/;" + (domain ? " domain=" + domain : "") + "; SameSite=Lax; Secure";
                        } else {
                            // Step 3: Attempt to restore from IndexedDB
                            retrieveFromIndexedDB(db, name, function(error, indexedDBValue) {
                                if (error) {
                                    console.error(error);
                                } else if (indexedDBValue !== null) {
                                    var now = new Date();
                                    var newExpiryDate = new Date(now.getTime() + lifetimeInSeconds * 1000);

                                    document.cookie = name + "=" + encodeURIComponent(indexedDBValue) + 
                                        "; expires=" + newExpiryDate.toUTCString() + 
                                        "; path=/;" + (domain ? " domain=" + domain : "") + "; SameSite=Lax; Secure";
                                } else {
                                }
                            });
                        }
                    }
                }
            })(cookiesToHandle[i]);
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    extendCookiesWithBackup([
      { name: '_fbp', lifetimeInSeconds: 63115200 },
      { name: '_fbc', lifetimeInSeconds: 15552000 },
      { name: 'fr', lifetimeInSeconds: 15552000 },
      { name: '_scid', lifetimeInSeconds: 31622400 },
      { name: '_sc_at', lifetimeInSeconds: 31622400 },
      { name: '_ScCbts', lifetimeInSeconds: 2592000 },
      { name: '_ga', lifetimeInSeconds: 63115200 },
      { name: 'IDE', lifetimeInSeconds: 31622400 },
      { name: '1P_JAR', lifetimeInSeconds: 15552000 },
      { name: 'DV', lifetimeInSeconds: 15552000 },
      { name: '_ttp', lifetimeInSeconds: 63115200 },
      { name: '_ttcid', lifetimeInSeconds: 15552000 },
      { name: 'TDID', lifetimeInSeconds: 31622400 },
      { name: 'htjs_anonymous_id', lifetimeInSeconds: 63115200 },
      { name: 'htjs_user_id', lifetimeInSeconds: 63115200 },
      { name: 'external_id', lifetimeInSeconds: 63115200 }
    ]);
  });


// FUNCTION: trackPageView
async function trackPageView() {
    const eventData = await getEventData();
    const eventName = document.title;

    window.htevents.page(
        'Main Website',
        eventName,
        {
            page_hostname: window.location.hostname,
            page_path: window.location.pathname,
            ...eventData
        },
        function () {
            console.log("Page view tracked:", document.title);
        }
    );
}

// Track initial page view on load
trackPageView();

// Listen to dataLayer pushes and send them to Hightouch
(function () {
    window.dataLayer = window.dataLayer || [];

    // Set of events to ignore
    const IGNORED_EVENTS = new Set([
      'gtm.js',
      'gtm.dom',
      'gtm.load',
      'gtm.init',
      'gtm.init_consent',
      'gtm.beforeConsent',
      'gtm.afterConsent',
      'gtm.consentUpdate',
      'gtm.linkClick',
      'gtm.click',
      'gtm.historyChange',
      'gtm.historyChange-v2',
      'gtm.scrollDepth',
      'gtm.timer',
      'gtm.formSubmit',
      'gtm.triggerGroup',
      'gtm.visibility',
      'userTiming',
      'optimize.activate',
      'optimize.callback',
      'consent_initialization',
      'config',
      'gaInitialization',
      'firebase_screen_view'
    ]);
    
    // Helper: Send each event to Hightouch
    async function handleDataLayerEvent(event) {
        if (!event || typeof event !== 'object' || !event.event) return;

        // Skip ignored events
        if (IGNORED_EVENTS.has(event.event)) {
            console.log('[Hightouch] Skipping ignored event:', event.event);
            return;
        }

        // Prevent duplicate sends
        if (event._sentToHightouch) return;
        event._sentToHightouch = true;

        const { event: eventName, ...properties } = event;
        const context = await getEventData();

        window.htevents.track(
            eventName,
            properties,
            {
                source: 'dataLayer',
                ...context
            },
            function () {
                console.log('[Hightouch] Tracked event from dataLayer:', eventName, properties);
            }
        );
    }

    // Handle any events already pushed before this script runs
    window.dataLayer.forEach(handleDataLayerEvent);

    // Override push() to catch future events
    const originalPush = window.dataLayer.push;
    window.dataLayer.push = function () {
        Array.from(arguments).forEach(handleDataLayerEvent);
        return originalPush.apply(window.dataLayer, arguments);
    };
})();
