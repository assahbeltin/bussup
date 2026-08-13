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
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { loginApi } from "../services/api";
import { setCurrentUser, setAuthToken } from "../services/authStore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      const res = await loginApi(email.trim(), password);
      setLoading(false);

      if (!res.success || !res.data) {
        setErrorMessage(res.message || "Invalid credentials");
        Alert.alert("Login Failed", res.message || "Invalid credentials");
        return;
      }

      const { user, token } = res.data;
      if (token) {
        setAuthToken(token);
      }
      if (user) {
        setCurrentUser(user);
      }

      if (user.role === 'admin') {
        router.replace("/bus-admin/overview");
      } else {
        router.replace("/home");
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err?.message || "Login failed");
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        {/* App Header & Logo */}
        <View style={styles.headerContainer}>
          <View style={styles.logoBadge}>
            <Ionicons name="bus" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.appName}>BusUp</Text>
        </View>

        {/* Welcome Title */}
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>
          Ready for your next journey? Log in to manage your bookings.
        </Text>

        {/* Error Banner */}
        {!!errorMessage && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Email Input */}
        <Text style={styles.label}>Email Address</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={18} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="name@example.com"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />
        </View>

        {/* Password Header (Label + Forgot Password) */}
        <View style={styles.passwordHeader}>
          <Text style={styles.label}>Password</Text>
          <TouchableOpacity onPress={() => router.push("../forgot-password")}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Password Input */}
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

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.loginButton, loading && { opacity: 0.7 }]}
          onPress={() => handleLogin()}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.loginText}>Log In →</Text>
          )}
        </TouchableOpacity>



        {/* Signup Link */}
        <TouchableOpacity
          style={styles.signupContainer}
          onPress={() => router.push("/signup")}
        >
          <Text style={styles.signupText}>
            Don't have an account? <Text style={styles.signupLink}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: "center",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 16,
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
    marginBottom: 28,
    lineHeight: 20,
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
  },
  passwordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2563EB",
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
  loginButton: {
    height: 52,
    marginTop: 24,
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
  loginText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  adminButton: {
    height: 52,
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: "#0F172A",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  adminIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  adminText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
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
  signupContainer: {
    marginTop: 24,
  },
  signupText: {
    color: "#64748B",
    textAlign: "center",
    fontSize: 14,
  },
  signupLink: {
    color: "#2563EB",
    fontWeight: "700",
  },
});