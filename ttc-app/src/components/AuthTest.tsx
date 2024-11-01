// src/components/AuthTest.tsx

'use client';

import React from 'react';
import { useGetAuthUserQuery } from '../state/api';

const AuthTest: React.FC = () => {
    const { data, error, isLoading } = useGetAuthUserQuery();

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

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
