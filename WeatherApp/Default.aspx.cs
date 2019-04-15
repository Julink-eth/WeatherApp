using System;
using System.Web.Services;
using System.Web.UI;
using WeatherApp.Apis;

namespace WeatherApp
{
    public partial class _Default : Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {

        }

        /// <summary>
        /// Get the forecast for next 5 days from the OpenWeatherMap Api and return
        /// the response as a json string.
        /// </summary>
        /// <param name="lat" type="string">The latitude of the location to get the weather from</param>
        /// <param name="lon" type="string">The longitude of the location to get the weather from</param>
        /// <returns>Response as a json string</returns>
        [WebMethod]
        public static string GetForecast(string lat, string lon)
        {
            try
            {
                OpenWeatherMap openWeatherMap = new OpenWeatherMap(OpenWeatherMap.Timelines.Hourly);
                openWeatherMap.InitUrlByGeoCoordinates(double.Parse(lat), double.Parse(lon));
                return openWeatherMap.Call();
            }
            catch (Exception ex)
            {
                return ex.Message;
            }

        }
    }
}