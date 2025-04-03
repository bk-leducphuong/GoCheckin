import api from "./api";

export const GuestService = {
    async getAllGuestsOfPoc(eventCode: string, pocId: string) {
        try {
            const response = await api.get(`/guests/all/${eventCode}/${pocId}`);
            return response.data.data.guests;
        } catch (error) {
            throw error;
        }
    },
}