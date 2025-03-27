
import { LovableTodoManager } from './lovableTodoManager';

// This function can be used directly from the console to test the todo manager
export const markTodoCompleted = async (todoTitle: string): Promise<void> => {
  console.log(`Attempting to mark todo "${todoTitle}" as completed...`);
  const success = await LovableTodoManager.markTodoCompleted(todoTitle);
  
  if (success) {
    console.log(`✅ Successfully marked todo "${todoTitle}" as completed`);
  } else {
    console.error(`❌ Failed to mark todo "${todoTitle}" as completed`);
  }
};

// Usage example:
// If you have a todo with title "Implement Authentication"
// You can mark it complete by running this in the browser console:
// import { markTodoCompleted } from './utils/markTodoDemoFunction';
// markTodoCompleted("Implement Authentication");
