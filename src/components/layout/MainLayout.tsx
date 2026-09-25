import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import MapSection from './MapSection';
import FAQ from '../FAQ';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isReservaClient = location.pathname.startsWith('/reserva');

  const globalFaqs = [
    {
      q: "É obrigatório usar meias no Leni's FunPark?", 
      a: <><strong>Sim.</strong> O uso de meias antiderrapantes é estritamente obrigatório por normas de higiene e segurança. Pode trazer meias próprias ou adquiri-las na receção do nosso parque indoor.</>
    },
    {
      q: "Qual é a idade mínima para aceder aos equipamentos do parque?", 
      a: <>A idade mínima é de <strong>5 anos</strong>. Todos os trampolins e atividades estão dimensionados e certificados para garantir a segurança de crianças a partir desta faixa etária.</>
    },
    {
      q: "Qual é o limite de convidados para uma festa de aniversário infantil?", 
      a: <>O pacote base cobra sempre um mínimo de <strong>10 crianças</strong>. O limite padrão para garantir a segurança no espaço é de <strong>25 pessoas</strong>. Para grupos superiores, contacte-nos para avaliarmos a viabilidade.</>
    },
    {
      q: "O parque de diversões tem estacionamento próprio?", 
      a: <><strong>Sim.</strong> O Leni's FunPark dispõe de estacionamento gratuito no local, na Zona Industrial do Tortosendo, com lotação adequada para os dias de maior afluência.</>
    },
    {
      q: "Onde se localiza o Leni's FunPark?", 
      a: <>O parque está localizado na <strong>Zona Industrial do Tortosendo (Covilhã)</strong>. Somos um espaço de diversões indoor, 100% climatizado, a servir a região da Cova da Beira.</>
    },
    {
      q: "Que atrações e equipamentos indoor estão disponíveis?", 
      a: <>O espaço oferece <strong>trampolins interativos, piscinas de bolas, escorregas gigantes, campo de futebol indoor e matraquilos</strong>. Todos os equipamentos cumprem as rigorosas normas de segurança europeias.</>
    }
];

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans selection:bg-primary selection:text-white">
      {!isAdmin && !isReservaClient && <Header />}
      <main className="flex-grow">
        {children}
      </main>
      {!isAdmin && !isReservaClient && (
        <>
          {['/', '/parque', '/festas', '/contactos'].includes(location.pathname) && (
            <>
              <FAQ faqs={globalFaqs} />
              <MapSection />
            </>
          )}
          <Footer />
        </>
      )}
    </div>
  );
}
