// src/utils/amplifyConfig.ts

import { Amplify } from 'aws-amplify';
import awsExports from '../aws-exports'; // Adjust the path if necessary

Amplify.configure(awsExports);
console.log('Amplify configured with:', awsExports);