import Image from "next/image";
import { User } from "@/lib/types";

type Props = {
  isExpanded: boolean;
  onClose: () => void;
  currentUser: User[];
  userOnStageId?: string;
};

export function UsersExpandedView({
  isExpanded,
  onClose,
  currentUser,
  userOnStageId,
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
            <h3 className="text-white text-lg font-medium">
              Online Users ({currentUser.length})
            </h3>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4 w-full max-h-[60vh] overflow-y-auto p-4">
            {currentUser.map((user) => {
              return (
                <div
                  key={user._id}
                  className="flex flex-col items-center space-y-2"
                >
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/10">
                    <Image
                      src={user.profile.avatar || "/bg2.png"}
                      alt={user.profile.first_name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                    {user._id === userOnStageId && (
                      <div className="absolute inset-0 ring-2 ring-pink-500 ring-offset-2 ring-offset-black/90 rounded-full" />
                    )}
                  </div>
                  <span className="text-white/90 text-sm text-center font-medium truncate max-w-full px-2">
                    {user.profile.first_name}
                  </span>
                  {user._id === userOnStageId && (
                    <span className="text-xs text-pink-500">Speaking</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
