import { useState, useEffect } from 'react';

interface ProfilePromptCardProps {
  title: string;
  placeholder: string;
  value: string | null;
  onChange: (value: string) => void;
  onSkip: () => void;
  autoSave?: boolean;
  isSaving?: boolean;
  onSave?: () => void;
}

export default function ProfilePromptCard({
  title,
  placeholder,
  value,
  onChange,
  onSkip,
  autoSave = true,
  isSaving = false,
  onSave,
}: ProfilePromptCardProps) {
  const [text, setText] = useState(value || '');

  useEffect(() => {
    console.log(`ProfilePromptCard: value prop changed to "${value}"`);
    setText(value || '');
  }, [value]);

  const handleChange = (newValue: string) => {
    console.log(`ProfilePromptCard: user typed "${newValue}"`);
    setText(newValue);
    onChange(newValue);
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
        <div className="flex gap-3">
          <button
            onClick={onSkip}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Skip for now
          </button>
          {onSave && text.trim() && (
            <button
              onClick={onSave}
              disabled={isSaving}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isSaving
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isSaving ? 'Saving...' : 'Save Answer'}
            </button>
          )}
        </div>
        {text.trim() && (
          <span className="text-sm text-gray-500">
            {text.split(/\s+/).filter(w => w.length > 0).length} words
          </span>
        )}
      </div>
    </div>
  );
}


