import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProfilePromptCard from "../components/profile/ProfilePromptCard";
import Header from "../components/Header";
import { User } from "../types/user";

const PROFILE_PROMPTS = [
  {
    key: "relationshipGoals",
    title: "What kind of connection are you open to right now?",
    placeholder: "Friendship / Builders / Mentorship / Dating / Exploration",
  },
  {
    key: "currentFocus",
    title: "Right now, you feel more drawn to:",
    placeholder: "Stability / Exploration / Growth / Collaboration",
  },
  {
    key: "connectionValue",
    title:
      "What would make a new connection feel like a good use of your time?",
    placeholder: "Share what matters to you in building new relationships...",
  },
  {
    key: "currentObsession",
    title: "I'm currently obsessed with…",
    placeholder: "What's capturing your attention and energy right now?",
  },
  {
    key: "endlessTopic",
    title: "A topic I could talk about for hours without getting tired is…",
    placeholder: "What subjects light you up and keep you engaged?",
  },
  {
    key: "curiousThoughts",
    title: "When I'm alone and curious, I tend to think about…",
    placeholder:
      "What questions or ideas occupy your mind when you're by yourself?",
  },
  {
    key: "energizingConversations",
    title: "Which kind of conversations energize you most right now?",
    placeholder:
      "Practical / Applied · Philosophical / Abstract · Emotional / Personal · Playful / Experimental",
  },
  {
    key: "excitedInConversation",
    title: "When I feel excited in a conversation, I usually…",
    placeholder:
      "Talk and explore ideas out loud · Go quiet and focus · Act first, reflect later",
  },
  {
    key: "conversationComfort",
    title: "In conversations, I'm more comfortable with…",
    placeholder: "Precision and clarity · Exploration and ambiguity",
  },
  {
    key: "handlingTension",
    title: "When tension or disagreement appears, I tend to…",
    placeholder:
      "Address it directly · Take time before engaging · Change the subject unless it matters",
  },
  {
    key: "presenceTriggers",
    title: "I feel most present and open when I'm…",
    placeholder:
      "e.g. moving, walking, building, listening, teaching, being outdoors, in silence",
  },
  {
    key: "groundingPractices",
    title:
      "What usually helps you feel grounded enough to really meet another person?",
    placeholder: "What practices or conditions help you show up authentically?",
  },
  {
    key: "patternsToMoveBeyond",
    title: "A pattern I'm currently trying to move beyond is…",
    placeholder: "What habits or behaviors are you working to change?",
  },
  {
    key: "growthThroughChallenge",
    title: "I tend to grow most when people challenge me on…",
    placeholder: "What areas benefit from constructive feedback and challenge?",
  },
  {
    key: "connectionComfortLevel",
    title: "I want new connections to be:",
    placeholder:
      "Mostly comfortable · Slightly challenging · Actively stretching",
  },
  {
    key: "buildExploreCreate",
    title:
      "Something I'd love to build, explore, or create with the right person is…",
    placeholder:
      "What projects or experiences are you excited to pursue collaboratively?",
  },
  {
    key: "closingOffTriggers",
    title: "In new connections, I tend to close off when…",
    placeholder: "What situations or dynamics make you withdraw?",
  },
  {
    key: "feelingMostMyself",
    title: 'I feel most like "myself" when I\'m…',
    placeholder:
      "What activities or states help you feel most authentic and connected to yourself?",
  },
];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [profileData, setProfileData] = useState<Partial<User>>(
    () => user || {}
  );
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync profileData when user object updates (e.g., after save or initial load)
  useEffect(() => {
    if (user) {
      setProfileData((prev) => ({ ...prev, ...user }));
    }
  }, [user]);

  // Force immediate save
  const saveImmediately = useCallback(
    async (key: string, value: string | null) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      try {
        setSaving(true);
        console.log(`Saving ${key}:`, value);
        const result = await updateUser({ [key]: value });
        console.log(`Save result for ${key}:`, result);
        return result;
      } catch (error) {
        console.error("Failed to save:", error);
        throw error;
      } finally {
        setSaving(false);
      }
    },
    [updateUser]
  );

  // Debounced save function
  const debouncedSave = useCallback(
    async (key: string, value: string | null) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          setSaving(true);
          await updateUser({ [key]: value });
        } catch (error) {
          console.error("Failed to save:", error);
        } finally {
          setSaving(false);
        }
      }, 1000); // Wait 1 second after user stops typing
    },
    [updateUser]
  );

  const handleChange = (key: string, value: string) => {
    console.log(`handleChange: ${key} = "${value}"`);
    const updated = { ...profileData, [key]: value || null };
    setProfileData(updated);
    console.log(`profileData updated for ${key}:`, updated[key]);

    // Debounced auto-save
    debouncedSave(key, value || null);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleSkip = async () => {
    // Save current question's answer immediately
    const currentValue = profileData[currentPrompt.key as keyof User];
    if (currentValue !== undefined) {
      await saveImmediately(currentPrompt.key, currentValue as string | null);
    }

    if (currentPromptIndex < PROFILE_PROMPTS.length - 1) {
      setCurrentPromptIndex(currentPromptIndex + 1);
    } else if (hasMinimumRequired) {
      navigate("/dashboard");
    }
    // If minimum not met, stay on current page (no navigation)
  };

  const handlePrevious = () => {
    if (currentPromptIndex > 0) {
      setCurrentPromptIndex(currentPromptIndex - 1);
    }
  };

  // Calculate completed questions
  const getCompletedQuestionsCount = () => {
    return PROFILE_PROMPTS.filter((prompt) => {
      const value = profileData[prompt.key as keyof User];
      return value && value.toString().trim().length > 0;
    }).length;
  };

  const completedQuestionsCount = getCompletedQuestionsCount();
  const minimumRequired = 5;
  const hasMinimumRequired = completedQuestionsCount >= minimumRequired;

  const currentPrompt = PROFILE_PROMPTS[currentPromptIndex];
  const progress = ((currentPromptIndex + 1) / PROFILE_PROMPTS.length) * 100;

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header title="Edit Your Profile" showProfileButton={false}>
        <p className="text-gray-600 mt-1">
          Complete at least {minimumRequired} questions to unlock matching
        </p>
        <p
          className={`text-sm font-medium mt-1 ${
            hasMinimumRequired ? "text-green-600" : "text-orange-600"
          }`}
        >
          {completedQuestionsCount} of {PROFILE_PROMPTS.length} questions
          completed
          {hasMinimumRequired && " ✓ Ready to match!"}
        </p>
      </Header>

      {/* Progress */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              hasMinimumRequired ? "bg-indigo-600" : "bg-orange-400"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm text-gray-600">
            Prompt {currentPromptIndex + 1} of {PROFILE_PROMPTS.length}
          </p>
          <p
            className={`text-sm font-medium ${
              hasMinimumRequired ? "text-green-600" : "text-orange-600"
            }`}
          >
            {completedQuestionsCount} of {PROFILE_PROMPTS.length} questions
            completed
            {hasMinimumRequired && " ✓"}
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProfilePromptCard
          title={currentPrompt.title}
          placeholder={currentPrompt.placeholder}
          value={profileData[currentPrompt.key as keyof User] as string | null}
          onChange={(value) => handleChange(currentPrompt.key, value)}
          onSkip={handleSkip}
          onSave={async () => {
            console.log(`Save button clicked for ${currentPrompt.key}`);
            const currentValue = profileData[currentPrompt.key as keyof User];
            console.log(
              `Current value for ${currentPrompt.key}:`,
              currentValue
            );
            if (currentValue !== undefined) {
              await saveImmediately(
                currentPrompt.key,
                currentValue as string | null
              );
            }
          }}
          autoSave={true}
          isSaving={saving}
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

          <div className="text-center">
            {!hasMinimumRequired && (
              <p className="text-sm text-orange-600 mb-2">
                Answer {minimumRequired - completedQuestionsCount} more question
                {minimumRequired - completedQuestionsCount !== 1 ? "s" : ""} to
                unlock matching
              </p>
            )}
            <button
              onClick={async () => {
                try {
                  // Save current answer before navigating
                  const currentValue =
                    profileData[currentPrompt.key as keyof User];
                  if (currentValue !== undefined) {
                    await saveImmediately(
                      currentPrompt.key,
                      currentValue as string | null
                    );
                  }

                  // Clear any pending debounced saves
                  if (saveTimeoutRef.current) {
                    clearTimeout(saveTimeoutRef.current);
                    saveTimeoutRef.current = null;
                  }

                  // Navigate to dashboard (matches)
                  console.log("Navigating to dashboard...");
                  navigate("/dashboard");
                } catch (error) {
                  console.error("Error saving before navigation:", error);
                  // Still navigate even if save fails - user can retry later
                  navigate("/dashboard");
                }
              }}
              disabled={!hasMinimumRequired || saving}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                hasMinimumRequired && !saving
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {saving
                ? "Saving..."
                : hasMinimumRequired
                ? "Done - View Matches"
                : `Complete ${minimumRequired - completedQuestionsCount} More`}
            </button>
          </div>

          <button
            onClick={handleSkip}
            disabled={
              !hasMinimumRequired &&
              currentPromptIndex === PROFILE_PROMPTS.length - 1
            }
            className={`px-6 py-3 font-medium transition-colors ${
              !hasMinimumRequired &&
              currentPromptIndex === PROFILE_PROMPTS.length - 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {currentPromptIndex === PROFILE_PROMPTS.length - 1
              ? "Finish"
              : "Skip →"}
          </button>
        </div>

        {/* All Prompts Overview */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              All Profile Sections
            </h3>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                hasMinimumRequired
                  ? "bg-green-100 text-green-800"
                  : "bg-orange-100 text-orange-800"
              }`}
            >
              {completedQuestionsCount}/{minimumRequired} required
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PROFILE_PROMPTS.map((prompt, index) => (
              <button
                key={prompt.key}
                onClick={() => setCurrentPromptIndex(index)}
                className={`p-3 rounded-lg text-left text-sm transition-colors ${
                  index === currentPromptIndex
                    ? "bg-indigo-100 text-indigo-700 font-medium"
                    : profileData[prompt.key as keyof User]
                    ? "bg-green-50 text-green-700 hover:bg-green-100"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
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
