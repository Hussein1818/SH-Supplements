# SH-Supplements 

A high-performance E-commerce backend API tailored for dietary supplements. 

## Tech Stack
* **Framework:** .NET 9 (ASP.NET Core Web API)
* **Architecture:** Clean Architecture & CQRS
* **Database:** SQL Server & Entity Framework Core
* **Security:** ASP.NET Core Identity

## Features

### 1. Authentication & User Management 
* **Authentication:** Secure Registration and Login using ASP.NET Core Identity.
* **JWT Security:** Implementation of Access Tokens, Refresh Tokens, and Token Revocation.
* **Account Verification:** Secure Email Confirmation and Forgot/Reset Password workflows using safe Base64Url encoding.
* **Security Standards:** Zero hardcoded URLs (loaded via `IConfiguration`) and IDOR prevention utilizing JWT Claims for user identification.
* **User Profiles:** Complete management of user physical metrics and fitness goals.
* **Address Management:** Secure handling of multiple shipping addresses per user with dynamic `IsDefault` logic and GUID-based primary keys.
