export const getDeviceInfo = () => {
  const userAgent = navigator.userAgent

  // Device type
  let deviceType = "Desktop"
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(userAgent)) {
    deviceType = /iPad/i.test(userAgent) ? "Tablet" : "Mobile"
  }

  // OS
  let os = "Unknown"
  if (/Windows/i.test(userAgent)) os = "Windows"
  else if (/Mac/i.test(userAgent)) os = "Mac"
  else if (/Linux/i.test(userAgent)) os = "Linux"
  else if (/Android/i.test(userAgent)) os = "Android"
  else if (/iOS|iPhone|iPad|iPod/i.test(userAgent)) os = "iOS"

  // Browser
  let browser = "Unknown"
  if (/Chrome/i.test(userAgent) && !/Edg/i.test(userAgent)) browser = "Chrome"
  else if (/Firefox/i.test(userAgent)) browser = "Firefox"
  else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) browser = "Safari"
  else if (/Edg/i.test(userAgent)) browser = "Edge"
  else if (/Opera|OPR/i.test(userAgent)) browser = "Opera"
  else if (/MSIE|Trident/i.test(userAgent)) browser = "IE"

  // Get detailed device model
  let deviceModel = "Unknown"
  
  // Samsung devices
  if (/Samsung/i.test(userAgent)) {
    const samsungMatch = userAgent.match(/SM-([A-Z0-9]+)/i)
    if (samsungMatch) {
      const model = samsungMatch[1]
      // Map common Samsung model codes to readable names
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
        'E225': 'Galaxy F14',
        'M315': 'Galaxy M31',
        'J737': 'Galaxy J7',
        'A505': 'Galaxy A50'
      }
      
      // Check for exact matches first
      const foundModel = Object.keys(samsungModels).find(key => model.includes(key))
      if (foundModel) {
        deviceModel = `Samsung ${samsungModels[foundModel]}`
      } else {
        deviceModel = `Samsung SM-${model}`
      }
    } else {
      deviceModel = "Samsung Device"
    }
  }
  // OPPO devices
  else if (/OPPO/i.test(userAgent)) {
    const oppoMatch = userAgent.match(/OPPO ([A-Z0-9]+)/i)
    if (oppoMatch) {
      const model = oppoMatch[1]
      const oppoModels: { [key: string]: string } = {
        'A12': 'A12',
        'A15': 'A15',
        'A53': 'A53',
        'A74': 'A74',
        'A94': 'A94',
        'F19': 'F19',
        'F21': 'F21',
        'Reno6': 'Reno6',
        'Reno7': 'Reno7',
        'Find': 'Find X'
      }
      
      const foundModel = Object.keys(oppoModels).find(key => model.includes(key))
      if (foundModel) {
        deviceModel = `OPPO ${oppoModels[foundModel]}`
      } else {
        deviceModel = `OPPO ${model}`
      }
    } else {
      deviceModel = "OPPO Device"
    }
  }
  // iPhone devices
  else if (/iPhone/i.test(userAgent)) {
    const iphoneMatch = userAgent.match(/iPhone OS ([0-9_]+)/i)
    if (iphoneMatch) {
      deviceModel = "iPhone"
    } else {
      deviceModel = "iPhone"
    }
  }
  // iPad devices
  else if (/iPad/i.test(userAgent)) {
    deviceModel = "iPad"
  }
  // Xiaomi devices
  else if (/Xiaomi|Mi |Redmi/i.test(userAgent)) {
    if (/Redmi/i.test(userAgent)) {
      const redmiMatch = userAgent.match(/Redmi ([A-Z0-9\s]+)/i)
      if (redmiMatch) {
        deviceModel = `Xiaomi Redmi ${redmiMatch[1].trim()}`
      } else {
        deviceModel = "Xiaomi Redmi"
      }
    } else {
      deviceModel = "Xiaomi Device"
    }
  }
  // OnePlus devices
  else if (/OnePlus/i.test(userAgent)) {
    const oneplusMatch = userAgent.match(/OnePlus ([A-Z0-9]+)/i)
    if (oneplusMatch) {
      deviceModel = `OnePlus ${oneplusMatch[1]}`
    } else {
      deviceModel = "OnePlus Device"
    }
  }
  // Vivo devices
  else if (/vivo/i.test(userAgent)) {
    const vivoMatch = userAgent.match(/vivo ([A-Z0-9]+)/i)
    if (vivoMatch) {
      deviceModel = `Vivo ${vivoMatch[1]}`
    } else {
      deviceModel = "Vivo Device"
    }
  }
  // Desktop/Laptop detection
  else if (deviceType === "Desktop") {
    if (/Windows/i.test(userAgent)) {
      deviceModel = "Windows PC"
    } else if (/Mac/i.test(userAgent)) {
      deviceModel = "Mac"
    } else if (/Linux/i.test(userAgent)) {
      deviceModel = "Linux PC"
    } else {
      deviceModel = "Desktop Computer"
    }
  }

  return {
    deviceType,
    os,
    browser,
    deviceModel,
    userAgent: userAgent.substring(0, 100), // Truncate for storage
  }
}

// Enhanced location information with multiple fallback services
export const getLocationInfo = async () => {
  const fallbackLocation = {
    ip: "Unknown",
    city: "Unknown",
    region: "Unknown",
    country: "Unknown",
    timezone: "Unknown",
  }

  try {
    // Primary service: ipapi.co
    const response = await fetch("https://ipapi.co/json/", {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      timeout: 5000
    })
    
    if (response.ok) {
      const data = await response.json()
      
      // Check if we got valid data
      if (data && !data.error && data.ip) {
        return {
          ip: data.ip || "Unknown",
          city: data.city || "Unknown",
          region: data.region || "Unknown",
          country: data.country_name || data.country || "Unknown",
          timezone: data.timezone || "Unknown",
        }
      }
    }
  } catch (error) {
    console.warn("Primary location service failed:", error)
  }

  try {
    // Fallback service 1: ip-api.com
    const response2 = await fetch("http://ip-api.com/json/", {
      method: 'GET',
      timeout: 5000
    })
    
    if (response2.ok) {
      const data = await response2.json()
      
      if (data && data.status === 'success') {
        return {
          ip: data.query || "Unknown",
          city: data.city || "Unknown",
          region: data.regionName || data.region || "Unknown",
          country: data.country || "Unknown",
          timezone: data.timezone || "Unknown",
        }
      }
    }
  } catch (error) {
    console.warn("Fallback location service 1 failed:", error)
  }

  try {
    // Fallback service 2: ipinfo.io
    const response3 = await fetch("https://ipinfo.io/json", {
      method: 'GET',
      timeout: 5000
    })
    
    if (response3.ok) {
      const data = await response3.json()
      
      if (data && data.ip) {
        const [city, region] = (data.city || "Unknown,Unknown").split(',')
        return {
          ip: data.ip || "Unknown",
          city: city?.trim() || "Unknown",
          region: region?.trim() || data.region || "Unknown",
          country: data.country || "Unknown",
          timezone: data.timezone || "Unknown",
        }
      }
    }
  } catch (error) {
    console.warn("Fallback location service 2 failed:", error)
  }

  // If all services fail, try to get basic info from browser
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown"
    return {
      ...fallbackLocation,
      timezone,
    }
  } catch (error) {
    console.error("All location services failed:", error)
    return fallbackLocation
  }
}

// Generate unique session ID for tracking
export const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
