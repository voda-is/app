import React from "react";

interface ProgressBarProps {
  totalSeconds: number; // 总时间
  elapsedTime: number; // 已消耗的时间
}

const ProgressBar: React.FC<ProgressBarProps> = ({ totalSeconds, elapsedTime }) => {
  const progress = Math.max(0, Math.min(1, (totalSeconds - elapsedTime) / totalSeconds)); // 计算进度
  const newProgress = progress * 100; // 转换为百分比

  return (
    <div className="relative w-full h-[31px] bg-[#5D5D5D] rounded flex items-center">
      <div
        className="absolute h-full rounded"
        style={{
          width: `${newProgress}%`,
          backgroundColor: newProgress > 0 ? "#FFF068" : "#5D5D5D",
        }}
      />
      <div className="text-[14px] text-center text-[#10B981] z-10 w-full">
        The current session ends in {totalSeconds - elapsedTime}s
      </div>
    </div>
  );
};

export default ProgressBar; 