// HIGHTOUCH EVENTS APP.JS FILE –– LAST UPDATED: 11/25/2024 AT 4:15 PM PT //
// Additions: Implemented 'add_to_cart', 'remove_from_cart', and 'view_cart' events

console.log("Hightouch Events script loaded");

function removeEmptyProperties(obj) {
    if (typeof obj !== "object" || obj === null) return obj;
    for (const key in obj) if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        typeof value === "object" && value !== null && (obj[key] = removeEmptyProperties(value));
        (obj[key] === null || obj[key] === "" || obj[key] === undefined) && delete obj[key];
    }
    return Object.keys(obj).length === 0 && obj.constructor === Object ? {} : obj;
}

// Enable debugging in development mode
window.htevents.debug(false);

// Function to generate a 36-character, 128-bit GUID with hyphens
function generateGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Function to get or generate a unique Device ID (GUID)
function getDeviceId() {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
        deviceId = generateGUID();
        localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
}

// Function to get or generate a unique Session ID (GUID)
function getSessionId() {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
        sessionId = generateGUID();
        sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
}

// Function to get "user_id" from the data layer
function getUserIdFromDataLayer() {
    if (window.dataLayer) {
        const userEvent = window.dataLayer.find(item => item[2] && item[2].user_id);
        return userEvent ? userEvent[2].user_id : null;
    }
    return null;
}

// Function to generate FBC (Facebook Click ID) parameter
function getFBC(fbclid) {
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('_fbc='))
        ?.split('=')[1];

    return cookieValue || generateFBC(fbclid);
}

// Function to generate FBC if not found
function generateFBC(fbclid) {
    if (!fbclid) return null;
    const domain = window.location.hostname;
    const timestamp = Math.floor(Date.now() / 1000);
    const fbc = `fb.${domain}.${timestamp}.${fbclid}`;

    document.cookie = `_fbc=${fbc}; path=/; expires=${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toUTCString()}; SameSite=Lax`;

    return fbc;
}

// Function to get or generate FBP (Facebook Browser ID) parameter
function getFBP() {
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('_fbp='))
        ?.split('=')[1];

    return cookieValue || generateFBP();
}

// Function to generate FBP if not found
function generateFBP() {
    const version = 'fb.1.';
    const timestamp = Math.floor(new Date().getTime() / 1000);
    const randomNumber = Math.random().toString(36).substring(2, 15);
    const fbp = version + timestamp + '.' + randomNumber;

    document.cookie = `_fbp=${fbp}; path=/; expires=${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toUTCString()}; SameSite=Lax`;

    return fbp;
}

// Function to get additional parameters
async function getAdditionalParams() {
    let ipData = {};
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        ipData.ipAddress = data.ip;

        const geoResponse = await fetch(`https://ipapi.co/${data.ip}/json/`);
        const geoData = await geoResponse.json();
        ipData = {
            ...ipData,
            userCountry: geoData.country_name,
            userRegion: geoData.region,
            userCity: geoData.city,
            userPostal: geoData.postal
        };
    } catch (error) {
        console.error("Error fetching IP and geo data:", error);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const fbclid = urlParams.get('fbclid');

    return {
        ...ipData,
        utmParameters: {
            source: urlParams.get('utm_source'),
            medium: urlParams.get('utm_medium'),
            campaign: urlParams.get('utm_campaign'),
            id: urlParams.get('utm_id'),
            term: urlParams.get('utm_term'),
            content: urlParams.get('utm_content'),
            fbclid: fbclid,
            gclid: urlParams.get('gclid'),
            atrefid: urlParams.get('atrefid'),
            ad_id: urlParams.get('ad_id'),
            adset_id: urlParams.get('adset_id'),
            campaign_id: urlParams.get('campaign_id'),
            ad_name: urlParams.get('ad_name'),
            adset_name: urlParams.get('adset_name'),
            campaign_name: urlParams.get('campaign_name'),
            placement: urlParams.get('placement'),
            site_source_name: urlParams.get('site_source_name'),
            gbraid: urlParams.get('gbraid'),
            wbraid: urlParams.get('wbraid')
        },
        fbc: getFBC(fbclid),
        fbp: getFBP(),
        device_id: getDeviceId(),
        directory: window.location.pathname.split('/')[1],
        user_id: getUserIdFromDataLayer()
    };
}

// Track initial page view on load
async function trackPageView() {
    const additionalParams = await getAdditionalParams();
    const eventName = document.title;
    const eventCategory = getCategoryFromDataLayer();
    window.htevents.page(
        eventCategory,
        eventName,
        {
            hostname: window.location.hostname,
            path: window.location.pathname,
            ...additionalParams
        },
        {
            ip: additionalParams.ipAddress
        },
        function() {
            console.log("Page view tracked:", document.title);
        }
    );
}
trackPageView();

// Monitor dataLayer for all events
function monitorDataLayer() {
    console.log("Monitoring dataLayer events...");

    if (!window.dataLayer) {
        console.warn("dataLayer is not defined on the page.");
        window.dataLayer = [];
    }

    const originalPush = window.dataLayer.push;
    window.dataLayer.push = function(data) {
        originalPush.apply(window.dataLayer, arguments);
        console.log("Data layer event detected:", data);

        if (data.event === "add_to_cart") handleAddToCartEvent(data);
        if (data.event === "remove_from_cart") handleRemoveFromCartEvent(data);
        if (data.event === "view_cart") handleViewCartEvent(data);
    };
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", monitorDataLayer);
} else {
    monitorDataLayer();
}

// Handle add_to_cart event
async function handleAddToCartEvent(data) {
    const additionalParams = await getAdditionalParams();
    data.ecommerce.items.forEach(item => {
        const payload = { ...item, ...additionalParams };
        window.htevents.track("add_to_cart", payload);
    });
}

// Handle remove_from_cart event
async function handleRemoveFromCartEvent(data) {
    const additionalParams = await getAdditionalParams();
    data.ecommerce.items.forEach(item => {
        const payload = { ...item, ...additionalParams };
        window.htevents.track("remove_from_cart", payload);
    });
}

// Handle view_cart event
async function handleViewCartEvent(data) {
    const additionalParams = await getAdditionalParams();
    const payload = { ...data.ecommerce, ...additionalParams };
    window.htevents.track("view_cart", payload, {}, () => console.log("view_cart event tracked:", payload));
}
