import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthCallback({ onLogin }) {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get('token');
    const user   = params.get('user');

    if (token && user) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', user);
      onLogin(JSON.parse(user));
    }

    navigate('/');
  }, []);

  return null;
}