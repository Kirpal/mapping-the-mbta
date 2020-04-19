using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;

namespace MappingTheMBTA.Data
{
    public static class MBTA
    {
        // gets new data from the specified endpoint and returns as dynamic object
        // options allows further specification of the endpoint (filters, ids, etc)
        public static string FetchJSON(Endpoint endpoint, string options)
        {
            string baseUrl = "https://api-v3.mbta.com/";
            string target = baseUrl + endpoint.ToString().ToLower() + options;

            Console.WriteLine($"{DateTime.Now} | GET {target}");
            target += APIKey.Encoded; // add the api key to the request after logging

            string result = "";

            using (var client = new HttpClient())
                result = client.GetAsync(target).Result.Content.ReadAsStringAsync().Result;

            return result;
        }

        public enum Endpoint
        {
            predictions,
            vehicles,
            routes
        }
    }
}
