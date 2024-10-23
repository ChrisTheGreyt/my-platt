import React from 'react'
import { Authenticator } from "@aws-amplify/ui-react";
import { Amplify } from 'aws-amplify';
import "@aws-amplify/ui-react/styles.css";
Amplify.configure({
  Auth:{
    Cognito:{
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || "",
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID || "", 
    }
  }
})

const formFields ={
  signUp:{
    username: {
      order:1,
      Placeholder: "Choose a username",
      label: "Username",
      inputProps: { reqpuired: true }
    },
    email: {
      order:2,
      Placeholder: "Enter your email address",
      label: "Email",
      inputProps: { type: "email", reqpuired: true }
    }, 
    password: {
      order:3,
      Placeholder: "Enter your password",
      label: "Password",
      inputProps: { type: "password", reqpuired: true }
    }, 
    confirm_password: {
      order:4,
      Placeholder: "Confirm your Username",
      label: "Confirm Password",
      inputProps: { type: "password", reqpuired: true }
    },
  }
}
const AuthProvider = ({children}: any) => {
  return (
   
      <Authenticator formFields={formFields}>
        {({ user }: any) =>
          user ? (
            <div>{children}</div>
          ) : (
            <div>
              <h1>Please sign in below:</h1>
            </div>
          )
        }
      </Authenticator>

  )
}

export default AuthProvider;