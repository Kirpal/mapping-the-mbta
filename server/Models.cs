using System;
using System.Collections.Generic;

namespace MappingTheMBTA
{
    public class Vehicle
    {
        public List<Prediction> Stations { get; set; }

        public string Line { get; set; }
        public string ID { get; set; }
    }

    public class Prediction
    {
        public Station Station { get; set; }

        public ulong ArrivalEst { get; set; } // time in unix
        public ulong DepartureEst { get; set; } // time in unix
    }

    public class Stop
    {
        public string PlaceID { get; set; } // front end format (i.e "place-<station code>")
        public List<string> Vehicles { get; set; } // vehicle id only
    }

    public class Station
    {
        public string GTFS { get; set; } // gtfs id
        public string PlaceID { get; set; } // front end format (i.e "place-<station code>")
    }
}