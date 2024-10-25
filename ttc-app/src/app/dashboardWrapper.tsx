"use client"

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import StoreProvider, { useAppSelector } from './redux';
import AuthProvider from "./authProvider";
import SubscriptionPage from '@/components/SubscriptionPage';

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
  const [loading, setLoading] = useState(false);  // Set to false for testing to skip loading

  // Temporary toggle to switch between subscribed and unsubscribed
  const toggleSubscriptionStatus = () => {
    setHasSubscription((prev) => !prev);
  };

  return (
    <StoreProvider>
      <AuthProvider>
        {/* Temporary toggle button to simulate subscription status */}
        <div style={{ textAlign: "center", margin: "20px" }}>
          <button onClick={toggleSubscriptionStatus}>
            Toggle Subscription Status (Currently {hasSubscription ? "Subscribed" : "Not Subscribed"})
          </button>
        </div>

        {/* Conditional rendering based on simulated subscription status */}
        {hasSubscription ? (
          <DashboardLayout>{children}</DashboardLayout>  // Show main app if "subscribed"
        ) : (
          <SubscriptionPage userEmail="test@example.com" />  // Show subscription page if "not subscribed"
        )}
      </AuthProvider>
    </StoreProvider>
  );
};

export default DashboardWrapper;
