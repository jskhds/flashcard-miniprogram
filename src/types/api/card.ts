export type ApiCardStatus = "new" | "again" | "learning" | "mastered";

export interface ApiCard {
  _id: string;
  front: string;
  back: string;
  ease: number;
  interval: number;
  repetitions: number;
  nextReview: string;
  status: ApiCardStatus;
  createdAt: string;
  deckId?: string;
  reading?: string;
  romaji?: string;
  pitch?: number;
  meaning?: string;
  example?: string;
}

export interface ApiCardUpdated {
  _id: string;
  front: string;
  back: string;
}

export interface ApiCardDeleted {
  deleted: boolean;
}
