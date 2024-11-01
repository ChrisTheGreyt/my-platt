"use client"

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import StoreProvider, { useAppSelector } from './redux';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import { usePathname } from 'next/navigation';

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
      <Sidebar />
      <main className={`flex w-full flex-col bg-gray-50 dark:bg-dark-bg ${isSidebarCollapsed ? "" : "md:pl-64"}`}>
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
  // const pathname = usePathname();
  // const [hasSubscription, setHasSubscription] = useState(false);
  // const [loading, setLoading] = useState(true);
  // const [userEmail, setUserEmail] = useState('');

  // useEffect(() => {
  //   // If on success page, don't require subscription check
  //   if (pathname === '/success') {
  //     setLoading(false);
  //     return;
  //   }

  //   const fetchUserEmail = async () => {
  //     try {
  //       const user = userPool.getCurrentUser();
  //       if (user) {
  //         user.getSession((err: any) => {
  //           if (err) {
  //             console.error("Error getting session:", err);
  //             setLoading(false);
  //             return;
  //           }

  //           user.getUserAttributes((err: any, attributes: any) => {
  //             if (err) {
  //               console.error("Error fetching user attributes:", err);
  //               setLoading(false);
  //               return;
  //             }

  //             const emailAttr = attributes.find((attr: any) => attr.Name === "email");
  //             if (emailAttr) {
  //               setUserEmail(emailAttr.Value);
  //             } else {
  //               console.warn("Email attribute not found.");
  //               setLoading(false);
  //             }
  //           });
  //         });
  //       } else {
  //         console.warn("No user found, stopping loading.");
  //         setLoading(false);
  //       }
  //     } catch (err) {
  //       console.error("Error in fetchUserEmail:", err);
  //       setLoading(false);
  //     }
  //   };

  //   fetchUserEmail();
  // }, [pathname]);

  // useEffect(() => {
  //   // Check if user has paid by looking for the session ID or a flag in local storage
  //   const subscriptionFlag = localStorage.getItem("hasSubscription");
  //   if (subscriptionFlag) {
  //     setHasSubscription(true);
  //     setLoading(false);
  //     return;
  //   }

  //   const checkSubscriptionStatus = async () => {
  //     if (!userEmail) return;

  //     try {
  //       const response = await fetch('https://7b5we67gn6.execute-api.us-east-1.amazonaws.com/prod/check-subscription', {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({ email: userEmail }),
  //       });

  //       const data = await response.json();
  //       setHasSubscription(data.hasSubscription);
  //       if (data.hasSubscription) {
  //         localStorage.setItem("hasSubscription", "true");
  //       }
  //     } catch (error) {
  //       console.error('Error checking subscription:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   checkSubscriptionStatus();
  // }, [userEmail]);

  // if (loading) return <div>Loading...</div>;

  return (
    <StoreProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </StoreProvider>
  );
};

export default DashboardWrapper;
