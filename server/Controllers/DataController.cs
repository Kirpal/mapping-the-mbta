using System.Collections.Generic;
using MappingTheMBTA.Models;
using MappingTheMBTA.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;

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

        [HttpGet("actual")]
        // takes in yyyy, mm, dd
        public Dataset GetActual(int year, int month, int day)
        {
            Console.WriteLine($"{DateTime.Now} | REQ ./api/actual");
            return Sources.Today;
        }
    }
}
