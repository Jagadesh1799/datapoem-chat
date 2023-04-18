import { IUser } from "./user.model";

export interface IComment {
  id: number;
  content: string;
  createdAt: string;
  score: number;
  user: IUser,
  replies: IComment[];
  replyingTo?: string;
  
  inputValue?: string
}
