package com.pharmacy.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PrescriptionStatusDTO {
    private String  prescriptionHash;
    private String  status;        // "VALID", "REDEEMED", or "REVOKED"
    private String  expiryDate;    // Human-readable UTC timestamp
    private boolean isExpired;
    private String  doctorAddress;
    private String  message;       // User-friendly summary
}