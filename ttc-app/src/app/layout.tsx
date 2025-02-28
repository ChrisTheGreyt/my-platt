// src/app/layout.tsx
'use client'

import React from 'react';
import { Auth } from 'aws-amplify';
import '../utils/amplifyConfig';
import awsConfig from '../aws-exports';
import { Provider as ReduxProvier } from 'react-redux';
import { AuthProvider } from '../context/AuthContext'; // Import AuthProvider
import { store } from '../state/store';

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import DashboardWrapper from "./dashboardWrapper";

Auth.configure(awsConfig);

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// export const metadata: Metadata = {
//   title: "My PLATT",
//   description: "Manage Your Law School Applications with Precision",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <ReduxProvier store={store}>
            <AuthProvider>
                <DashboardWrapper>
                  {children}
                </DashboardWrapper>
            </AuthProvider>
          </ReduxProvier>
      </body>
    </html>
  );
}
