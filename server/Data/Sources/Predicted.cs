using MappingTheMBTA.Models;
using Newtonsoft.Json;
using System.Collections.Generic;
using System;
using System.Linq;

namespace MappingTheMBTA.Data
{
    public static class Predicted
    {
        private static Dataset _predictions = new Dataset();

        // includes the current predictions in the dataset to return
        public static Dataset Include(Dataset today)
        {
            Dataset result = today.Clone();

            //
            //
            // insert predictions into result here
            //
            //

            return result;
        }

        // fetches the most recent data and updates the trip list
        public static void Update()
        {
            List<Trip> processed = new List<Trip>();

            foreach (var route in Route.Routes)
            {
                string jsonPreds = new MBTAWeb().FetchJSON(MBTAWeb.Endpoint.predictions, $"?filter[route]={route.Key}");

                processed.AddRange(ProcessData(jsonPreds, route.Value));
            }

            _predictions = new Dataset() { Trips = processed };
        }

        // processes raw json into the list format that needs to be returned to the client
        private static List<Trip> ProcessData(string predJson, string[] termini)
        {
            List<Trip> result = new List<Trip>();
            var dataPreds = JsonConvert.DeserializeObject<dynamic>(predJson).data;
            // predictions (stations)
            foreach (var prediction in dataPreds)
            {
                string tripID = prediction.relationships.trip.data.id;

                // if the trip doesn't exist yet, add it
                // if it does, add this prediction to it
                Trip toAdd = result.SingleOrDefault(x => x.TripID == tripID);
                if (toAdd == default)
                {
                    toAdd = new Trip()
                    {
                        Stations = new List<Stop>(),
                        Line = prediction.relationships.route.data.id,
                        VehicleID = prediction.relationships.vehicle.data.id,
                        TripID = tripID,

                        StartTime = 0,
                        EndTime = 0,

                        DirectionID = prediction.attributes.direction_id,
                        Destination = termini[prediction.attributes.direction_id]
                    };
                }
                else
                {
                    string GTFS = prediction.relationships.stop.data.id;
                    Stop predToAdd = new Stop()
                    {
                        Delta = null,
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