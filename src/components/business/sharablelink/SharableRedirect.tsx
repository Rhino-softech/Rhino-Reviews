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
        // 🔹 Check if this is a main review link
        const mainDocRef = doc(db, "slug_to_uid", slug)
        const mainDocSnap = await getDoc(mainDocRef)

        if (mainDocSnap.exists()) {
          navigate(`/review/${slug}`)
          return
        }

        // 🔹 Check if this is a sharable link
        const sharableRef = collection(db, "sharable_links")
        const sharableQuery = query(
          sharableRef,
          where("slug", "==", slug),
          limit(1)
        )
        const sharableSnap = await getDocs(sharableQuery)

        if (!sharableSnap.empty) {
          const linkDoc = sharableSnap.docs[0]
          const linkData = linkDoc.data()

          const now = new Date()
          const expiresAt = linkData.expiresAt.toDate()

          if (now > expiresAt || !linkData.isActive) {
            alert("This link has expired or is no longer active")
            return
          }

          navigate(`/review/${linkData.businessSlug}?sl=${slug}`)
          return
        }

        alert("Link not found")
      } catch (error) {
        console.error("Error checking slug:", error)
        alert("Something went wrong. Please try again.")
      }
    }

    checkSlug()
  }, [slug, navigate])

  return <div>Checking link, please wait...</div>
}

export default SharableRedirect
