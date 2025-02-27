"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Auth } from 'aws-amplify';
import { 
  useCreateSchoolMutation, 
  useGetLawSchoolsQuery, 
  useAddUserSchoolMutation, 
  useGetUserSchoolsQuery 
} from "@/state/api";
import Modal from "@/components/Modal";
import { toast } from 'react-hot-toast';

type NewSchoolModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSchoolSelect: (school: string) => void;
};

const NewSchoolModal: React.FC<NewSchoolModalProps> = ({ isOpen, onClose, onSchoolSelect }) => {
  const [school, setSchool] = useState("");
  // Use a single state for the resolved user ID
  const [resolvedUserId, setResolvedUserId] = useState<number | null>(null);

  const [createSchool, { isLoading: isCreating, isError, error }] = useCreateSchoolMutation();
  const { data: lawSchools, isLoading: isSchoolsLoading, error: fetchError } = useGetLawSchoolsQuery();
  const [addUserSchool] = useAddUserSchoolMutation();
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  // Use the resolvedUserId in the user schools query.
  const { data: userSchools, refetch } = useGetUserSchoolsQuery(resolvedUserId ?? 0, {
    skip: resolvedUserId === null,
  });

  const sortedLawSchools = useMemo(() => {
    if (!lawSchools) return [];
    return [...lawSchools].sort((a, b) => a.school_name.localeCompare(b.school_name));
  }, [lawSchools]);

  useEffect(() => {
    console.log("Law Schools API Response:", lawSchools);
  }, [lawSchools]);

  // Fetch user details and set the resolved user ID
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        const userSub = user.attributes.sub;
  
        
        const response = await fetch(`${backendUrl}/api/users/resolve?cognitoSub=${userSub}`);
  
        if (!response.ok) {
          console.error("Failed to fetch userId:", response.statusText);
          return;
        }
  
        const data = await response.json();
        console.log("✅ Fetched user details:", data);
        // Set the resolved user ID
        setResolvedUserId(data.userId);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
  
    fetchUserDetails();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingTasks(true);
    
    if (!resolvedUserId || !school) {
        toast.error('Missing required information');
        setIsGeneratingTasks(false);
        return;
    }

    try {
        console.log('Submitting school creation request:', { userId: resolvedUserId, school });
        
        // First try the test endpoint to diagnose issues
        const testResponse = await fetch(`${backendUrl}/api/test-schools`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                userId: resolvedUserId, 
                school: school
            }),
        });
        
        const testData = await testResponse.json();
        console.log('Test endpoint response:', testData);
        
        if (!testResponse.ok) {
            throw new Error(testData.error || 'Test endpoint failed');
        }
        
        // If test was successful, proceed with actual creation
        const createSchoolResponse = await fetch(`${backendUrl}/api/schools`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                userId: resolvedUserId, 
                school: school
            }),
        });

        const responseData = await createSchoolResponse.json();
        console.log('Create school response:', responseData);
        
        if (!createSchoolResponse.ok) {
            if (responseData.error === 'User-school association already exists') {
                toast.error('You have already added this school');
                onClose();
                return;
            }
            throw new Error(responseData.error || 'Failed to create school association');
        }

        // Success handling with more detailed feedback
        if (responseData.tasksCreated > 0) {
            if (responseData.warning) {
                toast.success(`School added with ${responseData.tasksCreated} tasks!`);
                toast(responseData.warning, {
                    icon: '⚠️',
                    style: {
                        background: '#FFF9C4',
                        color: '#5F4339'
                    }
                });
            } else {
                toast.success(`School added with ${responseData.tasksCreated} tasks!`);
            }
        } else {
            toast.success('School added successfully!');
        }
        
        onSchoolSelect(school);
        onClose();
        
        // Optional: Delay reload to allow toast to be seen
        setTimeout(() => {
            window.location.reload();
        }, 1500);

    } catch (error) {
        console.error('Error:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to add school');
    } finally {
        setIsGeneratingTasks(false);
    }
};


  

  const isLoading = isCreating || isGeneratingTasks;
  const buttonText = isCreating ? "Creating School..." : 
                    isGeneratingTasks ? "Generating Tasks..." : 
                    "Add School";

  return (
    <Modal isOpen={isOpen} onClose={onClose} name="Select Your School">
      <form className="mt-4" onSubmit={handleSubmit}>
        <div className="w-80">
          <label htmlFor="school" className="block text-sm font-medium text-gray-700">
            Select a School
          </label>
          <select
            id="school"
            name="school"
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            required
            disabled={isLoading}
          >
            <option value="" disabled>
              Select your school
            </option>
            {isSchoolsLoading && <option>Loading schools...</option>}
            {fetchError && <option>Error loading schools</option>}
            {!isSchoolsLoading && !fetchError && sortedLawSchools.map((sch) => (
              <option key={sch.school_id} value={sch.school_name}>
                {sch.school_name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="mt-4 flex w-full justify-center rounded-md border border-transparent bg-green-500 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {buttonText}
        </button>
        {isError && (
          <p className="mt-2 text-sm text-red-600">
            Error: {error && 'data' in error ? (error.data as { message?: string }).message || "Failed to create school" : "Failed to create school"}
          </p>
        )}
      </form>
    </Modal>
  );
};

export default NewSchoolModal;
