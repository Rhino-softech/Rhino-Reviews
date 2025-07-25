// Enhanced device detection with better mobile identification and location permissions
export const getDeviceInfo = () => {
  const userAgent = navigator.userAgent

  // Enhanced device type detection
  let deviceType = "Desktop"
  let deviceModel = "Unknown"

  // Check for mobile devices first (more specific patterns)
  if (/iPhone/i.test(userAgent)) {
    deviceType = "Mobile"
    // Extract iPhone model with better detection
    if (/iPhone15/i.test(userAgent)) deviceModel = "iPhone 15"
    else if (/iPhone14/i.test(userAgent)) deviceModel = "iPhone 14"
    else if (/iPhone13/i.test(userAgent)) deviceModel = "iPhone 13"
    else if (/iPhone12/i.test(userAgent)) deviceModel = "iPhone 12"
    else if (/iPhone11/i.test(userAgent)) deviceModel = "iPhone 11"
    else if (/iPhoneXS/i.test(userAgent)) deviceModel = "iPhone XS"
    else if (/iPhoneXR/i.test(userAgent)) deviceModel = "iPhone XR"
    else if (/iPhoneX/i.test(userAgent)) deviceModel = "iPhone X"
    else if (/iPhone SE/i.test(userAgent)) deviceModel = "iPhone SE"
    else deviceModel = "iPhone"
  } else if (/iPad/i.test(userAgent)) {
    deviceType = "Tablet"
    if (/iPad Pro/i.test(userAgent)) deviceModel = "iPad Pro"
    else if (/iPad Air/i.test(userAgent)) deviceModel = "iPad Air"
    else if (/iPad mini/i.test(userAgent)) deviceModel = "iPad mini"
    else deviceModel = "iPad"
  } else if (/Android/i.test(userAgent)) {
    // Check if it's actually a tablet first
    if (/Tablet|Tab/i.test(userAgent) || (window.screen && window.screen.width >= 768 && window.screen.height >= 1024)) {
      deviceType = "Tablet"
      deviceModel = "Android Tablet"
    } else {
      deviceType = "Mobile"
    }
    
    // Samsung devices - Enhanced detection
    if (/Samsung|SM-/i.test(userAgent)) {
      const samsungMatch = userAgent.match(/SM-([A-Z0-9]+)/i) || userAgent.match(/Samsung[\s-]([A-Z0-9\s]+)/i)
      if (samsungMatch) {
        const model = samsungMatch[1].replace(/[\s-]+/g, '').toUpperCase()
        const samsungModels: { [key: string]: string } = {
          // Galaxy S Series
          'S911': 'Galaxy S23',
          'S916': 'Galaxy S23+',
          'S918': 'Galaxy S23 Ultra',
          'S901': 'Galaxy S22',
          'S906': 'Galaxy S22+',
          'S908': 'Galaxy S22 Ultra',
          'G991': 'Galaxy S21',
          'G996': 'Galaxy S21+',
          'G998': 'Galaxy S21 Ultra',
          'G973': 'Galaxy S10',
          'G975': 'Galaxy S10+',
          'G977': 'Galaxy S10 5G',
          // Galaxy Note Series
          'N975': 'Galaxy Note 10+',
          'N971': 'Galaxy Note 10',
          'N986': 'Galaxy Note 20 Ultra',
          'N981': 'Galaxy Note 20',
          // Galaxy A Series
          'A515': 'Galaxy A51',
          'A715': 'Galaxy A71',
          'A125': 'Galaxy A12',
          'A225': 'Galaxy A22',
          'A325': 'Galaxy A32',
          'A525': 'Galaxy A52',
          'A725': 'Galaxy A72',
          'A536': 'Galaxy A53',
          'A736': 'Galaxy A73',
          'A145': 'Galaxy A14',
          'A245': 'Galaxy A24',
          'A346': 'Galaxy A34',
          'A546': 'Galaxy A54',
          // Galaxy M Series
          'M315': 'Galaxy M31',
          'M215': 'Galaxy M21',
          'M336': 'Galaxy M33',
          'M546': 'Galaxy M54',
          // Galaxy J Series
          'J737': 'Galaxy J7',
          'J337': 'Galaxy J3',
          // Galaxy F Series
          'F415': 'Galaxy F41',
          'F625': 'Galaxy F62'
        }
        
        const foundModel = Object.keys(samsungModels).find(key => model.includes(key))
        deviceModel = foundModel ? `Samsung ${samsungModels[foundModel]}` : `Samsung ${model}`
      } else {
        deviceModel = "Samsung Galaxy"
      }
    }
    // OPPO devices - Enhanced detection
    else if (/OPPO/i.test(userAgent)) {
      const oppoMatch = userAgent.match(/OPPO[\s-]([A-Z0-9]+)/i) || userAgent.match(/CPH(\d+)/i)
      if (oppoMatch) {
        const model = oppoMatch[1]
        const oppoModels: { [key: string]: string } = {
          'A12': 'A12',
          'A15': 'A15',
          'A16': 'A16',
          'A53': 'A53 5G',
          'A74': 'A74 5G',
          'A94': 'A94',
          'A96': 'A96',
          'F19': 'F19 Pro',
          'F21': 'F21 Pro',
          'RENO6': 'Reno6',
          'RENO7': 'Reno7',
          'RENO8': 'Reno8',
          'RENO9': 'Reno9',
          'FINDX': 'Find X5',
          '2201': 'A96',
          '2269': 'A77',
          '2357': 'A58'
        }
        
        const foundModel = Object.keys(oppoModels).find(key => model.toUpperCase().includes(key))
        deviceModel = foundModel ? `OPPO ${oppoModels[foundModel]}` : `OPPO ${model}`
      } else {
        deviceModel = "OPPO"
      }
    }
    // Xiaomi/Redmi devices - Enhanced detection
    else if (/Xiaomi|Mi[\s-]|Redmi/i.test(userAgent)) {
      if (/Redmi/i.test(userAgent)) {
        const redmiMatch = userAgent.match(/Redmi[\s-]([A-Z0-9\s]+)/i) || userAgent.match(/M(\d+)/i)
        if (redmiMatch) {
          const model = redmiMatch[1].trim()
          const redmiModels: { [key: string]: string } = {
            'NOTE12': 'Note 12',
            'NOTE11': 'Note 11',
            'NOTE10': 'Note 10',
            'NOTE9': 'Note 9',
            '12C': '12C',
            '11T': '11T',
            '10A': '10A',
            '9A': '9A',
            'K50': 'K50',
            'K40': 'K40',
            'K30': 'K30'
          }
          
          const foundModel = Object.keys(redmiModels).find(key => model.toUpperCase().includes(key))
          deviceModel = foundModel ? `Xiaomi Redmi ${redmiModels[foundModel]}` : `Xiaomi Redmi ${model}`
        } else {
          deviceModel = "Xiaomi Redmi"
        }
      } else if (/Mi[\s-]/i.test(userAgent)) {
        const miMatch = userAgent.match(/Mi[\s-]([A-Z0-9\s]+)/i)
        if (miMatch) {
          const model = miMatch[1].trim()
          deviceModel = `Xiaomi Mi ${model}`
        } else {
          deviceModel = "Xiaomi Mi"
        }
      } else {
        deviceModel = "Xiaomi"
      }
    }
    // OnePlus devices - Enhanced detection
    else if (/OnePlus/i.test(userAgent)) {
      const oneplusMatch = userAgent.match(/OnePlus[\s-]([A-Z0-9]+)/i)
      if (oneplusMatch) {
        const model = oneplusMatch[1]
        const oneplusModels: { [key: string]: string } = {
          '11': 'OnePlus 11',
          '10PRO': 'OnePlus 10 Pro',
          '10T': 'OnePlus 10T',
          '9PRO': 'OnePlus 9 Pro',
          '9RT': 'OnePlus 9RT',
          '8T': 'OnePlus 8T',
          '8PRO': 'OnePlus 8 Pro',
          'NORD': 'OnePlus Nord'
        }
        
        const foundModel = Object.keys(oneplusModels).find(key => model.toUpperCase().includes(key))
        deviceModel = foundModel ? oneplusModels[foundModel] : `OnePlus ${model}`
      } else {
        deviceModel = "OnePlus"
      }
    }
    // Vivo devices - Enhanced detection
    else if (/vivo/i.test(userAgent)) {
      const vivoMatch = userAgent.match(/vivo[\s-]([A-Z0-9]+)/i) || userAgent.match(/V(\d+)/i)
      if (vivoMatch) {
        const model = vivoMatch[1]
        const vivoModels: { [key: string]: string } = {
          'Y75': 'Y75',
          'Y73': 'Y73',
          'Y55': 'Y55',
          'Y33': 'Y33',
          'Y21': 'Y21',
          'V25': 'V25',
          'V23': 'V23',
          'V21': 'V21',
          'X80': 'X80',
          'X70': 'X70',
          'X60': 'X60'
        }
        
        const foundModel = Object.keys(vivoModels).find(key => model.includes(key))
        deviceModel = foundModel ? `Vivo ${vivoModels[foundModel]}` : `Vivo ${model}`
      } else {
        deviceModel = "Vivo"
      }
    }
    // Realme devices - Enhanced detection
    else if (/RMX|Realme/i.test(userAgent)) {
      const realmeMatch = userAgent.match(/RMX(\d+)|Realme[\s-]([A-Z0-9\s]+)/i)
      if (realmeMatch) {
        const model = realmeMatch[1] || realmeMatch[2]
        const realmeModels: { [key: string]: string } = {
          '3630': 'GT Neo 5',
          '3551': 'GT Neo 3',
          '3371': 'GT 2 Pro',
          '3031': '9 Pro+',
          '2202': '9 5G',
          '2201': '9 4G',
          '2103': '8 5G',
          '2101': '8 4G'
        }
        
        const foundModel = Object.keys(realmeModels).find(key => model.includes(key))
        deviceModel = foundModel ? `Realme ${realmeModels[foundModel]}` : `Realme ${model}`
      } else {
        deviceModel = "Realme"
      }
    }
    // Honor devices
    else if (/Honor/i.test(userAgent)) {
      const honorMatch = userAgent.match(/Honor[\s-]([A-Z0-9\s]+)/i)
      if (honorMatch) {
        deviceModel = `Honor ${honorMatch[1].trim()}`
      } else {
        deviceModel = "Honor"
      }
    }
    // Huawei devices
    else if (/Huawei/i.test(userAgent)) {
      const huaweiMatch = userAgent.match(/Huawei[\s-]([A-Z0-9\s]+)/i)
      if (huaweiMatch) {
        deviceModel = `Huawei ${huaweiMatch[1].trim()}`
      } else {
        deviceModel = "Huawei"
      }
    }
    // Generic Android
    else {
      deviceModel = deviceType === "Tablet" ? "Android Tablet" : "Android Device"
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
      if (/Windows NT 10/i.test(userAgent)) deviceModel = "Windows 10/11 PC"
      else if (/Windows NT 6.3/i.test(userAgent)) deviceModel = "Windows 8.1 PC"
      else if (/Windows NT 6.1/i.test(userAgent)) deviceModel = "Windows 7 PC"
      else deviceModel = "Windows PC"
    } else if (/Macintosh|Mac OS X/i.test(userAgent)) {
      if (/Intel/i.test(userAgent)) deviceModel = "Intel Mac"
      else if (/Apple Silicon|M1|M2/i.test(userAgent)) deviceModel = "Apple Silicon Mac"
      else deviceModel = "Mac"
    } else if (/Linux/i.test(userAgent)) {
      if (/Ubuntu/i.test(userAgent)) deviceModel = "Ubuntu Linux"
      else if (/Fedora/i.test(userAgent)) deviceModel = "Fedora Linux"
      else deviceModel = "Linux PC"
    } else {
      deviceModel = "Desktop Computer"
    }
  }

  // Enhanced OS detection
  let os = "Unknown"
  if (/Windows NT 10/i.test(userAgent)) {
    // Try to detect Windows 11 vs 10
    if (userAgent.includes('Windows NT 10.0; Win64; x64') && userAgent.includes('Chrome')) {
      os = "Windows 10/11"
    } else {
      os = "Windows 10"
    }
  }
  else if (/Windows NT 6.3/i.test(userAgent)) os = "Windows 8.1"
  else if (/Windows NT 6.2/i.test(userAgent)) os = "Windows 8"
  else if (/Windows NT 6.1/i.test(userAgent)) os = "Windows 7"
  else if (/Windows/i.test(userAgent)) os = "Windows"
  else if (/Mac OS X ([\d_]+)/i.test(userAgent)) {
    const macMatch = userAgent.match(/Mac OS X ([\d_]+)/i)
    if (macMatch) {
      const version = macMatch[1].replace(/_/g, '.')
      const majorVersion = parseInt(version.split('.')[1])
      
      // macOS version mapping
      if (majorVersion >= 15) os = `macOS ${majorVersion - 4} (${version})`
      else if (majorVersion >= 10) os = `macOS ${version}`
      else os = `Mac OS X ${version}`
    } else {
      os = "macOS"
    }
  }
  else if (/Android ([\d.]+)/i.test(userAgent)) {
    const androidMatch = userAgent.match(/Android ([\d.]+)/i)
    if (androidMatch) {
      const version = androidMatch[1]
      const majorVersion = parseInt(version.split('.')[0])
      
      // Android version names
      const androidVersions: { [key: number]: string } = {
        14: 'Android 14',
        13: 'Android 13',
        12: 'Android 12',
        11: 'Android 11',
        10: 'Android 10',
        9: 'Android 9 (Pie)',
        8: 'Android 8 (Oreo)',
        7: 'Android 7 (Nougat)',
        6: 'Android 6 (Marshmallow)',
        5: 'Android 5 (Lollipop)'
      }
      
      os = androidVersions[majorVersion] || `Android ${version}`
    } else {
      os = "Android"
    }
  }
  else if (/iPhone OS ([\d_]+)|OS ([\d_]+)/i.test(userAgent)) {
    const iosMatch = userAgent.match(/(?:iPhone )?OS ([\d_]+)/i)
    if (iosMatch) {
      const version = iosMatch[1].replace(/_/g, '.')
      const majorVersion = parseInt(version.split('.')[0])
      
      if (majorVersion >= 17) os = `iOS ${majorVersion}`
      else os = `iOS ${version}`
    } else {
      os = "iOS"
    }
  }
  else if (/Linux/i.test(userAgent)) {
    if (/Ubuntu/i.test(userAgent)) os = "Ubuntu Linux"
    else if (/Fedora/i.test(userAgent)) os = "Fedora Linux"
    else if (/Debian/i.test(userAgent)) os = "Debian Linux"
    else os = "Linux"
  }

  // Enhanced browser detection
  let browser = "Unknown"
  if (/Chrome/i.test(userAgent) && !/Edg|OPR|Opera|Samsung/i.test(userAgent)) {
    const chromeMatch = userAgent.match(/Chrome\/([\d.]+)/i)
    if (chromeMatch) {
      const version = chromeMatch[1].split('.')[0]
      browser = `Chrome ${version}`
    } else {
      browser = "Chrome"
    }
  }
  else if (/Samsung/i.test(userAgent) && /Chrome/i.test(userAgent)) {
    const samsungMatch = userAgent.match(/SamsungBrowser\/([\d.]+)/i)
    if (samsungMatch) {
      browser = `Samsung Internet ${samsungMatch[1].split('.')[0]}`
    } else {
      browser = "Samsung Internet"
    }
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
    userAgent: userAgent.substring(0, 150) // Increased length for better debugging
  }
}

