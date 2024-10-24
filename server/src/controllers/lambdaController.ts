import https from "node:https";

export const handler = async (event: any) => {
 const postData = JSON .stringify({
  username: event.request.userAttributes['preferred_username'] || event.userName,
  cognitoId: event.userName,
  profilePictureUrl: "i1.jpg",
  teamId: 1
 });

 const options ={
  hostname: "7b5we67gn6.execute-api.us-east-1.amazonaws.com",
  port: 443,
  path: "/create-user",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length" : Buffer.byteLength(postData)
  }
 };

 const responseBody = await new Promise((resolve, reject) => {
  const req = https.request(options, res => {
    res.setEncoding("utf8");
    let body = "";
    res.on("data", chunk => body += chunk);
    res.on("end", () => resolve(body));
  });
  req.on("error", reject);
  req.write(postData);
  req.end();
 });

 return event;
};
