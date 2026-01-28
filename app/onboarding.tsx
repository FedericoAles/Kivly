import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, StatusBar, TextInput, LayoutAnimation, Platform, UIManager, KeyboardAvoidingView 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser, UserProfile } from './context/UserContext';
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

const DIETS = ['Omnívoro', 'Vegetariano', 'Vegano', 'Keto', 'Otro'];
const TOOLS = ['Hornalla', 'Horno', 'Microondas', 'Airfryer', 'Minipimer'];
const LEVELS = ['Básico', 'Intermedio', 'Chef'];

export default function OnboardingScreen() {
  const router = useRouter();
  const { updateProfile } = useUser();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState<Partial<UserProfile>>({
    dietType: 'Omnívoro',
    skillLevel: 'Intermedio',
    kitchenTools: ['Hornalla'],
    allergies: [],
    pantryEssentials: [],
  });
  
  const [customDiet, setCustomDiet] = useState('');
  const [extraToolInput, setExtraToolInput] = useState('');
  const [pantryInput, setPantryInput] = useState('');
  const [allergyInput, setAllergyInput] = useState('');

  const addChip = (field: keyof UserProfile, value: string, setInput: (v: string) => void) => {
    if (!value.trim()) return;
    const currentList = (formData[field] as string[]) || [];
    if (!currentList.includes(value.trim())) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setFormData({ ...formData, [field]: [...currentList, value.trim()] });
    }
    setInput('');
  };

  const removeChip = (field: keyof UserProfile, value: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const currentList = (formData[field] as string[]) || [];
    setFormData({ ...formData, [field]: currentList.filter(i => i !== value) });
  };

  const toggleTool = (tool: string) => {
    const list = formData.kitchenTools || [];
    setFormData(prev => ({
      ...prev,
      kitchenTools: list.includes(tool) ? list.filter(t => t !== tool) : [...list, tool]
    }));
  };

  const handleFinish = async () => {
    const finalDiet = formData.dietType === 'Otro' ? customDiet : formData.dietType;
    await updateProfile({
      ...formData,
      dietType: finalDiet as any,
      isOnboarded: true,
    });
    router.replace('/(tabs)');
  };

  const renderChipList = (data: string[], onRemove: (val: string) => void) => (
    <View style={styles.chipContainer}>
      {data.map((item, index) => (
        <View key={index} style={styles.chip}>
          <Text style={styles.chipText}>{item}</Text>
          <TouchableOpacity onPress={() => onRemove(item)} style={styles.chipClose}>
            <FontAwesome name="times" size={10} color="#FFF" />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View>
      <Text style={styles.question}>Estilo de alimentación</Text>
      <View style={styles.grid}>
        {DIETS.map(diet => (
          <TouchableOpacity
            key={diet}
            style={[styles.optionCard, formData.dietType === diet && styles.optionSelected]}
            onPress={() => setFormData({ ...formData, dietType: diet as any })}
          >
            <Text style={[styles.optionText, formData.dietType === diet && styles.textSelected]}>
              {diet}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {formData.dietType === 'Otro' && (
        <TextInput 
          style={styles.input} 
          placeholder="Escribe tu dieta..." 
          placeholderTextColor="#666"
          value={customDiet}
          onChangeText={setCustomDiet}
        />
      )}

      <Text style={[styles.question, { marginTop: 30 }]}>Nivel de cocina</Text>
      <View style={styles.row}>
        {LEVELS.map(level => (
          <TouchableOpacity
            key={level}
            style={[styles.optionCard, styles.flex1, formData.skillLevel === level && styles.optionSelected]}
            onPress={() => setFormData({ ...formData, skillLevel: level as any })}
          >
            <Text numberOfLines={1} style={[styles.optionText, formData.skillLevel === level && styles.textSelected]}>
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.question}>Tus Herramientas</Text>
      <View style={styles.grid}>
        {TOOLS.map(tool => {
          const isSelected = formData.kitchenTools?.includes(tool);
          return (
            <TouchableOpacity
              key={tool}
              style={[styles.optionCard, isSelected && styles.optionSelected]}
              onPress={() => toggleTool(tool)}
            >
              <Text style={[styles.optionText, isSelected && styles.textSelected]}>{tool}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.subtitle}>Otras herramientas:</Text>
      <View style={styles.inputRow}>
        <TextInput 
          style={styles.flexInput} 
          placeholder="Ej: Wok..." 
          placeholderTextColor="#666"
          value={extraToolInput}
          onChangeText={setExtraToolInput}
          onSubmitEditing={() => addChip('kitchenTools', extraToolInput, setExtraToolInput)}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => addChip('kitchenTools', extraToolInput, setExtraToolInput)}>
           <FontAwesome name="plus" size={16} color="#FFF" />
        </TouchableOpacity>
      </View>
      {renderChipList(formData.kitchenTools?.filter(t => !TOOLS.includes(t)) || [], (v) => removeChip('kitchenTools', v))}
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={styles.question}>Alergias / Restricciones</Text>
      <View style={styles.inputRow}>
        <TextInput 
          style={styles.flexInput} 
          placeholder="Ej: Maní, Gluten..." 
          placeholderTextColor="#666"
          value={allergyInput}
          onChangeText={setAllergyInput}
          onSubmitEditing={() => addChip('allergies', allergyInput, setAllergyInput)}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => addChip('allergies', allergyInput, setAllergyInput)}>
           <FontAwesome name="plus" size={16} color="#FFF" />
        </TouchableOpacity>
      </View>
      {renderChipList(formData.allergies || [], (v) => removeChip('allergies', v))}

      <Text style={[styles.question, { marginTop: 30 }]}>Tu Alacena Básica</Text>
      <Text style={styles.subtitle}>Lo que siempre tienes a mano.</Text>
      <View style={styles.inputRow}>
        <TextInput 
          style={styles.flexInput} 
          placeholder="Ej: Arroz, Huevos..." 
          placeholderTextColor="#666"
          value={pantryInput}
          onChangeText={setPantryInput}
          onSubmitEditing={() => addChip('pantryEssentials', pantryInput, setPantryInput)}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => addChip('pantryEssentials', pantryInput, setPantryInput)}>
           <FontAwesome name="plus" size={16} color="#FFF" />
        </TouchableOpacity>
      </View>
      {renderChipList(formData.pantryEssentials || [], (v) => removeChip('pantryEssentials', v))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* AGREGADO: KeyboardAvoidingView para que el teclado empuje el contenido */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <View style={styles.progressBar}><View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} /></View>
          <Text style={styles.title}>{step === 1 ? 'Tu Perfil' : step === 2 ? 'Tu Cocina' : 'Detalles'}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </ScrollView>

        <View style={styles.footer}>
          {step > 1 && (
            <TouchableOpacity onPress={() => setStep(step - 1)} style={styles.backButton}>
              <Text style={styles.backText}>Atrás</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.nextButton} 
            onPress={() => step < 3 ? setStep(step + 1) : handleFinish()}
          >
            <Text style={styles.nextText}>{step === 3 ? 'Finalizar' : 'Siguiente'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  header: { padding: 24, paddingBottom: 10 },
  progressBar: { height: 4, backgroundColor: THEME.card, borderRadius: 2, marginBottom: 15 },
  progressFill: { height: '100%', backgroundColor: THEME.primary, borderRadius: 2 },
  title: { fontSize: 28, fontWeight: 'bold', color: THEME.text },
  content: { padding: 24, paddingBottom: 100 },
  question: { fontSize: 18, fontWeight: '600', color: THEME.text, marginBottom: 12 },
  subtitle: { fontSize: 14, color: THEME.textSecondary, marginTop: 15, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  row: { flexDirection: 'row', gap: 10 },
  flex1: { flex: 1 },
  optionCard: { backgroundColor: THEME.card, paddingVertical: 12, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: THEME.border, marginBottom: 5 },
  optionSelected: { backgroundColor: THEME.primary, borderColor: THEME.primary },
  optionText: { color: THEME.textSecondary, fontWeight: '500', fontSize: 15, textAlign: 'center' },
  textSelected: { color: '#FFF' },
  input: { backgroundColor: THEME.card, color: '#FFF', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: THEME.border, marginTop: 10, fontSize: 16 },
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  flexInput: { flex: 1, backgroundColor: THEME.card, color: '#FFF', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: THEME.border, fontSize: 16 },
  addButton: { backgroundColor: THEME.primary, width: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 },
  chip: { backgroundColor: '#333', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#444' },
  chipText: { color: '#EEE', fontSize: 14 },
  chipClose: { backgroundColor: '#555', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  footer: { padding: 24, flexDirection: 'row', justifyContent: 'flex-end', gap: 15 },
  backButton: { padding: 15 },
  backText: { color: THEME.textSecondary, fontWeight: '600' },
  nextButton: { backgroundColor: THEME.primary, paddingVertical: 15, paddingHorizontal: 30, borderRadius: 12 },
  nextText: { color: '#FFF', fontWeight: 'bold' }
});