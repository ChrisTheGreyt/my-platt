import { Amplify, Auth } from 'aws-amplify';
import awsExports from '../aws-exports';

// Get the API URL from environment variable or use the default
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://7b5we67gn6.execute-api.us-east-1.amazonaws.com/prod';

Amplify.configure({
  ...awsExports,
  API: {
    endpoints: [
      {
        name: 'MyAPI',
        endpoint: apiUrl,
        region: 'us-east-1',
        custom_header: async () => {
          try {
            const session = await Auth.currentSession();
            return {
              Authorization: `Bearer ${session.getIdToken().getJwtToken()}`
            };
          } catch (error) {
            console.error('Error getting session:', error);
            return {};
          }
        }
      }
    ]
  }
}); 