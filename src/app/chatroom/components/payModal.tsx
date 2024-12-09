import CustomModal from "@/components/CustomModal";
import React, { useState } from "react";
import Image from "next/image";
import { CustomButton } from "@/components/CustomButton";
import PaySuccessModal from "./paySuccess";

interface PayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PayModal: React.FC<PayModalProps> = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  return (
    <>
      <CustomModal isOpen={isOpen} onRequestClose={onClose}>
        <div className="flex flex-col items-center">
          <Image src="/modal/time.png" alt="pay" width={74} height={74} />
          <h2 className="text-[16px] font-semibold mt-4">
            Someone is trying to take your spot
          </h2>
          <div className="flex justify-center items-center flex-row my-4">
            <div className="bg-[#10B981] text-black rounded-lg px-3 py-1 text-[27px] mr-2 w-[38px] h-[45px]">
              0
            </div>
            <div className="bg-[#10B981] text-black rounded-lg px-3 py-1 text-[27px] w-[38px] h-[45px]">
              1
            </div>
            <div className="text-[#10B981] px-2 font-bold text-[27px]">:</div>
            <div className="bg-[#10B981] text-black rounded-lg px-3 py-1 text-[27px] w-[38px] h-[45px] mr-2">
              5
            </div>
            <div className="bg-[#10B981] text-black rounded-lg px-3 py-1 text-[27px] w-[38px] h-[45px]">
              2
            </div>
          </div>
          <div className="text-[14px] text-center font-semibold">
            You have the priority to chat, pay{" "}
            <span className="text-[#10B981]">{`${200} points`}</span> to keep
            your spot.
          </div>
          <div className="flex justify-between mt-4 w-full">
            <CustomButton
              containerClassName="mr-4"
              type="secondary"
              onClick={onClose}
            >
              Not now
            </CustomButton>
            <CustomButton type="primary" onClick={onSuccess}>
              Pay
            </CustomButton>
          </div>
        </div>
      </CustomModal>
    </>
  );
};

export default PayModal;
