let inputBox = document.getElementById("input-box");
let Loader = document.getElementById("loader");
let searchButton = document.getElementById("search-button");
let isLocation = document.getElementById("location-available");
let container = document.getElementById("weather-box");
let description = document.getElementById("description");
let loader = false;
let cityName = "";

//handle search button on keypress enter
inputBox.addEventListener("keydown", function (e) {
  if (e.code === "Enter") {
    searchClick();
  }
});

if (inputBox.length === 0) {
  searchButton.disabled = true;
}

//Fetching weather details according to location name
const fetchData = async (city) => {
  //loader true when fetching start
  loader = true;
  isLoader();

  //Find latitude and longitude base on the city name
  const data = await fetch(
    `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=${5}&appid=${`82005d27a116c2880c8f0fcb866998a0`}`
  );
  const jsonData = await data.json();

  //If City name find then proceed further otherwise we jump on else block and update on webpage location not found
  if (jsonData.length > 0) {
    const latitute = jsonData[0].lat;
    const longitude = jsonData[0].lon;
    const details =
      await fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${latitute}&lon=${longitude}&appid=${`82005d27a116c2880c8f0fcb866998a0`}
      `);
    const weatherValue = await details.json();
    if (weatherValue) {
      //When fetching complete then false loader
      loader = false;
      isLoader();

      //Pass weather details in UpdateDom Function
      updateDom(weatherValue);
    }
  } else {
    //also location not find then loader false and update on webpages
    loader = false;
    isLoader();
    container.style.display = "none";
    document.getElementById("NotFound").style.display = "block";
    document.getElementById("notFoundImg").src = "/assets/unknown.png";
    document.getElementById("notfoundDesc").innerText = "Oops city not found.";
    inputBox.value = "";
  }
};

//This function invoke when Search button click
const searchClick = async () => {
  isLocation.style.display = "none";

  //If user input nothing we will not do nothing
  if (inputBox.value === "") {
    return;
  }

  //Get location from input box
  const city = inputBox.value;

  //call fetch function base location
  fetchData(city);
};

//Update element on weatherdetails
const updateDom = (details) => {
  cityName = cityName.length === 0 ? details.name : inputBox.value;
  container.style.display = "block";
  document.getElementById("NotFound").style.display = "none";

  document.getElementById(
    "weatherImg"
  ).src = `./assets/${details.weather[0].icon}.png`;
  //Update value of temprature
  document.getElementById("temp").innerText = `${(
    details.main.temp - 273.15
  ).toFixed(0)}`;

  //update value of description
  description.innerText = details.weather[0].description;

  //update value of city name and country name
  document.getElementById("location").innerText = `${
    cityName[0].toLocaleUpperCase() + cityName.substring(1)
  },${details.sys.country}`;

  //update humidity and wind
  document.getElementById("humidity").innerText = `${details.main.humidity}%`;
  document.getElementById("wind").innerText = `${details.wind.speed}km/hr`;

  //update image and background image on basis of weather condition
  switch (details.weather[0].main) {
    case "Clouds":
      document.body.style.backgroundImage = "url('/assets/cloudBg.png')";
      break;
    case "Clear":
      document.body.style.backgroundImage = "url('/assets/clearBG.webp')";
      break;
    case "Rain":
      document.body.style.backgroundImage = "url('/assets/rainBg.jpg')";
      break;
    case "Mist":
      document.body.style.backgroundImage = "url('/assets/cloudBg.png')";
      break;
    case "Snow":
      document.body.style.backgroundImage = "url('/assets/snowBg.jpg')";
    case "Haze":
      document.body.style.backgroundImage = "url('/assets/clearBG.webp')";
      break;
  }

  //After click input box clear
  inputBox.value = "";
};

//Find auto detect location with the help of buit in navigator object
if ("geolocation" in navigator) {
  //GetCurrentPosition
  navigator.geolocation.getCurrentPosition(
    geolocationSuccess,
    geolocationError
  );
} else {
  alert("Geolocation is not Available.");
}

//If location not found update on webpages
function geolocationError() {
  isLocation.style.display = "block";
  isLocation.innerText = "*Current location not available*";
}

//To find latitude and longitude of current location
async function geolocationSuccess(position) {
  //Get latitude and longitude from position which is built in Geolocation
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  // Fetch city name according to latitude and longitude
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
    );
    const data = await response.json();
    //Get city name
    const city = data.address.city || data.address.suburb;

    //then call fetch data function to update weather details
    fetchData(city);
  } catch (error) {
    console.log("Error in Fetching...");
  }
}

//Create loader function
function isLoader() {
  if (loader) {
    searchButton.innerHTML = `<div id="loader"></div>`;
  } else {
    searchButton.innerText = "Search";
  }
}
