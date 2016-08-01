$(document).ready(function () {

  function getWindStats(degrees, speed) {
    var cardinalDirectionMap=["N","NNE","NE","ENE","E","ESE", "SE", "SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
    var roundedDegree = Math.round((degrees/22.5)+.5);
    var cardinalDirection = cardinalDirectionMap[roundedDegree % 16];
    var cardinalDirectionIcon = $('<i>');
    cardinalDirectionIcon.addClass("wi");
    cardinalDirectionIcon.addClass("wi-wind");
    cardinalDirectionIcon.addClass("wi-towards-" + cardinalDirection.toLowerCase());
    cardinalDirectionIcon.attr('data-toggle', 'tooltip');
    cardinalDirectionIcon.attr('title',cardinalDirection);

    var spanIcon = $('<span>');
    spanIcon.addClass("wind-icon");
    cardinalDirectionIcon.prependTo(spanIcon);

    var spanStats = $('<span>');
    spanStats.addClass("wind-stats");
    spanStats.text(speed + " MPH");

    return [spanIcon, spanStats];
  }

  function getDayName(date) {
    //console.log("Calling getDayName");
    //console.log("Date: " + date);

    /* Check if today. */
    var todaysDate = new Date();
    //console.log("Todays Date: " + todaysDate);
    //var utc = todaysDate.getTime() + (todaysDate.getTimezoneOffset() * 60000);
    //var todaysDateUTC = new Date(utc);
    //console.log("todaysDateUTC: " + todaysDateUTC);
    //if (date.setHours(0,0,0,0) == todaysDateUTC.setHours(0,0,0,0)) {
    if (date.setHours(0,0,0,0) == todaysDate.setHours(0,0,0,0)) {
      return "Today";
    }

    /* Check if tomorrow.*/
    var tomorrowsDate = new Date();
    tomorrowsDate.setDate(todaysDate.getDate()+1);
    //console.log("Tomorrows date: " + tomorrowsDate);
    if (date.setHours(0,0,0,0) == tomorrowsDate.setHours(0,0,0,0)) {
      return "Tomorrow";
    }

    /* Else return day name */
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[date.getDay()];
  }

  function convertToCelsius(fahrenheit) {
    return Math.round(((fahrenheit - 32) / 1.8));
  }

  /* Put padded 0s in formatted time. */
  function pad(n) {
    return (n < 10) ? ("0" + n) : n;
}

  function convertUTCDateToLocalDate(date) {
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);
      var offset = date.getTimezoneOffset() / 60;
      var hours = date.getHours();
      newDate.setHours(hours - offset);
      //console.log(monthNames[newDate.getMonth()] + " " + newDate.getDate());
      return monthNames[newDate.getMonth()] + " " + newDate.getDate();
  }

  function createTableHeader() {
    var head = $("<thead>");
    var row = $("<tr>");
    var header = $("<th>");
    header.html("Day");
    header.appendTo(row);
    header = $("<th id=\"HighLowColumn\">");
    header.html("High/Low F&deg;");
    header.appendTo(row);
    header = $("<th>");
    header.html("Description");
    header.appendTo(row);
    header = $("<th>");
    header.html("Wind");
    header.appendTo(row);
    header = $("<th>");
    header.html("Humidity");
    header.appendTo(row);
    row.appendTo(head);
    return head;
  }


  //NEED a way to get current temperature
  function getCurrentWeather(location_data) {
    console.log(location_data);
    var api_call = "http://api.openweathermap.org/data/2.5/weather?lat=" + location_data.lat + "&lon=" + location_data.lon + "&units=imperial&appid=de56df6669bbe24c6b94ad4ff0f8d3d7"
    $.getJSON(api_call, function(data) {

      console.log("Current weather");
      console.log(data);

      /* Need to deal with this situation when API not responsive.
        Don't display humidity, wind, sunrise, sunset, F\C. Just say api not responsive, or something.
      */
      if (data.hasOwnProperty('cod') && data.cod == '404') {
        console.log("OOPS");
        $('#ws_details').html('<div><strong>Current weather data unavailable for location: ' + data.cod + ' ' + data.message + '</strong></div>');
        return;
      }
      $("#ws_location").text(location_data.city + ", " + location_data.region + " " + location_data.countryCode);

      var currentTemp = data.main.temp;
      var currentHumidity = data.main.humidity;
      var weatherIconId = data.weather[0].id;

      date = new Date(data.dt*1000);
      var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

      var timeString;
      if (date.getHours() < 12) {
        timeString = date.getHours() + ":" + pad(date.getMinutes()) + " AM";
      } else {
        timeString = date.getHours()-12 + ":" + pad(date.getMinutes()) + " PM";
      }
      $("#ws_datetime").text(days[date.getDay()] + " " + timeString);

      var weatherDesc = data.weather[0].description;
      $("#wsd").text(weatherDesc.charAt(0).toUpperCase() + weatherDesc.slice(1));

      var wsIcon =  $('<i>');
      wsIcon.attr('id', 'ws_icon');
      wsIcon.addClass('wi');
      wsIcon.addClass("wi-owm-" + data.weather[0].id);
      wsIcon.appendTo("#ws_details");

      var outerDiv = $('<div>');
      var tempInF = $('<div>');
      tempInF.attr('id', 'ws_temp_f');
      tempInF.appendTo(outerDiv);
      var tempInC = $('<div>');
      tempInC.attr('id', 'ws_temp_c');
      tempInC.appendTo(outerDiv);
      var currentUnit = $('<div>');
      currentUnit.attr('id', 'ws_temp_unit');
      var fToggle = $('<span>');
      fToggle.attr('id','ws_temp_f_toggle');
      fToggle.html('&deg;F');
      var cToggle = $('<span>');
      cToggle.attr('id','ws_temp_c_toggle');
      cToggle.html('&deg;C');
      currentUnit.html('&nbsp;&nbsp;|&nbsp;&nbsp;');
      fToggle.prependTo(currentUnit);
      cToggle.appendTo(currentUnit);
      currentUnit.appendTo(outerDiv);
      outerDiv.appendTo("#ws_details");

      var detailsDiv = $('<div>');
      detailsDiv.attr('id', 'ws_misc_details');
      var detailsTable = $('<table>');
      var row = $('<tr>');
      var cell = $('<td>');
      cell.text('Humidity');
      cell.appendTo(row);
      cell = $('<td>');
      cell.attr('id', 'ws_humidity');
      cell.appendTo(row);
      row.appendTo(detailsTable);

      row = $('<tr>');
      cell = $('<td>');
      cell.text('Wind');
      cell.appendTo(row);
      cell = $('<td>');
      var span = $('<span>');
      span.attr('id', 'ws_wind_icon');
      span.appendTo(cell);
      span = $('<span>');
      span.attr('id', 'ws_wind_stats');
      span.appendTo(cell);
      cell.appendTo(row);
      row.appendTo(detailsTable);

      row = $('<tr>');
      cell = $('<td>');

      var sunIcon = $('<i>');
      sunIcon.addClass('wi');
      sunIcon.addClass('wi-sunrise');
      sunIcon.attr('data-toggle', 'tooltip');
      sunIcon.attr('data-original-title', 'Sunrise');

      var sunTime = $('<span>');
      sunTime.attr('id','ws_sunrise_time');

      sunIcon.appendTo(cell);
      sunTime.appendTo(cell);
      cell.appendTo(row);

      cell = $('<td>');
      var sunIcon = $('<i>');
      sunIcon.addClass('wi');
      sunIcon.addClass('wi-sunset');
      sunIcon.attr('data-toggle', 'tooltip');
      sunIcon.attr('data-original-title', 'Sunset');

      var sunTime = $('<span>');
      sunTime.attr('id','ws_sunset_time');

      sunIcon.appendTo(cell);
      sunTime.appendTo(cell);
      cell.appendTo(row);
      row.appendTo(detailsTable);
      detailsTable.appendTo(detailsDiv);
      detailsDiv.appendTo("#ws_details");

      $("#ws_temp_f").text(Math.round(data.main.temp));
      $("#ws_temp_c").text(convertToCelsius(data.main.temp));

      $("#ws_temp_f_toggle").click(function() {
        console.log("F click");
        $("#ws_temp_c").css('display','none');
        $("#ws_temp_f").css('display','inline');
        $("#ws_temp_f_toggle").css('font-weight', 'bold');
        $("#ws_temp_c_toggle").css('font-weight', 'normal');
      });
      $("#ws_temp_c_toggle").click(function() {
        console.log("C click");
        $("#ws_temp_c").css('display','inline');
        $("#ws_temp_f").css('display','none');
        $("#ws_temp_f_toggle").css('font-weight', 'normal');
        $("#ws_temp_c_toggle").css('font-weight', 'bold');
      });

      $("#ws_humidity").text(data.main.humidity + "%");

      var windArray = getWindStats(data.wind.deg, data.wind.speed);
      windArray[0].appendTo($("#ws_wind_icon"));
      windArray[1].appendTo($("#ws_wind_stats"));

      //data.sys.sunrise;
      date = new Date(data.sys.sunrise*1000);
      timeString = (date.getHours() % 12) + ":" + date.getMinutes();
      if (date.getHours() < 12) { timeString += " AM"; }
      else { timeString += " PM" }
      console.log("TIMESTRING: " + timeString);
      $("#ws_sunrise_time").text(timeString);

      //data.sys.sunset;
      date = new Date(data.sys.sunset*1000);
      timeString = (date.getHours() % 12) + ":" + date.getMinutes();
      if (date.getHours() < 12) { timeString += " AM"; }
      else { timeString += " PM" }
      $("#ws_sunset_time").text(timeString);
      /*cell.addClass("highLows");
      cell.html("<span class=\"high\">" + weatherObj.temp.max + "</span> / <span class=\"low\">" + weatherObj.temp.min + "</span>");
      cell.appendTo(weather_row);
      */

      //$(weather_table).prependTo("#weather_summary");

    });
  }


  function getWeather(location_data) {
    var api_call = "http://api.openweathermap.org/data/2.5/weather?lat=" + location_data.lat + "&lon=" + location_data.lon + "&units=imperial&appid=de56df6669bbe24c6b94ad4ff0f8d3d7";
    api_call = "http://api.openweathermap.org/data/2.5/forecast?lat=" + location_data.lat + "&lon=" + location_data.lon + "&units=imperial&appid=de56df6669bbe24c6b94ad4ff0f8d3d7";
    api_call = "http://api.openweathermap.org/data/2.5/forecast/daily?lat=" + location_data.lat + "&lon=" + location_data.lon + "&cnt=10&units=imperial&appid=de56df6669bbe24c6b94ad4ff0f8d3d7";

    getCurrentWeather(location_data);
    console.log("Api: " + api_call);
    $.getJSON(api_call, function(data) {

      //console.log("Data");
      //console.log(data);
      //console.log("---------------------------------");


      var weather_table = $('<table class="weather_table">');

      $(createTableHeader()).appendTo(weather_table);


      var weatherObj, date, stringDate, dayName, wind_cardinal_direction;
      var weather_row, cell, weather_icon, weather_desc;
      for (var i = 0; i < 10; i++) {
        weatherObj = data.list[i];

        weather_row = $('<tr>');
        cell = $('<td>');

        //dt:       1467230400
        //GMT: Wed, 29 Jun 2016 20:00:00 GMT
        //Your time zone: 6/29/2016, 1:00:00 PM GMT-7:00 DST
        //offset:   25200 seconds offset (-7 GMT hours)
        //subtract: 1467118800
        console.log(weatherObj);
        date = new Date((weatherObj.dt)*1000); //*1000 because value takes in millisecionds, dt is epoch seconds.
        //console.log("dt: " + weatherObj.dt);
        //console.log("DATE: " + date);
        stringDate = convertUTCDateToLocalDate(date);
        //console.log("Date: " + stringDate);
        dayName = getDayName(date);
        //console.log("DayName: " + dayName);

        //console.log("Date Locale: " + stringDate.toLocaleString());
        cell.html("<p class=\"dayName\">" + dayName + "</p><p>" + stringDate + "</p>");
        cell.appendTo(weather_row);

        cell = $('<td>');
        cell.addClass("highLows");
        cell.html("<span class=\"hlf\"><span class=\"high\">" + Math.round(weatherObj.temp.max) + "</span><span class=\"slash\"></span><span class=\"low\">" + Math.round(weatherObj.temp.min) + "</span></span>");
        cell.append("<span class=\"hlc\"><span class=\"high\">" + convertToCelsius(weatherObj.temp.max) + "</span><span class=\"slash\"></span><span class=\"low\">" + convertToCelsius(weatherObj.temp.min) + "</span></span>");


        cell.appendTo(weather_row);

        cell = $('<td>');
        weather_icon = $('<i>');
        weather_icon.addClass("wi");
        weather_icon.addClass("wi-owm-"+weatherObj.weather[0].id);
        weather_icon.appendTo(cell);

        weather_desc = $('<span>');
        weather_desc.html(weatherObj.weather[0].description);
        weather_desc.appendTo(cell);
        cell.appendTo(weather_row);

        cell = $('<td>');
        var windArray = getWindStats(weatherObj.deg, weatherObj.speed);
        windArray[0].appendTo(cell);
        windArray[1].appendTo(cell);
        cell.appendTo(weather_row);

        cell = $('<td>');
        cell.html(weatherObj.humidity + "%");
        cell.appendTo(weather_row);

        $(weather_row).appendTo(weather_table);
      }
      $(weather_table).prependTo("#weather_forecast");

      $('[data-toggle="tooltip"]').tooltip(); // enable tooltips by hovering over wind direction icon.

      /* Needs to be after weather_table added to weather_forecast*/
      $("th#HighLowColumn").click(function() {
        var currentUnit = $("#HighLowColumn").text().substr(-2,1); //High/Low Column reads "High/Low [F\C]&deg;";
        if (currentUnit == 'F') {
          $(".hlc").css('display','inline');
          $(".hlf").css('display','none');
          $("#HighLowColumn").html($("#HighLowColumn").text().slice(0,-2) + "C&deg;");
        } else if (currentUnit == 'C') {
          $(".hlc").css('display','none');
          $(".hlf").css('display','inline');
          $("#HighLowColumn").html($("#HighLowColumn").text().slice(0,-2) + "F&deg;");
        } else {
          console.log("ERROR: Expected F or C but got " + currentUnit);
        }


      });

    }).fail(function (jqXHR, textStatus, errorThrown) {
      console.log("Error: " + errorThrown);
      console.log("TextStatus: " + textStatus);
    });
  }

  $.getJSON("http://ip-api.com/json", function(data) {
    //console.log("Data lat: " + data.lat);
    //console.log("Data lon: " + data.lon);
    getWeather(data);
  });

});