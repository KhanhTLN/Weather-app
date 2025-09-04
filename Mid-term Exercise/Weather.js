function showSection(id, event) {
  if (event) event.preventDefault();
  document.querySelectorAll("main section").forEach((sec) => {
    sec.style.display = "none";
  });
  document.getElementById(id).style.display = "block";
}

// Mặc định trở về Home khi load lại trang
document.addEventListener("DOMContentLoaded", () => {
  showSection("home-screen");
});

const KKK = "424f83dafd397e083540af917fc3e431";

const searchBtn = document.querySelector(".search-btn");
const cityInput = document.querySelector(".search-box input");
const weatherResult = document.querySelector(".weather-result");
const weatherForecast = document.querySelector(".forecast-card");
// 6 cards trong highlight card
const windSpeed = document.querySelector(".wind-speed");
const windDirection = document.querySelector(".wind-direction");
const UVindex = document.querySelector(".UV-index");
const sunrise = document.querySelector(".sunrise-sunset");
const humidity = document.querySelector(".humidity");
const pressure = document.querySelector(".pressure");

searchBtn.addEventListener("click", getWeather);
cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") getWeather();
});

async function getWeather() {
  const city = cityInput.value.trim();
  if (!city) {
    weatherResult.innerHTML = "<p>Please enter city</p>";
    return;
  }

  try {
    // Lấy dữ liệu thời tiết hiện tại
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${KKK}&units=metric&lang=en`
    );
    const data = await res.json();

    if (data.cod !== 200) {
      weatherResult.innerHTML = `<p>City not found!</p>`;
      weatherForecast.innerHTML = "";
      windSpeed.innerHTML = "";
      windDirection.innerHTML = "";
      UVindex.innerHTML = "";
      sunrise.innerHTML = "";
      humidity.innerHTML = "";
      pressure.innerHTML = "";
      return;
    }

    const { lat, lon } = data.coord;
    const temp = data.main.temp;
    const weather = data.weather[0].description;
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

    // Hiển thị thời tiết hiện tại với icon
    weatherResult.innerHTML = `
    <div class="current-weather-card">
        <img src="${iconUrl}" alt="${weather}" class="weather-icon">
        <h2 class="temperature">${temp}°C</h2>
        <p class="status">${weather}</p>
        <hr class="liner">
        <div class="location">
            <span class="material-symbols-outlined">location_on</span>
            ${data.name}, ${data.sys.country}
        </div>
        <div class="date-time">
            <span class="material-symbols-outlined">calendar_month</span>
            ${new Date().toLocaleString()}
        </div>
    </div>
    `;
    updateCityImageByName(data.name);

    // Hiển thị Wind Status
    windSpeed.innerHTML = `
      <p>${data.wind.speed} m/s</p>
      
    `;

    windDirection.innerHTML = `
        <p>${data.wind.deg}°</p>
    `;

    humidity.innerHTML = `
        <p>${data.main.humidity}%</p>
    `;

    pressure.innerHTML = `
        <p>${data.main.pressure} hPa</p>
    `;

    // Xử lý thời gian cho sunrise và sunset
    const sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
    const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    sunrise.innerHTML = `
        <p>Sunrise: ${sunriseTime}</p>
       <p>Sunset: ${sunsetTime}</p>
    `;

    // Lấy dự báo 5 ngày
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${KKK}&units=metric&lang=en`
    );
    const forecastData = await forecastRes.json();

    const dailyForecast = forecastData.list.filter((item) =>
      item.dt_txt.includes("12:00:00")
    );

    let forecastHTML = "<h3>5-day forecast</h3><div class='forecast-list'>";
    dailyForecast.forEach((item) => {
      const icon = item.weather[0].icon;
      forecastHTML += `
    <div class="forecast-item">
      <div class="forecast-date">${item.dt_txt.split(" ")[0]}</div>
      <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${
        item.weather[0].description
      }">
      <div class="forecast-temp">${item.main.temp}°C</div>
      <div class="forecast-desc">${item.weather[0].description}</div>
    </div>
  `;
    });
    forecastHTML += "</div>";
    weatherForecast.innerHTML = forecastHTML;
  } catch (err) {
    console.error(err);
    weatherResult.innerHTML = "<p>Error loading data!</p>";
    weatherForecast.innerHTML = "";
    windSpeed.innerHTML = "";
    windDirection.innerHTML = "";
    UVindex.innerHTML = "";
    sunrise.innerHTML = "";
    humidity.innerHTML = "";
    pressure.innerHTML = "";
  }
}

async function updateCityImageByName(cityName) {
  try {
    // Tìm thông tin trang Wikipedia của thành phố
    const searchRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
        cityName
      )}&prop=pageimages&pithumbsize=800&format=json&origin=*`
    );
    const searchData = await searchRes.json();

    const pages = searchData.query.pages;
    const page = Object.values(pages)[0];
    const imageUrl = page.thumbnail ? page.thumbnail.source : null;

    const mapCard = document.querySelector(".map-card");
    if (imageUrl) {
      mapCard.innerHTML = `
                <img src="${imageUrl}" alt="${cityName}" style="width:100%; border-radius:8px;">
                <p style="text-align:center; margin-top:5px;"></p>
            `;
    } else {
      mapCard.innerHTML = `<p>Không tìm thấy ảnh cho ${cityName}</p>`;
    }
  } catch (error) {
    console.error("Lỗi khi lấy ảnh thành phố:", error);
    document.querySelector(".map-card").innerHTML = "<p>Lỗi khi tải ảnh</p>";
  }
}

function showMyLocationOnMap() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        console.log(`Lat: ${lat}, Lon: ${lon}`);
        const src = `https://www.google.com/maps?q=${lat},${lon}&z=15&output=embed`;
        document.getElementById("map-frame").src = src;
      },
      (error) => {
        alert("Không thể lấy vị trí hiện tại: " + error.message);
      }
    );
  } else {
    alert("không hỗ trợ Geolocation");
  }
}

const monthYear = document.getElementById("month-year");
const calendarBody = document.getElementById("calendar-body");
let currentDate = new Date();

function renderCalendar(date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  monthYear.textContent = `${monthNames[month]} ${year}`;

  // Ngày bắt đầu & số ngày trong tháng
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  calendarBody.innerHTML = "";

  let dateNum = 1;
  for (let i = 0; i < 6; i++) {
    let row = document.createElement("tr");

    for (let j = 1; j <= 7; j++) {
      let cell = document.createElement("td");

      if (i === 0 && j < (firstDay === 0 ? 7 : firstDay)) {
        cell.textContent = "";
      } else if (dateNum > daysInMonth) {
        break;
      } else {
        cell.textContent = dateNum;
        dateNum++;
      }

      row.appendChild(cell);
    }

    calendarBody.appendChild(row);
  }
}

// Nút điều hướng
document.getElementById("prev-month").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar(currentDate);
});

document.getElementById("next-month").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar(currentDate);
});
renderCalendar(currentDate);


