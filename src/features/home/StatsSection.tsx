import React from 'react';

export function StatsSection() {
  const stats = [
    { value: '10k+', label: 'Saltos Mensais' },
    { value: '500+', label: 'Festas Realizadas' },
    { value: '100%', label: 'Sorrisos' },
  ];

  return (
    <section className="bg-[#082E32] py-16 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-center md:justify-between items-center gap-12 md:gap-8 text-center px-8 md:px-24">
        {stats.map((stat, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <h3 className="text-5xl md:text-6xl font-bold text-brand-yellow">
              {stat.value}
            </h3>
            <p className="text-brand-light/80 font-medium text-lg uppercase tracking-wide">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
