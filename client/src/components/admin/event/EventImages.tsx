import { EventStatus } from "@/types/event";
import { useEffect, useRef, useState } from "react";
import { Event } from "@/types/event";

export default function EventImages({ event }: { event: Event }) {
  const uploadEventImages = useRef<HTMLInputElement>(null);
  const [eventImages, setEventImages] = useState<File[]>([]);
  const [eventImageUrls, setEventImageUrls] = useState<string[]>([]);
  const [removedImageIndices, setRemovedImageIndices] = useState<number[]>([]);
  // Add this useEffect to load event images
  useEffect(() => {
    const loadEventImages = async () => {
      if (event && event.images) {
        setEventImageUrls(event.images);
      }
    };
    loadEventImages();
  }, [event]);

  // Add these event handler functions
  const handleEventImagesClick = () => {
    if (uploadEventImages.current) {
      uploadEventImages.current.click();
    }
  };

  const handleEventImagesUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);

    // Add file size validation
    const oversizedFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert("Some files exceed the 5MB limit");
      return;
    }

    // Add file type validation
    const invalidFiles = files.filter((file) => !file.type.match(/^image\//));
    if (invalidFiles.length > 0) {
      alert("Only image files are allowed");
      return;
    }

    // Check if adding these files would exceed the 3 image limit
    const currentImageCount =
      eventImageUrls.length - removedImageIndices.length;
    if (currentImageCount + files.length > 3) {
      alert("You can only have up to 3 images total");
      return;
    }

    setEventImages((prevImages) => [...prevImages, ...files]);

    // Create preview URLs
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEventImageUrls((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeEventImage = (index: number) => {
    // If the image is from the server (already uploaded)
    if (index < (event?.images?.length || 0)) {
      setRemovedImageIndices((prev) => [...prev, index]);
    } else {
      // If it's a newly added image
      const adjustedIndex = index - (event?.images?.length || 0);
      const newEventImages = [...eventImages];
      newEventImages.splice(adjustedIndex, 1);
      setEventImages(newEventImages);
    }

    setEventImageUrls((prev) => prev.filter((_, i) => i !== index));
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Event Images</h2>
        {event.eventStatus === EventStatus.PUBLISHED && (
          <div>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              ref={uploadEventImages}
              onChange={handleEventImagesUpload}
            />
            {eventImageUrls.length - removedImageIndices.length < 3 && (
              <button
                type="button"
                onClick={handleEventImagesClick}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Images
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        {eventImageUrls.map((image, index) => (
          <div
            key={index}
            className="relative"
            style={{
              display: removedImageIndices.includes(index) ? "none" : "block",
            }}
          >
            <img
              src={image}
              alt={`Event image ${index + 1}`}
              width={200}
              height={150}
              className="rounded-md object-cover"
            />
            {event.eventStatus === EventStatus.PUBLISHED && (
              <button
                type="button"
                onClick={() => removeEventImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 focus:outline-none"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        {eventImageUrls.length === 0 && (
          <div className="flex items-center justify-center h-[150px] w-full border-2 border-dashed border-gray-300 rounded-md">
            <p className="text-gray-500">No images uploaded</p>
          </div>
        )}
      </div>
    </div>
  );
}
