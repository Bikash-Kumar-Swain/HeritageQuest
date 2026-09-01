let currentLocation = null;
let simulatedLocation = null;

export function setSimulatedLocation(latitude, longitude) {
    simulatedLocation = { latitude, longitude, accuracy: 5 };
    console.log('📍 GPS Simulation Active:', simulatedLocation);
}

export function clearSimulatedLocation() {
    simulatedLocation = null;
    console.log('📍 GPS Simulation Cleared (using real device GPS)');
}

export function isSimulatingLocation() {
    return simulatedLocation !== null;
}

export function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (simulatedLocation) {
            resolve(simulatedLocation);
            return;
        }

        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by this browser."));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                currentLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };

                resolve(currentLocation);
            },
            (error) => {
                reject(new Error(getLocationError(error)));
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );
    });
}

function getLocationError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            return "Location permission was denied. Please enable GPS in browser settings.";
        case error.POSITION_UNAVAILABLE:
            return "Your GPS location is currently unavailable.";
        case error.TIMEOUT:
            return "GPS location request timed out.";
        default:
            return "Unable to get your location.";
    }
}

export function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth radius in meters

    const toRadians = (degrees) => degrees * Math.PI / 180;

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

export function formatDistance(distanceInMeters) {
    if (distanceInMeters < 1000) {
        return `${Math.round(distanceInMeters)} m`;
    }
    return `${(distanceInMeters / 1000).toFixed(1)} km`;
}

/**
 * Verify if player is within the geofence radius of a heritage site
 */
export async function verifyProximity(targetLat, targetLng, radiusMeters = 500) {
    const playerLoc = await getCurrentLocation();
    const distance = calculateDistance(
        playerLoc.latitude,
        playerLoc.longitude,
        targetLat,
        targetLng
    );

    const isInside = distance <= radiusMeters;

    return {
        isInside,
        distanceMeters: Math.round(distance),
        formattedDistance: formatDistance(distance),
        radiusMeters,
        playerLoc,
        isSimulated: isSimulatingLocation()
    };
}