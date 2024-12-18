import { User } from "@/lib/validations";
import { FiAward, FiClock, FiInfo } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const handleProfileClick = () => {
    router.push('/profile?tab=points');
    onClose();
  };

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
            <button 
              onClick={handleProfileClick}
              className="flex flex-col items-center w-full mb-6 group transition-all active:scale-98"
            >
              <div className="relative w-20 h-20 mb-3">
                <Image
                  src={user.profile_photo || "/bg2.png"}
                  alt={user.first_name}
                  fill
                  className="object-cover rounded-full border-2 border-white/10 group-hover:border-emerald-300/50 transition-all"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-600/40 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                  <svg 
                    className="w-4 h-4 text-emerald-300" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              <span className="text-white text-xl font-medium group-hover:text-emerald-300 transition-colors">
                {user.first_name}
              </span>
            </button>
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

            {/* Add link to profile at the bottom */}
            <Link
              href="/profile?tab=points"
              className="w-full flex items-center justify-center gap-2 text-white/60 hover:text-white transition-colors mt-4"
              onClick={onClose}
            >
              <FiInfo className="w-4 h-4" />
              <span className="text-sm">View detailed points guide</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 