"use client";

import { Auth } from 'aws-amplify';
import React, { useEffect, useState } from 'react';
import { SchoolHeader } from './components/SchoolHeader';
import { Toaster, toast } from 'react-hot-toast';
import { useGetSchoolsQuery } from '@/state/api';

const SchoolsPage = () => {
  const [internalUserId, setInternalUserId] = useState<string | null>(null);
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  
  const { 
    data: userSchools,
    isLoading,
    error,
    refetch 
  } = useGetSchoolsQuery(Number(internalUserId), {
    skip: !internalUserId
  });

  // Fetch authenticated user ID
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        const cognitoId = user.attributes.sub;
        
        const response = await fetch(`${backendUrl}/users/by-cognito/${cognitoId}`);
        if (!response.ok) throw new Error("Failed to fetch user ID");
        
        const userData = await response.json();
        setInternalUserId(userData.userId);
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };
    
    fetchUserId();
  }, []);

  const handleRemoveSchool = async (schoolId: number) => {
    console.log('Attempting to remove school with ID:', schoolId);
    console.log('User ID:', internalUserId);
    console.log('Backend URL:', backendUrl);
    
    try {
      const response = await fetch(`${backendUrl}/api/schools/user/${internalUserId}/school/${schoolId}`, {
        method: 'DELETE',
      });

      console.log('Delete response status:', response.status);
      const responseData = await response.json();
      console.log('Delete response data:', responseData);

      if (!response.ok) {
        throw new Error('Failed to remove school');
      }

      toast.success('School removed successfully');
      refetch(); // Refresh the schools list
    } catch (error) {
      console.error('Error removing school:', error);
      toast.error('Failed to remove school');
    }
  };

  const renderContent = () => {
    if (!internalUserId || isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse">Loading...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-screen text-red-500">
          Error loading schools
        </div>
      );
    }

    if (!userSchools?.length) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <div className="text-xl text-gray-600">No schools added yet</div>
          <p className="text-gray-500">Add schools from the search page to start tracking your applications</p>
        </div>
      );
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Schools</h1>
        <div className="space-y-6">
          {userSchools?.map((school) => {
            console.log('Rendering school:', school);
            const handleRemove = () => {
              console.log('Confirming deletion for school:', school.school);
              if (window.confirm(`Are you sure you want to remove ${school.school}?`)) {
                console.log('User confirmed deletion, calling handleRemoveSchool with ID:', school.id);
                handleRemoveSchool(school.id);
              }
            };
            
            return (
              <SchoolHeader 
                key={school.id} 
                schoolDetails={school}
                onRemove={handleRemove}
                showRemoveButton={true}
              />
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <Toaster position="top-right" />
      {renderContent()}
    </>
  );
};

export default SchoolsPage;
