import { useState } from 'react';
import { Input } from './Input';
import { Button } from './Button';

interface InputTagProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}

export function InputTag({ value, onChange, suggestions = [], placeholder, label, disabled }: InputTagProps) {
  const [input, setInput] = useState('');

  const addTag = (tag: string) => {
    if (!tag.trim() || value.includes(tag)) return;
    onChange([...value, tag]);
    setInput('');
  };

  const removeTag = (tag: string) => {
    onChange(value.filter(t => t !== tag));
  };

  const filteredSuggestions = suggestions.filter(
    s => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s)
  );

  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map(tag => (
          <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
            {tag}
            <button
              type="button"
              className="ml-2 text-blue-400 hover:text-red-500"
              onClick={() => removeTag(tag)}
              disabled={disabled}
              title="Supprimer"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && input.trim()) {
              e.preventDefault();
              addTag(input.trim());
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 w-full"
        />
        {filteredSuggestions.map(s => (
          <button
            key={s}
            type="button"
            className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium border border-gray-200 hover:bg-primary/10 transition"
            onClick={() => addTag(s)}
            disabled={disabled}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
} 