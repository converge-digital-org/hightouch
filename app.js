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

// Function to get data from the data layer
function getDataLayerInfo() {
    if (window.dataLayer) {
        console.log('Inspecting Data Layer:', window.dataLayer);
        let sessionInfo = {};
        let userInfo = {};
        let clientInfo = {};

        // Iterate over dataLayer entries
        window.dataLayer.forEach(item => {
            console.log('Inspecting Item:', item);

            if (Array.isArray(item)) {
                // Capture session_id
                if (item[2] === "session_id") {
                    console.log('Session ID Found:', item[2]);
                    sessionInfo = { sessionId: item[2], sessionValue: item[0] };
                }

                // Capture user_id
                if (item[0] === "set" && typeof item[2] === "object" && item[2].user_id) {
                    console.log('User ID Found:', item[2].user_id);
                    userInfo = { userId: item[2].user_id, action: item[0], id: item[1] };
                }

                // Capture client_id
                if (item[2] === "client_id") {
                    console.log('Client ID Found:', item[2]);
                    clientInfo = { clientId: item[2], clientValue: item[0], clientIdSource: item[1] };
                }
            }
        });

        return { ...sessionInfo, ...userInfo, ...clientInfo };
    }

    console.warn('Data Layer not found.');
    return {};
}

// Function to wait for data layer to be populated
function waitForDataLayer(callback, timeout = 10000) {
    const interval = 100; // Check every 100ms
    let elapsedTime = 0;

    const checkDataLayer = setInterval(() => {
        if (window.dataLayer && window.dataLayer.length > 0) {
            console.log('Data Layer Detected:', window.dataLayer);
            clearInterval(checkDataLayer); // Stop checking
            callback(); // Execute the callback when dataLayer is ready
        }

        elapsedTime += interval;
        if (elapsedTime >= timeout) {
            clearInterval(checkDataLayer);
            console.warn('Data Layer not detected within timeout.');
        }
    }, interval);
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
            placement
