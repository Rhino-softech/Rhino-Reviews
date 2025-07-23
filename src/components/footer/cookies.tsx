// cookies.tsx
import Navbar from "../Navbar"
import FooterSection from "../FooterSection"

export default function CookiePolicyPage() {
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-8 sm:p-10">
                <div className="border-b border-gray-200 pb-6">
                  <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                    Cookie Policy
                  </h1>
                  {/* <p className="mt-2 text-sm text-indigo-600">Last updated: January 1, 2024</p> */}
                </div>

                <div className="prose prose-indigo max-w-none mt-8">
                  <p className="text-lg text-gray-600 mb-8">
                    This Cookie Policy explains how Rhino Review uses cookies and similar tracking technologies when you visit our
                    website or use our services.
                  </p>

                  <div className="space-y-8">
                    <section>
                      <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-indigo-500 pl-4">What Are Cookies?</h2>
                      <p className="mt-4 text-gray-600">
                        Cookies are small text files that are stored on your device when you visit a website. They help websites
                        remember information about your visit, such as your preferences and login status, which can make your next
                        visit easier and the site more useful to you.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-indigo-500 pl-4">Types of Cookies We Use</h2>
                      
                      <div className="mt-4 space-y-8">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-700">Essential Cookies</h3>
                          <p className="mt-2 text-gray-600">
                            These cookies are necessary for our website to function properly. They enable core functionality such as
                            security, network management, and accessibility. You cannot opt out of these cookies.
                          </p>
                          <ul className="mt-4 space-y-2 text-gray-600 list-disc list-inside marker:text-indigo-500">
                            <li>
                              <strong>Authentication cookies:</strong> Keep you logged in to your account
                            </li>
                            <li>
                              <strong>Security cookies:</strong> Protect against fraud and abuse
                            </li>
                            <li>
                              <strong>Load balancing cookies:</strong> Distribute traffic across our servers
                            </li>
                          </ul>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-semibold text-gray-700">Performance and Analytics Cookies</h3>
                          <p className="mt-2 text-gray-600">
                            These cookies help us understand how visitors interact with our website by collecting and reporting
                            information anonymously. This helps us improve our website's performance and user experience.
                          </p>
                          <ul className="mt-4 space-y-2 text-gray-600 list-disc list-inside marker:text-indigo-500">
                            <li>
                              <strong>Google Analytics:</strong> Tracks website usage and performance
                            </li>
                            <li>
                              <strong>Hotjar:</strong> Records user sessions to improve user experience
                            </li>
                            <li>
                              <strong>Internal analytics:</strong> Our own tracking for service improvement
                            </li>
                          </ul>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-semibold text-gray-700">Functional Cookies</h3>
                          <p className="mt-2 text-gray-600">
                            These cookies enable enhanced functionality and personalization. They may be set by us or by third-party
                            providers whose services we use on our pages.
                          </p>
                          <ul className="mt-4 space-y-2 text-gray-600 list-disc list-inside marker:text-indigo-500">
                            <li>
                              <strong>Preference cookies:</strong> Remember your settings and preferences
                            </li>
                            <li>
                              <strong>Language cookies:</strong> Remember your language selection
                            </li>
                            <li>
                              <strong>Theme cookies:</strong> Remember your display preferences
                            </li>
                          </ul>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-semibold text-gray-700">Marketing and Advertising Cookies</h3>
                          <p className="mt-2 text-gray-600">
                            These cookies are used to deliver advertisements that are relevant to you and your interests. They may also be
                            used to limit the number of times you see an advertisement and measure the effectiveness of advertising
                            campaigns.
                          </p>
                          <ul className="mt-4 space-y-2 text-gray-600 list-disc list-inside marker:text-indigo-500">
                            <li>
                              <strong>Google Ads:</strong> Deliver targeted advertisements
                            </li>
                            <li>
                              <strong>Facebook Pixel:</strong> Track conversions and retarget visitors
                            </li>
                            <li>
                              <strong>LinkedIn Insight Tag:</strong> Measure campaign performance
                            </li>
                          </ul>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-indigo-500 pl-4">Third-Party Cookies</h2>
                      <p className="mt-4 text-gray-600">
                        Some cookies on our website are set by third-party services. We use these services to enhance our website's
                        functionality and analyze usage patterns. These third parties may use cookies to:
                      </p>
                      <ul className="mt-4 space-y-2 text-gray-600 list-disc list-inside marker:text-indigo-500">
                        <li>Provide analytics and insights about website usage</li>
                        <li>Enable social media features and integrations</li>
                        <li>Deliver targeted advertising</li>
                        <li>Provide customer support features</li>
                      </ul>
                    </section>

                    <section>
                      <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-indigo-500 pl-4">How Long Do Cookies Last?</h2>
                      
                      <div className="mt-4 space-y-6">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-700">Session Cookies</h3>
                          <p className="mt-2 text-gray-600">
                            These cookies are temporary and are deleted when you close your browser. They help maintain your session while
                            you navigate our website.
                          </p>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-semibold text-gray-700">Persistent Cookies</h3>
                          <p className="mt-2 text-gray-600">
                            These cookies remain on your device for a set period or until you delete them. They help us remember your
                            preferences and provide a better user experience on return visits.
                          </p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-indigo-500 pl-4">Managing Your Cookie Preferences</h2>
                      
                      <div className="mt-4 space-y-6">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-700">Browser Settings</h3>
                          <p className="mt-2 text-gray-600">Most web browsers allow you to control cookies through their settings. You can:</p>
                          <ul className="mt-4 space-y-2 text-gray-600 list-disc list-inside marker:text-indigo-500">
                            <li>View what cookies are stored on your device</li>
                            <li>Delete existing cookies</li>
                            <li>Block cookies from specific websites</li>
                            <li>Block all cookies</li>
                            <li>Get notified when cookies are set</li>
                          </ul>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-semibold text-gray-700">Cookie Consent Manager</h3>
                          <p className="mt-2 text-gray-600">
                            When you first visit our website, you'll see a cookie consent banner that allows you to choose which types of
                            cookies you want to accept. You can change your preferences at any time by clicking the "Cookie Settings" link
                            in our website footer.
                          </p>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-semibold text-gray-700">Opt-Out Links</h3>
                          <p className="mt-2 text-gray-600">You can opt out of certain third-party cookies by visiting these links:</p>
                          <ul className="mt-4 space-y-2 text-gray-600 list-disc list-inside marker:text-indigo-500">
                            <li>
                              <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                                Google Analytics Opt-out
                              </a>
                            </li>
                            <li>
                              <a href="https://www.facebook.com/settings?tab=ads" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
                                Facebook Ad Preferences
                              </a>
                            </li>
                            <li>
                              <a
                                href="https://www.linkedin.com/psettings/guest-controls/retargeting-opt-out"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-800"
                              >
                                LinkedIn Opt-out
                              </a>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-indigo-500 pl-4">Impact of Disabling Cookies</h2>
                      <p className="mt-4 text-gray-600">
                        While you can disable cookies, doing so may affect your experience on our website. Some features may not work
                        properly, and you may need to re-enter information that would normally be remembered.
                      </p>
                      
                      <div className="mt-4 space-y-6">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-700">Essential Cookies</h3>
                          <p className="mt-2 text-gray-600">
                            If you disable essential cookies, you may not be able to use certain features of our website, such as logging
                            into your account or accessing secure areas.
                          </p>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-semibold text-gray-700">Analytics Cookies</h3>
                          <p className="mt-2 text-gray-600">
                            Disabling analytics cookies won't affect your browsing experience, but it will prevent us from understanding
                            how you use our website and improving it accordingly.
                          </p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-indigo-500 pl-4">Updates to This Cookie Policy</h2>
                      <p className="mt-4 text-gray-600">
                        We may update this Cookie Policy from time to time to reflect changes in our practices or for other
                        operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated
                        policy on our website.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-indigo-500 pl-4">Contact Us</h2>
                      <p className="mt-4 text-gray-600">If you have any questions about our use of cookies or this Cookie Policy, please contact us:</p>
                      <ul className="mt-4 space-y-2 text-gray-600 list-disc list-inside marker:text-indigo-500">
                        <li>Email: privacy@rhinoreview.com</li>
                        <li>Phone: +1 (555) 123-4567</li>
                        <li>Address: 123 Business Ave, Suite 100, San Francisco, CA 94105</li>
                      </ul>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <FooterSection />
      </div>
    </>
  )
}