module.exports = {
  expo: {
    extra: {
      eas: {
        projectId: "d411443f-d72f-41be-a085-696c3fca0981",
      },
    },
    owner: "thisismeraeez",
    name: "neoERA-app",
    slug: "neoERA-app",
    version: "1.0.0",
    orientation: "default",
    icon: "./assets/images/android-icon-foreground.png",
    scheme: "neoeraapp",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.nwork1994.neoeraapp",
      infoPlist: {
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true,
        },
      },
    },
    android: {
      package: "com.nwork1994.neoeraapp",
      versionCode: 1,
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      permissions: ["android.permission.CAMERA", "android.permission.ACCESS_FINE_LOCATION", "android.permission.ACCESS_COARSE_LOCATION"],
    },
    plugins: [
      [
        "expo-build-properties",
        {
          android: {
            usesCleartextTraffic: true,
          },
        },
      ],
      [
        "expo-camera",
        {
          cameraPermission: "Allow $(PRODUCT_NAME) to access your camera for QR scanning",
        },
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Allow $(PRODUCT_NAME) to use your location for delivery tracking",
          locationWhenInUsePermission: "Allow $(PRODUCT_NAME) to use your location for delivery tracking",
        },
      ],
      "expo-font",
      "expo-secure-store",
      "expo-web-browser",
    ],
  },
};
