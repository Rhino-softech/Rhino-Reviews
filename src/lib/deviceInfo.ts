// Enhanced device detection with better mobile identification and location permissions
export const getDeviceInfo = () => {
  const userAgent = navigator.userAgent

  // Enhanced device type detection
  let deviceType = "Desktop"
  let deviceModel = "Unknown"

  // Check for mobile devices first (more specific patterns)
  if (/iPhone/i.test(userAgent)) {
    deviceType = "Mobile"
    // Extract iPhone model
    const iphoneMatch = userAgent.match(/iPhone(\d+,\d+|OS\s[\d_]+)/i)
    if (iphoneMatch) {
      deviceModel = "iPhone"
      // Try to get more specific model info
      if (/iPhone14/i.test(userAgent)) deviceModel = "iPhone 14"
      else if (/iPhone13/i.test(userAgent)) deviceModel = "iPhone 13"
      else if (/iPhone12/i.test(userAgent)) deviceModel = "iPhone 12"
      else if (/iPhone11/i.test(userAgent)) deviceModel = "iPhone 11"
      else if (/iPhoneX/i.test(userAgent)) deviceModel = "iPhone X"
    } else {
      deviceModel = "iPhone"
    }
  } else if (/iPad/i.test(userAgent)) {
    deviceType = "Tablet"
    deviceModel = "iPad"
  } else if (/Android/i.test(userAgent)) {
    deviceType = "Mobile"
    
    // Samsung devices
    if (/Samsung|SM-/i.test(userAgent)) {
      const samsungMatch = userAgent.match(/SM-([A-Z0-9]+)/i) || userAgent.match(/Samsung\s([A-Z0-9\s]+)/i)
      if (samsungMatch) {
        const model = samsungMatch[1]
        const samsungModels: { [key: string]: string } = {
          'G991': 'Galaxy S21',
          'G996': 'Galaxy S21+',
          'G998': 'Galaxy S21 Ultra',
          'G973': 'Galaxy S10',
          'G975': 'Galaxy S10+',
          'G977': 'Galaxy S10 5G',
          'N975': 'Galaxy Note 10+',
          'N971': 'Galaxy Note 10',
          'A515': 'Galaxy A51',
          'A715': 'Galaxy A71',
          'A125': 'Galaxy A12',
          'A225': 'Galaxy A22',
          'A325': 'Galaxy A32',
          'A525': 'Galaxy A52',
          'A725': 'Galaxy A72',
          'M315': 'Galaxy M31',
          'M215': 'Galaxy M21',
          'J737': 'Galaxy J7',
          'A505': 'Galaxy A50',
          'A705': 'Galaxy A70',
          'S901': 'Galaxy S22',
          'S906': 'Galaxy S22+',
          'S908': 'Galaxy S22 Ultra'
        }
        
        const foundModel = Object.keys(samsungModels).find(key => model.includes(key))
        deviceModel = foundModel ? `Samsung ${samsungModels[foundModel]}` : `Samsung ${model}`
      } else {
        deviceModel = "Samsung Galaxy"
      }
    }
    // OPPO devices
    else if (/OPPO/i.test(userAgent)) {
      const oppoMatch = userAgent.match(/OPPO\s([A-Z0-9]+)/i)
      if (oppoMatch) {
        const model = oppoMatch[1]
        const oppoModels: { [key: string]: string } = {
          'A12': 'A12',
          'A15': 'A15',
          'A16': 'A16',
          'A53': 'A53',
          'A74': 'A74',
          'A94': 'A94',
          'F19': 'F19',
          'F21': 'F21',
          'Reno6': 'Reno6',
          'Reno7': 'Reno7',
          'Reno8': 'Reno8',
          'Find': 'Find X'
        }
        
        const foundModel = Object.keys(oppoModels).find(key => model.includes(key))
        deviceModel = foundModel ? `OPPO ${oppoModels[foundModel]}` : `OPPO ${model}`
      } else {
        deviceModel = "OPPO"
      }
    }
    // Xiaomi/Redmi devices
    else if (/Xiaomi|Mi\s|Redmi/i.test(userAgent)) {
      if (/Redmi/i.test(userAgent)) {
        const redmiMatch = userAgent.match(/Redmi\s([A-Z0-9\s]+)/i)
        if (redmiMatch) {
          deviceModel = `Xiaomi Redmi ${redmiMatch[1].trim()}`
        } else {
          deviceModel = "Xiaomi Redmi"
        }
      } else if (/Mi\s/i.test(userAgent)) {
        const miMatch = userAgent.match(/Mi\s([A-Z0-9\s]+)/i)
        if (miMatch) {
          deviceModel = `Xiaomi Mi ${miMatch[1].trim()}`
        } else {
          deviceModel = "Xiaomi Mi"
        }
      } else {
        deviceModel = "Xiaomi"
      }
    }
    // OnePlus devices
    else if (/OnePlus/i.test(userAgent)) {
      const oneplusMatch = userAgent.match(/OnePlus\s([A-Z0-9]+)/i)
      if (oneplusMatch) {
        deviceModel = `OnePlus ${oneplusMatch[1]}`
      } else {
        deviceModel = "OnePlus"
      }
    }
    // Vivo devices
    else if (/vivo/i.test(userAgent)) {
      const vivoMatch = userAgent.match(/vivo\s([A-Z0-9]+)/i)
      if (vivoMatch) {
        deviceModel = `Vivo ${vivoMatch[1]}`
      } else {
        deviceModel = "Vivo"
      }
    }
    // Realme devices
    else if (/RMX|Realme/i.test(userAgent)) {
      const realmeMatch = userAgent.match(/RMX(\d+)|Realme\s([A-Z0-9\s]+)/i)
      if (realmeMatch) {
        const model = realmeMatch[1] || realmeMatch[2]
        deviceModel = `Realme ${model}`
      } else {
        deviceModel = "Realme"
      }
    }
    // Honor devices
    else if (/Honor/i.test(userAgent)) {
      const honorMatch = userAgent.match(/Honor\s([A-Z0-9\s]+)/i)
      if (honorMatch) {
        deviceModel = `Honor ${honorMatch[1].trim()}`
      } else {
        deviceModel = "Honor"
      }
    }
    // Huawei devices
    else if (/Huawei/i.test(userAgent)) {
      const huaweiMatch = userAgent.match(/Huawei\s([A-Z0-9\s]+)/i)
      if (huaweiMatch) {
        deviceModel = `Huawei ${huaweiMatch[1].trim()}`
      } else {
        deviceModel = "Huawei"
      }
    }
    // Generic Android
    else {
      deviceModel = "Android Device"
    }
    
    // Check if it's actually a tablet
    if (/Tablet|Tab/i.test(userAgent) || (window.screen && window.screen.width >= 768)) {
      deviceType = "Tablet"
    }
  }
  // Windows Mobile/Phone
  else if (/Windows Phone|IEMobile/i.test(userAgent)) {
    deviceType = "Mobile"
    deviceModel = "Windows Phone"
  }
  // Desktop detection
  else {
    deviceType = "Desktop"
    if (/Windows/i.test(userAgent)) {
      deviceModel = "Windows PC"
    } else if (/Macintosh|Mac OS X/i.test(userAgent)) {
      deviceModel = "Mac"
    } else if (/Linux/i.test(userAgent)) {
      deviceModel = "Linux PC"
    } else {
      deviceModel = "Desktop Computer"
    }
  }

  // OS detection
  let os = "Unknown"
  if (/Windows NT 10/i.test(userAgent)) os = "Windows 10/11"
  else if (/Windows NT 6.3/i.test(userAgent)) os = "Windows 8.1"
  else if (/Windows NT 6.2/i.test(userAgent)) os = "Windows 8"
  else if (/Windows NT 6.1/i.test(userAgent)) os = "Windows 7"
  else if (/Windows/i.test(userAgent)) os = "Windows"
  else if (/Mac OS X ([\d_]+)/i.test(userAgent)) {
    const macMatch = userAgent.match(/Mac OS X ([\d_]+)/i)
    if (macMatch) {
      const version = macMatch[1].replace(/_/g, '.')
      os = `macOS ${version}`
    } else {
      os = "macOS"
    }
  }
  else if (/Android ([\d.]+)/i.test(userAgent)) {
    const androidMatch = userAgent.match(/Android ([\d.]+)/i)
    if (androidMatch) {
      os = `Android ${androidMatch[1]}`
    } else {
      os = "Android"
    }
  }
  else if (/iPhone OS ([\d_]+)/i.test(userAgent)) {
    const iosMatch = userAgent.match(/iPhone OS ([\d_]+)/i)
    if (iosMatch) {
      const version = iosMatch[1].replace(/_/g, '.')
      os = `iOS ${version}`
    } else {
      os = "iOS"
    }
  }
  else if (/Linux/i.test(userAgent)) os = "Linux"

  // Browser detection
  let browser = "Unknown"
  if (/Chrome/i.test(userAgent) && !/Edg|OPR|Opera/i.test(userAgent)) {
    const chromeMatch = userAgent.match(/Chrome\/([\d.]+)/i)
    browser = chromeMatch ? `Chrome ${chromeMatch[1].split('.')[0]}` : "Chrome"
  }
  else if (/Firefox/i.test(userAgent)) {
    const firefoxMatch = userAgent.match(/Firefox\/([\d.]+)/i)
    browser = firefoxMatch ? `Firefox ${firefoxMatch[1].split('.')[0]}` : "Firefox"
  }
  else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
    const safariMatch = userAgent.match(/Version\/([\d.]+)/i)
    browser = safariMatch ? `Safari ${safariMatch[1].split('.')[0]}` : "Safari"
  }
  else if (/Edg/i.test(userAgent)) {
    const edgeMatch = userAgent.match(/Edg\/([\d.]+)/i)
    browser = edgeMatch ? `Edge ${edgeMatch[1].split('.')[0]}` : "Edge"
  }
  else if (/OPR|Opera/i.test(userAgent)) {
    const operaMatch = userAgent.match(/(?:OPR|Opera)\/([\d.]+)/i)
    browser = operaMatch ? `Opera ${operaMatch[1].split('.')[0]}` : "Opera"
  }
  else if (/MSIE|Trident/i.test(userAgent)) browser = "Internet Explorer"

  return {
    deviceType,
    os,
    browser,
    deviceModel,
    userAgent: userAgent.substring(0, 100)
  }
}

