

namespace service.OrderAPI.Models.Dto
{
    public class OrderDto
    {
        public int Id { get; set; }
        public List<int> ProductIds { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime Date { get; set; }
        public string Status { get; set; }
    }
}
