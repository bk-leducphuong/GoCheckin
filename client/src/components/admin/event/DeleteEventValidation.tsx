import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { EventService } from "@/services/admin/event.service";

interface DeleteEventValidationProps {
  isOpen: boolean;
  eventCode: string;
  onClose: () => void;
}

const DeleteEventValidation: React.FC<DeleteEventValidationProps> = ({
  isOpen,
  eventCode,
  onClose,
}) => {
  const [inputCode, setInputCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleConfirm = async () => {
    if (inputCode === eventCode) {
      await EventService.deleteEvent(eventCode);
      setInputCode("");
      router.push("/admin/events");
    } else {
      setError("Event code does not match");
    }
  };

  const handleCancel = () => {
    setInputCode("");
    onClose();
  };

  if (isOpen) {
    return (
      <div className="flex justify-center items-center flex-col bg-white rounded-lg backdrop-blur-sm shadow-md p-8 max-w-md fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
        <p className="text-center mb-4">
          Please type the event code{" "}
          <strong className="font-semibold">{eventCode}</strong> to confirm
          deletion:
        </p>
        <input
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
          placeholder="Enter event code"
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500 mb-4"
        />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="flex gap-4 w-full">
          <button
            className="flex-1 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-md transition-colors duration-200"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            className="flex-1 border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white px-4 py-2 rounded-md transition-colors duration-200"
            onClick={handleConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    );
  }
};

export default DeleteEventValidation;
