package com.pharmacy.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class IssueRequestDTO {

    @NotBlank(message = "Patient hash is required")
    private String patientHash;      // keccak256 hash of patient ID (computed client-side)

    @NotBlank(message = "Medicine hash is required")
    private String medicineHash;     // keccak256 hash of medicine details (computed client-side)

    @NotNull
    @Min(value = 1, message = "Duration must be at least 1 day")
    private Integer durationInDays;

    @NotBlank(message = "Doctor wallet address is required")
    private String doctorAddress;    // Used to load correct credentials for signing
}