using System;

namespace Core.Application.DTOs.Catalog;

public class VerificationResultDto
{
    public bool IsAuthentic { get; set; }
    public string Message { get; set; } = string.Empty;
    public int VerificationCount { get; set; }
    public DateTime? FirstVerifiedAt { get; set; }
}