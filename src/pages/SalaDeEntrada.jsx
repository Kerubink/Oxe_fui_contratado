import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SalaDeEntrada() {
  const [nome, setNome] = useState('');
  const navigate = useNavigate();

  const handleEntrar = () => {
    if (!nome.trim()) return alert('Digite seu nome');
    localStorage.setItem('usuarioNome', nome);
    navigate('/entrevista');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
      <h2 className="text-2xl font-semibold">Antes de começar...</h2>
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Digite seu nome"
        className="border p-2 rounded-lg w-64 text-center"
      />
      <button
        onClick={handleEntrar}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
      >
        Entrar na Entrevista
      </button>
    </div>
  );
}
