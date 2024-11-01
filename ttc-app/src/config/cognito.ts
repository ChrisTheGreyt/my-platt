// src/config/cognito.ts
export const cognitoConfig = {
    region: process.env.NEXT_PUBLIC_AWS_REGION!,
    userPoolId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID!,
    clientId: process.env.NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID!,
  };