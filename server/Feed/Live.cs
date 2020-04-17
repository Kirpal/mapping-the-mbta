﻿using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace MappingTheMBTA.Data
{
    public static class Live
    {
        private static string[] Routes = { "Blue", "Red", "Orange", "Green-B", "Green-C", "Green-D", "Green-E" };
        private static Dictionary<string, string> Places = JsonConvert.DeserializeObject<Dictionary<string, string>>(File.ReadAllText(@"stations.json"));
        private static List<Vehicle> Vehicles;
        private static List<Stop> Stops;

        // gets the most recently updated data available
        public static IEnumerable<Vehicle> GetUpdated()
        {
            return Vehicles;
        }

        // fetches the most recent data
        // updates predictions & vehicle lists
        public static void UpdateData()
        {
            List<Vehicle> processed = new List<Vehicle>();
            foreach (string route in Routes)
            {
                string jsonPreds = "";
                string jsonVehicles = "";

                jsonPreds = MBTA.FetchJSON(MBTA.Endpoint.predictions, "?filter[route]=" + route);
                jsonVehicles = MBTA.FetchJSON(MBTA.Endpoint.vehicles, "?filter[route]=" + route);

                processed.AddRange(ProcessData(jsonPreds, jsonVehicles));
            }

            Vehicles = processed;
            Stops = null; // FILL IN LATER
        }

        // processes raw json into the list format that needs to be returned to the client
        private static List<Vehicle> ProcessData(string predJson, string vehicleJson)
        {
            List<Vehicle> result = new List<Vehicle>();
            var dataPreds = JsonConvert.DeserializeObject<dynamic>(predJson).data;
            var dataVehicles = JsonConvert.DeserializeObject<dynamic>(vehicleJson).data;
            
            foreach (var vehicle in dataVehicles)
            {
                result.Add(new Vehicle()
                {
                    Stations = new List<Prediction>(),
                    Line = vehicle.relationships.route.data.id,
                    ID = vehicle.id
                });
            }
            foreach (var prediction in dataPreds)
            {
                string vehicleID = prediction.relationships.vehicle.data.id;
                if (result.Any(x => x.ID == vehicleID))
                {
                    Vehicle toAdd = result.Single(x => x.ID == vehicleID);
                    string GTFS = prediction.relationships.stop.data.id;
                    Prediction predToAdd = new Prediction()
                    {
                        Station = new Station()
                        {
                            GTFS = GTFS,
                            PlaceID = ResolveGTFS(GTFS)
                        },
                    };
                    if (prediction.attributes.arrival_time != null)
                        predToAdd.ArrivalEst = ParseTime(prediction.attributes.arrival_time);
                    if (prediction.attributes.departure_time != null)
                        predToAdd.DepartureEst = ParseTime(prediction.attributes.departure_time);

                    toAdd.Stations.Add(predToAdd);
                }
            }

            return result;
        }

        // Converts the dynamic DateTime format into unix time
        private static ulong ParseTime(dynamic timestamp)
        {
            var time = (DateTime)timestamp;

            return (ulong)time.Subtract(new DateTime(1970, 1, 1)).TotalSeconds;
        }

        // Resolves the api's GTFS location into our place-ID format
        private static string ResolveGTFS(string GTFS)
        {
            string result;
            if (!Places.TryGetValue(GTFS, out result))
                return "";

            return result;
        }
    }
}