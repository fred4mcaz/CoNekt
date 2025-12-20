import { useState } from 'react';

interface ConversationStartersProps {
  questions: string[];
}

export default function ConversationStarters({ questions }: ConversationStartersProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="bg-blue-50 rounded-xl p-5 border-l-4 border-blue-500">
      <h4 className="font-semibold text-gray-900 mb-4">Questions to Spark Connection</h4>
      <div className="space-y-3">
        {questions.map((question, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-4 flex justify-between items-start group hover:shadow-md transition-shadow"
          >
            <p className="text-gray-800 flex-1 pr-4 leading-relaxed">{question}</p>
            <button
              onClick={() => copyToClipboard(question, index)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Copy question"
            >
              {copiedIndex === index ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

