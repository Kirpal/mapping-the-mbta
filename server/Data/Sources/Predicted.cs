using MappingTheMBTA.Models;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace MappingTheMBTA.Data
{
    public static class Predicted
    {
        private static Dataset _predictions = new Dataset();

        // gets the next hour of predictions
        public static Dataset Capture()
        {
            return _predictions;
        }

        // fetches the most recent data and updates the trip list
        public static void Update()
        {
            List<Trip> processed = new List<Trip>();

            foreach (var route in Route.Routes)
            {
                string jsonPreds;
                string jsonVehicles;

                jsonPreds = MBTAWeb.FetchJSON(MBTAWeb.Endpoint.predictions, $"?filter[route]={route.Key}");
                jsonVehicles = MBTAWeb.FetchJSON(MBTAWeb.Endpoint.vehicles, $"?filter[route]={route.Key}");

                processed.AddRange(ProcessData(jsonPreds, jsonVehicles, route.Value));
            }

            _predictions = new Dataset() { Trips = processed };
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
                    Stations = new List<Stop>(),
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
                    Stop predToAdd = new Stop()
                    {
                        Station = new Station()
                        {
                            GTFS = GTFS,
                            PlaceID = Utils.ResolveGTFS(GTFS)
                        }
                    };

                    if (prediction.attributes.arrival_time != null)
                        predToAdd.Arrival = Utils.ParseTime(prediction.attributes.arrival_time);
                    if (prediction.attributes.departure_time != null)
                        predToAdd.Departure = Utils.ParseTime(prediction.attributes.departure_time);

                    toAdd.Stations.Add(predToAdd);
                }
            }
            // start/end times
            foreach (Trip trip in result)
            {
                List<ulong> times = new List<ulong>();
                foreach (Stop pred in trip.Stations)
                {
                    times.Add(pred.Arrival);
                    times.Add(pred.Departure);
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
    }
}
