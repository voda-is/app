'use client';

import { motion } from 'framer-motion';

export default function TermsOfService() {
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
            <h1 className="text-4xl font-bold text-gray-900">Terms of Service</h1>
            <p className="mt-4 text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>

          {/* Content Section */}
          <div className="p-8">
            <div className="prose prose-gray max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-indigo-600 mr-2">1.</span>
                  Introduction
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Welcome to Voda Team's services. By accessing or using our services, you agree to be bound by these Terms of Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-indigo-600 mr-2">2.</span>
                  Use of Services
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Our services are provided "as is" and are intended for personal and non-commercial use. You agree to use our services only for lawful purposes and in accordance with these Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-indigo-600 mr-2">3.</span>
                  User Accounts
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-indigo-600 mr-2">4.</span>
                  Intellectual Property
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  All content, features, and functionality of our services are owned by Voda Team and are protected by international copyright, trademark, and other intellectual property laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-indigo-600 mr-2">5.</span>
                  Limitation of Liability
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Voda Team shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-indigo-600 mr-2">6.</span>
                  Changes to Terms
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  We reserve the right to modify these Terms at any time. We will notify users of any material changes via email or through our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-indigo-600 mr-2">7.</span>
                  Contact Information
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  For any questions about these Terms, please contact us at:{' '}
                  <a href="mailto:support@vodateam.com" className="text-indigo-600 hover:text-indigo-700 transition-colors">
                    support@vodateam.com
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