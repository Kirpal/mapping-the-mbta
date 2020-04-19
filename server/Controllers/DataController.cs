using System.Collections.Generic;
using MappingTheMBTA.Models;
using MappingTheMBTA.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace MappingTheMBTA.Controllers
{
    [ApiController]
    //[Route("[controller]")]
    public class DataController : ControllerBase
    {
        private readonly ILogger<DataController> _logger;

        public DataController(ILogger<DataController> logger)
        {
            _logger = logger;
        }

        public string GetLiveVehicles() => "give me a date idiot";
        public string GetScheduled() => "give me a date idiot";

        [HttpGet("actual")]
        public Dataset GetLiveVehicles(int year, int day)
        {
            return Actual.Capture();
        }

        [HttpGet("scheduled")]
        public Dataset GetSchedule(int year, int day)
        {
            return Scheduled.Capture();
        }
    }
}
