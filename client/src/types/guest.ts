export interface GuestInfo {
    guestId: string;
    guestCode: string;
    eventCode: string;
    imageUrl: string | null;
    description: string;
    identityType: string;
    guestType: string;
    ageRange: string | null;
    gender: string | null;
    registrationDate: string;
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
}
