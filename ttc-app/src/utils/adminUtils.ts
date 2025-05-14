export const ADMIN_COGNITO_IDS = [
  "b4d80438-b081-7025-1adc-d6f95479680f", 
  "74488448-c071-70b0-28db-644fc67f3f11",
];

export const isAdmin = (cognitoId: string | undefined): boolean => {
  console.log("🔍 Checking admin status for Cognito ID:", cognitoId);
  console.log("🔍 Available admin IDs:", ADMIN_COGNITO_IDS);
  
  if (!cognitoId) {
    console.log("❌ No Cognito ID provided");
    return false;
  }

  const isAdminResult = ADMIN_COGNITO_IDS.includes(cognitoId);
  console.log("🔍 Is admin?", isAdminResult);
  return isAdminResult;
}; 