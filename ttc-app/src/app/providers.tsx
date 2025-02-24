import { Amplify, Auth } from 'aws-amplify';
import awsExports from '../aws-exports';

Amplify.configure({
  ...awsExports,
  API: {
    endpoints: [
      {
        name: 'api',
        endpoint: process.env.NEXT_PUBLIC_API_URL || 'https://7b5we67gn6.execute-api.us-east-1.amazonaws.com/prod',
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