// components/GoogleReviews.tsx
"use client"

import React, { useEffect, useState } from "react"
import { Star } from "lucide-react"
import { auth, db } from "@/firebase/firebase"
import { doc, getDoc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"

const GOOGLE_API_KEY = "AIzaSyA-CiYkNslFVHpkDd-jlJH9LOhabb1yLLw"

export default function GoogleReviews() {
  const [googleReviews, setGoogleReviews] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGoogleReviews = async (searchQuery: string) => {
      try {
        // Step 1: Get Place ID
        const searchRes = await fetch(
          `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
            searchQuery
          )}&inputtype=textquery&fields=place_id&key=${GOOGLE_API_KEY}`
        )
        const searchData = await searchRes.json()
        const placeId = searchData?.candidates?.[0]?.place_id

        if (!placeId) {
          setError("Business not found on Google Maps.")
          return
        }

        // Step 2: Fetch Reviews
        const detailsRes = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews&key=${GOOGLE_API_KEY}`
        )
        const detailsData = await detailsRes.json()
        const reviews = detailsData?.result?.reviews || []

        setGoogleReviews(reviews)
      } catch (err) {
        console.error("Google Reviews error:", err)
        setError("Failed to fetch Google reviews.")
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid)
          const userDoc = await getDoc(userRef)

          if (!userDoc.exists()) {
            setError("User data not found.")
            return
          }

          const data = userDoc.data()
          const businessName = data?.businessInfo?.businessName
          const branches = data?.businessInfo?.branches || []

          const firstBranchName = branches[0]?.branchname || ""
          const searchQuery = `${businessName} ${firstBranchName}`.trim()

          if (!businessName) {
            setError("Business name is missing in your profile.")
            return
          }

          await fetchGoogleReviews(searchQuery)
        } catch (err) {
          console.error("Firebase error:", err)
          setError("Failed to load business info.")
        }
      }
    })

    return () => unsubscribe()
  }, [])

  if (error) {
    return <p className="text-red-500 font-medium mt-4">{error}</p>
  }

  if (!googleReviews.length) return null

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Google Reviews</h2>
      <div className="space-y-4">
        {googleReviews.map((review, index) => (
          <div key={index} className="border p-4 rounded shadow-sm bg-white">
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-gray-800">{review.author_name}</span>
              <span className="text-sm text-gray-500">{review.relative_time_description}</span>
            </div>
            <div className="flex mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-gray-700">{review.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
