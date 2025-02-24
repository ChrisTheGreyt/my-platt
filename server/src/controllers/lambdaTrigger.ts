// Add these headers to your Lambda responses
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With',
  'Access-Control-Allow-Methods': 'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT',
  'Access-Control-Allow-Credentials': 'true'
};

// Example response
return {
  statusCode: 200,
  headers,
  body: JSON.stringify({ /* your response data */ })
}; 