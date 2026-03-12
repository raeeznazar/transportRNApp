const config = {
  development: {
    API_BASE_URL: "http://13.250.76.147:8083/api",
    API_TIMEOUT: 10000,
  },
  production: {
    API_BASE_URL: "http://13.250.76.147:8083/api",
    // live uat
    // API_BASE_URL: "http://13.250.76.147:8082/api",
    // live url
    // API_BASE_URL: "http://13.250.76.147:8085/api",
    API_TIMEOUT: 15000,
  },
};

// Select environment automatically in development, otherwise production
const environment = __DEV__ ? "development" : "production";

// console.log("Environment selected:", environment);
// console.log("Config being exported:", config[environment]);

export default config[environment];
