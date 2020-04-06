using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MappingTheMBTA.Data
{
    public class Live
    {
        private List<Vehicle> Data;

        // gets the most recently updated data available
        public IEnumerable<Vehicle> Updated()
        {
            return null;
        }


        // fetches the most recent data
        public void UpdateData()
        {
            this.Data = null; 
        }
    }
}
