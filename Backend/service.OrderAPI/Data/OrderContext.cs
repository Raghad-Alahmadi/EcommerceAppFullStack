using Microsoft.EntityFrameworkCore;
using service.OrderAPI.Models;

namespace service.OrderAPI.Data
{
    public class OrderContext : DbContext
    {
        public OrderContext(DbContextOptions<OrderContext> options) : base(options) { }

        public DbSet<Order> Orders { get; set; }
    }
}
