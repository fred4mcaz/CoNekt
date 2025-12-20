import { useState } from "react";
import { Match } from "../../types/user";
import { UserIcon } from "@heroicons/react/24/outline";
import RecommendedActivity from "./RecommendedActivity";
import ConversationStarters from "./ConversationStarters";

interface MatchCardProps {
  match: Match;
}

export default function MatchCard({ match }: MatchCardProps) {
  const [expanded, setExpanded] = useState(false);
  const {
    user,
    compatibilityScore,
    matchFactors,
    recommendedActivity,
    conversationStarters,
  } = match;

  // Determine icon color based on gender
  const getIconColor = (gender?: string | null) => {
    switch (gender?.toLowerCase()) {
      case "male":
        return "text-blue-300";
      case "female":
        return "text-pink-300";
      case "non-binary":
        return "text-green-300";
      default:
        return "text-indigo-200"; // Generic/unspecified
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-1">
            <UserIcon className={`w-8 h-8 ${getIconColor(user.gender)}`} />
            <h3 className="text-2xl font-bold">{user.name}</h3>
          </div>
          {user.age && <p className="text-indigo-100">{user.age} years old</p>}
          {user.location &&
            typeof user.location === "object" &&
            user.location.city && (
              <p className="text-indigo-100">{user.location.city}</p>
            )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Match Factors */}
        {matchFactors.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">
              Why you match
            </h4>
            <div className="flex flex-wrap gap-2">
              {matchFactors.map((factor, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium"
                >
                  {factor}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Profile Preview */}
        <div className="space-y-3">
          {user.career && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                Work
              </p>
              <p className="text-gray-800 italic">"{user.career}"</p>
            </div>
          )}

          {user.interests && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                Interests
              </p>
              <p className="text-gray-800 italic">
                "{user.interests.substring(0, 150)}
                {user.interests.length > 150 ? "..." : ""}"
              </p>
            </div>
          )}

          {user.keystoneValues && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                Values
              </p>
              <p className="text-gray-800 italic">
                "{user.keystoneValues.substring(0, 150)}
                {user.keystoneValues.length > 150 ? "..." : ""}"
              </p>
            </div>
          )}
        </div>

        {/* Recommended Activity */}
        <RecommendedActivity activity={recommendedActivity} />

        {/* Conversation Starters */}
        <ConversationStarters questions={conversationStarters} />

        {/* Expand Button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-3 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
        >
          {expanded ? "Show Less" : "View Full Profile"}
        </button>

        {/* Expanded Profile */}
        {expanded && (
          <div className="pt-6 border-t border-gray-200 space-y-4 animate-slide-up">
            {user.lifePhilosophy && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  Life Philosophy
                </p>
                <p className="text-gray-600 italic">"{user.lifePhilosophy}"</p>
              </div>
            )}

            {user.favoriteBooks && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  Favorite Books
                </p>
                <p className="text-gray-600 italic">"{user.favoriteBooks}"</p>
              </div>
            )}

            {user.favoriteAuthors && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  Favorite Authors
                </p>
                <p className="text-gray-600 italic">"{user.favoriteAuthors}"</p>
              </div>
            )}

            {user.hobbies && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  Hobbies
                </p>
                <p className="text-gray-600 italic">"{user.hobbies}"</p>
              </div>
            )}

            {user.whatImLookingFor && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  Looking For
                </p>
                <p className="text-gray-600 italic">
                  "{user.whatImLookingFor}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
