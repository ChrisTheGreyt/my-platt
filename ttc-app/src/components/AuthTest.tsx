// src/components/AuthTest.tsx

'use client';

import React from 'react';
import { useGetAuthUserQuery } from '../state/api';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';


const AuthTest: React.FC = () => {
    const { data, error, isLoading } = useGetAuthUserQuery();

    if (isLoading) return <p>Loading...</p>;
    if (error) {
        const errorMessage = (error as FetchBaseQueryError)?.data?.['message'] || 'An unexpected error occurred';
        return <p>Error: {errorMessage}</p>;

      }

    return (
        <div>
            <h2>Authenticated User Details</h2>
            <p>Username: {data?.user.username}</p>
            <p>User Sub: {data?.userSub}</p>
            <p>Email: {data?.userDetails.email}</p>
            {/* Add more fields as necessary */}
        </div>
    );
};

export default AuthTest;