// Enhanced location detection with better error handling and multiple fallbacks
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
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown",
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
            timeout: 8000,
            maximumAge: 300000 // 5 minutes
          }
        )
      })

      // If we get coordinates, use reverse geocoding
      const { latitude, longitude } = position.coords
      
      try {
        // Try multiple reverse geocoding services
        const reverseGeoServices = [
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          `https://geocode.xyz/${latitude},${longitude}?json=1`,
          `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=free&limit=1`
        ]

        for (const serviceUrl of reverseGeoServices) {
          try {
            const response = await fetch(serviceUrl, { 
              signal: AbortSignal.timeout(5000),
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'LocationService/1.0'
              }
            })
            
            if (response.ok) {
              const geoData = await response.json()
              
              let city = "Unknown", region = "Unknown", country = "Unknown"
              
              // Parse different service responses
              if (serviceUrl.includes('bigdatacloud')) {
                city = geoData.city || geoData.locality || geoData.localityInfo?.administrative?.[3]?.name || "Unknown"
                region = geoData.principalSubdivision || geoData.localityInfo?.administrative?.[1]?.name || "Unknown"
                country = geoData.countryName || "Unknown"
              } else if (serviceUrl.includes('geocode.xyz')) {
                city = geoData.city || "Unknown"
                region = geoData.region || geoData.state || "Unknown"
                country = geoData.country || "Unknown"
              } else if (serviceUrl.includes('opencagedata')) {
                const components = geoData.results?.[0]?.components
                if (components) {
                  city = components.city || components.town || components.village || "Unknown"
                  region = components.state || components.province || "Unknown"
                  country = components.country || "Unknown"
                }
              }
              
              if (city !== "Unknown" && country !== "Unknown") {
                // Also get IP info for additional details
                const ipInfo = await getIPLocationInfo()
                
                return {
                  ip: ipInfo.ip || "Unknown",
                  city,
                  region,
                  country,
                  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown",
                  accuracy: 'high',
                  source: 'gps+reverse-geocoding'
                }
              }
            }
          } catch (serviceError) {
            console.warn(`Reverse geocoding service failed: ${serviceUrl}`, serviceError)
            continue
          }
        }
      } catch (error) {
        console.warn("All reverse geocoding services failed:", error)
      }
    }
  } catch (error) {
    console.warn("Geolocation failed:", error)
  }

  // Fallback to IP-based location detection
  return await getIPLocationInfo()
}

