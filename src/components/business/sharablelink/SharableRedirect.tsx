import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { db } from "@/firebase/firebase"
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  limit,
  getDocs
} from "firebase/firestore"
function SharableRedirect() {
  const { slug } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const checkSlug = async () => {
      try {
        // 1. Check main review link
        const mainDocRef = doc(db, "slug_to_uid", slug)
        const mainDocSnap = await getDoc(mainDocRef)

        if (mainDocSnap.exists()) {
          navigate(`/review/${slug}`)
          return
        }

        // 2. Check global sharable links
        const globalSharableQuery = query(
          collection(db, "sharable_links"),
          where("slug", "==", slug),
          limit(1)
        )
        const globalSharableSnap = await getDocs(globalSharableQuery)

        if (!globalSharableSnap.empty) {
          const linkDoc = globalSharableSnap.docs[0]
          await handleSharableLink(linkDoc)
          return
        }

        // 3. Check user-specific sharable links (if we have userId)
        if (mainDocSnap.exists()) {
          const userId = mainDocSnap.data().uid
          const userSharableQuery = query(
            collection(db, "users", userId, "sharable_links"),
            where("slug", "==", slug),
            limit(1)
          )
          const userSharableSnap = await getDocs(userSharableQuery)

          if (!userSharableSnap.empty) {
            const linkDoc = userSharableSnap.docs[0]
            await handleSharableLink(linkDoc)
            return
          }
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

      if (now > expiresAt || !linkData.isActive) {
        alert("This link has expired or is no longer active")
        return
      }
      if (!linkData.businessSlug) {
        alert("Invalid link configuration")
        return
      }

      navigate(`/review/${linkData.businessSlug}?sl=${linkDoc.id}`)
    }

    checkSlug()
  }, [slug, navigate])

  return <div>Checking link, please wait...</div>
}
export default SharableRedirect