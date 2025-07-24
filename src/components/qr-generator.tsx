"use client"

import { useState } from "react"
import { QrCode, Download, Share2, Copy, Check } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { motion } from "framer-motion"

interface QRGeneratorProps {
  reviewUrl: string
  businessName: string
  hasCustomPlan: boolean
}

export default function QRGenerator({ reviewUrl, businessName, hasCustomPlan }: QRGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const generateQRCode = async () => {
    if (!hasCustomPlan) {
      toast.error("QR Code generation is available for Custom plan users only")
      return
    }

    setIsGenerating(true)
    try {
      // Using QR Server API for QR code generation
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(reviewUrl)}&bgcolor=ffffff&color=000000&format=png&margin=10`
      setQrCodeUrl(qrUrl)
      toast.success("QR Code generated successfully!")
    } catch (error) {
      console.error("Error generating QR code:", error)
      toast.error("Failed to generate QR code")
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadQRCode = async () => {
    if (!qrCodeUrl) return

    try {
      const response = await fetch(qrCodeUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${businessName.replace(/\s+/g, '-').toLowerCase()}-review-qr.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success("QR Code downloaded!")
    } catch (error) {
      console.error("Error downloading QR code:", error)
      toast.error("Failed to download QR code")
    }
  }

  const shareQRCode = async () => {
    if (!qrCodeUrl) return

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${businessName} - Leave a Review`,
          text: `Scan this QR code to leave a review for ${businessName}`,
          url: reviewUrl
        })
      } else {
        // Fallback to copying URL
        await navigator.clipboard.writeText(reviewUrl)
        setCopied(true)
        toast.success("Review URL copied to clipboard!")
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (error) {
      console.error("Error sharing QR code:", error)
      toast.error("Failed to share QR code")
    }
  }

  const copyQRCode = async () => {
    try {
      const response = await fetch(qrCodeUrl)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      setCopied(true)
      toast.success("QR Code copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      // Fallback to copying URL
      await navigator.clipboard.writeText(reviewUrl)
      setCopied(true)
      toast.success("Review URL copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!hasCustomPlan) {
    return (
      <Card className="border-amber-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 p-6">
          <CardTitle className="text-xl font-bold text-white flex items-center">
            <QrCode className="h-5 w-5 mr-2" />
            QR Code Generator
            <span className="ml-3 text-sm bg-white/20 px-2 py-1 rounded-full">Custom Plan</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <div className="mb-6">
            <QrCode className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Premium Feature</h3>
            <p className="text-gray-600">
              QR Code generation is available for Custom plan subscribers only.
            </p>
          </div>
          <Button
            onClick={() => toast.info("Upgrade to Custom plan to unlock QR Code generation")}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white"
          >
            Upgrade to Custom Plan
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-purple-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
        <CardTitle className="text-xl font-bold text-white flex items-center">
          <QrCode className="h-5 w-5 mr-2" />
          QR Code Generator
          <span className="ml-3 text-sm bg-white/20 px-2 py-1 rounded-full">Custom Plan</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {!qrCodeUrl ? (
          <div className="text-center">
            <div className="mb-6">
              <QrCode className="h-16 w-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Generate QR Code</h3>
              <p className="text-gray-600 mb-4">
                Create a QR code that customers can scan to leave reviews
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Links to: {reviewUrl}
              </p>
            </div>
            <Button
              onClick={generateQRCode}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white w-full"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate QR Code
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-4 rounded-xl shadow-inner border-2 border-gray-100 inline-block"
            >
              <img
                src={qrCodeUrl || "/placeholder.svg"}
                alt="QR Code for Review Link"
                className="w-64 h-64 mx-auto"
              />
            </motion.div>
            
            <div className="text-sm text-gray-600">
              <p className="font-medium">{businessName}</p>
              <p>Scan to leave a review</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                onClick={downloadQRCode}
                variant="outline"
                className="border-purple-200 hover:bg-purple-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              
              <Button
                onClick={copyQRCode}
                variant="outline"
                className="border-purple-200 hover:bg-purple-50"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
              
              <Button
                onClick={shareQRCode}
                variant="outline"
                className="border-purple-200 hover:bg-purple-50"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>

            <Button
              onClick={() => setQrCodeUrl("")}
              variant="ghost"
              className="text-purple-600 hover:text-purple-800"
            >
              Generate New QR Code
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
