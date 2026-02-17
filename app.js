const CONFIG = {
    apiKey: "b61c2353fac0e66e28f79e5b0cde2515",
    baseUrl: "https://api.openweathermap.org/data/2.5/weather"
};

const weatherForm = document.querySelector(".weatherForm");
const cityInput = document.querySelector(".cityInput");
const card = document.querySelector(".card");

weatherForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const city = cityInput.value.trim();
    if (!city) return;

    try {
        showLoading();
        const data = await fetchWeather(city);
        displayWeather(data);
    } catch (error) {
        showError(error.message);
    }
});

async function fetchWeather(city) {
    const url = `${CONFIG.baseUrl}?q=${encodeURIComponent(city)}&appid=${CONFIG.apiKey}&units=metric`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("City not found!");
    }

    return await response.json();
}

function displayWeather(data) {
    const {
        name,
        main: { temp, humidity },
        weather: [{ description, id }]
    } = data;

    card.innerHTML = `
        <p class="cityDisplay">${name}</p>
        <p class="tempDisplay">${temp.toFixed(1)}°C</p>
        <p>Humidity: ${humidity}%</p>
        <p>${capitalize(description)}</p>
        <p class="weatherEmoji">${getEmoji(id)}</p>
    `;

    card.style.display = "block";
}

function showLoading() {
    card.innerHTML = `<p>Loading...</p>`;
    card.style.display = "block";
}

function showError(message) {
    card.innerHTML = `<p class="errorDisplay">${message}</p>`;
    card.style.display = "block";
}

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function getEmoji(id) {
    if (id >= 200 && id < 300) return "⛈️";
    if (id >= 300 && id < 600) return "🌧️";
    if (id >= 600 && id < 700) return "❄️";
    if (id === 800) return "☀️";
    if (id > 800) return "☁️";
    return "🌍";
}
