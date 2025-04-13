export const SocketService = {
    async connect() {
        try {
            const response = await api.post("/socket/connect");
            return response.data.data;
        } catch (error) {
            console.error("Connect to socket error:", error);
            throw error;
        }
    },

    async disconnect() {
        try {
            const response = await api.post("/socket/disconnect");
            return response.data.data;
        } catch (error) {
            console.error("Disconnect from socket error:", error);
            throw error;
        }
    }
}