import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Recipe {
  title: string;
  description: string;
  time: string;
  calories: number;
  nutrition: {
    protein: string;
    carbs: string;
    fat: string;
    fiber: string;
    sugar: string;
    sodium: string;
  };
  ingredients_list: string[];
  steps: string[];
}

export interface UserProfile {
  isOnboarded: boolean;
  dietType: 'Omnívoro' | 'Vegetariano' | 'Vegano' | 'Keto' | 'Otro';
  allergies: string[];
  kitchenTools: string[];
  pantryEssentials: string[];
  skillLevel: 'Básico' | 'Intermedio' | 'Chef';
  savedRecipes: Recipe[]; // <--- NUEVO CAMPO
}

const defaultProfile: UserProfile = {
  isOnboarded: false,
  dietType: 'Omnívoro',
  allergies: [],
  kitchenTools: ['Hornalla'],
  pantryEssentials: [],
  skillLevel: 'Intermedio',
  savedRecipes: [],
};

interface UserContextType {
  profile: UserProfile;
  updateProfile: (newData: Partial<UserProfile>) => void;
  toggleSaveRecipe: (recipe: Recipe) => void;
  isRecipeSaved: (recipe: Recipe) => boolean;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const storedData = await AsyncStorage.getItem('kivly_user_profile');
      if (storedData) {
        // Aseguramos que savedRecipes exista si cargamos un perfil viejo
        const parsed = JSON.parse(storedData);
        if (!parsed.savedRecipes) parsed.savedRecipes = [];
        setProfile(parsed);
      }
    } catch (error) {
      console.error("Error loading profile", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (newData: Partial<UserProfile>) => {
    const updatedProfile = { ...profile, ...newData };
    setProfile(updatedProfile);
    await AsyncStorage.setItem('kivly_user_profile', JSON.stringify(updatedProfile));
  };

  // NUEVAS FUNCIONES DE GUARDADO
  const toggleSaveRecipe = async (recipe: Recipe) => {
    const exists = profile.savedRecipes.some(r => r.title === recipe.title);
    let newRecipes;
    
    if (exists) {
      newRecipes = profile.savedRecipes.filter(r => r.title !== recipe.title);
    } else {
      newRecipes = [...profile.savedRecipes, recipe];
    }
    
    await updateProfile({ savedRecipes: newRecipes });
  };

  const isRecipeSaved = (recipe: Recipe) => {
    return profile.savedRecipes.some(r => r.title === recipe.title);
  };

  return (
    <UserContext.Provider value={{ profile, updateProfile, toggleSaveRecipe, isRecipeSaved, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser error");
  return context;
};