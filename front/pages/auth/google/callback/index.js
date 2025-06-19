// pages/auth/google/callback.tsx (usando Pages Router)
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function GoogleCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const code = router.query.code;

      if (!code) {
        router.push('/');
        return;
      }

      try {
        const backendUrl = process.env.NEXT_PUBLIC_ENVIRONMENT_BACKEND ?? 'http://localhost:3000';
                
        const response = await fetch(`${backendUrl}/api/auth/google/callback?code=${code}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          console.error('Resposta não OK:', response.status, response.statusText);
          router.push('/');
          return;
        }

        const data = await response.json();
        
        const redirectUrl = data.redirect;
        router.push(redirectUrl);
        
      } catch (error) {
        console.error('Erro durante autenticação:', error);
        router.push('/');
      }
    };

    if (router.isReady) {
      handleCallback();
    }
  }, [router]);

  return <p>Autenticando com Google...</p>;
}