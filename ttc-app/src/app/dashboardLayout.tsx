"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardWrapper from './dashboardWrapper';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, session } = useAuth();

  // Only render DashboardWrapper if the user is authenticated
  if (!user || !session) {
    return null;
  }

  return <DashboardWrapper>{children}</DashboardWrapper>;
};

export default DashboardLayout;
