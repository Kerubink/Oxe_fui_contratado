import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="text-center space-y-8">
      <h2 className="text-3xl font-bold">Bem-vindo ao Simulador de Entrevistas</h2>
      <p className="text-gray-600">Prepare-se para sua próxima entrevista técnica com IA</p>
      <Link 
        to="/config"
        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
      >
        Começar Agora
      </Link>
    </div>
  );
};

export default HomePage;