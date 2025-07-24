"use client"

import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { db } from "@/firebase/firebase"
import { doc, getDoc, collection, query, where, limit, getDocs } from "firebase/firestore"

function SharableRedirect() {
  const { slug } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const checkSlug = async () => {
      try {
        // 1. Check if this is a sharable link first (since URL is /s/slug)
        const globalSharableQuery = query(collection(db, "sharable_links"), where("slug", "==", slug), limit(1))
        const globalSharableSnap = await getDocs(globalSharableQuery)

        if (!globalSharableSnap.empty) {
          const linkDoc = globalSharableSnap.docs[0]
          await handleSharableLink(linkDoc)
          return
        }

        // 2. Check main review link (fallback for direct business links)
        const mainDocRef = doc(db, "slug_to_uid", slug)
        const mainDocSnap = await getDoc(mainDocRef)

        if (mainDocSnap.exists()) {
          navigate(`/${slug}`)
          return
        }

        alert("Link not found")
      } catch (error) {
        console.error("Error checking slug:", error)
        alert("Something went wrong. Please try again.")
      }
    }

    const handleSharableLink = async (linkDoc: any) => {
      const linkData = linkDoc.data()
      const now = new Date()
      const expiresAt = linkData.expiresAt.toDate()

      // FIX: Check if link is expired first
      if (now > expiresAt) {
        alert("This link has expired")
        return
      }

      // FIX: Check if link is inactive and show appropriate message
      if (!linkData.isActive) {
        alert("Link temporarily unavailable")
        return
      }

      if (!linkData.businessSlug) {
        alert("Invalid link configuration")
        return
      }

      // Navigate to clean review URL with sharable link parameter
      navigate(`/${linkData.businessSlug}?sl=${linkDoc.id}`)
    }

    if (slug) {
      checkSlug()
    }
  }, [slug, navigate])

  return <div>Checking link, please wait...</div>
}

export default SharableRedirect
