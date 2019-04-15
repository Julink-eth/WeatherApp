using System;
using System.Configuration;
using System.IO;
using System.Net;

namespace WeatherApp.Apis
{
    /// <summary>
    /// Wrapper of the OpenWeatherMap API to facilitate the API calls and to have
    /// a better control of how the API is called
    /// </summary>
    public class OpenWeatherMap
    {
        //Define the timeline on which the weather has to be retrieve
        private string TimeLine;
        //Define the mode on which the weather has to be retrieve 
        private string Mode;
        //Define the url to request the api
        private string Url;

        public struct Timelines
        {
            public const string Hourly = "/forecast/hourly?";
            public const string Current = "weather?";
        }

        public struct Modes
        {
            public const string Xml = "&mode=xml";
            public const string Json = "&mode=json";
        }

        public struct ParameterNames
        {
            public const string CityName = "q={0},{1}";
            public const string CityId = "id={0}";
            public const string GeoCoordinates = "lat={0}&lon={1}";
            public const string ZipCode = "zip={0},{1}";
        }

        /// <summary>
        /// Instantiate the API with a timeline and a json mode. 
        /// </summary>
        /// <param name="timeLine">Timeline on which the weather has to be retrieved</param>
        /// <param name="mode">The reponse mode : Default is json</param>
        public OpenWeatherMap(string timeLine, string mode = Modes.Json)
        {
            TimeLine = timeLine;
            Mode = mode;
        }

        /// <summary>
        /// Initialize the url using a city's name and country.
        /// </summary>
        /// <param name="cityName">A city's name</param>
        /// <param name="country">A country</param>
        public void InitUrlByCityName(string cityName, string country)
        {
            string urlParams = TimeLine + string.Format(ParameterNames.CityName, cityName, country) + Mode;
            InitUrl(urlParams);
        }

        /// <summary>
        /// Initialize the url using a city ID.
        /// </summary>
        /// <param name="cityId">A city ID</param>
        public void InitUrlByCityId(long cityId)
        {
            string urlParams = TimeLine + string.Format(ParameterNames.CityId, cityId) + Mode;
            InitUrl(urlParams);
        }

        /// <summary>
        /// Initialize the url using geographical coordinates(lat,lon).
        /// </summary>
        /// <param name="lat">The latitude</param>
        /// <param name="lon">The longitude</param>
        public void InitUrlByGeoCoordinates(double lat, double lon)
        {
            string urlParams = TimeLine + string.Format(ParameterNames.GeoCoordinates, lat, lon) + Mode;
            InitUrl(urlParams);
        }

        /// <summary>
        /// Initialize the url using a zip code and a country.
        /// </summary>
        /// <param name="zipCode">A zip code</param>
        /// <param name="country">A country</param>
        public void InitUrlByZipCode(long zipCode, string country)
        {
            string urlParams = TimeLine + string.Format(ParameterNames.ZipCode, zipCode, country) + Mode;
            InitUrl(urlParams);
        }

        /// <summary>
        /// Function called on any url instanciation, builds the url with a correct format that will
        /// be called to perform the weather retrieval.
        /// </summary>
        /// <param name="urlParams">The url parameters</param>
        private void InitUrl(string urlParams)
        {
            Url = string.Format(ConfigurationManager.AppSettings["OpenWeatherApiUrl"], urlParams)
                + "&APPID=" + ConfigurationManager.AppSettings["OpenWeatherApiToken"];
        }

        /// <summary>
        /// Call the API with the instanciated url.
        /// The exeptions have to be handled by the caller.
        /// </summary>
        /// <exception cref="">Throw an exception if the url has not been set</exception>
        /// <returns>Response as a json string containing the weather data</returns>
        public string Call()
        {
            //The url has to be initiated, it is mandatory before calling the API
            if (Url != null)
            {
                HttpWebRequest request = WebRequest.CreateHttp(Url);
                WebResponse response = request.GetResponse();
                StreamReader stream = new StreamReader(response.GetResponseStream());
                return stream.ReadToEnd();
            }

            throw new Exception("The Url to call has not been initialized");

        }
    }
}