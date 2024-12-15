import { User } from "@/lib/validations";
import { FiAward, FiClock } from "react-icons/fi";
import Image from "next/image";

type Props = {
  isExpanded: boolean;
  onClose: () => void;
  user?: User;
  points: number;
  nextClaimTime: string;
  canClaim: boolean;
  onClaim: () => void;
};

export function PointsExpandedView({
  isExpanded,
  onClose,
  user,
  points,
  nextClaimTime,
  canClaim,
  onClaim,
}: Props) {
  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        isExpanded
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={`fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md rounded-t-3xl p-6 transition-transform duration-300 ease-out ${
          isExpanded ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex flex-col items-center">
          <div className="w-12 h-1 bg-white/20 rounded-full mb-6" />

          <div className="flex justify-between items-center w-full mb-6">
            <h3 className="text-white text-lg font-medium">Points Balance</h3>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>

          {user && (
            <div className="flex flex-col items-center w-full mb-8">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white/10 mb-3">
                <Image
                  src={user.profile_photo || "/bg2.png"}
                  alt={user.first_name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <span className="text-white text-xl font-medium">
                {user.first_name}
              </span>
            </div>
          )}

          <div className="w-full space-y-4">
            {/* Current Points */}
            <div className="flex items-center justify-between bg-white/5 rounded-lg p-4">
              <div className="flex items-center">
                <FiAward className="text-pink-500 text-xl mr-3" />
                <div>
                  <div className="text-white/60 text-sm">Available Points</div>
                  <div className="text-white text-lg font-medium">{points}</div>
                </div>
              </div>
            </div>

            {/* Next Claim */}
            <div className="flex items-center justify-between bg-white/5 rounded-lg p-4">
              <div className="flex items-center">
                <FiClock className="text-emerald-500 text-xl mr-3" />
                <div>
                  <div className="text-white/60 text-sm">Next Free Points</div>
                  <div className="text-white text-lg font-medium">
                    {canClaim ? "Available Now!" : nextClaimTime}
                  </div>
                </div>
              </div>
            </div>

            {/* Claim Button - Always visible */}
            <button
              onClick={onClaim}
              disabled={!canClaim}
              className={`w-full font-medium rounded-lg py-3 px-4 transition-colors ${
                canClaim 
                  ? 'bg-emerald-400/80 hover:bg-emerald-400 text-white' 
                  : 'bg-gray-500/50 text-white/60 cursor-not-allowed'
              }`}
            >
              {canClaim ? 'Claim Free Points' : `Claim Available in ${nextClaimTime}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 