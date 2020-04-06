using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace MappingTheMBTA.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class DataController : ControllerBase
    {
        private readonly ILogger<DataController> _logger;

        public DataController(ILogger<DataController> logger)
        {
            _logger = logger;
        }

        [HttpGet("live")]
        public IEnumerable<Vehicle> GetLive()
        {
            List<Vehicle> result = new List<Vehicle>
            {
                new Vehicle
                {
                    Begin = 1,
                    End = 999,
                    Line = "Blue line!",
                    Name = "The best trip",
                    Stations = new List<Station>()
                    {
                        new Station()
                        {
                            stop = "place-something", time = 42069
                        }
                    }
                }
            };

            return result;
        }

        [HttpGet("scheduled")]
        public IEnumerable<Vehicle> GetSchedule()
        {
            return null;
        }
    }
}