// Enhanced location detection with permission handling
export const getLocationInfo = async (): Promise<{
  ip: string
  city: string
  region: string
  country: string
  timezone: string
  accuracy: 'high' | 'medium' | 'low'
  source: string
}> => {
  const fallbackLocation = {
    ip: "Unknown",
    city: "Unknown", 
    region: "Unknown",
    country: "Unknown",
    timezone: "Unknown",
    accuracy: 'low' as const,
    source: 'fallback'
  }

  // First, try to get high-accuracy location using browser geolocation API
  try {
    if ('geolocation' in navigator) {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        )
      })

      // If we get coordinates, use reverse geocoding
      const { latitude, longitude } = position.coords
      
      try {
        // Try to get location details from coordinates using a reverse geocoding service
        const reverseGeoResponse = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          { signal: AbortSignal.timeout(5000) }
        )
        
        if (reverseGeoResponse.ok) {
          const geoData = await reverseGeoResponse.json()
          
          // Also get IP info for additional details
          const ipInfo = await getIPLocationInfo()
          
          return {
            ip: ipInfo.ip || "Unknown",
            city: geoData.city || geoData.locality || "Unknown",
            region: geoData.principalSubdivision || geoData.countryName || "Unknown", 
            country: geoData.countryName || "Unknown",
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown",
            accuracy: 'high',
            source: 'gps+ip'
          }
        }
      } catch (error) {
        console.warn("Reverse geocoding failed:", error)
      }
    }
  } catch (error) {
    console.warn("Geolocation failed:", error)
    
    // If geolocation fails, show a user-friendly message about enabling location
    if (error instanceof GeolocationPositionError) {
      if (error.code === error.PERMISSION_DENIED) {
        // Location permission denied - we'll still continue with IP-based location
        console.warn("Location permission denied by user")
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        console.warn("Location information unavailable")
      } else if (error.code === error.TIMEOUT) {
        console.warn("Location request timed out")
      }
    }
  }

  // Fallback to IP-based location detection
  return await getIPLocationInfo()
}

