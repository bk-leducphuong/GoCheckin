import { User } from "@/types/user";
import api from "./api";

export const UserService = {
  async getUser(): Promise<User> {
    const reponse = await api.get("/user/me");

    return reponse.data.data;
  },
};
