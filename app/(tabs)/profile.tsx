import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, TextInput, 
  LayoutAnimation, Platform, UIManager, KeyboardAvoidingView 
} from 'react-native';
import { useUser, UserProfile } from '../context/UserContext';
import { FontAwesome } from '@expo/vector-icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const THEME = {
  background: '#121212',
  card: '#1E1E1E',
  primary: '#7C3AED',
  text: '#FFFFFF',
  textSecondary: '#A1A1AA',
  border: '#3F3F46',
};

const DIETS_OPTIONS = ['Omnívoro', 'Vegetariano', 'Vegano', 'Keto', 'Otro'];
const LEVEL_OPTIONS = ['Básico', 'Intermedio', 'Chef'];

export default function ProfileScreen() {
  const { profile, updateProfile } = useUser();

  // ESTADOS DE EDICIÓN (Desplegables)
  const [isEditingDiet, setIsEditingDiet] = useState(false);
  const [isEditingLevel, setIsEditingLevel] = useState(false);
  
  // ESTADOS TEMPORALES PARA INPUTS
  const [tempPantry, setTempPantry] = useState('');
  const [tempTool, setTempTool] = useState('');
  const [tempAllergy, setTempAllergy] = useState('');

  // HELPERS
  const handleUpdate = (field: keyof UserProfile, value: any) => {
    updateProfile({ [field]: value });
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const addItem = (field: keyof UserProfile, value: string, setValue: (v: string) => void) => {
    if (!value.trim()) return;
    const currentList = (profile[field] as string[]) || [];
    // Evitamos duplicados
    if(!currentList.includes(value.trim())){
        handleUpdate(field, [...currentList, value.trim()]);
    }
    setValue('');
  };

  const removeItem = (field: keyof UserProfile, value: string) => {
    const currentList = (profile[field] as string[]) || [];
    handleUpdate(field, currentList.filter(i => i !== value));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* CORRECCIÓN: KeyboardAvoidingView empuja el contenido al abrir teclado */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0} // Ajuste fino para iOS
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.headerTitle}>Mi Perfil</Text>

          {/* 1. DIETA */}
          <View style={styles.section}>
            <Text style={styles.label}>Dieta</Text>
            <TouchableOpacity 
              style={styles.selector} 
              onPress={() => { 
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); 
                setIsEditingDiet(!isEditingDiet); 
              }}
            >
              <Text style={styles.selectorText}>{profile.dietType}</Text>
              <FontAwesome name={isEditingDiet ? "chevron-up" : "chevron-down"} size={14} color={THEME.primary} />
            </TouchableOpacity>
            
            {isEditingDiet && (
              <View style={styles.optionsContainer}>
                {DIETS_OPTIONS.map(opt => (
                  <TouchableOpacity 
                    key={opt} 
                    style={styles.optionItem} 
                    onPress={() => { handleUpdate('dietType', opt); setIsEditingDiet(false); }}
                  >
                    <Text style={[styles.optionText, profile.dietType === opt && styles.optionTextActive]}>{opt}</Text>
                    {profile.dietType === opt && <FontAwesome name="check" size={12} color={THEME.primary} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* 2. NIVEL */}
          <View style={styles.section}>
            <Text style={styles.label}>Nivel de Cocina</Text>
            <TouchableOpacity 
              style={styles.selector} 
              onPress={() => { 
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); 
                setIsEditingLevel(!isEditingLevel); 
              }}
            >
              <Text style={styles.selectorText}>{profile.skillLevel}</Text>
              <FontAwesome name={isEditingLevel ? "chevron-up" : "chevron-down"} size={14} color={THEME.primary} />
            </TouchableOpacity>
            
            {isEditingLevel && (
              <View style={styles.optionsContainer}>
                {LEVEL_OPTIONS.map(opt => (
                  <TouchableOpacity 
                    key={opt} 
                    style={styles.optionItem} 
                    onPress={() => { handleUpdate('skillLevel', opt); setIsEditingLevel(false); }}
                  >
                    <Text style={[styles.optionText, profile.skillLevel === opt && styles.optionTextActive]}>{opt}</Text>
                    {profile.skillLevel === opt && <FontAwesome name="check" size={12} color={THEME.primary} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* 3. ALERGIAS */}
          <View style={styles.section}>
            <Text style={styles.label}>Alergias / Restricciones</Text>
            <View style={styles.inputRow}>
              <TextInput 
                style={styles.input} 
                value={tempAllergy} 
                onChangeText={setTempAllergy} 
                placeholder="Agregar alergia..." 
                placeholderTextColor="#666" 
                onSubmitEditing={() => addItem('allergies', tempAllergy, setTempAllergy)}
              />
              <TouchableOpacity style={styles.addButton} onPress={() => addItem('allergies', tempAllergy, setTempAllergy)}>
                <FontAwesome name="plus" size={14} color="#FFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.chipsWrapper}>
              {profile.allergies?.map((item, i) => (
                <View key={i} style={styles.chip}>
                  <Text style={styles.chipText}>{item}</Text>
                  <TouchableOpacity onPress={() => removeItem('allergies', item)}>
                    <FontAwesome name="times" size={10} color="#AAA" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* 4. HERRAMIENTAS */}
          <View style={styles.section}>
            <Text style={styles.label}>Mis Herramientas</Text>
            <View style={styles.inputRow}>
              <TextInput 
                style={styles.input} 
                value={tempTool} 
                onChangeText={setTempTool} 
                placeholder="Agregar herramienta..." 
                placeholderTextColor="#666" 
                onSubmitEditing={() => addItem('kitchenTools', tempTool, setTempTool)}
              />
              <TouchableOpacity style={styles.addButton} onPress={() => addItem('kitchenTools', tempTool, setTempTool)}>
                <FontAwesome name="plus" size={14} color="#FFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.chipsWrapper}>
              {profile.kitchenTools?.map((item, i) => (
                <View key={i} style={styles.chip}>
                  <Text style={styles.chipText}>{item}</Text>
                  <TouchableOpacity onPress={() => removeItem('kitchenTools', item)}>
                    <FontAwesome name="times" size={10} color="#AAA" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* 5. ALACENA */}
          <View style={styles.section}>
            <Text style={styles.label}>Mi Alacena</Text>
            <View style={styles.inputRow}>
              <TextInput 
                style={styles.input} 
                value={tempPantry} 
                onChangeText={setTempPantry} 
                placeholder="Agregar ingrediente..." 
                placeholderTextColor="#666" 
                onSubmitEditing={() => addItem('pantryEssentials', tempPantry, setTempPantry)}
              />
              <TouchableOpacity style={styles.addButton} onPress={() => addItem('pantryEssentials', tempPantry, setTempPantry)}>
                <FontAwesome name="plus" size={14} color="#FFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.chipsWrapper}>
              {profile.pantryEssentials?.map((item, i) => (
                <View key={i} style={styles.chip}>
                  <Text style={styles.chipText}>{item}</Text>
                  <TouchableOpacity onPress={() => removeItem('pantryEssentials', item)}>
                    <FontAwesome name="times" size={10} color="#AAA" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Espacio extra al final para scroll cómodo */}
          <View style={{ height: 100 }} /> 
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  content: { padding: 24 },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: THEME.text, marginBottom: 30 },
  section: { marginBottom: 25 },
  label: { fontSize: 16, fontWeight: '600', color: THEME.primary, marginBottom: 10 },
  
  selector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: THEME.card, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: THEME.border },
  selectorText: { color: '#FFF', fontSize: 16, fontWeight: '500' },
  optionsContainer: { marginTop: 8, backgroundColor: '#27272A', borderRadius: 12, padding: 5 },
  optionItem: { padding: 14, flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#333' },
  optionText: { color: THEME.textSecondary, fontSize: 15 },
  optionTextActive: { color: '#FFF', fontWeight: 'bold' },

  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  input: { flex: 1, backgroundColor: THEME.card, color: '#FFF', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: THEME.border, fontSize: 16 },
  addButton: { backgroundColor: THEME.primary, width: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  chipsWrapper: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#333', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  chipText: { color: '#EEE', fontSize: 14, fontWeight: '500' },
});