"use client"

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import StoreProvider from './redux';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/state/hooks';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);
  const isDarkmode = useAppSelector((state) => state.global.isDarkMode);
  const { user, session } = useAuth();
  const isAuthenticated = user && session;

  useEffect(() => {
    if (isDarkmode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  });

  return (
    <div className="flex min-h-screen w-full bg-gray-50 text-gray-900">
      {/* Only render Sidebar if user is authenticated */}
      {isAuthenticated && <Sidebar />}
      <main
  className={`flex w-full flex-col bg-gray-50 dark:bg-dark-bg ${
    isAuthenticated && !isSidebarCollapsed ? 'md:pl-64' : ''
  }`}
      >
        {/* Only render Navbar if user is authenticated */}
        {isAuthenticated && <Navbar />}
        {children}
      </main>
    </div>
  );
};

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </StoreProvider>
  );
};

export default DashboardWrapper;
