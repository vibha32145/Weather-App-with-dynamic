const apiKey = "997dc287d1732b25bfd952524f7e9a8a";
const searchButton = document.getElementById("search-button");
const cityInput = document.getElementById("city-input");
const weatherIcon = document.getElementById("weather-icon");
const tempDisplay = document.getElementById("temp-display");
const cityDisplay = document.getElementById("city-display");
const humidityDisplay = document.getElementById("humidity-display");
const windDisplay = document.getElementById("wind-display");
const errorMessage = document.getElementById("error-message");
const locationIcon = document.querySelector('.location');
const hourlyCardsContainer = document.getElementById('hourly-cards');
const dailyCardsContainer = document.getElementById('daily-cards');

// Function to fetch weather data by city name
async function fetchWeatherData(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?units=metric&q=${city}&appid=${apiKey}`;
     try {
        const response = await fetch(apiUrl);
          if (!response.ok) {
             throw new Error(`HTTP error! Status: ${response.status}`);
            }
        const data = await response.json();
        return data;

    } catch (error) {
       console.error("Failed to fetch weather data:", error);
       return null;
    }
}

// Function to update the current weather UI
function updateCurrentWeatherUI(data) {
    const currentWeather = data.list[0]; // current weather
    cityDisplay.textContent = data.city.name;
    weatherIcon.src = `./image/${currentWeather.weather[0].main.toLowerCase()}.png`;
    tempDisplay.textContent = Math.round(currentWeather.main.temp) + "°C";
    humidityDisplay.textContent = currentWeather.main.humidity + "%";
    windDisplay.textContent = currentWeather.wind.speed + " km/h";
}

// Function to update hourly forecast UI
function updateHourlyForecastUI(data) {
     hourlyCardsContainer.innerHTML = ""; // Clear previous data
    for (let i = 0; i < 8; i++) { // show only 8 hours in hourly forecast
        const forecast = data.list[i];
        const time = new Date(forecast.dt * 1000).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
        const temp = Math.round(forecast.main.temp);
        const icon = forecast.weather[0].icon;
        const hourlyCard = document.createElement("div");
        hourlyCard.classList.add('hourly-card');
        hourlyCard.innerHTML = `
       <span>${time}</span>
          
      <span>${temp}°C</span>
      `;
        hourlyCardsContainer.appendChild(hourlyCard);
    }
}
// Function to update daily forecast UI
function updateDailyForecastUI(data) {
    dailyCardsContainer.innerHTML = ""; // Clear previous data
    const dailyData = groupForecastsByDay(data.list) // Group the forecast data by day
    for (let day in dailyData){
        if(dailyData.hasOwnProperty(day)){
            const dayForecast = dailyData[day];
            const tempMax = Math.round(Math.max(...dayForecast.map(item => item.main.temp_max))); // max temp of the day
            const tempMin = Math.round(Math.min(...dayForecast.map(item => item.main.temp_min))); //min temp of the day
            const weatherIcon = dayForecast[0].weather[0].icon;
            const dayName = new Date(day).toLocaleDateString('en-US', {weekday: 'short'}); // Get the short day name of the week
            const dailyCard = document.createElement('div');
            dailyCard.classList.add('daily-card');
            dailyCard.innerHTML = `
               <span>${dayName}</span>
                
                 <span>${tempMax}°C / ${tempMin}°C</span>
        `
            dailyCardsContainer.appendChild(dailyCard);
        }

    }
}
// Function to group forecast data by day
function groupForecastsByDay(forecastList) {
    const dailyData = {};
    forecastList.forEach(forecast => {
        const forecastDate = new Date(forecast.dt * 1000);
        const dateKey = forecastDate.toDateString(); //Use the date string as a key
        if (!dailyData[dateKey]) {
            dailyData[dateKey] = [];
        }
        dailyData[dateKey].push(forecast)
    });
    return dailyData;
}
// Function to handle location search and update UI
async function handleWeatherUpdate(city){
    const weatherData = await fetchWeatherData(city);
    if(weatherData){
        updateCurrentWeatherUI(weatherData);
        updateHourlyForecastUI(weatherData);
         updateDailyForecastUI(weatherData)
        errorMessage.style.display = 'none';
        locationIcon.style.display = 'flex';

    }else{
         errorMessage.style.display = 'block';
       locationIcon.style.display = 'none';
    }
}
// Function to get the user's location using geolocation
function getLocation() {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            },
            (error) => {
              reject(
                `Failed to get location: ${error.message} (Please allow location access for the best experience)`
              );
            }
          );
        } else {
          reject("Geolocation is not supported by this browser.");
        }
    });
}
//Function to get the weather data by using coordinates
async function fetchWeatherByCoordinates(latitude, longitude) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch weather data by coordinates:", error);
        return null;
    }
}
//Function to initialize the app
async function initApp(){
    try{
      const location = await getLocation();
        const {latitude, longitude} = location;
         const weatherData = await fetchWeatherByCoordinates(latitude, longitude);
        if(weatherData){
         updateCurrentWeatherUI(weatherData)
          updateHourlyForecastUI(weatherData);
           updateDailyForecastUI(weatherData);
            errorMessage.style.display = 'none';
            locationIcon.style.display = 'flex';

        }else {
             throw new Error ("Could not fetch weather based on provided coordinates");
        }
    } catch(error){
      console.log(error)
        // default city if the user does not provide location
        handleWeatherUpdate("London");

    }
}
// Event Listeners
searchButton.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if(city){
        handleWeatherUpdate(city)
    }
});

cityInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        const city = cityInput.value.trim();
        if(city){
            handleWeatherUpdate(city)
        }
    }
});

// Initialize the app
initApp();
