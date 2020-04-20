using System.Collections.Generic;
using MappingTheMBTA.Models;
using MappingTheMBTA.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace MappingTheMBTA.Controllers
{
    [ApiController]
    [Route("api")]
    public class DataController : ControllerBase
    {
        private readonly ILogger<DataController> _logger;

        public DataController(ILogger<DataController> logger)
        {
            _logger = logger;
        }

        public Dataset GetLiveVehicles() => GetLiveVehicles(0, 0, 0);
        public Dataset GetScheduled() => GetSchedule(0, 0, 0);

        // format dates yyyy/mm/dd
        [HttpGet("actual")]
        public Dataset GetLiveVehicles(int year, int month, int day)
        {
            return Actual.Capture();
        }

        [HttpGet("scheduled")]
        public Dataset GetSchedule(int year, int month, int day)
        {
            return Scheduled.Capture();
        }
    }
}
