//HIGHTOUCH EVENTS APP.JS FILE –– LAST UPDATED: 8/19/2024 AT 1:44 PM PT//
// Update: Capture GBRAID and WBRAID Paramters
// Update: Generate FBC (Facebook Click ID)
// Update: Generate FBP (Facebook Browser ID)

// Enable debugging in development mode
window.htevents.debug(false);

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

    // Capture UTM parameters and additional ad-related parameters
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
            glclid: urlParams.get('glclid'),
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
        fbc: fbclid ? generateFBC(fbclid) : null,
        fbp: fbclid ? generateFBP(fbclid) : null,
        directory: window.location.pathname.split('/')[1]
    };
}

// Function to generate FBC (Facebook Click ID) parameter
function generateFBC(fbclid) {
    const domain = window.location.hostname;
    const timestamp = Math.floor(Date.now() / 1000); // Current timestamp in seconds
    return `fb.${domain}.${timestamp}.${fbclid}`;
}

// Function to generate FBP (Facebook Browser ID) parameter
function generateFBP(fbclid) {
    const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000); // Random 10-digit number
    const timestamp = Math.floor(Date.now() / 1000); // Current timestamp in seconds
    return `fb.1.${timestamp}.${randomDigits}`;
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
        eventCategory, // category of the event from dataLayer
        eventName, // name of the event from page title
        {
            hostname: window.location.hostname,
            path: window.location.pathname,
            ...additionalParams
        },
        {
            // context - can include more metadata if needed
            ip: additionalParams.ipAddress
        },
        function() {
            console.log("Page view tracked:", document.title);
        }
    );
}

// Track initial page view on load
trackPageView();