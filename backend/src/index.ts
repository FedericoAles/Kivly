import express, { Request, Response } from 'express';
import cors from 'cors';
import Groq from 'groq-sdk';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.error("❌ FALTA LA API KEY DE GROQ EN EL ARCHIVO .ENV (GROQ_API_KEY)");
}

const groq = new Groq({ apiKey: GROQ_API_KEY || "" });

interface RecipeRequest {
  profile: {
    dietType: string;
    kitchenTools: string[];
    pantryEssentials: string[];
    allergies: string[];
    skillLevel: string;
  };
  filters: {
    time: string;
    calories: string;
    balance: string;
  };
}

app.post('/generate-recipes', async (req: Request, res: Response) => {
  try {
    const { profile, filters } = req.body as RecipeRequest;
    console.log(`--- Generando para: ${profile.dietType} | Nivel: ${profile.skillLevel} ---`);
    console.log(`Filtros: Tiempo=${filters.time}, Calorías=${filters.calories}, Balance=${filters.balance}`);

    // USAMOS LLAMA 3.3 70B VERSATILE POR SU CAPACIDAD DE RAZONAMIENTO SUPERIOR
    const modelId = "llama-3.3-70b-versatile";

    const pantryStaples = "Agua, Sal, Pimienta, Aceite, Vinagre, Leche, Azúcar, Harina, Huevos, Ajo, Cebolla";

    // Prompt mejorado y detallado
    const prompt = `
      ROL: Eres un Chef Ejecutivo de Clase Mundial experto en adaptar recetas a inventarios limitados sin sacrificar calidad.
      
      OBJETIVO:
      Crear UNA receta detallada, deliciosa y realista basada en los ingredientes disponibles del usuario y sus preferencias estrictas.
      
      DATOS DEL USUARIO (SIEMPRE TENER EN CUENTA PARA CADA RECETA):
      1. INVENTARIO DISPONIBLE: [${profile.pantryEssentials.join(', ')}].
      2. BÁSICOS ASUMIDOS (Siempre disponibles): [${pantryStaples}].
      3. HERRAMIENTAS: [${profile.kitchenTools.join(', ')}].
      4. ALERGIAS (CRÍTICO - EVITAR A TODA COSTA): [${profile.allergies.join(', ') || 'Ninguna'}].
      5. NIVEL DE COCINA: ${profile.skillLevel}.
      6. DIETA (RESPETAR SIEMPRE): ${profile.dietType}.
      
      FILTROS OBLIGATORIOS (NO IGNORAR):
      - TIEMPO MÁXIMO: ${filters.time}. (La receta debe poder hacerse en este tiempo real).
      - OBJETIVO CALÓRICO: ${filters.calories}. (Ajusta porciones e ingredientes para acercarte).
      - TIPO DE PLATO / BALANCE: ${filters.balance}. (Ej: Si es "Día Libre", haz algo rico/grasoso. Si es "Sano", prioriza vegetales/proteínas magras).

      REGLAS DE ORO:
      1. REALISMO: No inventes platos absurdos como "Pollo al pollo". Basa tu respuesta en recetas culinarias reales (Italiana, Mexicana, Asiática, Criolla, etc.).
      2. INGREDIENTES: Debes usar PRINCIPALMENTE lo que hay en el INVENTARIO.
         - Puedes usar libremente los BÁSICOS.
         - Si falta UN ingrediente clave para que la receta sea excelente (ej: queso rallado para pasta), puedes sugerirlo como "Opcional" o incluirlo, pero prioriza lo que hay.
      3. PASOS CON VIDA: No des instrucciones robóticas. Explica CÓMO y POR QUÉ.
         - Mal: "Cocinar la carne."
         - Bien: "Sella la carne a fuego fuerte por 3 minutos de cada lado hasta que dore, esto mantendrá los jugos dentro."
      4. ADAPTACIÓN: Si el usuario tiene "Carne" pero no especifica corte, asume un corte común versátil. Si falta una herramienta específica, sugiere la alternativa (Sartén en vez de Wok).
      5. HERRAMIENTAS: Una acción culinaria es válida SOLO si la herramienta necesaria está en la lista.
         - Ejs: "Hornear" requiere "Horno". "Hervir" requiere "Hornalla" o "Cocina". "Licuar" requiere "Licuadora".
         - SI FALTA LA HERRAMIENTA PRINCIPAL: Debes adaptar la técnica (Ej: Si es una pizza pero no hay horno, hazla a la sartén. Si no hay sartén, hazla al microondas).
      6. FORMATO VISUAL (LIMPIEZA):
         - PASOS: Devuelve SOLO el texto de la acción. NO escribas "Paso 1:", "1.", ni nada parecido al inicio. El frontend ya pone los números.
         - INGREDIENTES: Lista limpia.
      7. REGLA DE ALEATORIEDAD PURA (CRÍTICO):
         - SIMULACIÓN DE AZAR: Antes de empezar, simula una selección completamente aleatoria (Random Pick) entre todos los ingredientes principales disponibles.
         - PROHIBIDO EL FAVORITISMO: Ignora qué ingrediente es más "popular" o "fácil". Si tienes [Pollo, Cerdo, Lentejas], debes darles exactamente la misma probabilidad (33% a cada uno). No elijas Pollo solo porque es lo más común.
         - INSTRUCCIÓN DIRECTA: Elige uno al azar y construye la receta alrededor de ese elegido, sin importar si es el más difícil de cocinar.

      OUTPUT FORMATO JSON (ARRAY ÚNICO):
      [
        {
          "title": "Nombre Atractivo y Real del Plato",
          "description": "Una descripción apetitosa de 2 lineas.",
          "time": "${filters.time}",
          "calories": NumeroEntero (Estimado),
          "nutrition": { "protein": "XXg", "carbs": "XXg", "fat": "XXg", "sugar": "XXg" },
          "ingredients_list": ["Lista completa de ingredientes con cantidades aproximadas para 1 persona"],
          "steps": [
             "Paso 1 detallado...", 
             "Paso 2 detallado...",
             ...
             "Paso final de emplatado."
          ]
        }
      ]
      
      NOTA: Devuelve SOLO el JSON puro, sin bloques de código ni texto extra.
    `;

    const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: modelId,
        temperature: 0.6, // Creatividad controlada para seguir instrucciones
        max_tokens: 2048,
        response_format: { type: "json_object" }
    });

    let text = chatCompletion.choices[0]?.message?.content || "";
    
    // Limpieza extra
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    let recipes;
    try {
        recipes = JSON.parse(text);
        if (!Array.isArray(recipes) && recipes.recipes) {
            recipes = recipes.recipes;
        }
        if (!Array.isArray(recipes)) {
            recipes = [recipes];
        }
    } catch (e) {
        console.error("Error parseando JSON de Groq:", text);
        throw new Error("Formato inválido del Chef");
    }

    console.log("✅ Receta generada y enviada.");
    res.json(recipes);

  } catch (error: any) {
    console.error("❌ Error generando receta:", error);
    
    if (error.status === 429 || (error.message && error.message.includes('429'))) {
      res.status(429).json({ error: "Has alcanzado el límite de peticiones en Groq. Intenta más tarde." });
    } else if (error.status === 401) {
        res.status(401).json({ error: "Error de autenticación con Groq. Revisa la API KEY." });
    } else {
      res.status(500).json({ error: "El chef tuvo un problema técnico. Intenta de nuevo." });
    }
  }
});

app.listen(PORT, () => {
  console.log(`🔥 Kivly Backend corriendo en http://localhost:${PORT}`);
});
