import { User } from "@/types/user";
import api from "./api";

export const UserService = {
  async getUser(): Promise<User> {
    try {
      const reponse = await api.get("/user/me");
      if (!reponse.data.data) {
        throw new Error("User data not found");
      }

      return reponse.data.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  },
};