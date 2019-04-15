<%@ Page Title="Home Page" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="WeatherApp._Default" %>

<asp:Content ID="BodyContent" ContentPlaceHolderID="MainContent" runat="server">
    <div ng-app="weatherApp" ng-controller="weatherCtrl">
        <div ng-show="displayNotif" class="notifBox col-md-12">
            <div ng-repeat="notif in notifs">
                <div class="notif">
                    <span ng-class="{notifError: notif.error}">{{notif.message}}</span>
                    <div class="glyphicon glyphicon-remove removeButton" ng-click="RemoveNotif($index)"></div>
                </div>
            </div>
        </div>
        <div ng-show="loading" class="loading">
            <img src="Content/Images/Eclipse-1s-200px.gif" />
        </div>
        <div ng-show="!loading">
            <div class="weatherBox col-md-12">
                <div class="weatherLocation">{{weatherData.city.name}}</div>
                <div class="weatherDay">{{weekDays[selectedWeatherData.date.getDay()]}}</div>
                <div class="weatherDate">{{selectedWeatherData.displayedDate}}</div>
                <div class="weatherDescription"><i>{{selectedWeatherData.weather[0].description}}</i></div>
                <div class="row weatherDetails">
                    <div class="col-md-3">
                    </div>
                    <div class="col-md-1">
                        <div class="weatherIcon">
                            <img ng-src="http://openweathermap.org/img/w/{{selectedWeatherData.weather[0].icon}}.png" />
                        </div>
                    </div>
                    <div class="col-md-2">
                        <div ng-if="celsiusSelected">
                            <div class="weatherTemp">
                                {{selectedWeatherData.main.tempCelsius}} | <span ng-click="ToggleTempFormat()" class="handSelector">°F</span>
                            </div>
                        </div>
                        <div ng-if="!celsiusSelected">
                            <div class="weatherTemp">
                                {{selectedWeatherData.main.tempFahrenheit}} | <span ng-click="ToggleTempFormat()" class="handSelector">°C</span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="weatherProperties">Humidity : {{selectedWeatherData.main.humidity}}%</div>
                        <div class="weatherProperties">Wind : {{selectedWeatherData.wind.speed}} m/s</div>
                    </div>
                </div>
            </div>
            <div class="col-md-12">
                <div class="row timesBox">
                    <div class="col-md-1 col-xs-2 weatherTime handSelector" ng-repeat="possibleIndex in possibleIndexes" 
                        ng-click="ChangeSelectedWeather(possibleIndex)"
                        ng-class="{hightlightTime: selectedWeatherData == weatherData.list[possibleIndex]}"
                        ng-if="possibleIndex < weatherData.list.length">
                        {{AddZero(weatherData.list[possibleIndex].date.getHours())}}:{{AddZero(weatherData.list[possibleIndex].date.getMinutes())}}
                    </div>
                </div>
                <div class="row daysBox">
                    <div class="col-md-2 weatherDays handSelector" ng-repeat="(day,indexStart) in daysOfWeek" 
                        ng-click="ChangeSelectedDay(indexStart)"
                        ng-class="{hightlightDay: selectedWeatherData.date.getDay() == weatherData.list[indexStart].date.getDay()}">
                        {{day}}
                        <img ng-src="http://openweathermap.org/img/w/{{weatherData.list[indexStart].weather[0].icon}}.png" />
                        <div ng-if="celsiusSelected">
                            <div class="weatherTemp">{{weatherData.list[indexStart].main.tempCelsius}}</div>
                        </div>
                        <div ng-if="!celsiusSelected">
                            <div class="weatherTemp">{{weatherData.list[indexStart].main.tempFahrenheit}}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</asp:Content>
