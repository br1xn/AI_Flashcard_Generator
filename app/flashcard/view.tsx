// app/flashcard/view.tsx
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Animated,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, ChevronRight, Home, Eye, EyeOff } from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function FlashcardViewScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const cards: any[] = params.flashcards ? JSON.parse(params.flashcards as string) : [];

  const [index, setIndex] = useState(0);
  const rotation = useRef(new Animated.Value(0)).current;
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);

  if (!cards || cards.length === 0) {
    return (
      <SafeAreaView style={s.safeArea}>
        <View style={s.emptyContainer}>
          <Text style={s.emptyText}>No flashcards found</Text>
          <TouchableOpacity style={s.homeButton} onPress={() => router.replace("/")}>
            <Home size={18} color="#6366f1" />
            <Text style={s.homeButtonText}>Go Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const card = cards[index];

  const toggleFlip = (i: number) => {
    const currentlyFlipped = flippedIndex === i;
    const toValue = currentlyFlipped ? 0 : 180;

    Animated.spring(rotation, {
      toValue,
      friction: 8,
      useNativeDriver: true,
    }).start();

    setFlippedIndex(currentlyFlipped ? null : i);
  };

  const frontInterpolate = rotation.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });
  const backInterpolate = rotation.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  return (
    <SafeAreaView style={s.safeArea}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.iconButton}>
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Card {index + 1} of {cards.length}</Text>
        <TouchableOpacity onPress={() => router.replace("/")} style={s.iconButton}>
          <Home size={22} color="#6366f1" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={s.progressBar}>
        <View style={[s.progressFill, { width: `${((index + 1) / cards.length) * 100}%` }]} />
      </View>
      
      {/* Flashcard + Navigation */}
      <ScrollView contentContainerStyle={s.scrollContent}>
        <View style={s.flashcardWrapper}>
          {/* Flashcard */}
          <Animated.View
            style={[
              s.card,
              { position: "absolute", backfaceVisibility: "hidden", transform: [{ rotateY: frontInterpolate }],
              opacity: flippedIndex === index ? 0 : 1, zIndex: flippedIndex === index ? 0 : 1,},
            ]}
          >
            <Text style={s.questionLabel}>Question</Text>
            <Text style={s.questionText}>{card.question}</Text>
            <TouchableOpacity style={s.showButton} onPress={() => toggleFlip(index)}>
              <Eye size={18} color="#fff" />
              <Text style={s.showButtonText}>Show Answer</Text>
            </TouchableOpacity>
          </Animated.View>
      
          {/* Back Side */}
          <Animated.View
            style={[
              s.card,
              { position: "absolute", top: 0, bottom: 0, right: 0, left:0, backfaceVisibility: "hidden", transform: 
                [{   rotateY: backInterpolate }] ,
                opacity: flippedIndex === index ? 1 : 0,  
                zIndex: flippedIndex === index ? 1 : 0,
              },
            ]}            
          >
            <View style={{ flex: 1 }}>
              <Text style={s.answerLabel}>📝 Short Answer</Text>
              <Text style={s.shortAnswer}>{card.short_answer}</Text>
      
              <View style={s.divider} />
      
              <Text style={s.answerLabel}>📚 Detailed Answer</Text>
              <Text style={s.longAnswer}>{card.long_answer}</Text>
            </View>
      
            <TouchableOpacity style={s.hideButton} onPress={() => toggleFlip(index)}>
              <EyeOff size={18} color="#6366f1" />
              <Text style={s.hideButtonText}>Hide Answer</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      
        {/* Navigation */}
        <View style={s.navigation}>
          <TouchableOpacity
            style={[s.navButton, index === 0 && { opacity: 0.5 }]}
            onPress={() => {
              if (index > 0) {
                setIndex(index - 1);
                rotation.setValue(0);
                setFlippedIndex(null);
              }
            }}
            disabled={index === 0}
          >
            <ChevronLeft size={20} color={index === 0 ? "#d1d5db" : "#6366f1"} />
            <Text style={[s.navButtonText, index === 0 && { color: "#d1d5db" }]}>Previous</Text>
          </TouchableOpacity>
      
          <TouchableOpacity
            style={[s.navButton, index === cards.length - 1 && { opacity: 0.5 }]}
            onPress={() => {
              if (index < cards.length - 1) {
                setIndex(index + 1);
                rotation.setValue(0);
                setFlippedIndex(null);
              }
            }}
            disabled={index === cards.length - 1}
          >
            <Text style={[s.navButtonText, index === cards.length - 1 && { color: "#d1d5db" }]}>Next</Text>
            <ChevronRight size={20} color={index === cards.length - 1 ? "#d1d5db" : "#6366f1"} />
          </TouchableOpacity>
        </View>
        {/* Finish Button — just below navigation */}
        {index === cards.length - 1 && (
          <TouchableOpacity style={s.finishButton} onPress={() => router.replace("/")}>
            <Home size={18} color="#fff" />
            <Text style={s.finishButtonText}>Finish & Go Home</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  headerTitle: { fontSize: 16, fontWeight: "700" },
  iconButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  progressBar: { height: 4, backgroundColor: "#e5e7eb" },
  progressFill: { height: "100%", backgroundColor: "#6366f1" },

  scrollContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },

  flashcardWrapper: {
    width: width - 40,
    height: 420,
    alignItems: "center",
    justifyContent: "center",
    position: "relative", 
    marginBottom: 20,
  },

  card: {
    width: width - 40,
    minHeight: 380,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  questionLabel: {
    fontSize: 12,
    color: "#6366f1",
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  questionText: { fontSize: 20, fontWeight: "700", color: "#111827", lineHeight: 28 },
  showButton: {
    marginTop: 18,
    backgroundColor: "#6366f1",
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  showButtonText: { color: "#fff", fontWeight: "700", marginLeft: 8 },
  answerLabel: { fontSize: 14, fontWeight: "700", color: "#6b7280", marginBottom: 8 },
  shortAnswer: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 12 },
  divider: { height: 1, backgroundColor: "#f3f4f6", marginVertical: 16 },
  longAnswer: { fontSize: 15, color: "#374151", lineHeight: 22 },
  hideButton: {
    marginTop: 20,
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  hideButtonText: { color: "#6366f1", fontWeight: "700", marginLeft: 8 },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: width - 80,
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#6366f1",
  },
  navButtonText: { color: "#6366f1", fontWeight: "600" },
  finishButton: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#10b981",
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 14,
    borderRadius: 12,
  },
  finishButtonText: { color: "#fff", fontWeight: "700", marginLeft: 8 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  emptyText: { color: "#6b7280", fontSize: 18, marginBottom: 16 },
  homeButton: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#6366f1",
  },
  homeButtonText: { color: "#6366f1", fontWeight: "600", marginLeft: 8 },
});
