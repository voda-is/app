"use client";
import { CircularLoading } from "./CircularLoading";
import classNames from "classnames";

type ButtonProps = React.PropsWithChildren<{
  disabled?: boolean;
  loading?: boolean;
  type?: "primary" | "secondary";
  width?: string;
  height?: string;
  fontSize?: string;
  classname?: string;
  containerClassName?: string;
  isRegularFont?: boolean;
  isSmall?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}>;

export const CustomButton = ({
  disabled = false,
  loading = false,
  type = "primary",
  width,
  height = "36px",
  fontSize = "14px",
  classname = "",
  containerClassName = "",
  isSmall = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  children,
}: ButtonProps) => {
  const buttonClasses = classNames(
    {
      "cursor-not-allowed opacity-70": disabled || loading,
      "bg-[#10B981] border-[#10B981]":
        !disabled && !loading && type === "primary",
      "hover:bg-[#10B981]/70 active:bg-[#10B981]":
        !disabled && !loading && type === "primary",
      "active:opacity-70 cursor-pointer": !disabled && !loading,
      "translate-x-[-1px] translate-y-[-1px]": isSmall,
    },
    classname
  );

  return (
    <div
      className={`w-full flex items-center justify-center rounded-full border transition-colors duration-250 text-white ${
        type === "secondary"
          ? "border-[#10B981]"
          : "bg-[#10B981] border-[#10B981]"
      } ${containerClassName}`}
    >
      <div
        className={buttonClasses}
        style={{
          width,
          height,
          lineHeight: height,
          fontSize,
        }}
        onClick={(e) => {
          if (!disabled && !loading && onClick) {
            onClick(e);
          }
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {loading && <CircularLoading color="inherit" size={fontSize} />}
        <div className={classNames("flex items-center", { "ml-1": loading })}>
          {children}
        </div>
      </div>
    </div>
  );
};
