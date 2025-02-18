'use client';

import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="flex-1 px-4 py-12 max-w-4xl mx-auto w-full"
      >
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {/* Header Section */}
          <div className="p-8 border-b border-gray-100">
            <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
            <p className="mt-4 text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>

          {/* Content Section */}
          <div className="p-8">
            <div className="prose prose-gray max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-indigo-600 mr-2">1.</span>
                  Information We Collect
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We collect information you provide directly to us, including:
                </p>
                <ul className="list-none space-y-2 pl-6">
                  {['Account information (name, email, profile picture)', 
                    'Authentication data from social login providers',
                    'Usage data and interaction with our services'].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-indigo-600 mr-2">•</span>
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-indigo-600 mr-2">2.</span>
                  How We Use Your Information
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We use the collected information to:
                </p>
                <ul className="list-none space-y-2 pl-6">
                  {['Provide and maintain our services',
                    'Personalize your experience',
                    'Improve our services',
                    'Communicate with you'].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-indigo-600 mr-2">•</span>
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-indigo-600 mr-2">3.</span>
                  Data Security
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-indigo-600 mr-2">4.</span>
                  Third-Party Services
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  We use third-party services for authentication (Google, X). These services have their own privacy policies that govern their use of your information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-indigo-600 mr-2">5.</span>
                  Your Rights
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  You have the right to:
                </p>
                <ul className="list-none space-y-2 pl-6">
                  {['Access your personal data',
                    'Correct inaccurate data',
                    'Request deletion of your data',
                    'Object to data processing'].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-indigo-600 mr-2">•</span>
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-indigo-600 mr-2">6.</span>
                  Changes to Privacy Policy
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-indigo-600 mr-2">7.</span>
                  Contact Us
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us at:{' '}
                  <a href="mailto:privacy@vodateam.com" className="text-indigo-600 hover:text-indigo-700 transition-colors">
                    privacy@vodateam.com
                  </a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 