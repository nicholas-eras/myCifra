export async function registerUser(userData) {
  try {
    const response = await fetch('/api/users/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      console.log('Erro ao registrar usuário');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function loginUser(credentials) {
  try {
    const response = await fetch('/api/auth/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      console.log('Erro ao fazer login');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}
