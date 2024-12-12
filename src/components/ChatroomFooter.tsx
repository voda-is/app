interface ChatroomFooterProps {
  isCurrentSpeaker: boolean;
  hijackCost: { cost: number };
  onHijack: () => void;
  onReaction: (type: string) => void;
  disabled?: boolean;
}

export function ChatroomFooter({
  isCurrentSpeaker,
  hijackCost,
  onHijack,
  onReaction,
  disabled,
}: ChatroomFooterProps) {
  const reactions = [
    { emoji: "❤️", name: "heart" },
    { emoji: "💩", name: "poop" },
  ];

  if (isCurrentSpeaker) {
    return null;
  }

  return (
    <div className="flex items-center p-4 backdrop-blur-xl bg-black/20">
      <div className="flex items-center justify-between w-full space-x-3">
        {/* Hijack Button */}
        <button
          onClick={onHijack}
          disabled={disabled}
          className="flex-1 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white px-6 py-4 rounded-xl flex items-center justify-center space-x-4 disabled:opacity-50 transition-colors"
        >
          <div className="bg-emerald-500/20 px-4 rounded-full flex items-center">
            <span className="text-lg font-semibold text-emerald-400">{`${hijackCost.cost}`}</span>
          </div>
          <span className="text-lg font-bold">HIJACK⚡️</span>
        </button>

        {/* Reactions */}
        {reactions.map((reaction) => (
          <button
            key={reaction.name}
            onClick={() => onReaction(reaction.name)}
            disabled={disabled}
            className="text-white text-base bg-white/10 hover:bg-white/20 backdrop-blur-sm px-5 py-4 rounded-xl disabled:opacity-50 transition-colors"
          >
            {reaction.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
