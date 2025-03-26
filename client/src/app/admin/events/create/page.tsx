'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EventService } from '@/services/event.service';
import { CreateEventRequest } from '@/types/event';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

// Event creation validation schema
const eventSchema = z.object({
  name: z.string().min(3, 'Event name must be at least 3 characters'),
  code: z.string().min(3, 'Event code must be at least 3 characters'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  notes: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface CheckInPoint {
  name: string;
  location: string;
  pocId: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [checkInPoints, setCheckInPoints] = useState<CheckInPoint[]>([
    { name: '', location: '', pocId: '' },
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  const eventService = EventService.getInstance();

  const addCheckInPoint = () => {
    setCheckInPoints([...checkInPoints, { name: '', location: '', pocId: '' }]);
  };

  const removeCheckInPoint = (index: number) => {
    setCheckInPoints(checkInPoints.filter((_, i) => i !== index));
  };

  const updateCheckInPoint = (index: number, field: keyof CheckInPoint, value: string) => {
    const newPoints = [...checkInPoints];
    newPoints[index] = { ...newPoints[index], [field]: value };
    setCheckInPoints(newPoints);
  };

  const onSubmit = async (data: EventFormData) => {
    try {
      setIsLoading(true);

      const eventData: CreateEventRequest = {
        ...data,
        checkInPoints: checkInPoints.filter(point => 
          point.name && point.location && point.pocId
        ),
      };

      const response = await eventService.createEvent(eventData);

      if (response.success) {
        router.push('/admin/events');
      } else {
        throw new Error(response.message || 'Failed to create event');
      }
    } catch (error) {
      console.error('Create event error:', error);
      alert(error instanceof Error ? error.message : 'Failed to create event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Event</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Event Name"
              type="text"
              {...register('name')}
              error={errors.name?.message}
              placeholder="Tech Conference 2024"
            />

            <Input
              label="Event Code"
              type="text"
              {...register('code')}
              error={errors.code?.message}
              placeholder="TC2024"
            />

            <Input
              label="Start Date"
              type="datetime-local"
              {...register('startDate')}
              error={errors.startDate?.message}
            />

            <Input
              label="End Date"
              type="datetime-local"
              {...register('endDate')}
              error={errors.endDate?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              {...register('notes')}
              rows={4}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Add any additional notes about the event"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Check-in Points</h2>
              <button
                type="button"
                onClick={addCheckInPoint}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Point
              </button>
            </div>

            <div className="space-y-4">
              {checkInPoints.map((point, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-sm font-medium text-gray-900">
                      Check-in Point {index + 1}
                    </h3>
                    {checkInPoints.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCheckInPoint(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Name"
                      type="text"
                      value={point.name}
                      onChange={(e) => updateCheckInPoint(index, 'name', e.target.value)}
                      placeholder="Main Entrance"
                    />

                    <Input
                      label="Location"
                      type="text"
                      value={point.location}
                      onChange={(e) => updateCheckInPoint(index, 'location', e.target.value)}
                      placeholder="Ground Floor"
                    />

                    <Input
                      label="POC ID"
                      type="text"
                      value={point.pocId}
                      onChange={(e) => updateCheckInPoint(index, 'pocId', e.target.value)}
                      placeholder="POC001"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <Button type="submit" isLoading={isLoading}>
              Create Event
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 