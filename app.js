// HIGHTOUCH EVENTS APP.JS FILE –– LAST UPDATED: 9/20/2024 AT 3:42 PM PT //
// Update: Capture GBRAID and WBRAID Parameters
// Update: Grab FBC or Generate FBC (Facebook Click ID)
// Update: Grab FBC or Generate FBP (Facebook Browser ID)
// Update: Generate GUID for Device ID

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

function getDataLayerInfo() {
    if (window.dataLayer) {
        console.log('Data Layer:', window.dataLayer); // Log data layer for debugging
        let sessionInfo = {};
        let userInfo = {};
        let clientInfo = {};

        // Iterate over dataLayer entries
        window.dataLayer.forEach(item => {
            if (Array.isArray(item)) {
                console.log('Inspecting Data Layer Item:', item); // Debug each item

                // Capture session_id
                if (item[2] === "session_id") {
                    sessionInfo = { sessionId: item[2], sessionValue: item[0] };
                }

                // Capture user_id
                if (item[0] === "set" && typeof item[2] === "object" && item[2].user_id) {
                    userInfo = { userId: item[2].user_id, action: item[0], id: item[1] };
                }

                // Capture client_id
                if (item[2] === "client_id") {
                    clientInfo = { clientId: item[2], clientValue: item[0], clientIdSource: item[1] };
                }
            }
        });

        // Debug extracted values
        console.log('Session Info:', sessionInfo);
        console.log('User Info:', userInfo);
        console.log('Client Info:', clientInfo);

        return { ...sessionInfo, ...userInfo, ...clientInfo };
    }

    console.warn('Data Layer not found.');
    return {};
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
    const dataLayerInfo = getDataLayerInfo();

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
        ...dataLayerInfo
    };
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
    const timestamp = Math.floor(Date.now() / 1000);
    const randomNumber = Math.random().toString(36).substring(2, 15);
    const fbp = version + timestamp + '.' + randomNumber;
    document.cookie = `_fbp=${fbp}; path=/; expires=${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toUTCString()}; SameSite=Lax`;
    return fbp;
}

// Function to track page views
async function trackPageView() {
    const additionalParams = await getAdditionalParams();
    const eventName = document.title;
    window.htevents.page(
        eventName, // name of the event from page title
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

// Track initial page view on load
trackPageView();
