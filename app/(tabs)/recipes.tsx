import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, Modal, ScrollView, StatusBar, LayoutAnimation, Platform, UIManager 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser, Recipe } from '../context/UserContext';
import { FontAwesome } from '@expo/vector-icons';
import { GestureHandlerRootView, Swipeable, FlatList, TouchableOpacity } from 'react-native-gesture-handler';

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
  danger: '#EF4444',
};

export default function RecipesScreen() {
  const { profile, toggleSaveRecipe } = useUser();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showNutrition, setShowNutrition] = useState(false);

  // --- LOGICA VIEJA (ROBUSTA) ---
  // Un simple bloque rojo que llena el espacio. Sin cálculos raros.
  const renderRightActions = (progress: any, dragX: any, item: Recipe) => {
    return (
      <TouchableOpacity 
        style={styles.deleteAction} // Estilo simple de bloque
        onPress={() => toggleSaveRecipe(item)}
      >
        <FontAwesome name="trash" size={24} color="#FFF" />
        <Text style={styles.deleteText}>Borrar</Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: Recipe }) => (
    <View style={styles.itemWrapper}>
      {/* EL TRUCO DE MAGIA: 
         Envolvemos el Swipeable en un View con borderRadius y overflow: hidden.
         Esto recorta el bloque rojo cuadrado y lo obliga a ser redondo.
      */}
      <View style={styles.swipeContainer}>
        <Swipeable 
          renderRightActions={(p, d) => renderRightActions(p, d, item)}
          friction={2}
          rightThreshold={40}
        >
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => setSelectedRecipe(item)} 
            activeOpacity={1} // Opacidad 1 para que no parpadee al tocar
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
              <FontAwesome name="chevron-right" size={14} color="#666" />
            </View>
            <View style={styles.statsRowCard}>
              <Text style={styles.stat}>⏱ {item.time}</Text>
              <Text style={styles.stat}>🔥 {item.calories} kcal</Text>
            </View>
          </TouchableOpacity>
        </Swipeable>
      </View>
    </View>
  );

  // --- RENDERS AUXILIARES (TEXTO, MODAL, ETC.) ---
  const renderStyledText = (text: string) => {
    const parts = text.split('**');
    return (
      <Text style={styles.stepText}>
        {parts.map((part, index) => (
          <Text key={index} style={index % 2 === 1 ? { fontWeight: 'bold', color: '#FFF' } : {}}>{part}</Text>
        ))}
      </Text>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}><Text style={styles.title}>Mis Recetas</Text></View>

        {profile.savedRecipes.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome name="bookmark-o" size={50} color="#333" />
            <Text style={styles.emptyText}>Desliza recetas aquí para guardarlas.</Text>
          </View>
        ) : (
          <FlatList
            data={profile.savedRecipes}
            renderItem={renderItem}
            keyExtractor={(item) => item.title}
            contentContainerStyle={styles.list}
          />
        )}

        {/* MODAL SIN CAMBIOS */}
        <Modal visible={!!selectedRecipe} animationType="slide" presentationStyle="pageSheet">
          <View style={styles.modalContainer}>
            {selectedRecipe && (
              <View style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
                  <Text style={styles.winnerLabel}>RECETA GUARDADA</Text>
                  <Text style={styles.modalTitle}>{selectedRecipe.title}</Text>
                  <View style={styles.statsRow}>
                    <View style={styles.statBadge}><Text style={styles.statText}>⏱ {selectedRecipe.time}</Text></View>
                    <View style={styles.statBadge}><Text style={styles.statText}>🔥 {selectedRecipe.calories} kcal</Text></View>
                  </View>
                  <TouchableOpacity style={styles.nutritionHeader} onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setShowNutrition(!showNutrition); }}>
                    <Text style={styles.nutritionTitle}>Información Nutricional</Text>
                    <FontAwesome name={showNutrition ? "chevron-up" : "chevron-down"} size={14} color={THEME.textSecondary} />
                  </TouchableOpacity>
                  {showNutrition && selectedRecipe.nutrition && (
                    <View style={styles.nutritionGrid}>
                      <View style={styles.nutriItem}><Text style={styles.nutriVal}>{selectedRecipe.nutrition.protein}</Text><Text style={styles.nutriLabel}>Prot</Text></View>
                      <View style={styles.nutriItem}><Text style={styles.nutriVal}>{selectedRecipe.nutrition.carbs}</Text><Text style={styles.nutriLabel}>Carb</Text></View>
                      <View style={styles.nutriItem}><Text style={styles.nutriVal}>{selectedRecipe.nutrition.fat}</Text><Text style={styles.nutriLabel}>Grasa</Text></View>
                      <View style={styles.nutriItem}><Text style={styles.nutriVal}>{selectedRecipe.nutrition.sugar}</Text><Text style={styles.nutriLabel}>Azúcar</Text></View>
                    </View>
                  )}
                  <Text style={styles.description}>{selectedRecipe.description}</Text>
                  <View style={styles.divider} />
                  <Text style={styles.sectionTitle}>🛒 Ingredientes</Text>
                  {selectedRecipe.ingredients_list.map((ing, i) => <Text key={i} style={styles.listItem}>• {ing}</Text>)}
                  <View style={styles.divider} />
                  <Text style={styles.sectionTitle}>👨‍🍳 Pasos</Text>
                  {selectedRecipe.steps.map((step, i) => (
                    <View key={i} style={styles.stepContainer}>
                      <Text style={styles.stepNumber}>{i + 1}</Text>
                      {renderStyledText(step)}
                    </View>
                  ))}
                </ScrollView>
                <View style={styles.modalFooter}>
                  <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedRecipe(null)}>
                    <Text style={styles.closeText}>Cerrar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  header: { padding: 24, paddingBottom: 10 },
  title: { fontSize: 32, fontWeight: 'bold', color: THEME.text },
  list: { padding: 24 },
  
  // --- ESTILOS CLAVE PARA EL SWIPE ---
  itemWrapper: {
    marginBottom: 12, 
  },
  // Este contenedor es el secreto: Recorta todo lo que esté dentro (incluido el botón rojo cuadrado)
  swipeContainer: {
    borderRadius: 16,
    overflow: 'hidden', 
    backgroundColor: THEME.card, // Fondo base por si acaso
  },
  
  card: { 
    backgroundColor: THEME.card, 
    padding: 20, 
    // No necesitamos borderRadius aquí porque lo da el padre (swipeContainer)
    // Pero podemos dejarlo por seguridad visual
  },

  // Botón rojo estilo "Bloque" (Estable)
  deleteAction: {
    backgroundColor: THEME.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 100, // Un buen ancho para arrastrar
    height: '100%',
  },
  deleteText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 5,
  },
  // ------------------------------------

  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', flex: 1, marginRight: 10 },
  statsRowCard: { flexDirection: 'row', gap: 15 },
  stat: { color: THEME.textSecondary, fontWeight: '500' },
  
  // Estilos generales (iguales)
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', opacity: 0.5 },
  emptyText: { color: '#FFF', marginTop: 10, fontSize: 16 },
  modalContainer: { flex: 1, backgroundColor: '#18181B' },
  winnerLabel: { color: THEME.primary, textAlign: 'center', fontWeight: 'bold', letterSpacing: 2, marginBottom: 5, fontSize: 12, marginTop: 20 },
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
  stepText: { color: '#E4E4E7', fontSize: 16, flex: 1, lineHeight: 24 },
  modalFooter: { padding: 24, backgroundColor: '#18181B', borderTopWidth: 1, borderTopColor: '#333' },
  closeButton: { backgroundColor: '#333', padding: 16, borderRadius: 16, alignItems: 'center' },
  closeText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});