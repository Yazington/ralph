import { Comment } from '../domain_types/comment';
import { CommentRepository, ListOptions } from '../domain_types/repository';

export class InMemoryCommentRepository implements CommentRepository {
  private comments: Map<string, Comment> = new Map();
  private idCounter = 1;

  async create(comment: Comment): Promise<string> {
    const id = comment.id || `comment-${this.idCounter++}`;
    const commentWithId = { ...comment, id };
    this.comments.set(id, commentWithId);
    return id;
  }

  async read(id: string): Promise<Comment | null> {
    return this.comments.get(id) || null;
  }

  async update(id: string, updates: Partial<Comment>): Promise<void> {
    const existing = await this.read(id);
    if (!existing) {
      throw new Error(`Comment with id ${id} not found`);
    }
    const updated = { ...existing, ...updates, id };
    this.comments.set(id, updated);
  }

  async delete(id: string): Promise<void> {
    this.comments.delete(id);
  }

  async list(options?: ListOptions): Promise<Comment[]> {
    let comments = Array.from(this.comments.values());
    if (options?.sortBy) {
      const { sortBy, sortOrder = 'asc' } = options;
      comments.sort((a, b) => {
        let aVal = (a as any)[sortBy];
        let bVal = (b as any)[sortBy];
        if (aVal instanceof Date) aVal = aVal.getTime();
        if (bVal instanceof Date) bVal = bVal.getTime();
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
    if (options?.offset) {
      comments = comments.slice(options.offset);
    }
    if (options?.limit) {
      comments = comments.slice(0, options.limit);
    }
    return comments;
  }

  async findByTaskId(taskId: string): Promise<Comment[]> {
    return Array.from(this.comments.values()).filter(comment => comment.taskId === taskId);
  }

  async findByUserId(userId: string): Promise<Comment[]> {
    return Array.from(this.comments.values()).filter(comment => comment.userId === userId);
  }
}