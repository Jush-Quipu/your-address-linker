
import { toast } from 'sonner';
import { 
  getDeveloperTodos, 
  updateTodoStatus, 
  getDeveloperTodoWithSubtasks, 
  updateSubtaskStatus,
  DeveloperTodo,
  DeveloperSubtask
} from '@/services/developerTodoService';

/**
 * Utility for Lovable to manage the developer todo list
 */
export const LovableTodoManager = {
  /**
   * Mark a todo as completed by title
   */
  async markTodoCompleted(todoTitle: string): Promise<boolean> {
    try {
      // Get all todos
      const todos = await getDeveloperTodos();
      
      // Find the todo with the matching title (case insensitive)
      const todo = todos.find(t => 
        t.title.toLowerCase() === todoTitle.toLowerCase()
      );
      
      if (!todo) {
        console.log(`Todo with title "${todoTitle}" not found`);
        return false;
      }
      
      // If already completed, don't do anything
      if (todo.status === 'completed') {
        return true;
      }
      
      // Update the todo status to completed
      await updateTodoStatus(todo.id, 'completed');
      
      // Optionally also mark all subtasks as completed
      const todoWithSubtasks = await getDeveloperTodoWithSubtasks(todo.id);
      if (todoWithSubtasks && todoWithSubtasks.subtasks) {
        for (const subtask of todoWithSubtasks.subtasks) {
          if (subtask.status !== 'completed') {
            await updateSubtaskStatus(subtask.id, 'completed');
          }
        }
      }
      
      // Notify of successful completion
      toast.success(`Todo "${todoTitle}" marked as completed`);
      return true;
    } catch (error) {
      console.error('Error completing todo:', error);
      return false;
    }
  },
  
  /**
   * Mark a specific subtask as completed
   */
  async markSubtaskCompleted(todoTitle: string, subtaskTitle: string): Promise<boolean> {
    try {
      // Get all todos
      const todos = await getDeveloperTodos();
      
      // Find the todo with the matching title
      const todo = todos.find(t => 
        t.title.toLowerCase() === todoTitle.toLowerCase()
      );
      
      if (!todo) {
        console.log(`Todo with title "${todoTitle}" not found`);
        return false;
      }
      
      // Get the todo with subtasks
      const todoWithSubtasks = await getDeveloperTodoWithSubtasks(todo.id);
      if (!todoWithSubtasks || !todoWithSubtasks.subtasks) {
        console.log(`No subtasks found for todo "${todoTitle}"`);
        return false;
      }
      
      // Find the subtask with the matching title
      const subtask = todoWithSubtasks.subtasks.find(s => 
        s.title.toLowerCase() === subtaskTitle.toLowerCase()
      );
      
      if (!subtask) {
        console.log(`Subtask with title "${subtaskTitle}" not found in todo "${todoTitle}"`);
        return false;
      }
      
      // If already completed, don't do anything
      if (subtask.status === 'completed') {
        return true;
      }
      
      // Update the subtask status to completed
      await updateSubtaskStatus(subtask.id, 'completed');
      
      // If all subtasks are completed, mark the todo as completed too
      const allSubtasksCompleted = todoWithSubtasks.subtasks.every(
        s => s.id === subtask.id ? true : s.status === 'completed'
      );
      
      if (allSubtasksCompleted && todo.status !== 'completed') {
        await updateTodoStatus(todo.id, 'completed');
      }
      
      toast.success(`Subtask "${subtaskTitle}" marked as completed`);
      return true;
    } catch (error) {
      console.error('Error completing subtask:', error);
      return false;
    }
  },
  
  /**
   * Find todos by string search across title or description
   */
  async findTodosBySearch(searchTerm: string): Promise<DeveloperTodo[]> {
    try {
      const todos = await getDeveloperTodos();
      return todos.filter(todo => 
        todo.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (todo.description && todo.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    } catch (error) {
      console.error('Error searching todos:', error);
      return [];
    }
  },
  
  /**
   * Get information about current todo progress
   */
  async getTodoProgress(): Promise<{
    totalTodos: number;
    completedTodos: number;
    inProgressTodos: number;
    notStartedTodos: number;
    blockedTodos: number;
    completionPercentage: number;
  }> {
    try {
      const todos = await getDeveloperTodos();
      
      const totalTodos = todos.length;
      const completedTodos = todos.filter(t => t.status === 'completed').length;
      const inProgressTodos = todos.filter(t => t.status === 'in-progress').length;
      const notStartedTodos = todos.filter(t => t.status === 'not-started').length;
      const blockedTodos = todos.filter(t => t.status === 'blocked').length;
      
      const completionPercentage = totalTodos > 0 
        ? Math.round((completedTodos / totalTodos) * 100) 
        : 0;
      
      return {
        totalTodos,
        completedTodos,
        inProgressTodos,
        notStartedTodos,
        blockedTodos,
        completionPercentage
      };
    } catch (error) {
      console.error('Error getting todo progress:', error);
      return {
        totalTodos: 0,
        completedTodos: 0,
        inProgressTodos: 0,
        notStartedTodos: 0,
        blockedTodos: 0,
        completionPercentage: 0
      };
    }
  }
};
