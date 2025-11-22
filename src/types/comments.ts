export interface CommentThread {
  id: string;
  comments: CommentData[];
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommentData {
  id: string;
  threadId: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CommentPosition {
  from: number;
  to: number;
}
