"use client";

import { useState, useEffect } from 'react';
import { useGetLawSchoolsQuery } from '@/state/api';
import { School, Edit2, Trash2, Plus, Info } from 'lucide-react';
import { isAdmin } from '@/utils/adminUtils';
import { Auth } from 'aws-amplify';
import { useRouter } from 'next/navigation';
import ModalEditSchool from '@/components/ModalEditSchool';
import ModalConfirm from '@/components/ModalConfirm';

interface SchoolData {
  id: number;
  school: string;
  personal_statement?: string;
  diversity_statement?: string;
  optional_statement_prompt?: string;
  letters_of_recommendation?: string;
  resume?: string;
  extras_addenda?: string;
  application_fee?: string;
  interviews?: string;
}

interface ApiSchool {
  school_id: string;
  school_name: string;
  personal_statement?: string;
  diversity_statement?: string;
  optional_statement_prompt?: string;
  letters_of_recommendation?: string;
  resume?: string;
  extras_addenda?: string;
  application_fee?: string;
  interviews?: string;
}

const truncateText = (text: string | undefined | null, maxLength: number = 50) => {
  if (!text || text === 'Not specified') return 'Not specified';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export default function ManageSchools() {
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [selectedSchool, setSelectedSchool] = useState<SchoolData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'save' | 'delete';
    data?: SchoolData | string;
  } | null>(null);
  const router = useRouter();
  
  // Fetch all law schools
  const { data: schools, isLoading, error } = useGetLawSchoolsQuery();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const currentUser = await Auth.currentAuthenticatedUser();
        const cognitoSub = currentUser.attributes.sub;
        console.log("🔍 ManageSchools: Checking admin status for Cognito ID:", cognitoSub);
        const isAdminUser = isAdmin(cognitoSub);
        console.log("🔍 ManageSchools: Is user admin?", isAdminUser);
        setIsUserAdmin(isAdminUser);
      } catch (error) {
        console.error("Failed to fetch authenticated user:", error);
        setIsUserAdmin(false);
      } finally {
        setIsCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, []);

  // Redirect if not admin
  useEffect(() => {
    if (!isCheckingAdmin && !isUserAdmin) {
      console.log("🔍 ManageSchools: Not an admin, redirecting to home");
      router.push('/home');
    }
  }, [isUserAdmin, isCheckingAdmin, router]);

  const handleEditSchool = async (school: ApiSchool) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/schools/name/${encodeURIComponent(school.school_name)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch school details');
      }
      const schoolData = await response.json();
      setSelectedSchool({
        id: parseInt(school.school_id),
        school: school.school_name,
        personal_statement: schoolData.personal_statement || '',
        diversity_statement: schoolData.diversity_statement || '',
        optional_statement_prompt: schoolData.optional_statement_prompt || '',
        letters_of_recommendation: schoolData.letters_of_recommendation || '',
        resume: schoolData.resume || '',
        extras_addenda: schoolData.extras_addenda || '',
        application_fee: schoolData.application_fee || '',
        interviews: schoolData.interviews || ''
      });
      setIsEditModalOpen(true);
    } catch (error) {
      console.error('Error fetching school details:', error);
    }
  };

  const handleSaveSchool = async (schoolData: SchoolData) => {
    setConfirmAction({
      type: 'save',
      data: schoolData
    });
    setIsConfirmModalOpen(true);
  };

  const handleDeleteSchool = async (schoolId: string) => {
    setConfirmAction({
      type: 'delete',
      data: schoolId
    });
    setIsConfirmModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

      if (confirmAction.type === 'save' && confirmAction.data) {
        const schoolData = confirmAction.data as SchoolData;
        const response = await fetch(`${backendUrl}/api/schools/${schoolData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(schoolData),
        });

        if (!response.ok) {
          throw new Error('Failed to save school details');
        }

        const updatedSchool = await response.json();
        console.log('School updated successfully:', updatedSchool);
        setIsEditModalOpen(false);
        alert('School details updated successfully!');
      } else if (confirmAction.type === 'delete' && confirmAction.data) {
        // TODO: Implement delete functionality
        console.log('Deleting school:', confirmAction.data);
      }
    } catch (error) {
      console.error('Error performing action:', error);
      alert('Failed to perform action. Please try again.');
    }
  };

  // Show loading state while checking admin status
  if (isCheckingAdmin) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!isUserAdmin) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-500">Error loading schools data</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Schools</h1>
        <button
          onClick={() => {
            setSelectedSchool(null);
            setIsEditModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New School
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  School Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Personal Statement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Diversity Statement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Letters of Recommendation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {schools?.map((school: ApiSchool) => (
                <tr key={school.school_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <School className="w-5 h-5 text-gray-400 mr-2" />
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {school.school_name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="group relative">
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        {truncateText(school.personal_statement)}
                        {school.personal_statement && school.personal_statement !== 'Not specified' && (
                          <Info className="w-4 h-4 ml-1 text-gray-400 cursor-help" />
                        )}
                      </div>
                      {school.personal_statement && school.personal_statement !== 'Not specified' && (
                        <div className="absolute z-10 hidden group-hover:block w-64 p-2 mt-1 text-sm text-white bg-gray-900 rounded shadow-lg">
                          {school.personal_statement}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="group relative">
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        {truncateText(school.diversity_statement)}
                        {school.diversity_statement && school.diversity_statement !== 'Not specified' && (
                          <Info className="w-4 h-4 ml-1 text-gray-400 cursor-help" />
                        )}
                      </div>
                      {school.diversity_statement && school.diversity_statement !== 'Not specified' && (
                        <div className="absolute z-10 hidden group-hover:block w-64 p-2 mt-1 text-sm text-white bg-gray-900 rounded shadow-lg">
                          {school.diversity_statement}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="group relative">
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        {truncateText(school.letters_of_recommendation)}
                        {school.letters_of_recommendation && school.letters_of_recommendation !== 'Not specified' && (
                          <Info className="w-4 h-4 ml-1 text-gray-400 cursor-help" />
                        )}
                      </div>
                      {school.letters_of_recommendation && school.letters_of_recommendation !== 'Not specified' && (
                        <div className="absolute z-10 hidden group-hover:block w-64 p-2 mt-1 text-sm text-white bg-gray-900 rounded shadow-lg">
                          {school.letters_of_recommendation}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditSchool(school)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSchool(school.school_id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ModalEditSchool
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        school={selectedSchool}
        onSave={handleSaveSchool}
      />

      <ModalConfirm
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setConfirmAction(null);
        }}
        onConfirm={handleConfirmAction}
        title={confirmAction?.type === 'save' ? 'Save Changes' : 'Delete School'}
        message={
          confirmAction?.type === 'save'
            ? 'Are you sure you want to save these changes?'
            : 'Are you sure you want to delete this school? This action cannot be undone.'
        }
        confirmText={confirmAction?.type === 'save' ? 'Save Changes' : 'Delete'}
      />
    </div>
  );
} 