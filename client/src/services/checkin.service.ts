import { GuestCheckinInfo, CheckInResponse } from "@/types/checkin";
import api from "./api";
import imageCompression from "browser-image-compression";
import { blobToFile } from "@/utils/blobToFile";

export const CheckinService = {
  async uploadGuestImage(guestImage: string | null): Promise<string> {
    if (!guestImage) return "";

    const formData = new FormData();

    if (guestImage.startsWith("data:")) {
      const blob = await fetch(guestImage).then((res) => res.blob());

      const file = blobToFile(blob, "guest-image.jpg");

      const compressedImage = await imageCompression(file, {
        maxSizeMB: 2,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      });

      const compressedFile = blobToFile(
        compressedImage,
        "guest-image.jpg",
        compressedImage.lastModified
      );

      formData.append("image", compressedFile);
    } else {
      formData.append("image", guestImage);
    }

    const response = await api.post("/guests/checkin/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data;
  },

  async checkinGuest(checkinDto: GuestCheckinInfo): Promise<CheckInResponse> {
    const response = await api.post("/guests/checkin", checkinDto, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data.data;
  },
};
