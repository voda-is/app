import ClipLoader from "react-spinners/ClipLoader";

interface CustomLoadingProps {
  color?: string;
  size?: string;
}

export const CircularLoading = (props: CustomLoadingProps) => {
  return (
    <ClipLoader color={props.color || "#37D8FA"} size={props.size || "14px"} />
  );
};
