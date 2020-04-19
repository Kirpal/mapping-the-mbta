using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace MappingTheMBTA.Data
{
    public static class Live
    {
        private static LiveData Trips;

        //private static string[] Routes = { "Blue", "Red", "Orange", "Green-B", "Green-C", "Green-D", "Green-E" };
        private static Dictionary<string, string> Places = JsonConvert.DeserializeObject<Dictionary<string, string>>(File.ReadAllText(@"stations.json"));
        /*private static Dictionary<string, string[]> Termini = new Dictionary<string, string[]>()
        {
            ["Blue"] = new string[] { "Wonderland", "Bowdoin" },
            ["Red"] = new string[] { "Alewife", "Ashmont" },
            ["Orange"] = new string[] { "Forest Hills", "Oak Grove" },
            ["Green-B"] = new string[] { "Lechmere", "Boston College" },
            ["Green-C"] = new string[] { "Lechmere", "Cleverland Circle" },
            ["Green-D"] = new string[] { "Lechmere", "Riverside" },
            ["Green-E"] = new string[] { "Lechmere", "Heath Street" }
        };*/

        // gets the most recently updated data available
        public static LiveData GetUpdated()
        {
            return Trips;
        }

        // fetches the most recent data and updates the trip list
        public static void UpdateData()
        {
            List<Trip> processed = new List<Trip>();

            foreach (var route in Route.Routes)
            {
                string jsonPreds = "";
                string jsonVehicles = "";

                jsonPreds = MBTA.FetchJSON(MBTA.Endpoint.predictions, $"?filter[route]={route.Key}");
                jsonVehicles = MBTA.FetchJSON(MBTA.Endpoint.vehicles, $"?filter[route]={route.Key}");

                processed.AddRange(ProcessData(jsonPreds, jsonVehicles, route.Value));
            }

            Trips = new LiveData() { Trips = processed };
        }

        // processes raw json into the list format that needs to be returned to the client
        private static List<Trip> ProcessData(string predJson, string vehicleJson, string[] termini)
        {
            List<Trip> result = new List<Trip>();
            var dataPreds = JsonConvert.DeserializeObject<dynamic>(predJson).data;
            var dataVehicles = JsonConvert.DeserializeObject<dynamic>(vehicleJson).data;

            // vehicles
            foreach (var vehicle in dataVehicles)
            {
                result.Add(new Trip()
                {
                    Stations = new List<Prediction>(),
                    Line = vehicle.relationships.route.data.id,
                    VehicleID = vehicle.id,
                    StartTime = 0,
                    EndTime = 0,
                    TripID = vehicle.relationships.trip.data.id,
                    Destination = termini[vehicle.attributes.direction_id]
                });
            }
            // predictions (stations)
            foreach (var prediction in dataPreds)
            {
                string vehicleID = prediction.relationships.vehicle.data.id;
                if (result.Any(x => x.VehicleID == vehicleID))
                {
                    Trip toAdd = result.Single(x => x.VehicleID == vehicleID);
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
            // start/end times
            foreach (Trip trip in result)
            {
                List<ulong> times = new List<ulong>();
                foreach (Prediction pred in trip.Stations)
                {
                    times.Add(pred.ArrivalEst);
                    times.Add(pred.DepartureEst);
                }
                var nonzero = times.Where(x => x != 0);
                if (nonzero.Count() > 0)
                {
                    trip.StartTime = nonzero.Min(x => x);
                    trip.EndTime = nonzero.Max(x => x);
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
