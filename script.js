/**
 * Atmosfera — Weather App Frontend Logic
 * Fetches weather data from the Flask /weather endpoint
 * and updates the DOM with smooth transitions.
 */

// ─── DOM references ───────────────────────────────────────────────
const cityInput   = document.getElementById('cityInput');
const searchBtn   = document.getElementById('searchBtn');
const loader      = document.getElementById('loader');
const errorBanner = document.getElementById('errorBanner');
const weatherCard = document.getElementById('weatherCard');
const hintBlock   = document.getElementById('hintBlock');

// Weather field refs
const wCity     = document.getElementById('wCity');
const wCountry  = document.getElementById('wCountry');
const wTime     = document.getElementById('wTime');
const wIcon     = document.getElementById('wIcon');
const wTemp     = document.getElementById('wTemp');
const wDesc     = document.getElementById('wDesc');
const wFeels    = document.getElementById('wFeels');
const wMax      = document.getElementById('wMax');
const wMin      = document.getElementById('wMin');
const wHumidity = document.getElementById('wHumidity');
const wWind     = document.getElementById('wWind');
const wVis      = document.getElementById('wVis');
const wPressure = document.getElementById('wPressure');
const wSunrise  = document.getElementById('wSunrise');
const wSunset   = document.getElementById('wSunset');

// ─── State ────────────────────────────────────────────────────────
let isLoading = false;

// ─── Event listeners ──────────────────────────────────────────────

/** Trigger search on button click */
searchBtn.addEventListener('click', handleSearch);

/** Trigger search on Enter key */
cityInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleSearch();
});

/** Clear error when user starts typing again */
cityInput.addEventListener('input', () => {
  if (!errorBanner.classList.contains('hidden')) {
    hideElement(errorBanner);
  }
});

// ─── Core functions ───────────────────────────────────────────────

/**
 * Main handler: validates input, calls the API, updates the UI.
 */
async function handleSearch() {
  const city = cityInput.value.trim();

  if (!city) {
    showError('Please type a city or village name first.');
    cityInput.focus();
    return;
  }

  if (isLoading) return;
  isLoading = true;

  // Reset UI state
  hideElement(errorBanner);
  hideElement(weatherCard);
  hideElement(hintBlock);
  showElement(loader);
  searchBtn.disabled = true;

  try {
    const response = await fetch(`/weather?city=${encodeURIComponent(city)}`);
    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error || 'Failed to fetch weather data.');
    }

    renderWeather(data);
    showElement(weatherCard);
    // Remove and re-add class to retrigger CSS animation on repeat searches
    weatherCard.style.animation = 'none';
    requestAnimationFrame(() => {
      weatherCard.style.animation = '';
    });

  } catch (err) {
    showError(err.message);
    showElement(hintBlock);
  } finally {
    hideElement(loader);
    searchBtn.disabled = false;
    isLoading = false;
  }
}

/**
 * Populate all weather fields from API response object.
 * @param {Object} d - Weather data from Flask /weather endpoint
 */
function renderWeather(d) {
  wCity.textContent    = d.city;
  wCountry.textContent = d.country;
  wTime.textContent    = d.timestamp;
  wTemp.textContent    = `${d.temperature}°C`;
  wDesc.textContent    = d.description;
  wFeels.textContent   = `Feels like ${d.feels_like}°C`;
  wMax.textContent     = `${d.temp_max}°C`;
  wMin.textContent     = `${d.temp_min}°C`;
  wHumidity.textContent = `${d.humidity}%`;
  wWind.textContent    = `${d.wind_speed} km/h`;
  wVis.textContent     = `${d.visibility} km`;
  wPressure.textContent = `${d.pressure} hPa`;
  wSunrise.textContent = d.sunrise;
  wSunset.textContent  = d.sunset;

  // Weather icon — animate in
  wIcon.style.opacity = '0';
  wIcon.src = d.icon_url;
  wIcon.alt = d.description;
  wIcon.onload = () => {
    wIcon.style.transition = 'opacity .4s ease';
    wIcon.style.opacity = '1';
  };

  // Update the background orb tint based on weather condition
  applyConditionTheme(d.condition);
}

/**
 * Subtly shift the accent orb colors to match the weather condition.
 * @param {string} condition - e.g. "Clear", "Rain", "Clouds", "Snow"
 */
function applyConditionTheme(condition) {
  const root = document.documentElement;
  const themes = {
    Clear:        { orb1: '#ff9f6a', orb2: '#ffd166' },
    Clouds:       { orb1: '#8899bb', orb2: '#aabbcc' },
    Rain:         { orb1: '#4488ff', orb2: '#00d4ff' },
    Drizzle:      { orb1: '#66aaff', orb2: '#aaddff' },
    Thunderstorm: { orb1: '#9966ff', orb2: '#ff66cc' },
    Snow:         { orb1: '#aaddff', orb2: '#eef6ff' },
    Mist:         { orb1: '#99aabb', orb2: '#bbccdd' },
    Fog:          { orb1: '#99aaaa', orb2: '#bbccbb' },
    Haze:         { orb1: '#ccaa66', orb2: '#ffcc88' },
  };

  const theme = themes[condition] || themes.Clouds;
  const orb1 = document.querySelector('.orb-1');
  const orb2 = document.querySelector('.orb-2');

  if (orb1) orb1.style.background = `radial-gradient(circle, ${theme.orb1}, transparent 70%)`;
  if (orb2) orb2.style.background = `radial-gradient(circle, ${theme.orb2}, transparent 70%)`;
}

// ─── UI helpers ───────────────────────────────────────────────────

function showError(message) {
  errorBanner.textContent = `⚠ ${message}`;
  showElement(errorBanner);
}

function showElement(el) {
  el.classList.remove('hidden');
}

function hideElement(el) {
  el.classList.add('hidden');
}
