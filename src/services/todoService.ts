
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define todo and subtask types
export interface Todo {
  id: string;
  title: string;
  description: string | null;
  status: 'completed' | 'in-progress' | 'not-started' | 'blocked';
  priority: 'high' | 'medium' | 'low';
  created_at: string;
  updated_at: string;
  subtasks?: Subtask[];
}

export interface Subtask {
  id: string;
  todo_id: string;
  title: string;
  status: 'completed' | 'in-progress' | 'not-started';
  created_at: string;
  updated_at: string;
}

// Get all todos with their subtasks
export const getAllTodos = async (): Promise<Todo[]> => {
  try {
    // Fetch all todos
    const { data: todos, error: todosError } = await supabase
      .from('developer_todos')
      .select('*')
      .order('created_at', { ascending: false });

    if (todosError) {
      console.error('Error fetching todos:', todosError);
      return [];
    }

    // Fetch all subtasks
    const { data: subtasks, error: subtasksError } = await supabase
      .from('developer_subtasks')
      .select('*')
      .order('created_at', { ascending: true });

    if (subtasksError) {
      console.error('Error fetching subtasks:', subtasksError);
      return todos as Todo[];
    }

    // Group subtasks by todo_id
    const subtasksByTodoId = subtasks.reduce((acc: Record<string, Subtask[]>, subtask) => {
      if (!acc[subtask.todo_id]) {
        acc[subtask.todo_id] = [];
      }
      acc[subtask.todo_id].push(subtask as Subtask);
      return acc;
    }, {});

    // Combine todos with their subtasks
    return todos.map((todo) => ({
      ...todo,
      subtasks: subtasksByTodoId[todo.id] || []
    })) as Todo[];
  } catch (error) {
    console.error('Error in getAllTodos:', error);
    return [];
  }
};

// Get a specific todo with its subtasks
export const getTodoById = async (id: string): Promise<Todo | null> => {
  try {
    // Fetch the todo
    const { data: todo, error: todoError } = await supabase
      .from('developer_todos')
      .select('*')
      .eq('id', id)
      .single();

    if (todoError) {
      console.error('Error fetching todo:', todoError);
      return null;
    }

    // Fetch the subtasks
    const { data: subtasks, error: subtasksError } = await supabase
      .from('developer_subtasks')
      .select('*')
      .eq('todo_id', id)
      .order('created_at', { ascending: true });

    if (subtasksError) {
      console.error('Error fetching subtasks:', subtasksError);
      return todo as Todo;
    }

    // Return the todo with its subtasks
    return {
      ...todo,
      subtasks
    } as Todo;
  } catch (error) {
    console.error('Error in getTodoById:', error);
    return null;
  }
};

// Update a todo
export const updateTodo = async (id: string, updates: Partial<Omit<Todo, 'id' | 'created_at' | 'updated_at' | 'subtasks'>>): Promise<Todo | null> => {
  try {
    const { data, error } = await supabase
      .from('developer_todos')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating todo:', error);
      return null;
    }

    return data as Todo;
  } catch (error) {
    console.error('Error in updateTodo:', error);
    return null;
  }
};

// Update a subtask
export const updateSubtask = async (id: string, updates: Partial<Omit<Subtask, 'id' | 'todo_id' | 'created_at' | 'updated_at'>>): Promise<Subtask | null> => {
  try {
    const { data, error } = await supabase
      .from('developer_subtasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating subtask:', error);
      return null;
    }

    return data as Subtask;
  } catch (error) {
    console.error('Error in updateSubtask:', error);
    return null;
  }
};

// Create a new todo
export const createTodo = async (todo: Omit<Todo, 'id' | 'created_at' | 'updated_at' | 'subtasks'>): Promise<Todo | null> => {
  try {
    const { data, error } = await supabase
      .from('developer_todos')
      .insert(todo)
      .select()
      .single();

    if (error) {
      console.error('Error creating todo:', error);
      return null;
    }

    return data as Todo;
  } catch (error) {
    console.error('Error in createTodo:', error);
    return null;
  }
};

// Create a new subtask
export const createSubtask = async (subtask: Omit<Subtask, 'id' | 'created_at' | 'updated_at'>): Promise<Subtask | null> => {
  try {
    const { data, error } = await supabase
      .from('developer_subtasks')
      .insert(subtask)
      .select()
      .single();

    if (error) {
      console.error('Error creating subtask:', error);
      return null;
    }

    return data as Subtask;
  } catch (error) {
    console.error('Error in createSubtask:', error);
    return null;
  }
};

// Delete a todo (will cascade delete its subtasks)
export const deleteTodo = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('developer_todos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting todo:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteTodo:', error);
    return false;
  }
};

// Delete a subtask
export const deleteSubtask = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('developer_subtasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting subtask:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteSubtask:', error);
    return false;
  }
};
