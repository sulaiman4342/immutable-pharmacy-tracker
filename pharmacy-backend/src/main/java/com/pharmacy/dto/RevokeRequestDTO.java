package com.pharmacy.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RevokeRequestDTO {

    @NotBlank(message = "Prescription hash is required")
    private String prescriptionHash;

    @NotBlank(message = "Doctor wallet address is required")
    private String doctorAddress;
}