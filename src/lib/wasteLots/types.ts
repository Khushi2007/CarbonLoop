import { WasteLotStatus } from "@prisma/client";

export type WasteLotListItem = {
  id: string;
  wasteType: string;
  quantityTonnes: number;
  status: WasteLotStatus;
  latitude: number;
  longitude: number;
  availableFrom: Date;
  createdAt: Date;
};
