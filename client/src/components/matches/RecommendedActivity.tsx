interface RecommendedActivityProps {
  activity: string;
}

export default function RecommendedActivity({ activity }: RecommendedActivityProps) {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-5 border-l-4 border-purple-500">
      <div className="flex items-start">
        <span className="text-2xl mr-3">💡</span>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-2">Try This Together</h4>
          <p className="text-gray-700 leading-relaxed">{activity}</p>
        </div>
      </div>
    </div>
  );
}





