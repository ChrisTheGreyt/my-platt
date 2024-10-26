"use client"

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import StoreProvider, { useAppSelector } from './redux';
import AuthProvider from "./authProvider";
import SubscriptionPage from '@/components/SubscriptionPage';
import { CognitoUserPool } from 'amazon-cognito-identity-js';


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


const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
  ClientId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID || '',
};
const userPool = new CognitoUserPool(poolData);

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  const [hasSubscription, setHasSubscription] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        // Replace this with a call to your backend API that checks the user's payment status in the database
        const response = await fetch('/api/users/check-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: userEmail }),
        });
  
        const data = await response.json();
        setHasSubscription(data.hasSubscription);  // Update state based on subscription status
      } catch (error) {
        console.error('Error fetching subscription status:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchSubscriptionStatus();
  }, [userEmail]);
  

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
