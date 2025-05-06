import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
   

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-0">
        <Outlet /> {/* Aqui as páginas serão renderizadas */}
      </main>

     
    </div>
  );
};

export default MainLayout;