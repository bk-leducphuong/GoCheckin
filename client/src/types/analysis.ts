export interface EventCheckinAnalytics {
    analyticsId: string;
    eventCode: string;
    timeInterval: Date;
    intervalDuration: string;
    checkinCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface PointCheckinAnalytics {
    analyticsId: string;
    eventCode: string;
    pointCode: string;
    timeInterval: Date;
    intervalDuration: string;
    checkinCount: number;
    createdAt: Date;
    updatedAt: Date;
}