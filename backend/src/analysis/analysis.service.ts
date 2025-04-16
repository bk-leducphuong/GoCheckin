import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventCheckinAnalytics } from './entities/event-checkin-analytics.entity';
import { PointCheckinAnalytics } from './entities/point-checkin-analytics.entity';
import { GuestService } from 'src/guest/guest.service';
import { EventService } from 'src/event/event.service';
import { PocService } from 'src/poc/poc.service';
import { GuestCheckin } from 'src/guest/entities/guest-checkin.entity';

@Injectable()
export class AnalysisService {
  constructor(
    @InjectRepository(EventCheckinAnalytics)
    private eventCheckinAnalyticsRepository: Repository<EventCheckinAnalytics>,
    @InjectRepository(PointCheckinAnalytics)
    private pointCheckinAnalyticsRepository: Repository<PointCheckinAnalytics>,
    private guestService: GuestService,
    private eventService: EventService,
    private pocService: PocService,
  ) {}

  async analyzeEventCheckin(
    eventCode: string,
    intervalDuration: 'hourly' | '15min' | '30min' | 'daily' = 'hourly',
  ): Promise<EventCheckinAnalytics[]> {
    try {
      const oldAnalytics = await this.eventCheckinAnalyticsRepository.find({
        where: { eventCode },
      });
      if (oldAnalytics.length > 0) {
        return oldAnalytics;
      }

      const transactions =
        await this.guestService.getAllCheckinsByEvent(eventCode);
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

      // Calculate analytics for each interval
      const analytics: EventCheckinAnalytics[] = [];
      for (const [intervalKey, transactions] of intervalMap.entries()) {
        const intervalStart = new Date(intervalKey);
        // Count total check-ins
        const checkinCount = transactions.length;

        const analytic = this.eventCheckinAnalyticsRepository.create({
          eventCode,
          timeInterval: intervalStart,
          intervalDuration,
          checkinCount,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await this.eventCheckinAnalyticsRepository.save(analytic);

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
  ): Promise<PointCheckinAnalytics[]> {
    const oldAnalytics = await this.pointCheckinAnalyticsRepository.find({
      where: { eventCode },
    });
    if (oldAnalytics.length > 0) {
      return oldAnalytics;
    }

    const transactions =
      await this.guestService.getAllCheckinsByEvent(eventCode);
    if (transactions.length === 0) return [];

    // Map to store point analytics grouped by point and time interval
    const pointIntervalMap = new Map<string, GuestCheckin[]>();

    transactions.forEach((transaction) => {
      const date = new Date(transaction.checkinTime);
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

      // Combine point code and interval for unique key
      const mapKey = `${transaction.pointCode}:${intervalKey}`;

      if (!pointIntervalMap.has(mapKey)) {
        pointIntervalMap.set(mapKey, []);
      }
      pointIntervalMap.get(mapKey)!.push(transaction);
    });

    // Calculate analytics for each point-interval combination
    const analytics: PointCheckinAnalytics[] = [];
    for (const [mapKey, transactions] of pointIntervalMap.entries()) {
      const [pointCode, timeInterval] = mapKey.split(':');

      // Count check-ins
      const checkinCount = transactions.length;
      const analytic = this.pointCheckinAnalyticsRepository.create({
        eventCode,
        pointCode,
        timeInterval,
        intervalDuration,
        checkinCount,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await this.pointCheckinAnalyticsRepository.save(analytic);
      analytics.push(analytic);
    }

    return analytics;
  }
}
