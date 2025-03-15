using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace service.OrderAPI.Models
{
    public class Order
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public List<int> ProductIds { get; set; } 

        [Required]
        public decimal TotalAmount { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [Required]
        public string Status { get; set; }
    }
}
