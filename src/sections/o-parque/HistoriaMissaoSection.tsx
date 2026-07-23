export interface HistoriaMissaoSectionProps {}

export default function HistoriaMissaoSection({}: HistoriaMissaoSectionProps) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-black text-secondary mb-8">A Nossa História & Missão</h2>
        <p className="text-lg text-secondary/80 leading-relaxed mb-6">
          Mais do que um parque, uma família. Nascemos com uma missão simples: tirar as crianças de casa, dos ecrãs, e devolvê-las ao movimento puro e genuíno da brincadeira física.
        </p>
      </div>
    </section>
  );
}
