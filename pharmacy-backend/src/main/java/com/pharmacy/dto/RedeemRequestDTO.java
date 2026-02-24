package com.pharmacy.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RedeemRequestDTO {

    @NotBlank(message = "Prescription hash is required")
    private String prescriptionHash;

    @NotBlank(message = "Pharmacist wallet address is required")
    private String pharmacistAddress;
}