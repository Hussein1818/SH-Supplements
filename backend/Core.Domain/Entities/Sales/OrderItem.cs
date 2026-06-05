using Core.Domain.Common;
using Core.Domain.Entities.Catalog;
using Core.Domain.Enums;

namespace Core.Domain.Entities.Sales;



public class OrderItem : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; } 
}