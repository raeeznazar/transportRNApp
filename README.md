# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

Node module use in this project v20.19.4

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```


App navigation (simplified)
Splash
├─ if auth success & complete session -> Main (TabNavigator)
│ ├─ Home (DrawerNavigator)
│ │ ├─ Dashboard
│ │ ├─ Inwades
│ │ ├─ Sales
│ │ └─ Revenue
│ └─ Tiles
├─ if auth success but session incomplete -> Setup
└─ otherwise -> Login



API request / token lifecycle
Component -> useApi / AuthService -> apiClient request interceptor:

attach Authorization: Bearer <token> if present
send request to server
Server responds:
2xx -> response returned to component
401 Unauthorized -> response interceptor:
attempt refresh with stored refresh token:
refresh success -> save new tokens via SecureStoreService.saveCredentials(...) -> retry original request -> return result
refresh failure -> SecureStoreService.clearCredentials() and (should) notify app to log out -> reject error