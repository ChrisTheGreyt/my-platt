// src/utils/cognito.ts
import { CognitoUserPool, CognitoUserAttribute, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import { cognitoConfig } from '../config/cognito';

// Debugging Logs
console.log('Cognito Configuration:', cognitoConfig);

const { userPoolId, clientId, region } = cognitoConfig;

// Validate Configuration
if (!userPoolId || !clientId) {
//   throw new Error('Both UserPoolId and ClientId are required.');
}

// Initialize the User Pool
const poolData = {
  UserPoolId: userPoolId,
  ClientId: clientId,
};

console.log('Pool Data:', poolData);

const userPool = new CognitoUserPool(poolData);

// Sign-Up Function
export const signUp = (username: string, password: string, email: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const emailAttribute = new CognitoUserAttribute({ Name: 'email', Value: email });
  
      userPool.signUp(username, password, [emailAttribute], [], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  };

// Sign-In Function
export const signIn = (username: string, password: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({
      Username: username,
      Pool: userPool,
    });

    const authDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    });

    user.authenticateUser(authDetails, {
      onSuccess: (result) => {
        resolve(result);
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
};

// Sign-Out Function
export const signOut = (): void => {
  const currentUser = userPool.getCurrentUser();
  if (currentUser) {
    currentUser.signOut();
  }
};

// Get Current User Function
export const getCurrentUser = (): CognitoUser | null => {
  return userPool.getCurrentUser();
};

export const confirmSignUp = (user: CognitoUser, confirmationCode: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      user.confirmRegistration(confirmationCode, true, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };