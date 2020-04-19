using System;
using System.Net.Http;
using MappingTheMBTA.Models;

namespace MappingTheMBTA.Data
{
    public static class MBTAWeb
    {
        // gets new data from the specified endpoint and returns as dynamic object
        // options allows further specification of the endpoint (filters, ids, etc)
        public static string FetchJSON(Endpoint endpoint, string options)
        {
            string baseUrl = "https://api-v3.mbta.com/";
            string target = baseUrl + endpoint.ToString().ToLower() + options;

            Console.WriteLine($"{DateTime.Now} | GET {target}");
            target += $"&api_key={APIKey.Key}"; // add the api key to the request after logging

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
