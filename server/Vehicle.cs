using System.Collections.Generic;

namespace MappingTheMBTA
{
    public class Vehicle
    {
        public List<Station> Stations { get; set; }

        public ulong Begin { get; set; }
        public ulong End { get; set; }

        public string Line { get; set; }

        public string Name { get; set; }
    }

    public class Station
    {
        public ulong time { get; set; } // unix in seconds
        public string stop { get; set; } // gtfs id
    }
}
