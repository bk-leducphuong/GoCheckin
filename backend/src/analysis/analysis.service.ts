import { Injectable, NotFoundException } from '@nestjs/common';
import { EventCheckinAnalytics } from './entities/event-checkin-analytics.entity';
import { EventStatus } from 'src/event/entities/event.entity';
import { GuestCheckin } from 'src/guest/entities/guest-checkin.entity';
import {
  EventCheckinAnalysisRepository,
  PointCheckinAnalysisRepository,
  EventRepository,
  GuestCheckinRepository,
} from 'src/repositories';

@Injectable()
export class AnalysisService {
  constructor(
    private readonly eventCheckinAnalyticsRepository: EventCheckinAnalysisRepository,
    private readonly pointCheckinAnalyticsRepository: PointCheckinAnalysisRepository,
    private readonly eventRepository: EventRepository,
    private readonly guestCheckinRepository: GuestCheckinRepository,
  ) {}

  async analyzeEventCheckin(
    eventCode: string,
    intervalDuration: 'hourly' | '15min' | '30min' | 'daily' = 'hourly',
  ): Promise<EventCheckinAnalytics[]> {
    try {
      const event = await this.eventRepository.findOne({
        eventCode: eventCode,
      });
      if (!event) {
        throw new NotFoundException('Event not found');
      }

      if (event.eventStatus == EventStatus.COMPLETED) {
        // Check if analytics already exist
        const oldAnalytics = await this.eventCheckinAnalyticsRepository.findAll(
          {
            eventId: event.eventId,
          },
        );
        if (oldAnalytics.length > 0) {
          return oldAnalytics;
        }
      }

      const transactions = await this.guestCheckinRepository.findAll({
        eventId: event.eventId,
      });
      if (transactions.length === 0) return [];

      const intervalMap = new Map<string, GuestCheckin[]>();

      transactions.forEach((checkin) => {
        const date = new Date(checkin.checkinTime);
        let intervalKey: string;

        // Determine the interval key based on intervalDuration
        switch (intervalDuration) {
          case '15min':
            date.setMinutes(Math.floor(date.getMinutes() / 15) * 15, 0, 0);
            intervalKey = date.toISOString();
            break;
          case '30min':
            date.setMinutes(Math.floor(date.getMinutes() / 30) * 30, 0, 0);
            intervalKey = date.toISOString();
            break;
          case 'hourly':
            date.setMinutes(0, 0, 0);
            intervalKey = date.toISOString();
            break;
          case 'daily':
            date.setHours(0, 0, 0, 0);
            intervalKey = date.toISOString();
            break;
        }

        if (!intervalMap.has(intervalKey)) {
          intervalMap.set(intervalKey, []);
        }
        intervalMap.get(intervalKey)!.push(checkin);
      });

      const analytics: EventCheckinAnalytics[] = [];
      for (const [intervalKey, transactions] of intervalMap.entries()) {
        const intervalStart = new Date(intervalKey);
        const checkinCount = transactions.length;

        const analytic = this.eventCheckinAnalyticsRepository.create(
          eventCode,
          {
            timeInterval: intervalStart,
            intervalDuration,
            checkinCount,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        );

        if (event.eventStatus == EventStatus.COMPLETED) {
          await this.eventCheckinAnalyticsRepository.save(analytic);
        }

        analytics.push(analytic);
      }

      return analytics.sort(
        (a, b) => a.timeInterval.getTime() - b.timeInterval.getTime(),
      );
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async analyzePointCheckin(
    eventCode: string,
    intervalDuration: 'hourly' | '15min' | '30min' | 'daily' = 'hourly',
  ) {
    // try {
    //   const event = await this.eventRepository.findOne({
    //     eventCode: eventCode,
    //   });
    //   if (!event) {
    //     throw new NotFoundException('Event not found');
    //   }
    //   if (event.eventStatus == EventStatus.COMPLETED) {
    //     const oldAnalytics = await this.pointCheckinAnalyticsRepository.findAll(
    //       {
    //         eventId: event.eventId,
    //       },
    //     );
    //     if (oldAnalytics.length > 0) {
    //       return oldAnalytics;
    //     }
    //   }
    //   const transactions = await this.guestCheckinRepository.findAll({
    //     eventId: event.eventId,
    //   });
    //   if (transactions.length === 0) return [];
    //   // Map to store point analytics grouped by point and time interval
    //   const pointIntervalMap = new Map<string, GuestCheckin[]>();
    //   transactions.forEach((transaction) => {
    //     const date = new Date(transaction.checkinTime);
    //     let intervalKey: string;
    //     // Determine the interval key based on intervalDuration
    //     switch (intervalDuration) {
    //       case '15min':
    //         date.setMinutes(Math.floor(date.getMinutes() / 15) * 15, 0, 0);
    //         intervalKey = date.toISOString();
    //         break;
    //       case '30min':
    //         date.setMinutes(Math.floor(date.getMinutes() / 30) * 30, 0, 0);
    //         intervalKey = date.toISOString();
    //         break;
    //       case 'hourly':
    //         date.setMinutes(0, 0, 0);
    //         intervalKey = date.toISOString();
    //         break;
    //       case 'daily':
    //         date.setHours(0, 0, 0, 0);
    //         intervalKey = date.toISOString();
    //         break;
    //     }
    //     // Combine point code and interval for unique key
    //     const mapKey = `${transaction.pocCode}:${intervalKey}`;
    //     if (!pointIntervalMap.has(mapKey)) {
    //       pointIntervalMap.set(mapKey, []);
    //     }
    //     pointIntervalMap.get(mapKey)!.push(transaction);
    //   });
    //   // Calculate analytics for each point-interval combination
    //   const analytics: PointCheckinAnalytics[] = [];
    //   for (const [mapKey, transactions] of pointIntervalMap.entries()) {
    //     const [pointCode, timeInterval] = mapKey.split(':');
    //     // Count check-ins
    //     const checkinCount = transactions.length;
    //     const analytic = this.pointCheckinAnalyticsRepository.create(
    //       eventCode,
    //       pointCode,
    //       {
    //         timeInterval: new Date(timeInterval),
    //         intervalDuration,
    //         checkinCount,
    //         createdAt: new Date(),
    //         updatedAt: new Date(),
    //       },
    //     );
    //     if (eventStatus == EventStatus.COMPLETED) {
    //       await this.pointCheckinAnalyticsRepository.save(analytic);
    //     }
    //     analytics.push(analytic);
    //   }
    //   return analytics;
    // } catch (error) {
    //   console.log(error);
    //   return [];
    // }
  }
}
