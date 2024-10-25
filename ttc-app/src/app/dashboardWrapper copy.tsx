"use client"

import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import StoreProvider, { useAppSelector } from './redux';
import AuthProvider from "./authProvider";
import SubscriptionPage from '@/components/SubscriptionPage';
import { Auth } from 'aws-amplify';

const DashboardLayout = ( {children}: {children: React.ReactNode}) => {
    const isSidebarCollapsed = useAppSelector(
      (state) => state.global.isSidebarCollapsed,
    );
    const isDarkmode = useAppSelector (
      (state) => state.global.isDarkMode
    );

    useEffect(() =>{
      if(isDarkmode){
        document.documentElement.classList.add("dark");
      } else{
        document.documentElement.classList.remove("dark");

      }
    })
  return (
    <div className='flex min-h-screen w-full bg-gray-50 text-gray-900'>
        { /*sidebar */}
        <Sidebar />
        <main className={`flex w-full flex-col bg-gray-50 dark:bg-dark-bg ${
          isSidebarCollapsed ? "" : "md:pl-64"
          }`}
        >
            {/* navbar */}
            <Navbar />
            {children}
            
        </main>
    </div>
  )
}

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  return(
    <StoreProvider>
      <AuthProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </AuthProvider>
    </StoreProvider>
  )
}

export default DashboardWrapper