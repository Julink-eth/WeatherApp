var app = angular.module('weatherApp', []);
app.controller('weatherCtrl', function ($scope, $http) {
    //Week days as string to match the week day numbers
    $scope.weekDays = new Array(7);
    $scope.weekDays[0] = "Sunday";
    $scope.weekDays[1] = "Monday";
    $scope.weekDays[2] = "Tuesday";
    $scope.weekDays[3] = "Wednesday";
    $scope.weekDays[4] = "Thursday";
    $scope.weekDays[5] = "Friday";
    $scope.weekDays[6] = "Saturday";

    //Contains all the weather data from the API call
    $scope.weatherData = null;
    //Current selected weather
    $scope.selectedWeatherData = null;
    //Displays or hide the notifications 
    $scope.displayNotif = true;
    //Current days of the week matching the weather data retrieved
    $scope.daysOfWeek = {};
    //Current selected index in the weather array
    $scope.currentWeatherIndex = 0;
    //All the possible weather indexes for the current day selected
    $scope.possibleIndexes = [];
    //All the notifications to be displayed
    $scope.notifs = [];
    //Displays the temperature in Celsius or Fahrenheit
    $scope.celsiusSelected = false;
    //Retrieves the previous temperature format choice from the user's local storage
    if (window.localStorage.getItem("celsiusSelected") !== null) {
        $scope.celsiusSelected = "true" === window.localStorage.getItem("celsiusSelected");
    }
    //Display loading spinner while the weather data are being retrieved
    $scope.loading = true;

    //Adds a notfication in the notifications array
    $scope.AddNotif = function (message,error) {
        var notif = {};
        notif.message = message;
        notif.error = error;
        $scope.notifs.push(notif);
        //This is called on a new notification so we display them
        $scope.displayNotif = true;
    };

    //Removes a notfication from the notifications array
    $scope.RemoveNotif = function (indexToRemove) {
        $scope.notifs.splice(indexToRemove, 1);
        if ($scope.notifs.length <= 0) {
            //If there are no notifications to be displayed we stop displaying them
            $scope.displayNotif = false;
        }
    };

    //Adds zeros to hours and minutes for a better display
    $scope.AddZero = function (i) {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    };

    //Converts Kelvin temperature to Celsius
    $scope.KelvinToCelsius = function (kelvinTemp) {
        return kelvinTemp - 273.15;
    };

    //Converts Kelvin temperature to Fahrenheit
    $scope.KelvinToFahrenheit = function (kelvinTemp) {
        return kelvinTemp * (9 / 5) - 459.67;
    };

    //Adds necessary properties to the weather data to make it easier on the html side for the display
    $scope.AddWeatherProperties = function () {
        angular.forEach($scope.weatherData.list, function (item, index) {
            //Add date as a javascript Date object for easy manipulation (Also added UTC to convert the date to local time)
            item.date = new Date(item.dt_txt + " UTC");
            //The formatted date to be displayed in the weather box
            item.displayedDate = $scope.AddZero((item.date.getMonth() + 1)) + "-" + $scope.AddZero(item.date.getDate())
                + "-" + item.date.getFullYear() + " " + $scope.AddZero(item.date.getHours()) + ":" + $scope.AddZero(item.date.getMinutes());
            //Add temperature in Celsius and Fahrenheit for the display
            item.main.tempCelsius = Math.round($scope.KelvinToCelsius(item.main.temp)) + "°C";
            item.main.tempFahrenheit = Math.round($scope.KelvinToFahrenheit(item.main.temp)) + "°F";
        });
    };

    //Adds the days of the week matching the retrieved weather data
    $scope.InitDaysOfWeek = function () {
        var weatherIndex = 0;
        angular.forEach($scope.weatherData.list, function (item, index) {
            var dayOfWeek = $scope.weekDays[item.date.getDay()];
            if (!$scope.daysOfWeek.hasOwnProperty(dayOfWeek)) {
                //Keep the first index of the weather for this day 
                //as it will be the default one displayed when this day is selected
                $scope.daysOfWeek[dayOfWeek] = weatherIndex;
            }
            weatherIndex++;
        });
    };

    //Refreshs all the possible weather indexes depending on the current day selected
    $scope.RefreshPossibleIndexes = function () {
        $scope.possibleIndexes = [];
        for (let i = $scope.currentWeatherIndex; i <= $scope.weatherData.list.length && $scope.possibleIndexes.length <= 7; i += 3) {
            $scope.possibleIndexes.push(i);
        }
    };

    //Calls the "GetForecast" Web Method to get the weather data from the OpenWeatherMap API 
    //The call is performed after the user has authorized to use his geographical coordinates
    //(This call could have been performed directly in the javascript but it makes it more 
    //secure being called on the server side as we don't show the API key)
    $scope.GetWeatherData = function (position) {
        var latStr = position.coords.latitude + "";
        var lat = latStr.replace(".", ",");
        var lonStr = position.coords.longitude + "";
        var lon = lonStr.replace(".", ",");
        $http({
            method: "POST",
            url: "Default.aspx/GetForecast",
            data: '{lat: "' + lat + '", lon:"' + lon +'"}',
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        }).then(
            function success(result) {
                if (result.data !== null && result.data !== undefined) {
                    //The weather data is added to the scope and the display can start
                    $scope.weatherData = JSON.parse(result.data.d);
                    $scope.AddWeatherProperties();
                    $scope.InitDaysOfWeek();
                    $scope.RefreshPossibleIndexes();
                    $scope.selectedWeatherData = $scope.weatherData.list[$scope.currentWeatherIndex];
                    $scope.loading = false;
                }
            },
            function error(result) {
                //The error is displyed in the notification box
                $scope.AddNotif(result.statusText, true);
                $scope.loading = false;
            }
        );
    };

    //Handles the errors from the retrieval of the user's location
    $scope.ShowGeoErrors = function (error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                $scope.AddNotif("User needs to authorize Geolocation.", true);
                break;
            case error.POSITION_UNAVAILABLE:
                $scope.AddNotif("Location information is unavailable.", true);
                break;
            case error.TIMEOUT:
                $scope.AddNotif("The request to get user location timed out.", true);
                break;
            case error.UNKNOWN_ERROR:
                $scope.AddNotif("An unknown error occurred.", true);
                break;
        }
        $scope.$apply();
    };

    //Retrieves the user's location and then call the function in charge of calling the Web Method GetForecast
    $scope.GetWeather = function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition($scope.GetWeatherData, $scope.ShowGeoErrors);
        } else {
            //Only works if the user accepts and if the browser is compatible
            $scope.ShowNotif("The current browser's location is not available");
        }
    };

    //The user selects another Weather index by clicking on a different time
    $scope.ChangeSelectedWeather = function (weatherIndex) {
        $scope.currentWeatherIndex = weatherIndex;
        $scope.selectedWeatherData = $scope.weatherData.list[$scope.currentWeatherIndex];
    };

    //The user selects another Weather index by clicking on a different day
    $scope.ChangeSelectedDay = function (indexStart) {
        $scope.ChangeSelectedWeather(indexStart);
        $scope.RefreshPossibleIndexes();
    };

    //The user selects a different temperature format
    $scope.ToggleTempFormat = function () {
        if ($scope.celsiusSelected) {
            $scope.celsiusSelected = false;
        } else {
            $scope.celsiusSelected = true;
        }
        //His choice is kept in the local storage
        window.localStorage.setItem("celsiusSelected", $scope.celsiusSelected);
    };

    //Launch the data collection and display of the page
    $scope.GetWeather();

});

