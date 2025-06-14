import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.showmate",
  appName: "Showmate",

  server: {
    url: "http://192.168.1.61:3000", // Mets ici ton vrai domaine
    cleartext: true, // Optionnel, utile pour du http local/dev (en prod laisse https)
    allowNavigation: [
      "http://192.168.1.61:3000",
      "https://www.google.com/recaptcha/*",
      // Ajoute ici d'autres URLs à autoriser si besoin
    ],
    // androidScheme: "https",             // Optionnel, garde https pour la prod
    // iosScheme: "https",                 // Optionnel, garde https pour la prod
  },

  ios: {
    limitsNavigationsToAppBoundDomains: false, // Permet de charger tout domaine spécifié
  },

  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["apple.com", "facebook.com", "google.com"],
    },
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: true,
      backgroundColor: "#16171a", // Par exemple, adapte à ton branding
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
