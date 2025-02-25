import { IncomingMessage } from 'http';
const https = require('https');

// CORS headers for all Lambda responses
const getCorsHeaders = (event: any) => {
  // Try to get origin from headers (case insensitive)
  const origin = event.headers?.origin || event.headers?.Origin;
  // Also check referer as backup
  const referer = event.headers?.referer || event.headers?.Referer;
  
  const allowedOrigins = [
    'https://main.d249lhj5v2utjs.amplifyapp.com',
    'http://localhost:3000'
  ];

  let requestOrigin = origin;
  if (!requestOrigin && referer) {
    // Extract origin from referer if needed
    try {
      const url = new URL(referer);
      requestOrigin = `${url.protocol}//${url.host}`;
    } catch (e) {
      console.error('Failed to parse referer:', e);
    }
  }

  console.log('Request origin:', requestOrigin);
  console.log('Request referer:', referer);

  return {
    'Access-Control-Allow-Origin': allowedOrigins.includes(requestOrigin) 
      ? requestOrigin 
      : 'https://main.d249lhj5v2utjs.amplifyapp.com',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With',
    'Access-Control-Allow-Methods': 'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT',
    'Access-Control-Allow-Credentials': 'true'
  };
};

// Helper function to create Lambda response
const createResponse = (statusCode: number, body: any, event: any) => ({
  statusCode,
  headers: getCorsHeaders(event),
  body: JSON.stringify(body)
});

exports.handler = async (event: any) => {
  console.log("=== START LAMBDA EXECUTION ===");
  console.log("Event:", JSON.stringify(event, null, 2));
  console.log("Context:", JSON.stringify(event.context, null, 2));
  console.log("Headers:", JSON.stringify(event.headers, null, 2));
  console.log("CORS Headers to be sent:", JSON.stringify(getCorsHeaders(event), null, 2));
  console.log("Request Path:", event.path);
  console.log("HTTP Method:", event.httpMethod);
  console.log("Origin header:", event.headers?.origin);
  console.log("CORS Headers being sent:", JSON.stringify(getCorsHeaders(event), null, 2));
  
  if (event.headers?.origin) {
    console.log("Origin header found:", event.headers.origin);
  } else {
    console.log("No origin header found in request");
  }

  // Handle OPTIONS requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: getCorsHeaders(event),
      body: ''
    };
  }

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
    console.log("=== END LAMBDA EXECUTION ===");
    return createResponse(200, { message: "Success", data: responseBody }, event);
  } catch (error: unknown) {
    console.error("=== LAMBDA ERROR ===");
    console.error("Error details:", error);
    
    // Safely handle the error stack
    if (error instanceof Error) {
      console.error("Stack trace:", error.stack);
    } else {
      console.error("Non-Error object thrown:", error);
    }
    
    return createResponse(500, { error: "Internal server error" }, event);
  }
}; 