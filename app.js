// HIGHTOUCH EVENTS APP.JS FILE –– LAST UPDATED: 11/20/2024 AT 2:12 PM PT //

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded and parsed. Initializing Hightouch Events...");

    // Function to remove empty properties
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

    // Functions (e.g., GUID generation, getDeviceId, getSessionId, etc.)
    function generateGUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function getDeviceId() {
        let deviceId = localStorage.getItem('device_id');
        if (!deviceId) {
            deviceId = generateGUID();
            localStorage.setItem('device_id', deviceId);
        }
        return deviceId;
    }

    function getSessionId() {
        let sessionId = sessionStorage.getItem('session_id');
        if (!sessionId) {
            sessionId = generateGUID();
            sessionStorage.setItem('session_id', sessionId);
        }
        return sessionId;
    }

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

    // Event tracking logic
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

    function trackAddToCartFromDataLayer(eventData) {
        console.log("Tracking Add To Cart:", eventData);
        getAdditionalParams().then((params) => {
            eventData.ecommerce.items.forEach((item) => {
                window.htevents.track(
                    "Add To Cart",
                    {
                        item_id: item.item_id,
                        item_name: item.item_name,
                        price: parseFloat(item.price),
                        quantity: item.quantity,
                        value: parseFloat(eventData.ecommerce.value),
                        currency: eventData.ecommerce.currency,
                        ...params
                    },
                    {
                        ip: params.ipAddress
                    },
                    function() {
                        console.log("Add To Cart event tracked:", item);
                    }
                );
            });
        }).catch(error => {
            console.error("Error tracking Add To Cart from dataLayer:", error);
        });
    }

    function monitorDataLayer() {
        const originalPush = window.dataLayer.push;
        window.dataLayer.push = function(data) {
            originalPush.apply(window.dataLayer, arguments);
            if (data.event === "add_to_cart" && data.ecommerce) {
                trackAddToCartFromDataLayer(data);
            }
        };

        window.dataLayer.forEach((entry) => {
            if (entry.event === "add_to_cart" && entry.ecommerce) {
                trackAddToCartFromDataLayer(entry);
            }
        });
    }

    // Initialize page view tracking and monitor dataLayer
    trackPageView();
    monitorDataLayer();
});
