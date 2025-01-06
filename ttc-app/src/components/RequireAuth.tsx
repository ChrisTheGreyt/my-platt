import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { user, session } = useAuth();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (user && session) {
      setIsCheckingAuth(false); // Authenticated
    } else {
      console.warn('Unauthorized access. Redirecting to sign-in page.');
      router.push('/SignIn'); // Explicitly redirect to sign-in
    }
  }, [user, session, router]);

  if (isCheckingAuth) {
    return <div>Loading...</div>; // Prevent blank state
  }

  return <>{children}</>;
};

export default RequireAuth;
