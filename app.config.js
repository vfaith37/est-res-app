import appJson from "./app.json";

export default ({ config }) => ({
  ...config,
  ...appJson.expo,
  name: process.env.EXPO_PUBLIC_APP_NAME || appJson.expo.name,
  slug: "estate-manager",
  ios: {
    ...appJson.expo.ios,
    bundleIdentifier: "com.st33v3.estatemanager",
    infoPlist: {
      ...appJson.expo.ios.infoPlist,
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  extra: {
    ...appJson.expo.extra,
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
    eas: {
      projectId: "6633f0aa-417f-484c-9745-d256ab72bc75",
    },
  },
});
