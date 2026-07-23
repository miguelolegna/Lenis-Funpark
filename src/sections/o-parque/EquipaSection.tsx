import { motion } from 'framer-motion';

export interface StaffMember {
  name: string;
  role: string;
  desc: string;
  img: string;
}

export interface EquipaSectionProps {
  staffList: StaffMember[];
}

export default function EquipaSection({ staffList }: EquipaSectionProps) {
  return (
    <section className="py-20 bg-surface-alt">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-secondary">A Nossa Equipa</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-16">
          {staffList.map((staff, idx) => {
            const borderColors = ['border-primary', 'border-accent', 'border-secondary'];
            const borderColor = borderColors[idx % borderColors.length];
            
            return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border-b-4 ${borderColor} flex flex-col`}
            >
              <img 
                src={staff.img} 
                alt={staff.name} 
                loading="lazy"
                className="w-full aspect-[3/4] object-cover rounded-t-xl"
              />
              <div className="p-6 bg-white rounded-b-xl flex-1 flex flex-col items-center text-center">
                <h4 className="text-xl font-bold text-secondary mb-1">{staff.name}</h4>
                <p className="text-sm text-primary font-bold mb-4">{staff.role}</p>
                <p className="text-secondary/70 text-sm leading-relaxed">{staff.desc}</p>
              </div>
            </motion.div>
          )})}
        </div>
      </div>
    </section>
  );
}
