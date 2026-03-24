// API Configuration
const API_KEY = '0ecf9bada1a39e4d29f2dd2e5688e88f'; // OpenWeatherMap Free API
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const geolocationBtn = document.getElementById('geolocationBtn');
const currentWeather = document.getElementById('currentWeather');
const hourlyForecast = document.getElementById('hourlyForecast');
const dailyForecast = document.getElementById('dailyForecast');
const searchHistory = document.getElementById('searchHistory');
const errorMessage = document.getElementById('errorMessage');

// Search History Array
let searchHistoryArray = JSON.parse(localStorage.getItem('weatherHistory')) || [];

// Event Listeners
searchBtn.addEventListener('click', () => searchWeather(cityInput.value));
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchWeather(cityInput.value);
});
geolocationBtn.addEventListener('click', getGeolocation);

// Initialize
displaySearchHistory();

/**
 * Search weather by city name
 */
async function searchWeather(city) {
    if (!city.trim()) {
        showError('Please enter a city name');
        return;
    }

    try {
        hideError();
        const data = await fetchWeatherData(city);
        if (data) {
            displayCurrentWeather(data);
            await fetchForecastData(data.coord.lat, data.coord.lon);
            addToSearchHistory(data.name);
        }
    } catch (error) {
        showError('City not found. Please try again.');
        console.error(error);
    }
}

/**
 * Get weather by geolocation
 */
async function getGeolocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    hideError();
                    const data = await fetchWeatherByCoords(latitude, longitude);
                    if (data) {
                        displayCurrentWeather(data);
                        await fetchForecastData(latitude, longitude);
                        addToSearchHistory(data.name);
                    }
                } catch (error) {
                    showError('Unable to fetch weather for your location.');
                    console.error(error);
                }
            },
            () => showError('Geolocation permission denied.')
        );
    } else {
        showError('Geolocation is not supported by your browser.');
    }
}

/**
 * Fetch current weather data by city
 */
async function fetchWeatherData(city) {
    const url = `${API_BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Weather data not found');
    return await response.json();
}

/**
 * Fetch current weather data by coordinates
 */
async function fetchWeatherByCoords(lat, lon) {
    const url = `${API_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Weather data not found');
    return await response.json();
}

/**
 * Fetch forecast data
 */
async function fetchForecastData(lat, lon) {
    const url = `${API_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Forecast data not found');
    const data = await response.json();
    displayForecast(data.list);
}

/**
 * Display current weather
 */
function displayCurrentWeather(data) {
    const { name, sys, main, weather, wind, clouds, visibility, dt } = data;
    
    const date = new Date(dt * 1000);
    const dateString = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const iconUrl = `https://openweathermap.org/img/wn/${weather[0].icon}@4x.png`;

    currentWeather.innerHTML = `
        <div class="weather-card">
            <div class="city-info">
                <h2 id="cityName">${name}, ${sys.country}</h2>
                <p id="weatherDescription">${weather[0].main} - ${weather[0].description}</p>
                <p id="dateTime">${dateString}</p>
            </div>
            <div class="weather-main">
                <img id="weatherIcon" src="${iconUrl}" alt="${weather[0].description}" class="weather-icon">
                <div class="temperature">
                    <span id="temperature">${Math.round(main.temp)}</span>
                    <span class="unit">°C</span>
                </div>
            </div>
            <div class="weather-details">
                <div class="detail">
                    <i class="fas fa-tint"></i>
                    <span>Humidity: <strong id="humidity">${main.humidity}</strong>%</span>
                </div>
                <div class="detail">
                    <i class="fas fa-wind"></i>
                    <span>Wind: <strong id="windSpeed">${wind.speed.toFixed(1)}</strong> m/s</span>
                </div>
                <div class="detail">
                    <i class="fas fa-compress"></i>
                    <span>Pressure: <strong id="pressure">${main.pressure}</strong> mb</span>
                </div>
                <div class="detail">
                    <i class="fas fa-eye"></i>
                    <span>Visibility: <strong id="visibility">${(visibility / 1000).toFixed(1)}</strong> km</span>
                </div>
            </div>
        </div>
    `;

    cityInput.value = '';
}

/**
 * Display hourly and daily forecast
 */
function displayForecast(forecastList) {
    // Clear previous forecasts
    hourlyForecast.innerHTML = '';
    dailyForecast.innerHTML = '';

    const hourlyData = forecastList.slice(0, 8); // Next 24 hours (8 x 3 hours)
    const dailyData = {};

    // Process forecast data
    forecastList.forEach((item) => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

        if (!dailyData[day]) {
            dailyData[day] = [];
        }
        dailyData[day].push(item);
    });

    // Display hourly forecast
    hourlyData.forEach((item) => {
        const date = new Date(item.dt * 1000);
        const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;

        const hourlyItem = document.createElement('div');
        hourlyItem.className = 'hourly-item';
        hourlyItem.innerHTML = `
            <p class="time">${time}</p>
            <img src="${iconUrl}" alt="${item.weather[0].description}">
            <p class="temp">${Math.round(item.main.temp)}°C</p>
            <p>${item.weather[0].main}</p>
        `;
        hourlyForecast.appendChild(hourlyItem);
    });

    // Display daily forecast
    let dayCount = 0;
    for (const day in dailyData) {
        if (dayCount >= 5) break;

        const dayItems = dailyData[day];
        const avgTemp = dayItems.reduce((sum, item) => sum + item.main.temp, 0) / dayItems.length;
        const maxTemp = Math.max(...dayItems.map(item => item.main.temp));
        const minTemp = Math.min(...dayItems.map(item => item.main.temp));
        const weatherDesc = dayItems[0].weather[0].main;
        const iconUrl = `https://openweathermap.org/img/wn/${dayItems[0].weather[0].icon}@2x.png`;

        const dailyItem = document.createElement('div');
        dailyItem.className = 'daily-item';
        dailyItem.innerHTML = `
            <p class="day">${day}</p>
            <img src="${iconUrl}" alt="${weatherDesc}">
            <div class="temp-range">
                <span class="max">${Math.round(maxTemp)}°</span>
                <span class="min">${Math.round(minTemp)}°</span>
            </div>
            <p class="description">${weatherDesc}</p>
        `;
        dailyForecast.appendChild(dailyItem);

        dayCount++;
    }
}

/**
 * Add city to search history
 */
function addToSearchHistory(city) {
    if (!searchHistoryArray.includes(city)) {
        searchHistoryArray.unshift(city);
        if (searchHistoryArray.length > 10) {
            searchHistoryArray.pop();
        }
        localStorage.setItem('weatherHistory', JSON.stringify(searchHistoryArray));
        displaySearchHistory();
    }
}

/**
 * Display search history
 */
function displaySearchHistory() {
    searchHistory.innerHTML = '';
    searchHistoryArray.forEach((city) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.textContent = city;
        historyItem.addEventListener('click', () => searchWeather(city));
        searchHistory.appendChild(historyItem);
    });
}

/**
 * Show error message
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    setTimeout(() => hideError(), 5000);
}

/**
 * Hide error message
 */
function hideError() {
    errorMessage.classList.remove('show');
}

console.log('Weather Dashboard Loaded Successfully! ✅');
