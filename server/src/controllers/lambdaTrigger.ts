import { IncomingMessage } from 'http';
const https = require('https');

// CORS headers for all Lambda responses
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://main.d249lhj5v2utjs.amplifyapp.com',  // Hardcode production URL
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With',
  'Access-Control-Allow-Methods': 'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT',
  'Access-Control-Allow-Credentials': 'true'
};

// Helper function to create Lambda response
const createResponse = (statusCode: number, body: any) => ({
  statusCode,
  headers: corsHeaders,
  body: JSON.stringify(body)
});

exports.handler = async (event: any) => {
  console.log("Lambda Triggered:", JSON.stringify(event, null, 2));
  console.log("Environment:", process.env.NODE_ENV);
  console.log("Frontend URL:", process.env.FRONTEND_URL);
  
  try {
    // Extract user attributes
    const username = event.request.userAttributes['preferred_username'] || event.userName;
    const cognitoId = event.userName;
    const firstName = event.request.userAttributes['given_name'];
    const lastName = event.request.userAttributes['family_name'];
    const email = event.request.userAttributes['email'];

    const postData = JSON.stringify({
      username,
      cognitoId,
      firstName,
      lastName,
      email,
      profilePictureUrl: "https://main.d249lhj5v2utjs.amplifyapp.com/pd1.jpg",
      teamId: 1,
    });

    const options = {
      hostname: "7b5we67gn6.execute-api.us-east-1.amazonaws.com",
      port: 443,
      path: "/create-user",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const responseBody = await new Promise((resolve, reject) => {
      const req = https.request(options, (res: IncomingMessage) => {
        let body = "";
        res.on("data", (chunk: Buffer) => (body += chunk));
        res.on("end", () => resolve(body));
      });

      req.on("error", (error: Error) => {
        console.error("HTTPS Request Error:", error);
        reject(error);
      });

      req.write(postData);
      req.end();
    });

    console.log("Response from /create-user:", responseBody);
    return createResponse(200, { message: "Success", data: responseBody });
  } catch (error) {
    console.error("PreSignUp Handler Error:", error);
    return createResponse(500, { error: "Internal server error" });
  }
}; 