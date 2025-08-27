// Test file to debug API calls - can be deleted after testing
import { fetchWeatherData, fetchForecastData } from './utils/weather-api';

// Test with New York coordinates
const testLat = 40.7128;
const testLng = -74.0060;

console.log('Testing Weather API calls...');

// Test current weather
fetchWeatherData(testLat, testLng)
  .then(data => {
    console.log('✅ Current weather API success:', data);
  })
  .catch(error => {
    console.error('❌ Current weather API error:', error);
  });

// Test forecast
fetchForecastData(testLat, testLng)
  .then(data => {
    console.log('✅ Forecast API success:', data);
  })
  .catch(error => {
    console.error('❌ Forecast API error:', error);
  });
