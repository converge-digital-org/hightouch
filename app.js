// HIGHTOUCH EVENTS APP.JS FILE –– LAST UPDATED: 11/26/2024 AT 3:24 PM PT //
// Additions: Implemeted 'add_to_cart', 'remove_from_cart', 'view_cart', 'begin_checkout', and 'purchase' events

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

// Function to get additional parameters (includes only "user_id")
async function getAdditionalParams() {
    let ipData = {};
    try {
        // Fetch IPv4 Address
        const ipv4Response = await fetch('https://api.ipify.org?format=json');
        const ipv4Data = await ipv4Response.json();
        ipData.ipAddress = ipv4Data.ip;

        // Fetch IPv6 Address
        const ipv6Response = await fetch('https://api64.ipify.org?format=json');
        const ipv6Data = await ipv6Response.json();
        ipData.ipv6Address = ipv6Data.ip;

        // Fetch Geo data using IPv4
        const geoResponse = await fetch(`https://ipapi.co/${ipv4Data.ip}/json/`);
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

// Function to get the category from the dataLayer
function getCategoryFromDataLayer() {
    if (window.dataLayer) {
        const ecommPageType = window.dataLayer.find(item => item.ecomm_pagetype);
        return ecommPageType ? ecommPageType.ecomm_pagetype : 'Unknown';
    }
    return 'Unknown';
}

// Function to track page views
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
            //console.log("Page view tracked:", document.title);
        }
    );
}

// Track initial page view on load
trackPageView();

console.log("Hightouch Events script loaded");

// Monitor dataLayer for all events
function monitorDataLayer() {
    console.log("Monitoring dataLayer events...");

    // Ensure dataLayer exists
    if (!window.dataLayer) {
        console.warn("dataLayer is not defined on the page.");
        window.dataLayer = []; // Create an empty dataLayer if it doesn't exist
    }

    // Hook into dataLayer.push to log all events
    const originalPush = window.dataLayer.push;
    window.dataLayer.push = function(data) {
        originalPush.apply(window.dataLayer, arguments); // Retain original functionality
        console.log("Data layer event detected:", data); // Log the pushed data

        // Log the event type
        if (data.event) {
            console.log(`Event type detected: '${data.event.trim().toLowerCase()}'`);
        } else {
            console.warn("No event type found in data:", data);
        }

        // Check for add_to_cart event
        if (data.event.trim().toLowerCase() === "add_to_cart") {
            console.log("Processing add_to_cart event:", data);
            handleAddToCartEvent(data);
        }

        // Check for remove_from_cart event
        if (data.event.trim().toLowerCase() === "remove_from_cart") {
            console.log("Processing remove_from_cart event:", data);
            handleRemoveFromCartEvent(data);
        }

        // Check for view_cart event
        if (data.event.trim().toLowerCase() === "view_cart") {
            console.log("Processing view_cart event:", data);
            handleViewCartEvent(data);
        }

        // Check for begin_checkout event
        if (data.event.trim().toLowerCase() === "begin_checkout") {
            console.log("Processing begin_checkout event:", data);
            handleBeginCheckoutEvent(data);
        }

        // Check for purchase event
        if (data.event.trim().toLowerCase() === "purchase") {
            console.log("Processing purchase event:", data);
            handlePurchaseEvent(data);
        }
    };
}

// Ensure logic runs after DOM is ready
if (document.readyState === "loading") {
    // DOM is still loading; wait for it to be ready
    document.addEventListener("DOMContentLoaded", () => {
        console.log("DOM fully loaded (via event).");
        monitorDataLayer();
    });
} else {
    // DOM is already loaded; run the logic immediately
    console.log("DOM already loaded (via readyState).");
    monitorDataLayer();
}

async function handleAddToCartEvent(data) {
    if (!data.ecommerce || !data.ecommerce.items || !Array.isArray(data.ecommerce.items)) {
        console.warn("add_to_cart event is missing required ecommerce or items data:", data);
        return;
    }

    const additionalParams = await getAdditionalParams();

    data.ecommerce.items.forEach(item => {
        const eventPayload = {
            item_id: item.item_id,
            item_name: item.item_name,
            item_price: parseFloat(item.price),
            item_quantity: parseInt(item.quantity, 10),
            value: parseFloat(data.ecommerce.value),
            currency: data.ecommerce.currency,
            ...additionalParams // Merge additional parameters into the payload
        };

        window.htevents.track(
            "add_to_cart",
            eventPayload,
            {},
            function() {
                console.log("add_to_cart event successfully tracked to Hightouch with additional params:", eventPayload);
            }
        );
    });
}

