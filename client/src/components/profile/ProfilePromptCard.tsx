import { useState, useEffect } from 'react';

interface ProfilePromptCardProps {
  title: string;
  placeholder: string;
  value: string | null;
  onChange: (value: string) => void;
  onSkip: () => void;
  autoSave?: boolean;
}

export default function ProfilePromptCard({
  title,
  placeholder,
  value,
  onChange,
  onSkip,
  autoSave = true,
}: ProfilePromptCardProps) {
  const [text, setText] = useState(value || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setText(value || '');
  }, [value]);

  const handleChange = (newValue: string) => {
    setText(newValue);
    onChange(newValue);
    
    if (autoSave) {
      setIsSaving(true);
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 animate-slide-up max-w-2xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
        {autoSave && isSaving && (
          <span className="text-sm text-gray-500">Saving...</span>
        )}
      </div>

      <textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-40 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-800"
        style={{ minHeight: '160px' }}
      />

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={onSkip}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
        >
          Skip for now
        </button>
        {text.trim() && (
          <span className="text-sm text-gray-500">
            {text.split(/\s+/).filter(w => w.length > 0).length} words
          </span>
        )}
      </div>
    </div>
  );
}

