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
        public LiveData GetLiveVehicles()
        {
            return Data.Live.GetUpdated();
        }

        [HttpGet("scheduled")]
        public IEnumerable<Trip> GetSchedule()
        {
            return null;
        }
    }
}
