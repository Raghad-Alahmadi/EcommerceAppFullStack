using System.ComponentModel.DataAnnotations;

namespace service.ProductAPI.Models
{
    public class Product
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Title { get; set; }

        [Required]
        public decimal Price { get; set; }

        [Required]
        [StringLength(500)]
        public string Description { get; set; }

        [Required]
        public string Category { get; set; }

        [Required]
        [Url]
        public string Image { get; set; }


        [Range(0.0, 5.0)]
        public double Rate { get; set; }

        [Range(0, int.MaxValue)]
        public int Count { get; set; }
    }

}
