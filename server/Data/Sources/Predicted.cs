using MappingTheMBTA.Models;
using Newtonsoft.Json;
using System.Collections.Generic;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace MappingTheMBTA.Data
{
    public static class Predicted
    {
        private static List<Trip> _predictions = new List<Trip>();

        // includes the current predictions in the dataset to return
        public static Dataset Include(Dataset today)
        {
            var lol = _predictions;
            Dataset result = today.Clone();

            //
            //
            // insert predictions into result here
            //
            //

            return result;
        }

        // fetches the most recent data and updates the trip list
        public static async Task Update()
        {
            List<Trip> result = new List<Trip>();

            List<Tuple<Task<string>, string[]>> pending = new List<Tuple<Task<string>, string[]>>();

            // add each route to the queue
            foreach (var route in Route.Routes)
                pending.Add(Tuple.Create(new MBTAWeb().FetchJSONAsync(MBTAWeb.Endpoint.predictions, $"?filter[route]={route.Key}"), route.Value));

            // process the queue
            foreach (var item in pending)
                result.AddRange(ProcessData(await item.Item1, item.Item2));

            result.ConfigTimes();

            _predictions = result;
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
                    result.Add(toAdd);
                }

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
                    predToAdd.Arrival = Utils.ConvertToSeconds(prediction.attributes.arrival_time);
                if (prediction.attributes.departure_time != null)
                    predToAdd.Departure = Utils.ConvertToSeconds(prediction.attributes.departure_time);

                toAdd.Stations.Add(predToAdd);
            }

            return result;
        }
    }
}