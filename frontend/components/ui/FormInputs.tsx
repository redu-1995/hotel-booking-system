import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

// Reusable TextInput component
export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  helperText,
  error,
  leftIcon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="w-full text-left">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[#1F2937] mb-1.5">
          {label}
        </label>
      )}
      <div className="relative rounded-[8px]">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full bg-white border ${
            error ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/20' : 'border-[#E5E7EB] focus:border-[#12355B] focus:ring-[#12355B]/20'
          } text-[#1F2937] placeholder-[#6B7280] text-sm rounded-[8px] transition-colors duration-150 py-2.5 ${
            leftIcon ? 'pl-10 pr-3.5' : 'px-3.5'
          } focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-1 text-xs text-[#DC2626]">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-[#6B7280]">{helperText}</p>
      ) : null}
    </div>
  );
};

// Reusable DatePickerInput component
export interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const DatePickerInput: React.FC<DatePickerProps> = ({
  label,
  helperText,
  error,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? `date-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="w-full text-left">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[#1F2937] mb-1.5">
          {label}
        </label>
      )}
      <div className="relative rounded-[8px]">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#12355B]">
          <Calendar className="w-4 h-4 text-[#12355B]" />
        </div>
        <input
          id={inputId}
          type="date"
          className={`w-full bg-white border ${
            error ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/20' : 'border-[#E5E7EB] focus:border-[#12355B] focus:ring-[#12355B]/20'
          } text-[#1F2937] text-sm rounded-[8px] transition-colors duration-150 py-2.5 pl-10 pr-3.5 focus:outline-none focus:ring-2 cursor-pointer ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-1 text-xs text-[#DC2626]">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-[#6B7280]">{helperText}</p>
      ) : null}
    </div>
  );
};

// Reusable SelectDropdown component
export interface SelectOption {
  value: string | number;
  label: string;
  sublabel?: string;
}

export interface SelectDropdownProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const SelectDropdown: React.FC<SelectDropdownProps> = ({
  label,
  options,
  helperText,
  error,
  leftIcon,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="w-full text-left">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-[#1F2937] mb-1.5">
          {label}
        </label>
      )}
      <div className="relative rounded-[8px]">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7280]">
            {leftIcon}
          </div>
        )}
        <select
          id={selectId}
          className={`w-full appearance-none bg-white border ${
            error ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/20' : 'border-[#E5E7EB] focus:border-[#12355B] focus:ring-[#12355B]/20'
          } text-[#1F2937] text-sm rounded-[8px] transition-colors duration-150 py-2.5 ${
            leftIcon ? 'pl-10 pr-10' : 'pl-3.5 pr-10'
          } focus:outline-none focus:ring-2 cursor-pointer ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label} {opt.sublabel ? `(${opt.sublabel})` : ''}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#6B7280]">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error ? (
        <p className="mt-1 text-xs text-[#DC2626]">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-[#6B7280]">{helperText}</p>
      ) : null}
    </div>
  );
};

// Reusable TextArea component
export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  helperText,
  error,
  className = '',
  id,
  rows = 4,
  ...props
}) => {
  const areaId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="w-full text-left">
      {label && (
        <label htmlFor={areaId} className="block text-sm font-medium text-[#1F2937] mb-1.5">
          {label}
        </label>
      )}
      <div className="relative rounded-[8px]">
        <textarea
          id={areaId}
          rows={rows}
          className={`w-full bg-white border ${
            error
              ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/20'
              : 'border-[#E5E7EB] focus:border-[#12355B] focus:ring-[#12355B]/20'
          } text-[#1F2937] placeholder-[#6B7280] text-sm rounded-[8px] transition-colors duration-150 p-3.5 focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-1 text-xs text-[#DC2626]">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-[#6B7280]">{helperText}</p>
      ) : null}
    </div>
  );
};
