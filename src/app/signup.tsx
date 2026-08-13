import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { registerApi } from "../services/api";
import { setCurrentUser } from "../services/authStore";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignup = async () => {
    if (!fullName || !email || !password) {
      setErrorMessage("Full Name, Email, and Password are required.");
      return;
    }

    if (!agreedToTerms) {
      Alert.alert("Terms & Conditions", "Please agree to the Terms & Conditions to proceed.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      const res = await registerApi(fullName.trim(), email.trim(), phone.trim(), password);
      setLoading(false);

      if (!res.success) {
        setErrorMessage(res.message || "Registration failed");
        Alert.alert("Signup Failed", res.message || "Could not create account");
        return;
      }

      if (res.data?.user) {
        setCurrentUser(res.data.user);
      }

      if (Platform.OS === 'web') {
        router.replace("/home");
      } else {
        Alert.alert("Success", "Account created successfully!", [
          { text: "OK", onPress: () => router.replace("/home") }
        ]);
        // Fallback navigation
        setTimeout(() => {
          router.replace("/home");
        }, 500);
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err?.message || "Registration failed");
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* App Header & Logo */}
      <View style={styles.headerContainer}>
        <View style={styles.logoBadge}>
          <Ionicons name="bus" size={24} color="#FFFFFF" />
        </View>
        <Text style={styles.appName}>BusUp</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>
        Enter your details to start your journey.
      </Text>

      {/* Error Banner */}
      {!!errorMessage && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      {/* Full Name */}
      <Text style={styles.label}>Full Name</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={18} color="#64748B" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="John Doe"
          placeholderTextColor="#94A3B8"
          value={fullName}
          onChangeText={setFullName}
          editable={!loading}
        />
      </View>

      {/* Email */}
      <Text style={styles.label}>Email Address</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={18} color="#64748B" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="john@example.com"
          placeholderTextColor="#94A3B8"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          editable={!loading}
        />
      </View>

      {/* Phone Number */}
      <Text style={styles.label}>Phone Number</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="call-outline" size={18} color="#64748B" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="+237 600-000-000"
          placeholderTextColor="#94A3B8"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          editable={!loading}
        />
      </View>

      {/* Password */}
      <Text style={styles.label}>Password</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#94A3B8"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Terms & Conditions Checkbox */}
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => setAgreedToTerms(!agreedToTerms)}
        activeOpacity={0.8}
      >
        <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
          {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.termsText}>
          I agree to the{" "}
          <Text style={styles.linkText}>Terms & Conditions</Text> and{" "}
          <Text style={styles.linkText}>Privacy Policy</Text>
        </Text>
      </TouchableOpacity>

      {/* Passenger Sign Up Button */}
      <TouchableOpacity
        style={[styles.createButton, loading && { opacity: 0.7 }]}
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.createButtonText}>Sign Up →</Text>
        )}
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>Or register with</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Social Register Options */}
      <View style={styles.socialRow}>
        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => console.log("Google Signup")}
        >
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.socialButtonText}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => console.log("Facebook Signup")}
        >
          <Text style={styles.facebookIcon}>f</Text>
          <Text style={styles.socialButtonText}>Facebook</Text>
        </TouchableOpacity>
      </View>

      {/* Login Link */}
      <TouchableOpacity
        style={styles.loginContainer}
        onPress={() => router.replace("/login")}
      >
        <Text style={styles.loginText}>
          Already have an account? <Text style={styles.loginLink}>Login</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  logoIcon: {
    fontSize: 22,
  },
  appName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
  },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
    marginTop: 14,
  },
  inputContainer: {
    height: 52,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    color: "#0F172A",
    fontSize: 15,
    paddingVertical: 0,
  },
  eyeIcon: {
    fontSize: 16,
    padding: 4,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    backgroundColor: "#FFFFFF",
  },
  checkboxChecked: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },
  linkText: {
    color: "#2563EB",
    fontWeight: "600",
  },
  createButton: {
    height: 52,
    marginTop: 20,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 22,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dividerText: {
    color: "#94A3B8",
    paddingHorizontal: 12,
    fontSize: 13,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  socialButton: {
    width: "48%",
    height: 50,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  googleIcon: {
    color: "#4285F4",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 8,
  },
  facebookIcon: {
    color: "#1877F2",
    fontSize: 20,
    fontWeight: "bold",
    marginRight: 8,
  },
  socialButtonText: {
    color: "#334155",
    fontWeight: "600",
    fontSize: 14,
  },
  loginContainer: {
    marginTop: 24,
  },
  loginText: {
    color: "#64748B",
    textAlign: "center",
    fontSize: 14,
  },
  loginLink: {
    color: "#2563EB",
    fontWeight: "700",
  },
});