import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="404 - Página Não Encontrada | Lennis Fun Park"
        description="A página solicitada não existe."
      />

      <section className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-surface">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="max-w-xl w-full p-8 md:p-12 text-center"
        >
          <span className="inline-block text-8xl md:text-9xl font-black text-secondary tracking-tight select-none">
            4<span className="text-accent">0</span>4
          </span>

          <div className="mt-6 space-y-3">
            <h1 className="text-2xl md:text-3xl font-bold text-dark">
              Página não encontrada
            </h1>
            <p className="text-secondary/80 text-base md:text-lg leading-relaxed">
              O endereço introduzido não existe, foi removido ou está temporariamente indisponível.
            </p>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-white bg-accent hover:bg-accent-dark transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/50 cursor-pointer"
            >
              Voltar à Página Anterior
            </button>

            <button
              onClick={() => navigate('/contactos')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-secondary bg-surface-alt hover:bg-surface border border-secondary/15 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary/30 cursor-pointer"
            >
              Contactar a Equipa
            </button>
          </div>
        </motion.div>
      </section>
    </>
  );
}