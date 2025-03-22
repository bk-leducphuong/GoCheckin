'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">GoCheckin</h1>
          <div className="flex space-x-4">
            <Button variant="outline" onClick={() => router.push('/login')}>
              Log in
            </Button>
            <Button onClick={() => router.push('/register/tenant')}>
              Sign up
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero section */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">
                Event Management Made Simple
              </h2>
              <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                Streamline Your Check-in Process
              </p>
              <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
                GoCheckin helps you manage events and attendees efficiently with a simple, intuitive interface.
              </p>
              <div className="mt-8 flex justify-center space-x-4">
                <Button onClick={() => router.push('/register/tenant')} className="px-8 py-3">
                  Get Started as Admin
                </Button>
                <Button variant="outline" onClick={() => router.push('/register/poc')} className="px-8 py-3">
                  Register as POC
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Features section */}
        <div className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Everything You Need for Event Check-ins
              </p>
            </div>

            <div className="mt-10">
              <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                {/* Feature 1 */}
                <div className="p-6 bg-white rounded-lg shadow-md">
                  <h3 className="text-xl font-medium text-gray-900">Easy Registration</h3>
                  <p className="mt-2 text-gray-600">
                    Register attendees quickly and efficiently with our streamlined system.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="p-6 bg-white rounded-lg shadow-md">
                  <h3 className="text-xl font-medium text-gray-900">Real-time Analytics</h3>
                  <p className="mt-2 text-gray-600">
                    Track attendance and event metrics in real-time with intuitive dashboards.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="p-6 bg-white rounded-lg shadow-md">
                  <h3 className="text-xl font-medium text-gray-900">Multi-role Access</h3>
                  <p className="mt-2 text-gray-600">
                    Different access levels for admins and point-of-contact users to manage events.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} GoCheckin. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
