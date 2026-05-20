import { StickyHeader } from '@/components/organisms/StickyHeader';
import { Footer } from '@/components/organisms/Footer';
import { ReservaFormulario } from '@/features/reservas/ReservaFormulario';
import { ReservaCalendario } from '@/features/reservas/ReservaCalendario';

export default function Marcacoes() {
  return (
    <div className="min-h-screen bg-brand-dark flex flex-col">
      <StickyHeader />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 py-12 w-full animate-mount-section">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-light mb-4">
            Pré-Reservas
          </h1>
          <p className="text-lg text-brand-gray max-w-2xl mx-auto">
            Planeie a sua visita com antecedência. O nosso parque tem uma capacidade controlada para garantir a melhor experiência para todos.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-start">
          <div className="w-full flex justify-end">
            <ReservaCalendario />
          </div>
          <div className="w-full flex justify-start">
            <ReservaFormulario />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
