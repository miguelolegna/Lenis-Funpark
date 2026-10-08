import { motion } from "framer-motion";

export interface HistoriaMissaoSectionProps {}

export default function HistoriaMissaoSection({}: HistoriaMissaoSectionProps) {
  return (
    <section className="py-16 md:py-20 bg-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl p-8 sm:p-12 shadow-md border border-surface-alt text-center"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-primary mb-2 block">
            Missão & Propósito
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-secondary mb-6">
            A Nossa História & Missão
          </h2>
          <p className="text-lg sm:text-xl text-secondary/80 leading-relaxed font-medium max-w-2xl mx-auto">
            Criámos o Leni's Funpark para transformar energia em memórias inesquecíveis. Num espaço desenhado ao detalhe para a máxima segurança, desafiamos as crianças a largar os ecrãs e a redescobrir a alegria pura de saltar, explorar e brincar em equipa.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
