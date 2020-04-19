using MappingTheMBTA.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MappingTheMBTA.Data
{
    public static class Actual
    {
        private static Dataset _actual = new Dataset();

        // gets the observed trips for today
        public static Dataset Capture()
        {
            return _actual;
        }

        // updates the current state of the network based on vehicle statuses
        // when something is added to _actual, it should also be stored in the database
        public static void Update()
        {

        }
    }
}
