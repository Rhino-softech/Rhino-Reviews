// terms.tsx
import FooterSection from "../FooterSection"
import Navbar from "../Navbar"

export default function TermsOfServicePage() {
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
                    Terms of Service
                  </h1>
                  {/* <p className="mt-2 text-sm text-indigo-600">Last updated: January 1, 2024</p> */}
                </div>

                <div className="prose prose-indigo max-w-none mt-8">
                  <p className="text-lg text-gray-600 mb-8">
                    These Terms of Service ("Terms") govern your use of the Rhino Review platform and services. By using our
                    services, you agree to these Terms.
                  </p>

                  <div className="space-y-8">
                    <section>
                      <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-indigo-500 pl-4">1. Acceptance of Terms</h2>
                      <p className="mt-4 text-gray-600">
                        By accessing or using Rhino Review's services, you agree to be bound by these Terms and our Privacy Policy. If
                        you do not agree to these Terms, you may not use our services.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-indigo-500 pl-4">2. Description of Service</h2>
                      <p className="mt-4 text-gray-600">
                        Rhino Review provides a platform for businesses to collect, manage, and analyze customer reviews from various
                        online platforms. Our services include review collection, analytics, response management, and related
                        features.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-indigo-500 pl-4">3. User Accounts</h2>
                      
                      <div className="mt-4 space-y-6">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-700">Account Creation</h3>
                          <p className="mt-2 text-gray-600">
                            To use our services, you must create an account and provide accurate, complete information. You are
                            responsible for maintaining the confidentiality of your account credentials.
                          </p>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-semibold text-gray-700">Account Responsibility</h3>
                          <p className="mt-2 text-gray-600">
                            You are responsible for all activities that occur under your account. You must notify us immediately of any
                            unauthorized use of your account.
                          </p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-indigo-500 pl-4">4. Acceptable Use</h2>
                      <p className="mt-4 text-gray-600">You agree not to use our services to:</p>
                      <ul className="mt-4 space-y-2 text-gray-600 list-disc list-inside marker:text-indigo-500">
                        <li>Violate any applicable laws or regulations</li>
                        <li>Infringe on intellectual property rights</li>
                        <li>Generate fake or misleading reviews</li>
                        <li>Harass, abuse, or harm others</li>
                        <li>Distribute malware or harmful code</li>
                        <li>Attempt to gain unauthorized access to our systems</li>
                        <li>Use our services for any illegal or unauthorized purpose</li>
                      </ul>
                    </section>

                    <section>
                      <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-indigo-500 pl-4">5. Subscription and Payment</h2>
                      
                      <div className="mt-4 space-y-6">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-700">Subscription Plans</h3>
                          <p className="mt-2 text-gray-600">
                            Our services are offered through various subscription plans. By subscribing, you agree to pay the applicable
                            fees for your chosen plan.
                          </p>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-semibold text-gray-700">Payment Terms</h3>
                          <p className="mt-2 text-gray-600">
                            Subscription fees are billed in advance on a monthly or annual basis. All fees are non-refundable except as
                            required by law or as specifically stated in these Terms.
                          </p>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-semibold text-gray-700">Price Changes</h3>
                          <p className="mt-2 text-gray-600">
                            We may change our pricing at any time. We will provide at least 30 days' notice of any price increases for
                            existing subscribers.
                          </p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-indigo-500 pl-4">6. Data and Privacy</h2>
                      
                      <div className="mt-4 space-y-6">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-700">Your Data</h3>
                          <p className="mt-2 text-gray-600">
                            You retain ownership of all data you provide to our services. We will process your data in accordance with our
                            Privacy Policy.
                          </p>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-semibold text-gray-700">Data Security</h3>
                          <p className="mt-2 text-gray-600">
                            We implement reasonable security measures to protect your data, but we cannot guarantee absolute security.
                          </p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-indigo-500 pl-4">7. Intellectual Property</h2>
                      
                      <div className="mt-4 space-y-6">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-700">Our Rights</h3>
                          <p className="mt-2 text-gray-600">
                            Rhino Review and its services, including all content, features, and functionality, are owned by us and are
                            protected by copyright, trademark, and other intellectual property laws.
                          </p>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-semibold text-gray-700">License to Use</h3>
                          <p className="mt-2 text-gray-600">
                            We grant you a limited, non-exclusive, non-transferable license to use our services in accordance with these
                            Terms.
                          </p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-indigo-500 pl-4">8. Third-Party Integrations</h2>
                      <p className="mt-4 text-gray-600">
                        Our services may integrate with third-party platforms and services. We are not responsible for the
                        availability, content, or practices of these third-party services.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-indigo-500 pl-4">9. Service Availability</h2>
                      <p className="mt-4 text-gray-600">
                        We strive to maintain high service availability but do not guarantee uninterrupted access. We may suspend or
                        discontinue services for maintenance, updates, or other reasons.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-indigo-500 pl-4">10. Limitation of Liability</h2>
                      <p className="mt-4 text-gray-600">
                        To the maximum extent permitted by law, Rhino Review shall not be liable for any indirect, incidental,
                        special, consequential, or punitive damages, including but not limited to loss of profits, data, or business
                        opportunities.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-indigo-500 pl-4">11. Indemnification</h2>
                      <p className="mt-4 text-gray-600">
                        You agree to indemnify and hold harmless Rhino Review from any claims, damages, or expenses arising from your
                        use of our services or violation of these Terms.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-indigo-500 pl-4">12. Termination</h2>
                      
                      <div className="mt-4 space-y-6">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-700">Termination by You</h3>
                          <p className="mt-2 text-gray-600">
                            You may terminate your account at any time by contacting us or using the account cancellation feature in our
                            platform.
                          </p>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-semibold text-gray-700">Termination by Us</h3>
                          <p className="mt-2 text-gray-600">
                            We may terminate or suspend your account immediately if you violate these Terms or for any other reason at our
                            sole discretion.
                          </p>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-semibold text-gray-700">Effect of Termination</h3>
                          <p className="mt-2 text-gray-600">
                            Upon termination, your right to use our services will cease immediately. We may delete your data after a
                            reasonable period following termination.
                          </p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-indigo-500 pl-4">13. Dispute Resolution</h2>
                      
                      <div className="mt-4 space-y-6">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-700">Governing Law</h3>
                          <p className="mt-2 text-gray-600">
                            These Terms are governed by the laws of the State of California, without regard to conflict of law principles.
                          </p>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-semibold text-gray-700">Arbitration</h3>
                          <p className="mt-2 text-gray-600">
                            Any disputes arising from these Terms or our services shall be resolved through binding arbitration in
                            accordance with the rules of the American Arbitration Association.
                          </p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-indigo-500 pl-4">14. Changes to Terms</h2>
                      <p className="mt-4 text-gray-600">
                        We may modify these Terms at any time. We will notify you of material changes by email or through our
                        platform. Continued use of our services after changes constitutes acceptance of the new Terms.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-indigo-500 pl-4">15. Severability</h2>
                      <p className="mt-4 text-gray-600">
                        If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full
                        force and effect.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-indigo-500 pl-4">16. Contact Information</h2>
                      <p className="mt-4 text-gray-600">If you have any questions about these Terms, please contact us:</p>
                      <ul className="mt-4 space-y-2 text-gray-600 list-disc list-inside marker:text-indigo-500">
                        <li>Email: legal@rhinoreview.com</li>
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