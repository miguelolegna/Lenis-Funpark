import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface PrivacyTermsCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export default function PrivacyTermsCheckbox({
  checked,
  onChange,
  id = 'privacy-terms-checkbox',
  name = 'accept_privacy_terms',
  required = true,
  disabled = false,
  error,
  className = ''
}: PrivacyTermsCheckboxProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label
        htmlFor={id}
        className={`group relative flex items-start gap-3 p-3.5 rounded-2xl border-2 transition-all cursor-pointer select-none ${
          disabled
            ? 'opacity-60 cursor-not-allowed bg-gray-50 border-gray-200'
            : checked
            ? 'border-primary/60 bg-primary/5 shadow-xs'
            : error
            ? 'border-red-300 bg-red-50/50'
            : 'border-surface-alt bg-surface-alt/50 hover:bg-surface-alt hover:border-primary/30'
        }`}
      >
        <input
          type="checkbox"
          id={id}
          name={name}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          required={required}
          disabled={disabled}
          className="sr-only"
        />

        <div
          className={`w-5 h-5 rounded-lg border-2 mt-0.5 flex items-center justify-center shrink-0 transition-all ${
            checked
              ? 'bg-primary border-primary text-white scale-105'
              : error
              ? 'bg-white border-red-400'
              : 'bg-white border-secondary/30 group-hover:border-primary'
          }`}
        >
          {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </div>

        <span className="text-xs sm:text-sm font-semibold text-secondary leading-snug">
          Ao submeter este formulário, concordo com a{' '}
          <Link
            to="/politica-privacidade"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-primary underline hover:text-secondary font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-sm"
          >
            Política de Privacidade
          </Link>{' '}
          e com os{' '}
          <Link
            to="/termos-condicoes"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-primary underline hover:text-secondary font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-sm"
          >
            Termos e Condições
          </Link>
          {required && <span className="text-primary ml-0.5">*</span>}
        </span>
      </label>

      {error && (
        <p role="alert" className="text-xs font-bold text-red-600 pl-1">
          {error}
        </p>
      )}
    </div>
  );
}