// IP-based location detection with multiple services
const getIPLocationInfo = async () => {
  const fallbackLocation = {
    ip: "Unknown",
    city: "Unknown",
    region: "Unknown", 
    country: "Unknown",
    timezone: "Unknown",
    accuracy: 'low' as const,
    source: 'ip-fallback'
  }

  // Service 1: ipgeolocation.io (Good for Indian locations)
  try {
    const response = await fetch("https://api.ipgeolocation.io/ipgeo?apiKey=free", {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000)
    })

    if (response.ok) {
      const data = await response.json()
      
      if (data && data.ip && data.city && data.city !== "Unknown" && data.city !== "") {
        console.log("Location from ipgeolocation.io:", data)
        return {
          ip: data.ip || "Unknown",
          city: data.city || "Unknown",
          region: data.state_prov || data.district || "Unknown",
          country: data.country_name || "Unknown", 
          timezone: data.time_zone?.name || "Unknown",
          accuracy: 'medium' as const,
          source: 'ipgeolocation.io'
        }
      }
    }
  } catch (error) {
    console.warn("ipgeolocation.io failed:", error)
  }

  // Service 2: ip-api.com (Good accuracy, free)
  try {
    const response = await fetch(
      "http://ip-api.com/json/?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query",
      {
        method: "GET",
        signal: AbortSignal.timeout(8000)
      }
    )

    if (response.ok) {
      const data = await response.json()
      
      if (data && data.status === "success" && data.city && data.city !== "Unknown" && data.city !== "") {
        console.log("Location from ip-api.com:", data)
        return {
          ip: data.query || "Unknown",
          city: data.city || "Unknown",
          region: data.regionName || data.region || "Unknown",
          country: data.country || "Unknown",
          timezone: data.timezone || "Unknown",
          accuracy: 'medium' as const,
          source: 'ip-api.com'
        }
      }
    }
  } catch (error) {
    console.warn("ip-api.com failed:", error)
  }

  // Service 3: ipapi.co (Backup)
  try {
    const response = await fetch("https://ipapi.co/json/", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; LocationService/1.0)"
      },
      signal: AbortSignal.timeout(8000)
    })

    if (response.ok) {
      const data = await response.json()
      
      if (data && !data.error && data.ip && data.city && data.city !== "Unknown" && data.city !== "") {
        console.log("Location from ipapi.co:", data)
        return {
          ip: data.ip || "Unknown",
          city: data.city || "Unknown", 
          region: data.region || "Unknown",
          country: data.country_name || data.country || "Unknown",
          timezone: data.timezone || "Unknown",
          accuracy: 'medium' as const,
          source: 'ipapi.co'
        }
      }
    }
  } catch (error) {
    console.warn("ipapi.co failed:", error)
  }

  // Service 4: ipinfo.io (Another backup)
  try {
    const response = await fetch("https://ipinfo.io/json", {
      method: "GET",
      signal: AbortSignal.timeout(8000)
    })

    if (response.ok) {
      const data = await response.json()
      
      if (data && data.ip && data.city && data.city !== "Unknown" && data.city !== "") {
        console.log("Location from ipinfo.io:", data)
        return {
          ip: data.ip || "Unknown",
          city: data.city || "Unknown",
          region: data.region || "Unknown", 
          country: data.country || "Unknown",
          timezone: data.timezone || "Unknown",
          accuracy: 'medium' as const,
          source: 'ipinfo.io'
        }
      }
    }
  } catch (error) {
    console.warn("ipinfo.io failed:", error)
  }

  // If all services fail, return fallback with browser timezone
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown"
    console.warn("All location services failed, using browser timezone only")
    return {
      ...fallbackLocation,
      timezone,
      source: 'browser-timezone'
    }
  } catch (error) {
    console.error("All location services failed completely:", error)
    return fallbackLocation
  }
}