// Enhanced IP-based location detection with multiple services and better error handling
const getIPLocationInfo = async () => {
  const fallbackLocation = {
    ip: "Unknown",
    city: "Unknown",
    region: "Unknown", 
    country: "Unknown",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown",
    accuracy: 'low' as const,
    source: 'browser-timezone'
  }

  // Service configurations with priorities
  const locationServices = [
    {
      name: 'ipgeolocation.io',
      url: 'https://api.ipgeolocation.io/ipgeo?apiKey=free',
      parser: (data: any) => ({
        ip: data.ip,
        city: data.city,
        region: data.state_prov || data.district,
        country: data.country_name,
        timezone: data.time_zone?.name
      })
    },
    {
      name: 'ip-api.com',
      url: 'http://ip-api.com/json/?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query',
      parser: (data: any) => ({
        ip: data.query,
        city: data.city,
        region: data.regionName || data.region,
        country: data.country,
        timezone: data.timezone
      })
    },
    {
      name: 'ipapi.co',
      url: 'https://ipapi.co/json/',
      parser: (data: any) => ({
        ip: data.ip,
        city: data.city,
        region: data.region,
        country: data.country_name || data.country,
        timezone: data.timezone
      })
    },
    {
      name: 'ipinfo.io',
      url: 'https://ipinfo.io/json',
      parser: (data: any) => ({
        ip: data.ip,
        city: data.city,
        region: data.region,
        country: data.country,
        timezone: data.timezone
      })
    },
    {
      name: 'ipwhois.app',
      url: 'http://ipwhois.app/json/',
      parser: (data: any) => ({
        ip: data.ip,
        city: data.city,
        region: data.region,
        country: data.country,
        timezone: data.timezone
      })
    }
  ]

  // Try each service in order
  for (const service of locationServices) {
    try {
      console.log(`Trying location service: ${service.name}`)
      
      const response = await fetch(service.url, {
        method: "GET",
        headers: { 
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; LocationService/1.0)"
        },
        signal: AbortSignal.timeout(8000)
      })

      if (response.ok) {
        const data = await response.json()
        
        // Check for service-specific error conditions
        if (service.name === 'ip-api.com' && data.status !== 'success') {
          console.warn(`${service.name} returned error:`, data.message)
          continue
        }
        
        if (service.name === 'ipapi.co' && data.error) {
          console.warn(`${service.name} returned error:`, data.reason)
          continue
        }
        
        const parsed = service.parser(data)
        
        // Validate the parsed data
        if (parsed.ip && parsed.city && parsed.city !== "Unknown" && parsed.city !== "" && 
            parsed.country && parsed.country !== "Unknown" && parsed.country !== "") {
          
          console.log(`Successfully got location from ${service.name}:`, parsed)
          
          return {
            ip: parsed.ip || "Unknown",
            city: parsed.city || "Unknown",
            region: parsed.region || "Unknown",
            country: parsed.country || "Unknown",
            timezone: parsed.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown",
            accuracy: 'medium' as const,
            source: service.name
          }
        } else {
          console.warn(`${service.name} returned incomplete data:`, parsed)
        }
      } else {
        console.warn(`${service.name} HTTP error:`, response.status, response.statusText)
      }
    } catch (error) {
      console.warn(`${service.name} failed:`, error)
      continue
    }
  }

  // If all services fail, return fallback with browser timezone
  console.warn("All location services failed, using browser timezone only")
  return fallbackLocation
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
