using System;

namespace Core.Application.DTOs.Catalog;



public class ReviewDto
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
}