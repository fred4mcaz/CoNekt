import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfilePromptCard from '../components/profile/ProfilePromptCard';
import { User } from '../types/user';

const PROFILE_PROMPTS = [
  {
    key: 'culturalUpbringing',
    title: 'Tell us about your cultural background',
    placeholder: 'Where are you from? How did your background shape you? Share as much or as little as feels right.',
  },
  {
    key: 'interests',
    title: 'What lights you up?',
    placeholder: 'Books, movies, ideas, hobbies, experiences - what captures your imagination?',
  },
  {
    key: 'career',
    title: 'Describe your work or passion',
    placeholder: 'What do you do? What are you building? What drives you professionally?',
  },
  {
    key: 'relationshipGoals',
    title: 'What are you looking for?',
    placeholder: 'Friends? Cofounders? Study partners? Mentors? Tell us what kind of connections you\'re seeking.',
  },
  {
    key: 'keystoneValues',
    title: 'What matters most to you?',
    placeholder: 'What are your core values? What principles guide you? Share what feels important.',
  },
  {
    key: 'favoriteBooks',
    title: 'What books have influenced you?',
    placeholder: 'Share books that have shaped your thinking, or describe your reading preferences.',
  },
  {
    key: 'favoriteAuthors',
    title: 'Who are the thinkers you admire?',
    placeholder: 'Authors, speakers, podcast hosts, thought leaders - who influences your perspective?',
  },
  {
    key: 'hobbies',
    title: 'What do you love doing?',
    placeholder: 'Your hobbies, activities, and interests - what brings you joy?',
  },
  {
    key: 'lifePhilosophy',
    title: 'Your life philosophy',
    placeholder: 'What\'s your worldview? What beliefs guide how you live?',
  },
  {
    key: 'whatImLookingFor',
    title: 'Describe your ideal connection',
    placeholder: 'What kind of person are you hoping to connect with? What qualities matter to you?',
  },
];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [profileData, setProfileData] = useState<Partial<User>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData(user);
    }
  }, [user]);

  const handleChange = async (key: string, value: string) => {
    const updated = { ...profileData, [key]: value || null };
    setProfileData(updated);

    // Auto-save
    try {
      setSaving(true);
      await updateUser({ [key]: value || null });
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    if (currentPromptIndex < PROFILE_PROMPTS.length - 1) {
      setCurrentPromptIndex(currentPromptIndex + 1);
    } else {
      navigate('/dashboard');
    }
  };

  const handlePrevious = () => {
    if (currentPromptIndex > 0) {
      setCurrentPromptIndex(currentPromptIndex - 1);
    }
  };

  const currentPrompt = PROFILE_PROMPTS[currentPromptIndex];
  const progress = ((currentPromptIndex + 1) / PROFILE_PROMPTS.length) * 100;

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Your Profile</h1>
              <p className="text-gray-600">Share what feels right - everything is optional!</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 text-center">
          Prompt {currentPromptIndex + 1} of {PROFILE_PROMPTS.length}
        </p>
      </div>

      {/* Profile Card */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProfilePromptCard
          title={currentPrompt.title}
          placeholder={currentPrompt.placeholder}
          value={profileData[currentPrompt.key as keyof User] as string | null}
          onChange={(value) => handleChange(currentPrompt.key, value)}
          onSkip={handleSkip}
          autoSave={true}
        />

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentPromptIndex === 0}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Done - View Matches
          </button>

          <button
            onClick={handleSkip}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Skip →
          </button>
        </div>

        {/* All Prompts Overview */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">All Profile Sections</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PROFILE_PROMPTS.map((prompt, index) => (
              <button
                key={prompt.key}
                onClick={() => setCurrentPromptIndex(index)}
                className={`p-3 rounded-lg text-left text-sm transition-colors ${
                  index === currentPromptIndex
                    ? 'bg-indigo-100 text-indigo-700 font-medium'
                    : profileData[prompt.key as keyof User]
                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {prompt.title}
                {profileData[prompt.key as keyof User] && (
                  <span className="ml-2">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