// Check if location permission is granted
export const checkLocationPermission = async (): Promise<{
  granted: boolean
  canRequest: boolean
  message: string
}> => {
  if (!('geolocation' in navigator)) {
    return {
      granted: false,
      canRequest: false,
      message: "Geolocation is not supported by this browser"
    }
  }

  try {
    if ('permissions' in navigator) {
      const permission = await navigator.permissions.query({ name: 'geolocation' })
      
      switch (permission.state) {
        case 'granted':
          return {
            granted: true,
            canRequest: false,
            message: "Location access granted"
          }
        case 'denied':
          return {
            granted: false,
            canRequest: false,
            message: "Location access denied. Please enable location in your browser settings."
          }
        case 'prompt':
          return {
            granted: false,
            canRequest: true,
            message: "Location permission required for accurate tracking"
          }
        default:
          return {
            granted: false,
            canRequest: true,
            message: "Location permission status unknown"
          }
      }
    }
  } catch (error) {
    console.warn("Permission API not available:", error)
  }

  // Fallback for browsers without permission API
  return {
    granted: false,
    canRequest: true,
    message: "Location permission required for accurate tracking"
  }
}

// Request location permission
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 60000
        }
      )
    })
    
    return true
  } catch (error) {
    console.warn("Location permission request failed:", error)
    return false
  }
}

// Generate unique session ID
export const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
