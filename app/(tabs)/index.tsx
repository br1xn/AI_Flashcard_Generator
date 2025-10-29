// app/(tabs)/index.tsx
import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Sparkles } from "lucide-react-native";
import Slider from "@react-native-community/slider";
import { generateFlashcards } from "../api/generate-flashcards";

export default function HomeScreen() {
  const [textInput, setTextInput] = useState("");
  const [questionCount, setQuestionCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  const handleGenerate = async () => {
    if (!textInput.trim()) {
      Alert.alert("Error", "Please enter some text to generate flashcards");
      return;
    }

    setLoading(true);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 400);

    try {
      // call function with text + count
      const cards = await generateFlashcards(textInput, questionCount);

      clearInterval(progressInterval);
      setProgress(100);

      // optional: save to history (if you use the provider)
      // const setId = saveSet({ title: textInput.slice(0,40), flashcards: cards });

      setTimeout(() => {
        setLoading(false);
        // navigate to view screen with serialized flashcards
        router.push({
          pathname: "/flashcard/view",
          params: { flashcards: JSON.stringify(cards) },
        });
      }, 350);
    } catch (err: any) {
      clearInterval(progressInterval);
      setLoading(false);
      setProgress(0);
      Alert.alert("Error", err.message || "Failed to generate flashcards");
      console.error(err);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Sparkles size={36} color="#6366f1" strokeWidth={2} />
            <Text style={styles.title}>AI Flashcards</Text>
          </View>
          <Text style={styles.subtitle}>
            Turn notes into study flashcards — quick, minimal & focused.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Paste your content</Text>
          <TextInput
            placeholder="Paste notes, paragraphs or upload files later..."
            placeholderTextColor="#9ca3af"
            value={textInput}
            onChangeText={setTextInput}
            multiline
            style={styles.textInput}
            textAlignVertical="top"
            editable={!loading}
          />
          <Text style={styles.hint}>{textInput.length} characters</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sliderHeader}>
            <Text style={styles.label}>Number of flashcards</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{questionCount}</Text>
            </View>
          </View>

          <Slider
            style={styles.slider}
            minimumValue={3}
            maximumValue={30}
            step={1}
            value={questionCount}
            onValueChange={setQuestionCount}
            minimumTrackTintColor="#6366f1"
            maximumTrackTintColor="#e5e7eb"
            thumbTintColor="#6366f1"
            disabled={loading}
          />

          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>3</Text>
            <Text style={styles.sliderLabel}>30</Text>
          </View>
        </View>

        {loading && (
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>Generating... {progress}%</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleGenerate}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Generate Flashcards</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* styles: use your previously provided stylesheet — trimmed for brevity */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f9fafb" },
  container: { flex: 1 },
  contentContainer: { padding: 20, paddingTop: 40 },
  headerTop: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  header: { marginBottom: 20, alignItems: "flex-start"  },
  title: { fontSize: 28, fontWeight: "700", color: "#111827" },
  subtitle: { fontSize: 14, color: "#6b7280", marginTop: 4 },
  section: { marginBottom: 20 },
  label: { fontSize: 15, fontWeight: "600", color: "#111827", marginBottom: 8 },
  textInput: { backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb", padding: 12, minHeight: 120 },
  hint: { fontSize: 12, color: "#9ca3af", marginTop: 8 },
  sliderHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  countBadge: { backgroundColor: "#6366f1", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  countText: { color: "#fff", fontWeight: "700" },
  slider: { width: "100%", height: 40, marginTop: 8 },
  sliderLabels: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4 },
  sliderLabel: { color: "#6b7280" },
  progressSection: { marginVertical: 10 },
  progressBar: { height: 8, backgroundColor: "#e5e7eb", borderRadius: 8, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#6366f1" },
  progressText: { textAlign: "center", color: "#6b7280", marginTop: 6 },
  button: { marginTop: 12, backgroundColor: "#6366f1", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
