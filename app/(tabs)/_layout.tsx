import React from 'react';
import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#121212',
        borderTopColor: '#333',
        height: 75,
        paddingBottom: 15,
        paddingTop: 8,
      },
      tabBarActiveTintColor: '#7C3AED',
      tabBarInactiveTintColor: '#666',
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Cocinar',
          tabBarIcon: ({ color }) => <FontAwesome name="cutlery" size={24} color={color} />,
        }}
      />
      {/* NUEVA PESTAÑA RECETAS */}
      <Tabs.Screen
        name="recipes"
        options={{
          title: 'Recetas',
          tabBarIcon: ({ color }) => <FontAwesome name="book" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <FontAwesome name="user" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}