const https = require('https');

exports.handler = async (event) => {
  console.log("Lambda Triggered:", JSON.stringify(event, null, 2));
  try {
    // Extract user attributes
    const username = event.request.userAttributes['preferred_username'] || event.userName;
    const cognitoId = event.userName;
    const firstName = event.request.userAttributes['given_name'];
    const lastName = event.request.userAttributes['family_name'];
    const email = event.request.userAttributes['email'];

    // Prepare POST data
    const postData = JSON.stringify({
      username: username,
      cognitoId: cognitoId,
      firstName: firstName,
      lastName: lastName,
      email: email,
      profilePictureUrl: "https://main.d249lhj5v2utjs.amplifyapp.com/pd1.jpg", // Default picture
      teamId: 1, //default team
    });

    console.log('Lambda Triggered with Event:', JSON.stringify(event, null, 2));
    
    // Define HTTPS request options
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

    // Perform HTTPS request
    const responseBody = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        res.setEncoding("utf8");
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve(body));
      });

      req.on("error", (error) => {
        console.error("HTTPS Request Error:", error);
        reject(error);
      });

      req.write(postData);
      req.end();
    });

    console.log("Response from /create-user:", responseBody);

    return event; // Continue the sign-up process
  } catch (error) {
    console.error("PreSignUp Handler Error:", error);
    throw error; // Propagate the error to Cognito
  }
};
