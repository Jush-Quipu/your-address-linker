
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DeveloperTodo {
  id: string;
  title: string;
  description: string | null;
  status: 'not-started' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  subtasks?: DeveloperSubtask[];
}

export interface DeveloperSubtask {
  id: string;
  todo_id: string;
  title: string;
  status: 'not-started' | 'in-progress' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface TodoCreateParams {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface SubtaskCreateParams {
  todo_id: string;
  title: string;
}

// Get all developer todos
export const getDeveloperTodos = async (): Promise<DeveloperTodo[]> => {
  try {
    const { data, error } = await supabase
      .from('developer_todos')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching developer todos:', error);
    toast.error('Failed to fetch developer todos');
    return [];
  }
};

// Get a specific todo with its subtasks
export const getDeveloperTodoWithSubtasks = async (todoId: string): Promise<DeveloperTodo | null> => {
  try {
    // Get the todo
    const { data: todo, error: todoError } = await supabase
      .from('developer_todos')
      .select('*')
      .eq('id', todoId)
      .single();

    if (todoError) throw todoError;
    
    // Get the subtasks
    const { data: subtasks, error: subtasksError } = await supabase
      .from('developer_subtasks')
      .select('*')
      .eq('todo_id', todoId)
      .order('created_at', { ascending: true });

    if (subtasksError) throw subtasksError;
    
    return {
      ...todo,
      subtasks: subtasks || []
    };
  } catch (error) {
    console.error('Error fetching developer todo with subtasks:', error);
    toast.error('Failed to fetch todo details');
    return null;
  }
};

// Create a new todo
export const createDeveloperTodo = async (params: TodoCreateParams): Promise<DeveloperTodo | null> => {
  try {
    const { data, error } = await supabase
      .from('developer_todos')
      .insert({
        title: params.title,
        description: params.description || null,
        priority: params.priority || 'medium'
      })
      .select()
      .single();

    if (error) throw error;
    
    toast.success('Todo created successfully');
    return data;
  } catch (error) {
    console.error('Error creating developer todo:', error);
    toast.error('Failed to create todo');
    return null;
  }
};

// Create a new subtask
export const createDeveloperSubtask = async (params: SubtaskCreateParams): Promise<DeveloperSubtask | null> => {
  try {
    const { data, error } = await supabase
      .from('developer_subtasks')
      .insert({
        todo_id: params.todo_id,
        title: params.title
      })
      .select()
      .single();

    if (error) throw error;
    
    toast.success('Subtask added successfully');
    return data;
  } catch (error) {
    console.error('Error creating developer subtask:', error);
    toast.error('Failed to add subtask');
    return null;
  }
};

// Update todo status
export const updateTodoStatus = async (todoId: string, status: 'not-started' | 'in-progress' | 'completed'): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('developer_todos')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', todoId);

    if (error) throw error;
    
    toast.success('Todo status updated');
    return true;
  } catch (error) {
    console.error('Error updating todo status:', error);
    toast.error('Failed to update todo status');
    return false;
  }
};

// Update subtask status
export const updateSubtaskStatus = async (subtaskId: string, status: 'not-started' | 'in-progress' | 'completed'): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('developer_subtasks')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', subtaskId);

    if (error) throw error;
    
    toast.success('Subtask status updated');
    return true;
  } catch (error) {
    console.error('Error updating subtask status:', error);
    toast.error('Failed to update subtask status');
    return false;
  }
};

// Delete a todo
export const deleteDeveloperTodo = async (todoId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('developer_todos')
      .delete()
      .eq('id', todoId);

    if (error) throw error;
    
    toast.success('Todo deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting developer todo:', error);
    toast.error('Failed to delete todo');
    return false;
  }
};
