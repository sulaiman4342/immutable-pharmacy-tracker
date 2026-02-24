package com.pharmacy.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TransactionResponseDTO {
    private boolean success;
    private String  transactionHash;   // Blockchain tx hash for audit trail
    private String  prescriptionHash;  // The prescription's unique ID (for issue endpoint)
    private String  message;
    private String  actor;             // Which wallet performed the action
}