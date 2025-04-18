import { Check, X } from 'lucide-react';

export const SentimentTag = ({ 
  name, 
  sentiment = 'neutral', 
  count = null,
  isSelected = false, 
  onClick = () => {} 
}) => {
  // Define icon based on sentiment (no icon for neutral)
  const getIcon = () => {
    switch (sentiment) {
      case 'positive':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'negative':
        return <X className="h-4 w-4 text-red-600" />;
      case 'neutral':
        return null;
      default:
        return null;
    }
  };

  const baseStyles = "flex items-center gap-1.5 px-3 py-1 rounded-full text-sm transition-all cursor-pointer border";
  const selectedStyles = isSelected 
    ? "border-gray-700 bg-gray-100 font-semibold" 
    : "border-gray-200 hover:border-gray-400";

  return (
    <div 
      className={`${baseStyles} ${selectedStyles}`}
      onClick={onClick}
    >
      {getIcon()}
      <span>{name}</span>
    </div>
  );
};

export const SentimentSwitch = ({ 
  activeSentiment, 
  onChange,
  positive = 0,
  negative = 0,
  neutral = 0
}) => {
  const baseButtonClass = "px-3 py-1 text-xs rounded-md";
  const activeClass = "font-semibold";
  
  const buttonStyles = {
    negative: `${baseButtonClass} ${activeSentiment === 'negative' ? activeClass + ' bg-red-100 text-red-800' : 'text-red-700'}`,
    neutral: `${baseButtonClass} ${activeSentiment === 'neutral' ? activeClass + ' bg-gray-100 text-gray-800' : 'text-gray-700'}`,
    positive: `${baseButtonClass} ${activeSentiment === 'positive' ? activeClass + ' bg-green-100 text-green-800' : 'text-green-700'}`
  };

  return (
    <div className="inline-flex items-center space-x-1 border rounded-lg overflow-hidden bg-gray-50 p-1">
      <button 
        className={buttonStyles.negative}
        onClick={() => onChange('negative')}
      >
        <div className="flex items-center gap-1">
          <span>Negative</span>
          <span className="text-xs">({negative})</span>
        </div>
      </button>
      <button
        className={buttonStyles.neutral}
        onClick={() => onChange('neutral')}
      >
        <div className="flex items-center gap-1">
          <span>Neutral</span>
          <span className="text-xs">({neutral})</span>
        </div>
      </button>
      <button 
        className={buttonStyles.positive}
        onClick={() => onChange('positive')}
      >
        <div className="flex items-center gap-1">
          <span>Positive</span>
          <span className="text-xs">({positive})</span>
        </div>
      </button>
    </div>
  );
};