import React from 'react';

/**
 * Form section component with consistent styling
 */
interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({ 
  title, 
  description, 
  children 
}) => {
  return (
    <div className="bg-white shadow overflow-hidden rounded-brand mb-6">
      <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-moss to-night">
        <h3 className="text-lg font-medium text-white">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-sky-100">{description}</p>
        )}
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        {children}
      </div>
    </div>
  );
};

/**
 * Input field with Kyndly styling
 */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  icon, 
  error, 
  ...props 
}) => {
  return (
    <div className="mb-4">
      <label className="mb-2 block text-base font-medium text-night dark:text-white">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}
        <input
          className={`w-full bg-transparent rounded-brand border ${
            error ? 'border-red-500' : 'border-gray-300 dark:border-night-700'
          } py-3 px-5 ${
            icon ? 'pl-12' : 'pl-5'
          } text-night dark:text-white outline-none transition focus:border-seafoam active:border-seafoam disabled:cursor-default disabled:bg-gray-100 disabled:text-gray-500`}
          {...props}
        />
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
};

/**
 * Select component with Kyndly styling
 */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Array<{ value: string; label: string }>;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({ 
  label, 
  options, 
  error, 
  ...props 
}) => {
  return (
    <div className="mb-4">
      <label className="mb-2 block text-base font-medium text-night dark:text-white">
        {label}
      </label>
      <select
        className={`w-full bg-transparent rounded-brand border ${
          error ? 'border-red-500' : 'border-gray-300 dark:border-night-700'
        } py-3 px-5 text-night dark:text-white outline-none transition focus:border-seafoam active:border-seafoam disabled:cursor-default disabled:bg-gray-100`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
};

/**
 * Textarea component with Kyndly styling
 */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ 
  label, 
  error, 
  ...props 
}) => {
  return (
    <div className="mb-4">
      <label className="mb-2 block text-base font-medium text-night dark:text-white">
        {label}
      </label>
      <textarea
        className={`w-full bg-transparent rounded-brand border ${
          error ? 'border-red-500' : 'border-gray-300 dark:border-night-700'
        } py-3 px-5 text-night dark:text-white outline-none transition focus:border-seafoam active:border-seafoam disabled:cursor-default disabled:bg-gray-100`}
        {...props}
      />
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
};

/**
 * Checkbox component with Kyndly styling
 */
interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ 
  label, 
  ...props 
}) => {
  return (
    <div className="flex items-start mb-4">
      <div className="flex items-center h-5">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-seafoam focus:ring-seafoam"
          {...props}
        />
      </div>
      <div className="ml-3">
        <label className="text-sm font-medium text-night dark:text-white">
          {label}
        </label>
      </div>
    </div>
  );
};

/**
 * Radio button component with Kyndly styling
 */
interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Radio: React.FC<RadioProps> = ({ 
  label, 
  ...props 
}) => {
  return (
    <div className="flex items-start mb-4">
      <div className="flex items-center h-5">
        <input
          type="radio"
          className="h-4 w-4 border-gray-300 text-seafoam focus:ring-seafoam"
          {...props}
        />
      </div>
      <div className="ml-3">
        <label className="text-sm font-medium text-night dark:text-white">
          {label}
        </label>
      </div>
    </div>
  );
};

/**
 * File input component with Kyndly styling
 */
interface FileInputProps {
  label: string;
  description?: string;
  id: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileName?: string;
  accept?: string;
}

export const FileInput: React.FC<FileInputProps> = ({
  label,
  description,
  id,
  onChange,
  fileName,
  accept
}) => {
  return (
    <div className="mb-4">
      <label className="mb-2 block text-base font-medium text-night dark:text-white">
        {label}
      </label>
      {description && (
        <p className="mb-2 text-sm text-gray-500">{description}</p>
      )}
      <div className="flex items-center">
        <input
          type="file"
          id={id}
          className="sr-only"
          onChange={onChange}
          accept={accept}
        />
        <label
          htmlFor={id}
          className="relative cursor-pointer bg-white rounded-brand font-medium text-seafoam hover:text-seafoam-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-seafoam"
        >
          <span className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-brand bg-white hover:bg-gray-50">
            Choose file
          </span>
        </label>
        <span className="ml-3 text-sm text-gray-500">
          {fileName || 'No file selected'}
        </span>
      </div>
    </div>
  );
};

/**
 * Button component with Kyndly styling
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  ...props
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-brand focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = {
    primary: "bg-seafoam border border-transparent text-white hover:bg-seafoam-600 focus:ring-seafoam",
    secondary: "bg-night border border-transparent text-white hover:bg-night-700 focus:ring-night",
    outline: "bg-white border border-gray-300 text-night hover:bg-gray-50 focus:ring-seafoam"
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};

/**
 * Currency input with Kyndly styling
 */
interface CurrencyInputProps extends Omit<InputProps, 'type'> {
  currency?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label,
  error,
  currency = '$',
  ...props
}) => {
  return (
    <div className="mb-4">
      <label className="mb-2 block text-base font-medium text-night dark:text-white">
        {label}
      </label>
      <div className="flex items-center">
        <span className="h-full rounded-tl-brand rounded-bl-brand border border-r-0 border-gray-300 dark:border-night-700 bg-gray-100 dark:bg-night-800 py-3 px-4 text-base text-night dark:text-white">
          {currency}
        </span>
        <input
          type="text"
          className={`w-full bg-transparent rounded-tr-brand rounded-br-brand border ${
            error ? 'border-red-500' : 'border-gray-300 dark:border-night-700'
          } py-3 px-5 text-night dark:text-white outline-none transition focus:border-seafoam active:border-seafoam disabled:cursor-default disabled:bg-gray-100`}
          {...props}
        />
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}; 