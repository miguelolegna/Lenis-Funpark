import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Phone,
  Mail,
  MessageCircle,
  Clock,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Send,
  Heart,
  ShieldCheck,
  Car,
  Calendar,
  PartyPopper,
  Users,
  MessageSquare,
  GraduationCap,
  Building2,
  Wallet,
  Smartphone,
  CreditCard,
  Banknote
} from 'lucide-react';
import { pageVariants, pageTransition } from '../lib/animations';
import { supabase } from '../lib/supabase';
import PrivacyTermsCheckbox from '../components/PrivacyTermsCheckbox';

const VALIDADE_CODIGO_MS = 5 * 60 * 1000;
const ESPERA_REENVIO_MS = 60 * 1000;

interface Verificacao {
  id: string;
  destino: string;
  expiraEm: number;
  reenviarApos: number;
}

async function chamarEnvioCodigo(body: Record<string, string>) {
  const { data, error } = await supabase.functions.invoke('enviar_codigo_mensagem', { body });
  if (error) {
    let mensagem = 'Não foi possível enviar a mensagem. Tente novamente ou contacte-nos por email.';
    let codigoErro: string = error.name;
    try {
      const payload = await (error as { context?: Response }).context?.json();
      if (payload?.message) mensagem = payload.message;
      if (payload?.error) codigoErro = payload.error;
    } catch { /* manter a mensagem genérica */ }
    console.error('[Contactos] Erro em enviar_codigo_mensagem:', codigoErro, error.message);
    throw new Error(mensagem);
  }
  return data as { mensagem_id: string; destino: string };
}

