import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

import type { ReactNode } from 'react';

export interface FAQItem {
  q: string;
  a: ReactNode;
}

export interface FAQProps {
  faqs: FAQItem[];
}

export default function FAQ({ faqs }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-surface max-w-3xl mx-auto px-4 w-full">
      <h2 className="text-3xl font-black text-center text-secondary mb-12">Perguntas Frequentes</h2>
      {faqs.map((faq, idx) => (
        <div key={idx} className="bg-white border-2 rounded-2xl overflow-hidden mb-4 border-surface-alt">
          <button onClick={() => toggleFAQ(idx)} className="w-full px-6 py-5 text-left flex justify-between font-bold text-secondary">
            {faq.q} <ChevronDown className={openIndex === idx ? "rotate-180 transition-transform" : "transition-transform"} />
          </button>
          <AnimatePresence>
            {openIndex === idx && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 overflow-hidden">
                <p className="pb-5 text-secondary/80">{faq.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </section>
  );
}
