import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    // HARDCODE USERNAME PASSWORD DISINI
    if (username === 'admin' && password === 'bumdes123') {
      localStorage.setItem('isLoggedIn', 'true');
      router.push('/dashboard');
    } else {
      alert('Password Salah Bos!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded-xl shadow-lg w-80">
        <h1 className="text-2xl font-bold mb-6 text-center">🔐 Login Peternak</h1>
        <input 
          className="w-full p-3 mb-4 bg-gray-700 rounded text-white"
          placeholder="Username" 
          onChange={(e) => setUsername(e.target.value)} 
        />
        <input 
          className="w-full p-3 mb-6 bg-gray-700 rounded text-white"
          type="password" 
          placeholder="Password" 
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button className="w-full bg-blue-600 p-3 rounded font-bold hover:bg-blue-500">MASUK</button>
      </form>
    </div>
  );
}