function formatarTempo(ms: number) {
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function Contactos() {
  const [searchParams] = useSearchParams();
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedMBWay, setCopiedMBWay] = useState(false);
  const [copiedIBAN, setCopiedIBAN] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Mapear parâmetro de URL (?assunto=) para a opção correspondente
  const getInitialMotivo = () => {
    const p = (searchParams.get('assunto') || '').toLowerCase();
    if (p.includes('escola') || p.includes('escolar')) return 'Visitas Escolares';
    if (p.includes('institui') || p.includes('b2b') || p.includes('grupo')) return 'Traga a sua Instituição';
    if (p.includes('aniversario') || p.includes('festa')) return 'Festa de Aniversário';
    if (p.includes('familia') || p.includes('visita')) return 'Visita em Família';
    if (p.includes('duvida')) return 'Outras Dúvidas';
    return 'Festa de Aniversário';
  };

  // Estado do formulário de mensagem rápida
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telemovel: '',
    motivo: getInitialMotivo(),
    preferencia: 'whatsapp' as 'whatsapp' | 'email' | 'telefone',
    mensagem: ''
  });
  const [formSent, setFormSent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [armadilha, setArmadilha] = useState(''); // campo invisível: só os bots o preenchem
  const [verificacao, setVerificacao] = useState<Verificacao | null>(null);
  const [codigo, setCodigo] = useState('');
  const [codigoErro, setCodigoErro] = useState<string | null>(null);
  const [verificando, setVerificando] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [agora, setAgora] = useState(() => Date.now());
  const [concordaTermos, setConcordaTermos] = useState(false);

  useEffect(() => {
    if (!verificacao) return;
    const timer = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [verificacao]);

  // Sincronizar caso o utilizador navegue com novo parâmetro
  useEffect(() => {
    const paramMotivo = getInitialMotivo();
    setFormData((prev) => ({ ...prev, motivo: paramMotivo }));
  }, [searchParams]);

  const handleCopyText = (text: string, type: 'email' | 'mbway' | 'iban') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    } else if (type === 'mbway') {
      setCopiedMBWay(true);
      setTimeout(() => setCopiedMBWay(false), 2500);
    } else if (type === 'iban') {
      setCopiedIBAN(true);
      setTimeout(() => setCopiedIBAN(false), 2500);
    }
  };

  // A mensagem só chega à equipa depois de o visitante confirmar o código enviado
  // por email (Resend). Quem prefere WhatsApp ou chamada indica também o telemóvel.
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim() || !formData.email.trim() || !formData.mensagem.trim()) return;
    if (pedeTelemovel && !formData.telemovel.trim()) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const data = await chamarEnvioCodigo({
        nome: formData.nome,
        email: formData.email,
        telemovel: pedeTelemovel ? formData.telemovel : '',
        motivo: formData.motivo,
        preferencia: formData.preferencia,
        mensagem: formData.mensagem,
        website: armadilha,
      });
      const agoraMs = Date.now();
      setCodigo('');
      setCodigoErro(null);
      setAgora(agoraMs);
      setVerificacao({
        id: data.mensagem_id,
        destino: data.destino,
        expiraEm: agoraMs + VALIDADE_CODIGO_MS,
        reenviarApos: agoraMs + ESPERA_REENVIO_MS,
      });
    } catch (err) {
      setSubmitError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerificarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificacao || codigo.length !== 6) return;

    setVerificando(true);
    setCodigoErro(null);
    const { data, error } = await supabase.rpc('verificar_mensagem_contacto', {
      p_mensagem_id: verificacao.id,
      p_codigo: codigo,
    });
    setVerificando(false);

    if (error) {
      console.error('[Contactos] Erro ao verificar o código:', error.code, error.message);
      setCodigoErro('Não foi possível confirmar o código. Tente novamente.');
      return;
    }
    if (data === 'ok') {
      setVerificacao(null);
      setFormSent(true);
    } else if (data === 'incorreto') {
      setCodigoErro('Código incorreto. Confirme os 6 dígitos e tente novamente.');
      setCodigo('');
    } else {
      // 'expirado' ou 'bloqueado': a mensagem foi descartada no servidor
      setVerificacao(null);
      setSubmitError(
        data === 'bloqueado'
          ? 'Demasiadas tentativas com o código errado. A mensagem foi descartada: envie-a novamente.'
          : 'O código expirou e a mensagem foi descartada. Envie-a novamente.'
      );
    }
  };

  const handleReenviarCodigo = async () => {
    if (!verificacao) return;
    setReenviando(true);
    setCodigoErro(null);
    try {
      await chamarEnvioCodigo({ acao: 'reenviar', mensagem_id: verificacao.id });
      setVerificacao({ ...verificacao, reenviarApos: Date.now() + ESPERA_REENVIO_MS });
      setCodigo('');
    } catch (err) {
      setCodigoErro((err as Error).message);
    } finally {
      setReenviando(false);
    }
  };

  const restanteMs = verificacao ? Math.max(0, verificacao.expiraEm - agora) : 0;
  const expirou = verificacao !== null && restanteMs === 0;
  const podeReenviar = verificacao !== null && agora >= verificacao.reenviarApos && !expirou;
  const pedeTelemovel = formData.preferencia !== 'email';

  const opcoesAssunto = [
    {
      id: 'Festa de Aniversário',
      label: 'Festa de Aniversário',
      desc: 'Pacotes, reservas e celebrações',
      icon: PartyPopper
    },
    {
      id: 'Visita Individual / Família',
      label: 'Visita em Família',
      desc: 'Bilhetes diários e entradas livres',
      icon: Users
    },
    {
      id: 'Visitas Escolares',
      label: 'Visitas Escolares',
      desc: 'Turmas escolares, colégios e ATL',
      icon: GraduationCap
    },
    {
      id: 'Traga a sua Instituição',
      label: 'Traga a sua Instituição',
      desc: 'Empresas, associações e eventos de grupo',
      icon: Building2
    },
    {
      id: 'Dúvida Geral ou Sugestão',
      label: 'Outras Dúvidas',
      desc: 'Informações gerais ou pedidos especiais',
      icon: MessageSquare
    }
  ];

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
                onClick={() => handleCopyText('pereira.garcia2025@gmail.com', 'email')}
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
      <section id="formulario" className="scroll-mt-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
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
                <h3 className="text-2xl font-black text-secondary mb-2">Mensagem Enviada com Sucesso!</h3>
                <p className="text-secondary/80 font-medium max-w-md mx-auto mb-6">
                  A sua mensagem foi registada e encaminhada diretamente para a equipa do Leni's FunPark. Entraremos em contacto consigo com a maior brevidade!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFormSent(false);
                    setSubmitError(null);
                    setFormData({ nome: '', email: '', telemovel: '', motivo: 'Festa de Aniversário', preferencia: 'whatsapp', mensagem: '' });
                  }}
                  className="bg-secondary text-white font-bold px-6 py-3 rounded-xl hover:bg-secondary/90 transition-colors text-sm cursor-pointer"
                >
                  Enviar Nova Mensagem
                </button>
              </div>
            ) : verificacao ? (
              <div className="bg-surface p-6 sm:p-8 rounded-2xl border-2 border-primary/40">
                <div className="w-14 h-14 rounded-full bg-primary/15 text-primary flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                {expirou ? (
                  <div className="text-center">
                    <h3 className="text-xl font-black text-secondary mb-2">O código expirou</h3>
                    <p className="text-secondary/80 font-medium mb-6">
                      A mensagem não foi confirmada a tempo e foi descartada. Os seus dados continuam preenchidos: pode enviá-la novamente.
                    </p>
                    <button
                      type="button"
                      onClick={() => setVerificacao(null)}
                      className="bg-secondary text-white font-bold px-6 py-3 rounded-xl hover:bg-secondary/90 transition-colors text-sm cursor-pointer"
                    >
                      Voltar ao formulário
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleVerificarCodigo} className="text-center">
                    <h3 className="text-xl font-black text-secondary mb-2">Confirme que é mesmo você</h3>
                    <p className="text-secondary/80 font-medium mb-5">
                      Enviámos um código de 6 dígitos para o email{' '}
                      <strong className="text-secondary">{verificacao.destino}</strong>. A mensagem só é enviada depois de o confirmar. Se não o encontrar, veja também a pasta de spam.
                    </p>
                    <label htmlFor="codigo-verificacao" className="sr-only">Código de verificação</label>
                    <input
                      id="codigo-verificacao"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      autoFocus
                      maxLength={6}
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="w-full max-w-[14rem] mx-auto block text-center text-3xl font-black tracking-[0.4em] px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-secondary"
                    />
                    <p className="text-sm font-semibold text-secondary/60 mt-3" aria-live="polite">
                      Expira em {formatarTempo(restanteMs)}
                    </p>

                    {codigoErro && (
                      <p role="alert" className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm font-medium text-red-700">
                        {codigoErro}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={verificando || codigo.length !== 6}
                      className="mt-5 w-full bg-accent hover:bg-accent-dark text-white font-black py-3.5 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Check className="w-5 h-5" />
                      <span>{verificando ? 'A confirmar...' : 'Confirmar e enviar mensagem'}</span>
                    </button>

                    <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-bold">
                      <button
                        type="button"
                        onClick={handleReenviarCodigo}
                        disabled={!podeReenviar || reenviando}
                        className="text-primary hover:underline disabled:text-secondary/40 disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
                      >
                        {reenviando
                          ? 'A reenviar...'
                          : podeReenviar
                            ? 'Reenviar código'
                            : `Reenviar código (${formatarTempo(verificacao.reenviarApos - agora)})`}
                      </button>
                      <button
                        type="button"
                        onClick={() => setVerificacao(null)}
                        className="text-secondary/70 hover:underline cursor-pointer"
                      >
                        Corrigir o email
                      </button>
                    </div>
                  </form>
                )}
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
                    <label htmlFor="contacto-email" className="block text-sm font-bold text-secondary mb-2">
                      O seu Email *
                    </label>
                    <input
                      id="contacto-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Ex: maria@email.com"
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-secondary font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="block text-sm font-bold text-secondary">
                      Tipo de Assunto *
                    </label>
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                      Selecione uma opção
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {opcoesAssunto.map((opt) => {
                      const isSelected = formData.motivo === opt.id;
                      const IconComponent = opt.icon;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, motivo: opt.id })}
                          className={`group flex items-center gap-3.5 p-3.5 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? 'border-primary bg-surface text-secondary shadow-sm ring-2 ring-primary/20 scale-[1.01]'
                              : 'border-gray-200/80 bg-gray-50/60 hover:bg-white hover:border-primary/40 text-secondary/75'
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-primary text-white shadow-sm'
                                : 'bg-white text-secondary/50 border border-gray-200/60 group-hover:text-primary group-hover:border-primary/30'
                            }`}
                          >
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-black leading-tight ${isSelected ? 'text-secondary' : 'text-secondary/85'}`}>
                              {opt.label}
                            </p>
                            <p className="text-[11px] text-secondary/60 font-medium truncate mt-0.5">
                              {opt.desc}
                            </p>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                              isSelected
                                ? 'bg-primary text-white scale-100 opacity-100'
                                : 'border border-gray-300 opacity-40 scale-75 group-hover:opacity-70'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-secondary mb-2">
                    Como prefere que entremos em contacto?
                  </label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {[
                      { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
                      { id: 'email', label: 'Email', icon: Mail },
                      { id: 'telefone', label: 'Chamada', icon: Phone },
                    ].map((pref) => {
                      const Icon = pref.icon;
                      const isSelected = formData.preferencia === pref.id;
                      return (
                        <button
                          key={pref.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, preferencia: pref.id as 'whatsapp' | 'email' | 'telefone' })}
                          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'border-primary bg-primary/10 text-primary shadow-xs'
                              : 'border-gray-200 bg-white text-secondary/70 hover:border-primary/30'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{pref.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  {pedeTelemovel && (
                    <div className="mt-3">
                      <label htmlFor="contacto-telemovel" className="block text-sm font-bold text-secondary mb-2">
                        O seu Telemóvel *
                      </label>
                      <input
                        id="contacto-telemovel"
                        type="tel"
                        autoComplete="tel"
                        required
                        value={formData.telemovel}
                        onChange={(e) => setFormData({ ...formData, telemovel: e.target.value })}
                        placeholder="Ex: 920 000 000"
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-secondary font-medium"
                      />
                    </div>
                  )}
                  <p className="text-xs text-secondary/60 font-medium mt-2">
                    Vamos enviar um código para o seu email para confirmar que é mesmo você.
                  </p>
                </div>

                {/* Armadilha para bots: invisível para pessoas e leitores de ecrã */}
                <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
                  <label>
                    Website
                    <input
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={armadilha}
                      onChange={(e) => setArmadilha(e.target.value)}
                    />
                  </label>
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

                {submitError && (
                  <p role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm font-medium text-red-700 text-center">
                    {submitError}
                  </p>
                )}

                <PrivacyTermsCheckbox
                  id="contactos-privacy-terms"
                  checked={concordaTermos}
                  onChange={setConcordaTermos}
                  required
                />

                <button
                  type="submit"
                  disabled={submitting || !concordaTermos}
                  className="w-full bg-accent hover:bg-accent-dark text-white font-black py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 text-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                  <span>{submitting ? 'A enviar código...' : 'Enviar Mensagem'}</span>
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

            {/* Bloco de Métodos de Pagamento */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-gray-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-secondary leading-tight">
                      Métodos de Pagamento
                    </h3>
                    <p className="text-xs text-secondary/60 font-medium">Disponíveis online e no parque</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Online & Presencial
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 sm:gap-3 pt-1">
                {/* 1. MB WAY */}
                <div className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-surface/70 border border-primary/20 hover:border-primary hover:bg-surface transition-all duration-200 group">
                  <div className="w-9 h-9 rounded-xl bg-white shadow-xs border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-white transition-all duration-200 mb-1.5">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black text-secondary group-hover:text-primary transition-colors">
                    MB WAY
                  </span>
                  <span className="text-[10px] text-secondary/65 font-medium mt-0.5 leading-tight">
                    Online & móvel
                  </span>
                </div>

                {/* 2. Multibanco / IBAN */}
                <div className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-surface/70 border border-primary/20 hover:border-primary hover:bg-surface transition-all duration-200 group">
                  <div className="w-9 h-9 rounded-xl bg-white shadow-xs border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-white transition-all duration-200 mb-1.5">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black text-secondary group-hover:text-primary transition-colors">
                    Multibanco / IBAN
                  </span>
                  <span className="text-[10px] text-secondary/65 font-medium mt-0.5 leading-tight">
                    Cartão / Transf.
                  </span>
                </div>

                {/* 3. Em Dinheiro */}
                <div className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-surface/70 border border-primary/20 hover:border-primary hover:bg-surface transition-all duration-200 group">
                  <div className="w-9 h-9 rounded-xl bg-white shadow-xs border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-white transition-all duration-200 mb-1.5">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black text-secondary group-hover:text-primary transition-colors">
                    Em Dinheiro
                  </span>
                  <span className="text-[10px] text-secondary/65 font-medium mt-0.5 leading-tight">
                    Na receção
                  </span>
                </div>
              </div>

              {/* Detalhes para Pagamentos Diretos */}
              <div className="space-y-2 pt-1 border-t border-gray-100">
                {/* MB WAY */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface/40 border border-primary/15 hover:border-primary/40 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md shrink-0">
                      MB WAY
                    </span>
                    <span className="text-xs sm:text-sm font-black text-secondary tracking-wide">
                      911 855 496
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText('911855496', 'mbway')}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-secondary bg-white hover:bg-surface border border-primary/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ml-2 shadow-xs"
                    title="Copiar número MB WAY"
                  >
                    {copiedMBWay ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-primary" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>

                {/* IBAN */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface/40 border border-primary/15 hover:border-primary/40 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-secondary bg-secondary/10 px-2 py-0.5 rounded-md shrink-0">
                      IBAN
                    </span>
                    <span className="text-[11px] sm:text-xs font-black text-secondary tracking-tight font-mono truncate">
                      PT50 3560 0001 9001 8810 5228 3
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText('PT50356000019001881052283', 'iban')}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-secondary hover:text-primary bg-white hover:bg-surface border border-gray-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ml-2 shadow-xs"
                    title="Copiar IBAN"
                  >
                    {copiedIBAN ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-primary" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
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
