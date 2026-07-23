export interface HeaderSectionProps {
  onLogout: () => void;
}

export default function HeaderSection({ onLogout }: HeaderSectionProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-3xl shadow-sm border-2 border-surface-alt gap-4">
      <h1 className="text-3xl font-black text-secondary">Área Reservada</h1>
      <button 
        onClick={onLogout} 
        className="px-6 py-2 bg-surface-alt text-secondary font-bold rounded-xl hover:bg-surface transition-colors"
      >
        Sair
      </button>
    </div>
  );
}
