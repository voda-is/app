import React from "react";
import { getCustomModalStyles } from "@/lib/utils";
import Modal from "react-modal";

interface CustomModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  children: React.ReactNode;
}

const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  onRequestClose,
  children,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      style={getCustomModalStyles()}
      onRequestClose={onRequestClose}
      ariaHideApp={false}
    >
      {children}
      {/* <div className="relative flex flex-col items-center">
        <Image
          src={backgroundImageSrc}
          alt="background"
          width={backgroundImageSize.width}
          height={backgroundImageSize.height}
        />
        <div
          className={`absolute top-[${contentTop}%] z-[99] p-4 w-[292px]`}
          style={{ top: `${contentTop}%` }}
        >
          <div className="text-[20px] font-[#052126] text-center z-30 font-medium">
            {title}
          </div>

          <div className="w-full flex flex-col items-center justify-center mt-3 z-10">
            {children}
          </div>

          <CustomButton
            type="primary"
            width="260px"
            height="40px"
            fontSize="18px"
            disabled={btnDisabled}
            loading={btnLoading}
            onClick={btnClick}
            containerClassName="z-30 mt-4"
          >
            {btnText}
          </CustomButton>
        </div>
      </div> */}
    </Modal>
  );
};

export default CustomModal;
