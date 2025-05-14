"use client";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Clear form after successful submission
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      setSuccessMessage("Thank you! Your message has been sent successfully.");
    } catch (error) {
      setErrorMessage("Failed to send message. Please try again later.");
      console.error("Contact form error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Contact Us</h1>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
            {errorMessage}
          </div>
        )}

        <div className="mb-8">
          <p className="text-gray-600 text-center">
            Have questions or need assistance? Fill out the form below and our
            team will get back to you as soon as possible.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Your name"
                className="w-full"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Your email address"
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Subject
            </label>
            <Input
              id="subject"
              name="subject"
              type="text"
              value={formData.subject}
              onChange={handleChange}
              required
              placeholder="Subject of your message"
              className="w-full"
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              value={formData.message}
              onChange={handleChange}
              required
              placeholder="Your message"
              className="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="text-center">
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              className="w-full md:w-auto px-8"
            >
              Send Message
            </Button>
          </div>
        </form>

        <div className="mt-10 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Other Ways to Reach Us</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Email</h3>
                <p className="mt-1 text-sm text-gray-600">
                  support@gocheckin.com
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Phone</h3>
                <p className="mt-1 text-sm text-gray-600">+1 (555) 123-4567</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
