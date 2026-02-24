package com.pharmacy.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegistryRequestDTO {

    @NotBlank(message = "Wallet address is required")
    private String walletAddress;
}