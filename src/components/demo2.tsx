import ChatSupportWidget from "@/components/chat-support-widget"
import Navbar from "./Navbar"

export default function Demo2() {
  return (
    <> 
    <Navbar />
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, orange 2px, transparent 0), radial-gradient(circle at 75px 75px, orange 2px, transparent 0)`,
            backgroundSize: "100px 100px",
          }}
        ></div>
      </div>

      <div className="relative z-10 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent mb-4">
              Interactive Support Chat
            </h1>            
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-orange-100">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
              Get Help When You Need It
            </h2>
            <p className="text-gray-600 mb-8 text-center text-lg">
              Start a conversation with our support team. Share your questions or concerns, and help us improve by providing feedback on your experience.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="font-bold text-orange-900 mb-2">Open Conversation</h3>
                <p className="text-orange-800 text-sm">
                  Start by telling us about your issue in your own words. No need to select categories first.
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-2-2V10a2 2 0 012-2h8z" />
                  </svg>
                </div>
                <h3 className="font-bold text-orange-900 mb-2">Interactive Support</h3>
                <p className="text-orange-800 text-sm">
                  Engage in real-time conversation with our support system for personalized assistance.
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <h3 className="font-bold text-orange-900 mb-2">Share Feedback</h3>
                <p className="text-orange-800 text-sm">
                  After getting help, share your experience to help us continuously improve our support.
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-100 to-pink-100 px-6 py-3 rounded-full border border-orange-200">
                <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full animate-pulse"></div>
                <span className="text-orange-700 font-medium">Click the chat button to get started</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ChatSupportWidget />
    </div>
    </>
  )
}
