export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  parentCommentId?: string; // for threaded comments
  createdAt: Date;
  updatedAt: Date;
}