'use client';

import { motion } from 'framer-motion';
import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';
import { FaXTwitter } from 'react-icons/fa6';

export default function Login() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-sky-400 via-rose-300 to-emerald-200">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="flex-1 flex items-center justify-center px-4 py-12"
      >
        <div className="w-full max-w-md space-y-8 p-8 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="mt-2 text-gray-700">Sign in to continue</p>
          </div>

          <div className="mt-8 space-y-4">
            <button
              onClick={() => signIn('google', { callbackUrl: '/' })}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 
                        bg-white/30 hover:bg-white/40 backdrop-blur-sm 
                        rounded-xl transition-all duration-200 
                        text-gray-900 font-medium shadow-sm
                        hover:shadow-md transform hover:scale-[1.01]"
            >
              <FcGoogle className="w-5 h-5" />
              Continue with Google
            </button>

            <button
              onClick={() => signIn('twitter', { callbackUrl: '/' })}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 
                        bg-white/30 hover:bg-white/40 backdrop-blur-sm 
                        rounded-xl transition-all duration-200 
                        text-gray-900 font-medium shadow-sm
                        hover:shadow-md transform hover:scale-[1.01]"
            >
              <FaXTwitter className="w-5 h-5" />
              Continue with X
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-700">
              By continuing, you agree to our{' '}
              <a href="/terms" className="font-medium underline hover:text-gray-900">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="font-medium underline hover:text-gray-900">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 