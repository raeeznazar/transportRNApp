module.exports = {
  expo: {
    name: "neoERA-app",
    slug: "neoERA-app",
    version: "1.0.0",
    orientation: "default",
    icon: "./assets/images/icon.png",
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
    ],
    extra: {
      eas: {
        projectId: "5db54ad0-7085-40fd-991e-951fb6328045",
      },
    },
  },
};