async function handleRemoveFromCartEvent(data) {
    if (!data.ecommerce || !data.ecommerce.items || !Array.isArray(data.ecommerce.items)) {
        console.warn("remove_from_cart event is missing required ecommerce or items data:", data);
        return;
    }

    const additionalParams = await getAdditionalParams();

    data.ecommerce.items.forEach(item => {
        const eventPayload = {
            item_id: item.item_id,
            item_name: item.item_name,
            item_price: parseFloat(item.price),
            item_quantity: parseInt(item.quantity, 10),
            value: parseFloat(data.ecommerce.value),
            currency: data.ecommerce.currency,
            ...additionalParams // Merge additional parameters into the payload
        };

        window.htevents.track(
            "remove_from_cart",
            eventPayload,
            {},
            function() {
                console.log("remove_from_cart event successfully tracked to Hightouch with additional params:", eventPayload);
            }
        );
    });
}

// Handle View Cart Event
async function handleViewCartEvent(data) {
    if (!data.ecommerce || !data.ecommerce.items || !Array.isArray(data.ecommerce.items)) {
        console.warn("view_cart event is missing required ecommerce or items data:", data);
        return;
    }

    const additionalParams = await getAdditionalParams();

    const eventPayload = {
        value: parseFloat(data.ecommerce.value),
        currency: data.ecommerce.currency,
        items: data.ecommerce.items.map(item => ({
            item_id: item.item_id,
            item_name: item.item_name,
            price: parseFloat(item.price),
            quantity: parseInt(item.quantity, 10)
        })),
        ...additionalParams // Merge additional parameters into the payload
    };

    // Send the event to Hightouch
    window.htevents.track(
        "view_cart",
        eventPayload,
        {},
        function() {
            console.log("view_cart event successfully tracked to Hightouch with additional params:", eventPayload);
        }
    );
}

// Handle Begin Checkout Event
async function handleBeginCheckoutEvent(data) {
    if (!data.ecommerce || !data.ecommerce.items || !Array.isArray(data.ecommerce.items)) {
        console.warn("begin_checkout event is missing required ecommerce or items data:", data);
        return;
    }

    const additionalParams = await getAdditionalParams();

    const eventPayload = {
        transaction_id: data.ecommerce.transaction_id || null,
        value: parseFloat(data.ecommerce.value),
        currency: data.ecommerce.currency,
        quantity: parseInt(data.ecommerce.quantity, 10) || null,
        tax: parseFloat(data.ecommerce.tax) || null,
        fee: parseFloat(data.ecommerce.fee) || null,
        coupon: data.ecommerce.coupon || [],
        items: data.ecommerce.items.map(item => ({
            item_id: item.item_id,
            item_name: item.item_name,
            price: parseFloat(item.price)
        })),
        ...additionalParams // Merge additional parameters into the payload
    };

    // Send the event to Hightouch
    window.htevents.track(
        "begin_checkout",
        eventPayload,
        {},
        function() {
            console.log("begin_checkout event successfully tracked to Hightouch with additional params:", eventPayload);
        }
    );
}

// Handle Purchase Event
async function handlePurchaseEvent(data) {
    if (!data.ecommerce || !data.ecommerce.items || !Array.isArray(data.ecommerce.items)) {
        console.warn("purchase event is missing required ecommerce or items data:", data);
        return;
    }

    const additionalParams = await getAdditionalParams();

    const eventPayload = {
        transaction_id: data.ecommerce.transaction_id || null,
        value: parseFloat(data.ecommerce.value),
        currency: data.ecommerce.currency,
        quantity: parseInt(data.ecommerce.quantity, 10) || null,
        tax: parseFloat(data.ecommerce.tax) || null,
        fee: parseFloat(data.ecommerce.fee) || null,
        coupon: data.ecommerce.coupon || [],
        items: data.ecommerce.items.map(item => ({
            item_id: item.item_id,
            item_name: item.item_name,
            price: parseFloat(item.price)
        })),
        ...additionalParams // Merge additional parameters into the payload
    };

    // Send the event to Hightouch
    window.htevents.track(
        "purchase",
        eventPayload,
        {},
        function() {
            console.log("purchase event successfully tracked to Hightouch with additional params:", eventPayload);
        }
    );
}
