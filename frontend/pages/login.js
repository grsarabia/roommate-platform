import { useState } from 'react';
import { login } from '../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const data = await login(email, password);
    if (data.token) {
      localStorage.setItem('token', data.token);
      setMessage('Login exitoso');
    } else {
      setMessage(data.error || 'Error en login');
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-xl font-bold mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border p-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border p-2"
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2">
          Entrar
        </button>
      </form>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
