export interface Poc {
    pocId: string;
    pointCode: string;
    pointNode?: string;
    eventCode: string;
    userId: string;
    latitude?: string;
    longitude?: string;
    capacity?: string;
    status: string;
    openTime?: string;
    closeTime?: string;
    locationDescription?: string;
    floorLevel?: string;
    enabled: boolean;
    createdAt: string;
    updatAt: string;
}   

export interface PocValidationData {
    pocId: string;
    eventCode: string;
}

export interface CreatePocRequest {
    pointCode: string;
    pointName: string;
    latitude?: string;
    longitude?: string;
    capacity?: string;
    status?: string;
    openTime?: string;
    closeTime?: string;
    locationDescription?: string;
    floorLevel?: string;
}