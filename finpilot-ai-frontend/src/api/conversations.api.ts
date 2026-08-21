import { api } from "./axios";
import type { Conversation } from "../types/domain";

export const conversationsApi = {
  create: (customerId: string | null, title: string | null) =>
    api
      .post<Conversation>("/conversations", { customer_id: customerId, title })
      .then((r) => r.data),
};
