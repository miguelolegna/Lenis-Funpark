import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Clock,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Send,
  Heart,
  ShieldCheck,
  Car,
  Calendar
} from 'lucide-react';
import { pageVariants, pageTransition } from '../lib/animations';

export default function Contactos() {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Estado do formulário de mensagem rápida
  const [formData, setFormData] = useState({
    nome: '',
    contacto: '',
    motivo: 'Festa de Aniversário',
    mensagem: ''
  });
  const [formSent, setFormSent] = useState(false);

  const handleCopy = (text: string, type: 'email' | 'phone') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    } else {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2500);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const textoMsg = `Olá Leni's FunPark! O meu nome é ${formData.nome} (${formData.contacto}). Assunto: ${formData.motivo}. Mensagem: ${formData.mensagem}`;
    const whatsappUrl = `https://wa.me/351920259886?text=${encodeURIComponent(textoMsg)}`;
    window.open(whatsappUrl, '_blank');
    setFormSent(true);
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="w-full bg-surface-alt/40"
    >
      {/* ================= HERO SECTION ================= */}
      <section className="relative bg-secondary text-white py-20 md:py-28 overflow-hidden">
        {/* Background Image com overlay suave */}
        <div className="absolute inset-0 z-0">
          <img
            src="/Fotos/OverView.webp"
            alt="Leni's FunPark"
            className="w-full h-full object-cover opacity-25 scale-105 filter blur-[1px]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/95 via-secondary/90 to-secondary" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/30 border border-primary/50 text-surface-alt text-sm font-bold tracking-wide uppercase mb-6"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span>Estamos à sua espera</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6"
          >
            Planeie a sua visita hoje mesmo!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl md:text-2xl text-surface font-medium max-w-3xl mx-auto leading-relaxed"
          >
            Não perca mais tempo! Venha criar memórias inesquecíveis com a sua família e amigos. Estamos ansiosos para recebê-lo no Leni´s FunPark!
          </motion.p>

          {/* Badges de Destaque */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-wrap justify-center gap-4 text-sm font-semibold text-white/90"
          >
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
              <Phone className="w-4 h-4 text-primary" />
              <span>Resposta Rápida</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
              <Car className="w-4 h-4 text-primary" />
              <span>Estacionamento Grátis</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Espaço 100% Seguro</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= CANAIS DE CONTACTO (CARDS) ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* CARD 1: Telefone & WhatsApp */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl border-2 border-primary/20 hover:border-primary transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-sm">
                <Phone className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Contacto Direto</span>
              <h3 className="text-xl font-black text-secondary mt-1 mb-2">
                Ligue para nós/ WhatsApp:
              </h3>
              <p className="text-2xl font-black text-secondary tracking-tight">
                (+351)920 259 886
              </p>
              <p className="text-xs text-secondary/60 font-semibold mt-1">
                (chamada para a rede movel nacional)
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <a
                href="https://wa.me/351920259886?text=Ol%C3%A1!%20Gostaria%20de%20obter%20mais%20informa%C3%A7%C3%B5es%20sobre%20o%20Leni%27s%20FunPark."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Conversar no WhatsApp</span>
              </a>
              <a
                href="tel:+351920259886"
                className="inline-flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary hover:text-white text-primary px-4 py-2.5 rounded-xl font-bold text-sm transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Ligar Agora</span>
              </a>
            </div>
          </div>

          {/* CARD 2: Email */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl border-2 border-secondary/20 hover:border-secondary transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-5 group-hover:bg-secondary group-hover:text-white transition-colors duration-300 shadow-sm">
                <Mail className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-secondary">Correio Eletrónico</span>
              <h3 className="text-xl font-black text-secondary mt-1 mb-2">
                Envie um email:
              </h3>
              <p className="text-base font-black text-secondary break-all">
                pereira.garcia2025@gmail.com
              </p>
              <p className="text-xs text-secondary/60 font-semibold mt-1">
                Respondemos com rapidez ao seu pedido de informação
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <a
                href="mailto:pereira.garcia2025@gmail.com?subject=Informa%C3%A7%C3%B5es%20Leni%27s%20FunPark"
                className="inline-flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/90 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Email</span>
              </a>
              <button
                type="button"
                onClick={() => handleCopy('pereira.garcia2025@gmail.com', 'email')}
                className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-secondary px-4 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-4 h-4 text-primary" />
                    <span>Email Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Endereço</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* CARD 3: Instagram */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl border-2 border-[#E1306C]/20 hover:border-[#E1306C] transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#fdf497] via-[#fd5949] to-[#d6249f] text-white flex items-center justify-center mb-5 shadow-sm">
                <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#E1306C]">Redes Sociais</span>
              <h3 className="text-xl font-black text-secondary mt-1 mb-2">
                Visite nosso Instagram:
              </h3>
              <p className="text-lg font-black text-secondary">
                @lenisfunpark
              </p>
              <p className="text-xs text-secondary/60 font-semibold mt-1">
                Fotos diárias, vídeos dos saltos e novidades exclusivas
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <a
                href="https://www.instagram.com/lenisfunpark?igsh=aXB2cnU2bTJuNGh4"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-95 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md transition-opacity"
              >
                <span>Seguir no Instagram</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* CARD 4: Facebook */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl border-2 border-[#1877F2]/20 hover:border-[#1877F2] transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center mb-5 group-hover:bg-[#1877F2] group-hover:text-white transition-colors duration-300 shadow-sm">
                <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1877F2]">Comunidade</span>
              <h3 className="text-xl font-black text-secondary mt-1 mb-2">
                Encontre-nos no Facebook:
              </h3>
              <p className="text-lg font-black text-secondary">
                Leni's FunPark
              </p>
              <p className="text-xs text-secondary/60 font-semibold mt-1">
                Avaliações, partilhas e eventos especiais com a família
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <a
                href="https://www.facebook.com/share/1H7NfeWnQE/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#166FE5] text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md transition-colors"
              >
                <span>Visitar Facebook</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECÇÃO PRINCIPAL: FORMULÁRIO + HORÁRIOS & INFOS ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* COLUNA ESQUERDA: Formulário de Mensagem Direta (7 colunas) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-gray-100">
            <div className="mb-8">
              <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-3">
                Mensagem Rápida
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-secondary tracking-tight">
                Envie-nos a sua dúvida ou pedido
              </h2>
              <p className="text-secondary/70 font-medium mt-2">
                Quer saber mais sobre disponibilidade, festas ou eventos em grupo? Escreva-nos e entraremos em contacto consigo de imediato.
              </p>
            </div>

            {formSent ? (
              <div className="bg-surface p-8 rounded-2xl border-2 border-primary text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-secondary mb-2">Mensagem Encaminhada!</h3>
                <p className="text-secondary/80 font-medium max-w-md mx-auto mb-6">
                  A sua mensagem foi aberta no WhatsApp para envio direto à nossa equipa. Responderemos o mais breve possível!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFormSent(false);
                    setFormData({ nome: '', contacto: '', motivo: 'Festa de Aniversário', mensagem: '' });
                  }}
                  className="bg-secondary text-white font-bold px-6 py-3 rounded-xl hover:bg-secondary/90 transition-colors text-sm cursor-pointer"
                >
                  Enviar Nova Mensagem
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-secondary mb-2">
                      O seu Nome *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Ex: Maria Pereira"
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-secondary font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-secondary mb-2">
                      Telemóvel ou Email *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contacto}
                      onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                      placeholder="Ex: 920 000 000 ou email@..."
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-secondary font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-secondary mb-2">
                    Tipo de Assunto
                  </label>
                  <select
                    value={formData.motivo}
                    onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-secondary font-medium bg-white"
                  >
                    <option value="Festa de Aniversário">Festa de Aniversário</option>
                    <option value="Visita Individual / Família">Visita Individual / Família</option>
                    <option value="Grupo Escolar / Associação">Grupo Escolar / Associação</option>
                    <option value="Dúvida Geral ou Sugestão">Dúvida Geral ou Sugestão</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-secondary mb-2">
                    Mensagem *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.mensagem}
                    onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                    placeholder="Escreva aqui a data pretendida, número de crianças ou qualquer detalhe da sua visita..."
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-secondary font-medium resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-accent hover:bg-accent-dark text-white font-black py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 text-lg cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Enviar Mensagem via WhatsApp</span>
                </button>

                <p className="text-xs text-center text-secondary/50 font-medium">
                  Também nos pode contactar diretamente pelo email <a href="mailto:pereira.garcia2025@gmail.com" className="underline hover:text-primary">pereira.garcia2025@gmail.com</a>
                </p>
              </form>
            )}
          </div>

          {/* COLUNA DIREITA: Horários, Informações Práticas e Localização (5 colunas) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Bloco de Horários */}
            <div className="bg-secondary text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-primary">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">Horários do Parque</h3>
                    <p className="text-xs text-surface-alt font-medium">Pronto para saltar e brincar</p>
                  </div>
                </div>

                <div className="space-y-3.5 text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-white/10">
                    <span className="font-semibold text-surface-alt">Segunda-feira:</span>
                    <span className="font-bold text-accent bg-white/10 px-3 py-1 rounded-lg">Encerrados</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-white/10">
                    <span className="font-semibold text-surface-alt">3ª a 6ª feira:</span>
                    <span className="font-black text-white bg-primary/40 px-3 py-1 rounded-lg">14h00 às 20h00</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="font-semibold text-surface-alt">Sáb., Dom. e Feriados:</span>
                    <span className="font-black text-white bg-primary px-3 py-1 rounded-lg">10h00 às 20h00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bloco de Informações Úteis */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 space-y-5">
              <h3 className="text-xl font-black text-secondary">
                Informações Úteis para a sua Visita
              </h3>

              <div className="space-y-4 text-sm text-secondary/80">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-secondary block">Meias Antiderrapantes Obrigatórias</strong>
                    Por motivos de segurança e higiene. Pode trazer as suas ou adquirir diretamente na receção.
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-secondary block">Estacionamento Gratuito</strong>
                    Parque amplo e sem custos mesmo à porta para todas as famílias convidadas.
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-secondary block">Idade Mínima</strong>
                    Espaço recomendado para crianças a partir dos 5 anos com supervisão de monitores.
                  </div>
                </div>
              </div>
            </div>

            {/* Cartão de Morada */}
            {/* <div className="bg-surface rounded-3xl p-6 border-2 border-primary/30 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Onde estamos</span>
                <p className="font-bold text-secondary text-base leading-snug mt-0.5">
                  Zona Industrial do Tortosendo lt.23B Rua F, 6200-823 Tortosendo
                </p>
                <a
                  href="https://maps.google.com/?q=Leni's+FunPark+Tortosendo"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-black text-primary hover:text-secondary mt-2 underline"
                >
                  <span>Abrir no Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div> */}
          </div>
        </div>
      </section>

      {/* ================= BANNER INSPIRACIONAL DE FECHO ================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="relative rounded-[2.5rem] bg-gradient-to-r from-secondary via-primary to-secondary p-10 sm:p-14 text-white text-center shadow-2xl overflow-hidden">
          {/* Elementos decorativos de fundo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full filter blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/40 rounded-full filter blur-3xl -ml-20 -mb-20 pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <span className="inline-block py-1.5 px-4 rounded-full bg-white/20 backdrop-blur-md text-surface text-xs font-bold uppercase tracking-widest mb-6">
              Experiência Inesquecível
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 leading-tight">
              Crie memórias inesquecíveis no Leni's FunPark!
            </h2>
            <p className="text-lg text-surface-alt/90 font-medium mb-8">
              Venha saltar nos trampolins, mergulhar na piscina de bolas e celebrar momentos únicos!
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/festas"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white px-8 py-4 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                <Calendar className="w-5 h-5" />
                <span>Ver Pacotes de Festas</span>
              </Link>
              <a
                href="https://wa.me/351920259886?text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20informa%C3%A7%C3%B5es%20sobre%20o%20Leni%27s%20FunPark."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-white text-secondary hover:bg-surface px-8 py-4 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
                <span>Falar pelo WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
