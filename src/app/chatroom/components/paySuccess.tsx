import CustomModal from "@/components/CustomModal";
import React from "react";
import Image from "next/image";
import { CustomButton } from "@/components/CustomButton";

interface PaySuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PaySuccessModal: React.FC<PaySuccessModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <CustomModal isOpen={isOpen} onRequestClose={onClose}>
      <div className="flex flex-col items-center">
        <Image src="/modal/success.png" alt="pay" width={262} height={154} />
        <div className="text-[14px] text-center font-semibold mt-5">
          Congrats! You saved your spot, now enjoy your chat with Mia!
        </div>
        <div className="w-full mt-5">
          <CustomButton type="primary" onClick={onClose}>
            OK
          </CustomButton>
        </div>
      </div>
    </CustomModal>
  );
};

export default PaySuccessModal;
