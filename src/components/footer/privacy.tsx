import FooterSection from "../FooterSection";
import Navbar from "../Navbar";

export default function PrivacyPolicyPage() {
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow bg-gray-50">
          <header className="bg-gradient-to-r from-orange-600 to-indigo-700">
            <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl font-extrabold text-white sm:text-5xl">Privacy Policy</h1>
                {/* <p className="mt-4 text-xl text-blue-100">
                  Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p> */}
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-8 sm:p-10 lg:p-12">
                <div className="prose prose-blue max-w-none">
                  <p className="text-lg leading-7 text-gray-600 mb-8">
                    At Rhino Review, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose,
                    and safeguard your information when you use our service.
                  </p>

                  <div className="border-l-4 border-blue-500 pl-4 mb-8">
                    <p className="text-gray-600 italic">
                      By using our services, you agree to the collection and use of information in accordance with this Privacy Policy.
                    </p>
                  </div>

                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">Information We Collect</h2>

                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                        Information You Provide
                      </h3>
                      <p className="text-gray-600 mb-4">
                        We collect information you provide directly to us, such as when you create an account, use our services, or
                        contact us for support. This may include:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-600">
                        <li>Name, email address, and contact information</li>
                        <li>Business information and account details</li>
                        <li>Payment and billing information</li>
                        <li>Communications with us, including support requests</li>
                        <li>Any other information you choose to provide</li>
                      </ul>
                    </div>

                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                        Information We Collect Automatically
                      </h3>
                      <p className="text-gray-600 mb-4">When you use our services, we automatically collect certain information, including:</p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-600">
                        <li>Log data (IP address, browser type, pages visited)</li>
                        <li>Device information (device type, operating system)</li>
                        <li>Usage data (features used, time spent, interactions)</li>
                        <li>Cookies and similar tracking technologies</li>
                      </ul>
                    </div>

                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                        Information from Third Parties
                      </h3>
                      <p className="text-gray-600 mb-4">We may collect information from third-party services you connect to our platform, such as:</p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-600">
                        <li>Review platforms (Google, Yelp, Facebook, etc.)</li>
                        <li>Social media accounts</li>
                        <li>Business listing services</li>
                        <li>Analytics and advertising partners</li>
                      </ul>
                    </div>
                  </section>

                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">How We Use Your Information</h2>
                    <p className="text-gray-600 mb-4">We use the information we collect to:</p>
                    <ul className="grid md:grid-cols-2 gap-4">
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-600">Provide, maintain, and improve our services</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-600">Process transactions and send related information</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-600">Send technical notices, updates, and support messages</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-600">Respond to your comments, questions, and customer service requests</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-600">Monitor and analyze trends, usage, and activities</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-600">Detect, investigate, and prevent fraudulent transactions</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-600">Personalize and improve your experience</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-600">Send marketing communications (with your consent)</span>
                      </li>
                    </ul>
                  </section>

                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">Information Sharing and Disclosure</h2>
                    <p className="text-gray-600 mb-6">We may share your information in the following circumstances:</p>

                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                        With Your Consent
                      </h3>
                      <p className="text-gray-600">
                        We may share your information with third parties when you give us explicit consent to do so.
                      </p>
                    </div>

                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                        Service Providers
                      </h3>
                      <p className="text-gray-600">
                        We may share your information with third-party service providers who perform services on our behalf, such as
                        payment processing, data analysis, email delivery, and customer service.
                      </p>
                    </div>

                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                        Business Transfers
                      </h3>
                      <p className="text-gray-600">
                        If we are involved in a merger, acquisition, or asset sale, your information may be transferred as part of
                        that transaction.
                      </p>
                    </div>

                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                        Legal Requirements
                      </h3>
                      <p className="text-gray-600">
                        We may disclose your information if required to do so by law or in response to valid requests by public
                        authorities.
                      </p>
                    </div>
                  </section>

                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">Data Security</h2>
                    <p className="text-gray-600 mb-4">
                      We implement appropriate technical and organizational security measures to protect your information against
                      unauthorized access, alteration, disclosure, or destruction. These measures include:
                    </p>
                    <div className="bg-blue-50 rounded-lg p-6">
                      <ul className="grid md:grid-cols-2 gap-4">
                        <li className="flex items-start">
                          <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">Encryption of data in transit and at rest</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">Regular security assessments and audits</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">Access controls and authentication measures</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">Employee training on data protection</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">Incident response procedures</span>
                        </li>
                      </ul>
                    </div>
                  </section>

                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">Data Retention</h2>
                    <p className="text-gray-600">
                      We retain your information for as long as necessary to provide our services and fulfill the purposes outlined
                      in this Privacy Policy. We may also retain information to comply with legal obligations, resolve disputes, and
                      enforce our agreements.
                    </p>
                  </section>

                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">Your Rights and Choices</h2>
                    <p className="text-gray-600 mb-6">Depending on your location, you may have the following rights:</p>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <ul className="space-y-4">
                        <li className="flex items-start">
                          <div className="bg-blue-100 p-1 rounded-full mr-3">
                            <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Access</h4>
                            <p className="text-gray-600">Request access to your personal information</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-blue-100 p-1 rounded-full mr-3">
                            <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Correction</h4>
                            <p className="text-gray-600">Request correction of inaccurate information</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-blue-100 p-1 rounded-full mr-3">
                            <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Deletion</h4>
                            <p className="text-gray-600">Request deletion of your information</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-blue-100 p-1 rounded-full mr-3">
                            <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Portability</h4>
                            <p className="text-gray-600">Request a copy of your information in a portable format</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-blue-100 p-1 rounded-full mr-3">
                            <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Restriction</h4>
                            <p className="text-gray-600">Request restriction of processing</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-blue-100 p-1 rounded-full mr-3">
                            <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Objection</h4>
                            <p className="text-gray-600">Object to processing of your information</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-blue-100 p-1 rounded-full mr-3">
                            <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Withdraw Consent</h4>
                            <p className="text-gray-600">Withdraw consent where processing is based on consent</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                    <p className="text-gray-600 mt-6">To exercise these rights, please contact us at <a href="mailto:privacy@rhinoreview.com" className="text-blue-600 hover:underline">privacy@rhinoreview.com</a>.</p>
                  </section>

                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">Cookies and Tracking Technologies</h2>
                    <p className="text-gray-600">
                      We use cookies and similar tracking technologies to collect and track information and to improve our services.
                      You can control cookies through your browser settings, but disabling cookies may affect the functionality of
                      our services.
                    </p>
                  </section>

                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">International Data Transfers</h2>
                    <p className="text-gray-600">
                      Your information may be transferred to and processed in countries other than your own. We ensure appropriate
                      safeguards are in place to protect your information in accordance with applicable data protection laws.
                    </p>
                  </section>

                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">Children's Privacy</h2>
                    <p className="text-gray-600">
                      Our services are not intended for children under 13 years of age. We do not knowingly collect personal
                      information from children under 13.
                    </p>
                  </section>

                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">Changes to This Privacy Policy</h2>
                    <p className="text-gray-600">
                      We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
                      Privacy Policy on this page and updating the "Last updated" date.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">Contact Us</h2>
                    <p className="text-gray-600 mb-6">If you have any questions about this Privacy Policy, please contact us:</p>
                    <ul className="space-y-3 text-gray-600">
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        <span>Email: <a href="mailto:privacy@rhinoreview.com" className="text-blue-600 hover:underline">privacy@rhinoreview.com</a></span>
                      </li>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        <span>Phone: <a href="tel:+15551234567" className="text-blue-600 hover:underline">+1 (555) 123-4567</a></span>
                      </li>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span>Address: 123 Business Ave, Suite 100, San Francisco, CA 94105</span>
                      </li>
                    </ul>
                  </section>
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