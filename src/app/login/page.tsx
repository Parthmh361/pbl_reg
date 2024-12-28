"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const Login = () => {
  const [prn, setPrn] = useState('');
  const [email, setEmail] = useState('');
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true); // Ensure the component is mounted on the client
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prn, email }),
    });
    if (response.ok) {
      router.push('/team-details');
    } else {
      alert('Login failed');
    }
  };

  if (!isClient) {
    return null; // Don't render the login form on the server
  }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="PRN"
          value={prn}
          onChange={(e) => setPrn(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
