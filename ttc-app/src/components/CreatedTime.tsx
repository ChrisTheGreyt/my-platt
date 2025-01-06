import { Auth } from 'aws-amplify';
import { useEffect, useState } from 'react';

const TestCreatedTime: React.FC = () => {
  const [createdTime, setCreatedTime] = useState<string | null>(null); // State for displaying the time

  useEffect(() => {
    const fetchUserAttributes = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        console.log('Full User Object:', user);

        // Check and log attributes
        const createdAt = user.attributes['custom:createdTime']; // Replace this key if needed
        console.log('Custom Created Time:', createdAt);

        const defaultCreatedAt = user.attributes['createdAt']; // Replace this key if needed
        console.log('Default Created At:', defaultCreatedAt);

        // Set the time for displaying in UI
        setCreatedTime(defaultCreatedAt || createdAt || 'No Created Time Found');
      } catch (error) {
        console.error('Error fetching user attributes:', error);
        setCreatedTime('Error fetching data');
      }
    };

    fetchUserAttributes();
  }, []);

  // Render JSX to fix the error
  return (
    <div className="p-4 text-gray-600">
      Created Time: {createdTime || 'Loading...'}
    </div>
  );
};

export default TestCreatedTime;
