import { create } from 'zustand';

const useQuizStore = create((set) => ({
  level1: [],
  level2: [],
  level3: [],
  level4: [],
  currentLevel: 1,
  
  // Set quiz data for all levels
  setQuizData: (data) => set({
    level1: data.level1 || [],
    level2: data.level2 || [],
    level3: data.level3 || [],
    level4: data.level4 || [],
  }),
  
  // Set data for a specific level
  setLevelData: (level, data) => set((state) => ({
    [`level${level}`]: data,
  })),
  
  // Set current level
  setCurrentLevel: (level) => set({ currentLevel: level }),

  reset: () => set({
    quiz: {
      level1: [],
      level2: [],
      level3: [],
      level4: [],
    },
    currentLevel: 1,
  }),
}));

export default useQuizStore;