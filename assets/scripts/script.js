$(document).ready(function () {
    
  
    // VARIABLES
    var APIKey = "48b7e995118c1a25097d71ab8b23dcb2";
    var city = "";
    var currentLat;
    var currentLong;
    var searchedCities = JSON.parse(localStorage.getItem("searchedCities")) || [];
  
    
    // Initialize the page
    function init() {
      if (searchedCities[0] !== undefined) {
        city = searchedCities[0];
        displayCurrentWeather();
      }
    }
  
    // Display the current weather
    function displayCurrentWeather() {
      $("#current-weather").removeClass("d-none");
      var queryURL =
        "https://api.openweathermap.org/data/2.5/weather?q=" +
        city +
        "&units=imperial&appid=" +
        APIKey;
  
      // API query
        $.ajax({
        url: queryURL,
        method: "GET",
      }).then(
        function (response) {
    
          $("#current-weather").empty();
  
          //Clear 404 errors
          $("#message-404").addClass("d-none");
  
          // Add city to array or reorder, the display the buttons
          addCityToList(city);
          displaySearchButtons();
  
          // Add array to localStorage
          localStorage.setItem("searchedCities", JSON.stringify(searchedCities));
  
          
          var h1El = $("<h1>");
          var date = new Date(response.dt * 1000);
          var dateString = "(" + date.toLocaleDateString() + ")";
          h1El.text(response.name + " " + dateString);
          var imgEl = $("<img>");
          imgEl.attr(
            "src",
            "https://openweathermap.org/img/wn/" +
              response.weather[0].icon +
              "@2x.png"
          );
          h1El.append(imgEl);
          $("#current-weather").append(h1El);
          var hrEL = $("<hr>");
          $("#current-weather").append(hrEL);
  
          
          var tempEl = $("<p>");
          tempEl.text("Temperature: " + Math.floor(response.main.temp) + "°F");
          $("#current-weather").append(tempEl);
  
          
          var humidityEl = $("<p>");
          humidityEl.text("Humidity: " + response.main.humidity);
          $("#current-weather").append(humidityEl);
  
          
          var windSpeedEl = $("<p>");
          windSpeedEl.text(
            "Wind Speed " +
              response.wind.speed +
              " mph, Direction: " +
              response.wind.deg +
              "°"
          );
          $("#current-weather").append(windSpeedEl);
  
          //Function to create and append UV index
          getUVIndex(response.coord.lat, response.coord.lon);
          displayForecast(response.coord.lat, response.coord.lon);
        },
        function (response) {
          var responseText = JSON.parse(response.responseText);
          if (responseText.cod === "404") {
            $("#message-404").removeClass("d-none");
          }
        }
      );
    }
  
    
    function getUVIndex(lat, lon) {
      var queryURL =
        "https://api.openweathermap.org/data/2.5/uvi?lat=" +
        lat +
        "&lon=" +
        lon +
        "&appid=" +
        APIKey;
  
      // API query
        $.ajax({
        url: queryURL,
        method: "GET",
      }).then(function (response) {
        var UVIndex = response.value;
        var UVEl = $("<p>");
        UVEl.text("UV Index: ");
        var UVSpan = $("<span>");
        UVSpan.text(UVIndex);
        UVSpan.addClass("p-2 rounded");
        if (UVIndex < 3) {
          UVSpan.attr("id", "uv-green");
        } else if (UVIndex < 6) {
          UVSpan.attr("id", "uv-yellow");
        } else if (UVIndex < 8) {
          UVSpan.attr("id", "uv-orange");
        } else if (UVIndex < 11) {
          UVSpan.attr("id", "uv-red");
        } else {
          UVSpan.attr("id", "uv-purple");
        }
        UVEl.append(UVSpan);
        $("#current-weather").append(UVEl);
      });
    }
  
    function displayForecast(lat, lon) {
      $("#forecast-section").empty();
  
      var queryURL =
        "https://api.openweathermap.org/data/2.5/onecall?lat=" +
        lat +
        "&lon=" +
        lon +
        "&exclude=current,minutely,hourly,alerts&units=imperial&appid=" +
        APIKey;
  
      // API query  
      $.ajax({
        url: queryURL,
        method: "GET",
      }).then(function (response) {
        
        var titleRow = $("<div>");
        titleRow.addClass("row");
        var h1El = $("<h2>");
        h1El.text("5-day Forecast:");
        titleRow.append(h1El);
        $("#forecast-section").append(titleRow);
  
        
        var forecastRow = $("<div>");
        forecastRow.addClass("row");
  
        // For loop
        for (var i = 1; i < 6; i++) {
          
          var colEl = $("<div>");
          colEl.addClass("col bg-primary mx-2 text-white shadow rounded mb-2");
          colEl.attr("style","max-width: 10.5rem");
        
          var date = new Date(response.daily[i].dt * 1000);
          var h3El = $("<h3>").text(date.toLocaleDateString());
          colEl.append(h3El);
          
          var imgEl = $("<img>");
          imgEl.attr(
            "src",
            "https://openweathermap.org/img/wn/" +
              response.daily[i].weather[0].icon +
              ".png"
          );
          colEl.append(imgEl);
          
          var tempMaxEl = $("<p>");
          tempMaxEl.text("High: " + Math.floor(response.daily[i].temp.max) + "°F");
          colEl.append(tempMaxEl);
          var tempMinEl = $("<p>");
          tempMinEl.text("Low: " + Math.floor(response.daily[i].temp.min) + "°F");
          colEl.append(tempMinEl);
          
          humidityEl = $("<p>");
          humidityEl.text("Humidity: " + response.daily[i].humidity);
          colEl.append(humidityEl);
          
          forecastRow.append(colEl);
        }
  
        
        $("#forecast-section").append(forecastRow);
      });
    }
  
    function searchCity(event) {
      event.preventDefault();
      city = $("#search-input").val();
      displayCurrentWeather();
    }
  
    
    function addCityToList(city) {
      
      if (searchedCities.indexOf(city.toLowerCase()) === -1) {
        // Check to see if the list has ten 10 entries
        if (searchedCities.length === 10) {
          // Remove the last item then add the current city to the beginning of the array
          searchedCities.pop();
          searchedCities.unshift(city.toLowerCase());
        } else {
          searchedCities.unshift(city.toLowerCase());
        }
      } else {
        // Remove the item from the list and put it at the beginning
        var index = searchedCities.indexOf(city.toLowerCase());
        searchedCities.splice(index, 1);
        searchedCities.unshift(city.toLowerCase());
      }
    }
  
    // Display the previous searches section
    function displaySearchButtons() {
    
      $("#previous-searches").removeClass("d-none");
      $("#search-buttons").empty();
  
        for (var i = 0; i < searchedCities.length; i++) {
        
        var buttonEl = $("<button>");
        
        buttonEl.attr("type", "button");
        buttonEl.addClass("list-group-item list-group-item-action");
        
        var city = searchedCities[i];
        var citySplit = city.split(" ");
        for (var j = 0; j < citySplit.length; j++) {
          citySplit[j] = citySplit[j][0].toUpperCase() + citySplit[j].substr(1);
        }
        city = citySplit.join(" ");
        buttonEl.text(city);
        
        $("#search-buttons").append(buttonEl);
      }
    }
  
    function displayPreviousSearch() {
      city = $(this)[0].innerText;
      displayCurrentWeather();
    }
  
    
    init();
  
    
    $("#search").on("submit", searchCity);
    $("#search-buttons").on("click", "button", displayPreviousSearch);
  });