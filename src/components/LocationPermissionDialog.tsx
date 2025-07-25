"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Shield, AlertTriangle, CheckCircle } from 'lucide-react'

interface LocationPermissionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPermissionResult: (granted: boolean) => void
}

export function LocationPermissionDialog({ 
  open, 
  onOpenChange, 
  onPermissionResult 
}: LocationPermissionDialogProps) {
  const [requesting, setRequesting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRequestPermission = async () => {
    setRequesting(true)
    setError(null)

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        )
      })

      onPermissionResult(true)
      onOpenChange(false)
    } catch (error: any) {
      let errorMessage = "Failed to get location permission"
      
      if (error.code === 1) { // PERMISSION_DENIED
        errorMessage = "Location access was denied. Please enable location in your browser settings and try again."
      } else if (error.code === 2) { // POSITION_UNAVAILABLE
        errorMessage = "Location information is unavailable. Please check your device settings."
      } else if (error.code === 3) { // TIMEOUT
        errorMessage = "Location request timed out. Please try again."
      }

      setError(errorMessage)
      onPermissionResult(false)
    } finally {
      setRequesting(false)
    }
  }

  const handleSkip = () => {
    onPermissionResult(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Location Permission Required
          </DialogTitle>
          <DialogDescription>
            We need access to your location to provide accurate login tracking and security features.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Why we need location access:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Enhanced security monitoring</li>
                <li>• Accurate login location tracking</li>
                <li>• Suspicious activity detection</li>
                <li>• Better user experience</li>
              </ul>
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleRequestPermission}
              disabled={requesting}
              className="w-full"
            >
              {requesting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Requesting Permission...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Allow Location Access
                </>
              )}
            </Button>

            <Button 
              variant="outline" 
              onClick={handleSkip}
              disabled={requesting}
              className="w-full"
            >
              Continue Without Location
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Your location data is only used for security purposes and is not shared with third parties.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
