import { motion } from "framer-motion";
import {
  Smartphone,
  ChevronLeft,
  Share2,
  MoreVertical,
  Smile,
  Send,
} from "lucide-react";
import conviteImg from "../../assets/covite_lennis.webp";

export default function ConvitesDigitaisSection() {
  return (
    <section className="py-20 bg-primary text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Mockup do Telemóvel mantendo o outline original e proporção */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative mx-auto w-full max-w-[300px]"
          >
            <div className="relative bg-[#0b141a] rounded-[3rem] border-[14px] border-dark aspect-[9/19] shadow-2xl overflow-hidden flex flex-col justify-between select-none">
              {/* Notch superior do telemóvel */}
              <div className="absolute top-0 inset-x-0 h-6 bg-dark rounded-b-xl mx-16 z-30 pointer-events-none"></div>

              {/* Barra superior de visualização de imagem estilo WhatsApp */}
              <div className="absolute top-0 inset-x-0 pt-7 pb-3 px-3.5 bg-gradient-to-b from-black/85 via-black/40 to-transparent z-20 flex items-center justify-between text-white">
                <div className="flex items-center gap-2 min-w-0">
                  <ChevronLeft size={20} className="text-white shrink-0" />
                  <div className="min-w-0">
                    <div className="font-semibold text-xs truncate leading-tight">
                      Convite Leni's FunPark 🎈
                    </div>
                    <div className="text-[10px] text-white/70 leading-tight">
                      Hoje às 14:32
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-white/80 shrink-0">
                  <Share2 size={16} />
                  <MoreVertical size={16} />
                </div>
              </div>

              {/* Área central com a imagem preservando a proporção e fillers WhatsApp */}
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#0b141a]">
                {/* Filler 1: Fundo desfocado com as cores do próprio convite */}
                <img
                  src={conviteImg}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-125 pointer-events-none"
                />

                {/* Filler 2: Padrão subtil de textura WhatsApp nos fillers */}
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
                    backgroundSize: "16px 16px",
                  }}
                />

                {/* Imagem do convite sem corte e com proporção 100% original */}
                <img
                  src={conviteImg}
                  alt="Convite Digital Leni's FunPark"
                  className="relative z-10 w-full max-h-[82%] object-contain drop-shadow-2xl px-1.5"
                />
              </div>

              {/* Barra inferior estilo WhatsApp */}
              <div className="absolute bottom-0 inset-x-0 pb-5 pt-3 px-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-20 flex items-center gap-2 text-white">
                <div className="flex-1 bg-white/15 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-2 text-white/80 border border-white/10">
                  <Smile size={16} className="text-white/70 shrink-0" />
                  <span className="flex-1 truncate text-white/70 text-[11px]">
                    Responder a Leni's FunPark...
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#00a884] flex items-center justify-center text-white shrink-0 shadow-md">
                  <Send size={14} className="ml-0.5" />
                </div>
              </div>
            </div>
          </motion.div>

          <div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
              <Smartphone className="text-white" size={32} />
            </div>
            <h2 className="text-4xl font-black mb-6">
              Convites Digitais Prontos a Enviar
            </h2>
            <p className="text-lg text-white/90 leading-relaxed">
              Sabemos que organizar uma festa dá trabalho. Por isso, ao reservar
              a sua festa no Leni's FunPark, disponibilizamos convites digitais
              personalizados e otimizados para WhatsApp. É só reencaminhar para
              o seu grupo!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
