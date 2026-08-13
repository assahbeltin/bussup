import { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";


export default function SplashScreen() {

  const progress = useRef(new Animated.Value(0)).current;


  useEffect(() => {

    Animated.timing(progress, {
      toValue: 1,
      duration: 5000,
      useNativeDriver: false,
    }).start();


    const timer = setTimeout(() => {
      router.replace("/login");
    }, 5000);


    return () => clearTimeout(timer);

  }, []);



  return (

    <View style={styles.container}>

      {/* Hide phone status bar */}
      <StatusBar hidden />


      {/* Logo */}
      <Text style={styles.logo}>
        Bus<Text style={styles.blue}>up</Text>
      </Text>


      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Your Ticket to Anywhere
      </Text>



      {/* Bus Image */}
      <View style={styles.circle}>

        
<Image
  source={require("../../assets/images/bus1.jpg")}
  style={styles.bus}
/>
      </View>




      {/* Loading Bar */}
      <View style={styles.progress}>

        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />

      </View>



      {/* Loading Text */}
      <Text style={styles.loading}>
        SECURING YOUR JOURNEY...
      </Text>


    </View>

  );
}



const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#090913",
    alignItems: "center",
    paddingTop: 120,
  },


  logo: {
    fontSize: 54,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 30,
  },


  blue: {
    color: "#00D8FF",
  },


  subtitle: {
    color: "#9EA0AA",
    fontSize: 18,
    marginTop: 8,
    marginBottom: 45,
  },


  circle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 4,
    borderColor: "#00D8FF",
    overflow: "hidden",
  },


  bus: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },


  progress: {
    width: "75%",
    height: 5,
    backgroundColor: "#41414C",
    borderRadius: 5,
    marginTop: 55,
    overflow: "hidden",
  },


  progressFill: {
    height: "100%",
    backgroundColor: "#00D8FF",
    borderRadius: 5,
  },


  loading: {
    color: "#ffff",
    letterSpacing: 3,
    marginTop: 18,
    fontSize: 12,
  },

});