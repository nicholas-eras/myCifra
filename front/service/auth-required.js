import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const checkAuth = async () => {
  try {
    const response = await fetch('/api/auth/validate-token/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      console.log('Not authenticated');
    }
    return true; 
  } catch (error) {
    return false; 
  }
};

const AuthRequired = (WrappedComponent) => {
  return function AuthRequiredComponent(props) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
      const authCheck = async () => {
        const authenticated = await checkAuth();
        setIsAuthenticated(authenticated);
        setIsLoading(false);
        if (!authenticated) {
          router.push('/login');
        }
      };
      authCheck();
    }, [router]);

    if (isLoading) {
      return (
      <>
        <Link href="/">
          <button style={{
            padding: '5px 10px',
            backgroundColor: 'red',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}>
            Voltar
          </button>
        </Link>
        Loading...
      </>
    )
    }

    return isAuthenticated ? <WrappedComponent {...props} /> : null;
  };
};

export default AuthRequired;