import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import MapSection from './MapSection';
import FAQ from '../FAQ';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  const globalFaqs = [
    {q: "É obrigatório o uso de meias?", a: <><strong>Sim</strong>, por questões de higiene e segurança é obrigatório o uso de meias antiderrapantes. Podem trazer as vossas ou adquirir no parque.</>},
    {q: "Qual a idade mínima para brincar no parque?", a: <>O Leni's FunPark está preparado para receber pequenos aventureiros a partir dos <strong>5 anos de idade</strong>, garantindo assim que aproveitam as nossas atrações com a máxima segurança e diversão.</>},
    {q: "Qual o limite mínimo de convidados para uma festa?", a: <>Temos um mínimo de <strong>10 convidados</strong> por festa. Caso o seu grupo seja mais pequeno, a festa pode realizar-se na mesma! O valor cobrado será, no entanto, o equivalente ao pacote base de 10 crianças.</>},
    {q: "Qual o máximo de pessoas que posso convidar?", a: <>Para garantir a melhor experiência e segurança de todos, os nossos pacotes base cobrem até <strong>25 pessoas</strong>. Para grupos maiores, por favor entre em contacto connosco! Iremos avaliar a possibilidade e apresentar um orçamento à medida das suas necessidades.</>},
    {q: "Têm parque de estacionamento?", a: <>Sim, dispomos de <strong>estacionamento gratuito</strong> no local com lugares suficientes para os dias de maior afluência.</>}
  ];

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans selection:bg-primary selection:text-white">
      {!isAdmin && <Header />}
      <main className="flex-grow">
        {children}
      </main>
      {!isAdmin && (
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
