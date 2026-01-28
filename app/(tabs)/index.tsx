import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, StatusBar, Modal, ActivityIndicator, Alert, LayoutAnimation, Platform, UIManager 
} from 'react-native';
import { useUser, Recipe } from '../context/UserContext';
import { FontAwesome } from '@expo/vector-icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const THEME = {
  background: '#121212',
  card: '#1E1E1E',
  primary: '#7C3AED',
  success: '#10B981',
  text: '#FFFFFF',
  textSecondary: '#A1A1AA',
  border: '#3F3F46',
};

const TIMES = ['15 min', '30 min', '45 min', '+60 min'];
const CALORIES = ['Ligero (<400)', 'Medio (600)', 'Contundente (+800)'];
const BALANCE_OPTIONS = ['Día Libre 🍕', 'Equilibrado 🥘', '100% Sano 🥗'];

export default function HomeScreen() {
  const { profile, toggleSaveRecipe, isRecipeSaved, isLoading: userLoading } = useUser();
  
  const [selectedTime, setSelectedTime] = useState('30 min');
  const [selectedCal, setSelectedCal] = useState('Medio (600)');
  const [selectedBalance, setSelectedBalance] = useState('Equilibrado 🥘');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultRecipe, setResultRecipe] = useState<Recipe | null>(null);
  const [showNutrition, setShowNutrition] = useState(false); 

  // --- FUNCIÓN MÁGICA PARA LIMPIAR ASTERISCOS ---
  const renderStyledText = (text: string) => {
    const parts = text.split('**');
    return (
      <Text style={styles.stepText}>
        {parts.map((part, index) => (
          <Text 
            key={index} 
            style={index % 2 === 1 ? { fontWeight: 'bold', color: '#FFF' } : {}}
          >
            {part}
          </Text>
        ))}
      </Text>
    );
  };
  // ----------------------------------------------

  const handleMagicGenerate = async () => {
    setResultRecipe(null); 
    setIsGenerating(true);
    setShowNutrition(false);

    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      console.log('API URL:', apiUrl);

      if (!apiUrl || apiUrl.includes('REPLACE_WITH_YOUR_RENDER_URL')) {
        Alert.alert("Configuración Incompleta", "Por favor configura la variable EXPO_PUBLIC_API_URL en el archivo .env con la URL de tu backend en Render.");
        setIsGenerating(false);
        return;
      }

      // RECUERDA: Si usas Tunnel, pon aquí tu URL de Ngrok. Si usas local, tu IP.
      const response = await fetch(`${apiUrl}/generate-recipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: profile,
          filters: {
            time: selectedTime,
            calories: selectedCal,
            balance: selectedBalance
          }
        }),
      });

      const data = await response.json();
      if (data && data.length > 0) {
        setResultRecipe(data[0]);
      } else {
        Alert.alert("Ups", "No se generaron recetas.");
      }

    } catch (error) {
      Alert.alert("Error", "No se pudo conectar al chef.");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleNutrition = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowNutrition(!showNutrition);
  };

  const handleSave = () => {
    if (resultRecipe) toggleSaveRecipe(resultRecipe);
  };

  if (userLoading) return <View style={styles.container} />;

  const isSaved = resultRecipe ? isRecipeSaved(resultRecipe) : false;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}><Text style={styles.brandTitle}>Kivly.</Text></View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.label}>⏱️ Tiempo disponible</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {TIMES.map(t => (
              <TouchableOpacity key={t} style={[styles.chip, selectedTime === t && styles.chipActive]} onPress={() => setSelectedTime(t)}>
                <Text style={[styles.chipText, selectedTime === t && styles.chipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>🔥 Tamaño de porción</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {CALORIES.map(c => (
              <TouchableOpacity key={c} style={[styles.chip, selectedCal === c && styles.chipActive]} onPress={() => setSelectedCal(c)}>
                <Text style={[styles.chipText, selectedCal === c && styles.chipTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>⚖️ Balance del plato</Text>
          <View style={styles.grid}>
            {BALANCE_OPTIONS.map(b => (
              <TouchableOpacity key={b} style={[styles.balanceCard, selectedBalance === b && styles.balanceCardActive]} onPress={() => setSelectedBalance(b)}>
                <Text style={[styles.balanceText, selectedBalance === b && styles.balanceTextActive]}>{b}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.magicButton} onPress={handleMagicGenerate} disabled={isGenerating}>
          {isGenerating ? <ActivityIndicator color="#FFF" size="large" /> : <Text style={styles.magicButtonTitle}>DECIDE POR MÍ 🎲</Text>}
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL DE RESULTADO */}
      <Modal visible={!!resultRecipe} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          {resultRecipe && (
            <View style={{ flex: 1 }}>
              <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
                
                <Text style={styles.winnerLabel}>HOY SE COME</Text>
                <Text style={styles.modalTitle}>{resultRecipe.title}</Text>
                <View style={styles.statsRow}>
                   <View style={styles.statBadge}><Text style={styles.statText}>⏱ {resultRecipe.time}</Text></View>
                   <View style={styles.statBadge}><Text style={styles.statText}>🔥 {resultRecipe.calories} kcal</Text></View>
                </View>

                <TouchableOpacity style={styles.nutritionHeader} onPress={toggleNutrition}>
                  <Text style={styles.nutritionTitle}>Información Nutricional</Text>
                  <FontAwesome name={showNutrition ? "chevron-up" : "chevron-down"} size={14} color={THEME.textSecondary} />
                </TouchableOpacity>
                
                {showNutrition && resultRecipe.nutrition && (
                  <View style={styles.nutritionGrid}>
                    <View style={styles.nutriItem}><Text style={styles.nutriVal}>{resultRecipe.nutrition.protein}</Text><Text style={styles.nutriLabel}>Prot</Text></View>
                    <View style={styles.nutriItem}><Text style={styles.nutriVal}>{resultRecipe.nutrition.carbs}</Text><Text style={styles.nutriLabel}>Carb</Text></View>
                    <View style={styles.nutriItem}><Text style={styles.nutriVal}>{resultRecipe.nutrition.fat}</Text><Text style={styles.nutriLabel}>Grasa</Text></View>
                    <View style={styles.nutriItem}><Text style={styles.nutriVal}>{resultRecipe.nutrition.sugar}</Text><Text style={styles.nutriLabel}>Azúcar</Text></View>
                  </View>
                )}

                <Text style={styles.description}>{resultRecipe.description}</Text>
                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>🛒 Ingredientes</Text>
                {resultRecipe.ingredients_list?.map((ing, i) => <Text key={i} style={styles.listItem}>• {ing}</Text>)}

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>👨‍🍳 Pasos</Text>
                {resultRecipe.steps?.map((step, i) => (
                  <View key={i} style={styles.stepContainer}>
                    <Text style={styles.stepNumber}>{i + 1}</Text>
                    {/* USAMOS LA FUNCIÓN DE LIMPIEZA AQUÍ */}
                    {renderStyledText(step)}
                  </View>
                ))}
              </ScrollView>

              <View style={styles.modalFooter}>
                <View style={styles.mainActions}>
                  <TouchableOpacity style={styles.retryButton} onPress={handleMagicGenerate}>
                    <FontAwesome name="refresh" size={20} color="#FFF" />
                    <Text style={styles.retryText}>Otra opción</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.saveButton, isSaved && styles.saveButtonActive]} 
                    onPress={handleSave}
                  >
                    <FontAwesome name={isSaved ? "check" : "heart"} size={20} color={isSaved ? THEME.success : "#FFF"} />
                    <Text style={[styles.saveText, isSaved && { color: THEME.success }]}>
                      {isSaved ? "Guardado" : "Guardar"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.closeLink} onPress={() => setResultRecipe(null)}>
                  <Text style={styles.closeLinkText}>Cerrar</Text>
                </TouchableOpacity>
              </View>

            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  header: { padding: 20, marginBottom: 5 },
  brandTitle: { fontSize: 34, fontWeight: '800', color: THEME.primary, letterSpacing: -1 },
  scrollContent: { padding: 20, paddingBottom: 50 },
  section: { marginBottom: 25 },
  label: { fontSize: 18, fontWeight: '600', color: '#FFF', marginBottom: 12 },
  chipsScroll: { flexDirection: 'row' },
  chip: { backgroundColor: THEME.card, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, marginRight: 10, borderWidth: 1, borderColor: THEME.border },
  chipActive: { backgroundColor: THEME.primary, borderColor: THEME.primary },
  chipText: { color: THEME.textSecondary, fontWeight: '600', fontSize: 14 },
  chipTextActive: { color: '#FFF' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  balanceCard: { width: '100%', backgroundColor: THEME.card, padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: THEME.border, marginBottom: 5 },
  balanceCardActive: { borderColor: THEME.primary, backgroundColor: 'rgba(124, 58, 237, 0.1)' },
  balanceText: { color: THEME.textSecondary, fontWeight: '700', fontSize: 16 },
  balanceTextActive: { color: THEME.primary },
  magicButton: { backgroundColor: THEME.primary, borderRadius: 20, padding: 24, alignItems: 'center', marginTop: 20, shadowColor: THEME.primary, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 },
  magicButtonTitle: { color: '#FFF', fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  
  modalContainer: { flex: 1, backgroundColor: '#18181B' },
  winnerLabel: { color: THEME.primary, textAlign: 'center', fontWeight: 'bold', letterSpacing: 2, marginBottom: 5, fontSize: 12 },
  modalTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFF', textAlign: 'center', marginBottom: 15 },
  statsRow: { flexDirection: 'row', justifyContent: 'center', gap: 15, marginBottom: 20 },
  statBadge: { backgroundColor: '#27272A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statText: { color: '#FFF', fontWeight: '600' },
  nutritionHeader: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, padding: 10, backgroundColor: '#222', borderRadius: 8, alignSelf: 'center', marginBottom: 10 },
  nutritionTitle: { color: THEME.textSecondary, fontSize: 14, fontWeight: '600' },
  nutritionGrid: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#27272A', padding: 15, borderRadius: 12, marginBottom: 20 },
  nutriItem: { alignItems: 'center' },
  nutriVal: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  nutriLabel: { color: '#888', fontSize: 12 },
  description: { color: '#AAA', fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 20 },
  divider: { height: 1, backgroundColor: '#3F3F46', marginVertical: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: THEME.primary, marginBottom: 15 },
  listItem: { color: '#FFF', fontSize: 16, marginBottom: 8 },
  stepContainer: { flexDirection: 'row', marginBottom: 15 },
  stepNumber: { color: THEME.primary, fontWeight: 'bold', fontSize: 18, width: 30 },
  
  // ESTILO MEJORADO PARA EL TEXTO
  stepText: { color: '#E4E4E7', fontSize: 16, flex: 1, lineHeight: 24 },
  
  modalFooter: { padding: 20, backgroundColor: '#18181B', borderTopWidth: 1, borderTopColor: '#333' },
  mainActions: { flexDirection: 'row', gap: 15, marginBottom: 15 },
  retryButton: { flex: 1, flexDirection: 'row', gap: 8, backgroundColor: '#333', padding: 16, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  retryText: { color: '#FFF', fontWeight: 'bold' },
  saveButton: { flex: 1, flexDirection: 'row', gap: 8, backgroundColor: THEME.primary, padding: 16, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  saveButtonActive: { backgroundColor: '#064E3B' },
  saveText: { color: '#FFF', fontWeight: 'bold' },
  closeLink: { alignItems: 'center', padding: 10 },
  closeLinkText: { color: '#666', fontSize: 14, fontWeight: '600' },
});