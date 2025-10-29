

import { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of a single flashcard
export interface Flashcard {
  question: string;
  short_answer: string;
  long_answer: string;
}

// Define the shape of a flashcard set (what we will store)
export interface FlashcardSet {
  id: string; // Used as the unique key for temporary storage
  title: string;
  created_at: string; // ISO date string
  flashcards: Flashcard[];
}

// Define the shape of the context's value
interface FlashcardContextType {
  history: FlashcardSet[];
  saveSet: (newSet: Omit<FlashcardSet, 'id' | 'created_at'> & { title?: string }) => string;
  getSetById: (id: string) => FlashcardSet | undefined;
  deleteSetById: (id: string) => void;
}

// Create the Context
const FlashcardContext = createContext<FlashcardContextType | undefined>(undefined);

// Hook to use the flashcard store
export const useFlashcardStore = () => {
  const context = useContext(FlashcardContext);
  if (context === undefined) {
    throw new Error('useFlashcardStore must be used within a FlashcardProvider');
  }
  return context;
};

// The Provider Component
export const FlashcardProvider = ({ children }: { children: ReactNode }) => {
  // Use a state array to hold all the flashcard sets in memory
  const [history, setHistory] = useState<FlashcardSet[]>([]);

  // Function to save a new flashcard set
  const saveSet = (newSetData: Omit<FlashcardSet, 'id' | 'created_at'> & { title?: string }): string => {
    // Generate a simple unique ID for temporary storage
    const newId = Date.now().toString();
    
    const newSet: FlashcardSet = {
      id: newId,
      title: newSetData.title || `Flashcards - ${new Date().toLocaleDateString()}`,
      created_at: new Date().toISOString(),
      flashcards: newSetData.flashcards,
    };

    // Add the new set to the beginning of the history array
    setHistory(prevHistory => [newSet, ...prevHistory]);
    
    return newId; // Return the ID so the user can navigate to the new set
  };
  
  // Function to retrieve a set by its ID
  const getSetById = (id: string): FlashcardSet | undefined => {
      return history.find(set => set.id === id);
  };
  
  // Function to delete a set by its ID
  const deleteSetById = (id: string) => {
      setHistory(prevHistory => prevHistory.filter(set => set.id !== id));
  };


  const value = {
    history,
    saveSet,
    getSetById,
    deleteSetById,
  };

  return (
    <FlashcardContext.Provider value={value}>
      {children}
    </FlashcardContext.Provider>
  );
};