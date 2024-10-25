"use client"

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import StoreProvider, { useAppSelector } from './redux';
import AuthProvider from "./authProvider";
import SubscriptionPage from '@/components/SubscriptionPage';
import Auth from '@aws-amplify/auth';  // Modular import for Auth

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);
  const isDarkmode = useAppSelector((state) => state.global.isDarkMode);

  useEffect(() => {
    if (isDarkmode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  });

  return (
    <div className='flex min-h-screen w-full bg-gray-50 text-gray-900'>
      {/* Sidebar */}
      <Sidebar />
      <main className={`flex w-full flex-col bg-gray-50 dark:bg-dark-bg ${isSidebarCollapsed ? "" : "md:pl-64"}`}>
        {/* Navbar */}
        <Navbar />
        {children}
      </main>
    </div>
  );
};

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  const [hasSubscription, setHasSubscription] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        const email = user.attributes.email;
        setUserEmail(email);

        // Call the API route to check subscription status
        const response = await fetch('/api/users/check-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();
        setHasSubscription(data.hasSubscription);
      } catch (error) {
        console.error('Error fetching subscription status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <StoreProvider>
      <AuthProvider>
        {hasSubscription ? (
          <DashboardLayout>{children}</DashboardLayout>
        ) : (
          <SubscriptionPage userEmail={userEmail} />
        )}
      </AuthProvider>
    </StoreProvider>
  );
};

export default DashboardWrapper;
