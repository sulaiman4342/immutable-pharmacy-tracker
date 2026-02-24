package com.pharmacy.controller;

import com.pharmacy.dto.*;
import com.pharmacy.service.BlockchainService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class PrescriptionController {

    private final BlockchainService blockchainService;

    // ── READ ──────────────────────────────────────────────────────────────────

    @GetMapping("/api/prescriptions/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Blockchain connection active");
    }

    @GetMapping("/api/prescriptions/verify/{hash}")
    public ResponseEntity<PrescriptionStatusDTO> verify(@PathVariable String hash) {
        log.info("Verify request for hash: {}", hash);
        return ResponseEntity.ok(blockchainService.verifyPrescription(hash));
    }

    @GetMapping("/api/auth/role/{address}")
    public ResponseEntity<Map<String, String>> getRole(@PathVariable String address) {
        return ResponseEntity.ok(blockchainService.getRole(address));
    }

    // ── WRITE: Admin ──────────────────────────────────────────────────────────

    @PostMapping("/api/admin/authorize-doctor")
    public ResponseEntity<TransactionResponseDTO> authorizeDoctor(
            @Valid @RequestBody RegistryRequestDTO request) {
        log.info("Authorize doctor request: {}", request.getWalletAddress());
        return ResponseEntity.ok(blockchainService.authorizeDoctor(request.getWalletAddress()));
    }

    @PostMapping("/api/admin/authorize-pharmacist")
    public ResponseEntity<TransactionResponseDTO> authorizePharmacist(
            @Valid @RequestBody RegistryRequestDTO request) {
        log.info("Authorize pharmacist request: {}", request.getWalletAddress());
        return ResponseEntity.ok(blockchainService.authorizePharmacist(request.getWalletAddress()));
    }

    // ── WRITE: Doctor ─────────────────────────────────────────────────────────

    @PostMapping("/api/prescriptions/issue")
    public ResponseEntity<TransactionResponseDTO> issue(
            @Valid @RequestBody IssueRequestDTO request) {
        log.info("Issue prescription request from doctor: {}", request.getDoctorAddress());
        return ResponseEntity.ok(blockchainService.issuePrescription(request));
    }

    @PostMapping("/api/prescriptions/revoke")
    public ResponseEntity<TransactionResponseDTO> revoke(
            @Valid @RequestBody RevokeRequestDTO request) {
        log.info("Revoke prescription request from doctor: {}", request.getDoctorAddress());
        return ResponseEntity.ok(blockchainService.revokePrescription(request));
    }

    // ── WRITE: Pharmacist ─────────────────────────────────────────────────────

    @PostMapping("/api/prescriptions/redeem")
    public ResponseEntity<TransactionResponseDTO> redeem(
            @Valid @RequestBody RedeemRequestDTO request) {
        log.info("Redeem prescription request from pharmacist: {}", request.getPharmacistAddress());
        return ResponseEntity.ok(blockchainService.redeemPrescription(request));
    }
}
