import { UserPoints } from './validations';

export async function hashText(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

export const getCustomModalStyles = (options?: {
  darkMode?: boolean;
  right?: number;
  hideBorder?: boolean;
  height?: number;
  width?: number;
}) => {
  return {
    content: {
      top: "50%",
      left: "50%",
      padding: 16,
      height: options?.height || 347,
      right: `${options?.right || 68}px`,
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      border: options?.hideBorder ? "none" : "1px solid #10B981",
      borderRadius: 48,
      background: "rgba(0, 0, 0, 0.3)",
      outline: 0,
      animation: "bounceIn .4s ease-out",
      overflow: "hidden",
    },
    overlay: {
      background: "rgba(0, 0, 0, 0.7)",
      zIndex: 100,
    },
  };
};

export function getAvailableBalance(userPoints: UserPoints): number {
  return userPoints.running_purchased_balance + userPoints.running_claimed_balance + userPoints.running_misc_balance;
}

const DAILY_CLAIM_COOLDOWN = 24 * 60 * 60; // 24 hours in seconds

export function getNextClaimTime(lastClaimTime: number): {
  canClaim: boolean;
  timeLeft: string;
} {
  const now = Math.floor(Date.now() / 1000); // Convert current time to seconds
  const nextClaimTime = lastClaimTime + DAILY_CLAIM_COOLDOWN;
  const timeLeftSeconds = nextClaimTime - now;
  const canClaim = timeLeftSeconds <= 0;

  if (canClaim) {
    return { canClaim: true, timeLeft: "Ready to claim!" };
  }

  // Convert seconds to hours and minutes
  const hours = Math.floor(timeLeftSeconds / 3600);
  const minutes = Math.floor((timeLeftSeconds % 3600) / 60);
  
  return {
    canClaim: false,
    timeLeft: `${hours}h ${minutes}m`,
  };
}
