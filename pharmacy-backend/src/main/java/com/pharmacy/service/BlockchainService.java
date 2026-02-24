package com.pharmacy.service;

import com.pharmacy.blockchain.PharmacyTracker;
import com.pharmacy.config.WalletManager;
import com.pharmacy.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.tx.gas.ContractGasProvider;
import org.web3j.tuples.generated.Tuple4;

import java.math.BigInteger;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BlockchainService {

    private final PharmacyTracker pharmacyTracker;  // Admin-signed instance
    private final WalletManager   walletManager;
    private final Web3j            web3j;
    private final ContractGasProvider gasProvider;

    @Value("${blockchain.contract-address}")
    private String contractAddress;

    // ── READ ─────────────────────────────────────────────────────────────────

    public PrescriptionStatusDTO verifyPrescription(String prescriptionHash) {
        try {
            log.debug("Querying blockchain for prescription: {}", prescriptionHash);
            byte[] hashBytes = hexStringToBytes32(prescriptionHash);

            Tuple4<BigInteger, BigInteger, Boolean, String> result =
                    pharmacyTracker.verifyPrescription(hashBytes).send();

            BigInteger statusCode      = result.component1();
            BigInteger expiryTimestamp = result.component2();
            Boolean    isExpired       = result.component3();
            String     doctorAddress   = result.component4();

            String statusLabel = switch (statusCode.intValue()) {
                case 0  -> "VALID";
                case 1  -> "REDEEMED";
                case 2  -> "REVOKED";
                default -> "UNKNOWN";
            };

            String expiryDate = Instant.ofEpochSecond(expiryTimestamp.longValue())
                    .atZone(ZoneId.of("UTC"))
                    .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss 'UTC'"));

            return new PrescriptionStatusDTO(
                    prescriptionHash, statusLabel, expiryDate,
                    isExpired, doctorAddress, buildMessage(statusLabel, isExpired)
            );

        } catch (Exception e) {
            log.error("Verify failed for {}: {}", prescriptionHash, e.getMessage());
            throw new RuntimeException("Could not verify prescription: " + e.getMessage());
        }
    }

    // ── WRITE: Admin Registry ─────────────────────────────────────────────────

    public TransactionResponseDTO authorizeDoctor(String walletAddress) {
        try {
            log.info("Admin authorizing doctor: {}", walletAddress);
            TransactionReceipt receipt = pharmacyTracker
                    .authorizeDoctor(walletAddress).send();

            return new TransactionResponseDTO(
                    true, receipt.getTransactionHash(), null,
                    "Doctor successfully authorized: " + walletAddress,
                    "ADMIN"
            );
        } catch (Exception e) {
            log.error("authorizeDoctor failed: {}", e.getMessage());
            throw new RuntimeException("Failed to authorize doctor: " + e.getMessage());
        }
    }

    public TransactionResponseDTO authorizePharmacist(String walletAddress) {
        try {
            log.info("Admin authorizing pharmacist: {}", walletAddress);
            TransactionReceipt receipt = pharmacyTracker
                    .authorizePharmacist(walletAddress).send();

            return new TransactionResponseDTO(
                    true, receipt.getTransactionHash(), null,
                    "Pharmacist successfully authorized: " + walletAddress,
                    "ADMIN"
            );
        } catch (Exception e) {
            log.error("authorizePharmacist failed: {}", e.getMessage());
            throw new RuntimeException("Failed to authorize pharmacist: " + e.getMessage());
        }
    }

    // ── WRITE: Issue Prescription ─────────────────────────────────────────────

    public TransactionResponseDTO issuePrescription(IssueRequestDTO request) {
        try {
            log.info("Doctor {} issuing prescription", request.getDoctorAddress());

            // Load contract instance signed by the DOCTOR's credentials
            Credentials doctorCreds = walletManager.getCredentials(request.getDoctorAddress());
            PharmacyTracker doctorContract = PharmacyTracker.load(
                    contractAddress, web3j, doctorCreds, gasProvider
            );

            byte[] patientHash  = hexStringToBytes32(request.getPatientHash());
            byte[] medicineHash = hexStringToBytes32(request.getMedicineHash());
            BigInteger duration = BigInteger.valueOf(request.getDurationInDays());

            TransactionReceipt receipt = doctorContract
                    .issuePrescription(patientHash, medicineHash, duration).send();

            // Extract the prescription hash from PrescriptionIssued event
            List<PharmacyTracker.PrescriptionIssuedEventResponse> events =
                    doctorContract.getPrescriptionIssuedEvents(receipt);

            if (events.isEmpty()) {
                throw new RuntimeException("Transaction succeeded but no PrescriptionIssued event found");
            }

            String pHash = bytesToHex(events.get(0).prescriptionHash);
            log.info("Prescription issued successfully. Hash: {}", pHash);

            return new TransactionResponseDTO(
                    true,
                    receipt.getTransactionHash(),
                    pHash,
                    "Prescription issued successfully. Valid for " + request.getDurationInDays() + " days.",
                    request.getDoctorAddress()
            );

        } catch (Exception e) {
            log.error("issuePrescription failed: {}", e.getMessage());
            throw new RuntimeException("Failed to issue prescription: " + e.getMessage());
        }
    }

    // ── WRITE: Redeem Prescription ────────────────────────────────────────────

    public TransactionResponseDTO redeemPrescription(RedeemRequestDTO request) {
        try {
            log.info("Pharmacist {} redeeming prescription: {}",
                    request.getPharmacistAddress(), request.getPrescriptionHash());

            // Load contract instance signed by the PHARMACIST's credentials
            Credentials pharmacistCreds = walletManager.getCredentials(request.getPharmacistAddress());
            PharmacyTracker pharmacistContract = PharmacyTracker.load(
                    contractAddress, web3j, pharmacistCreds, gasProvider
            );

            byte[] hashBytes = hexStringToBytes32(request.getPrescriptionHash());
            TransactionReceipt receipt = pharmacistContract
                    .redeemPrescription(hashBytes).send();

            log.info("Prescription redeemed. Tx: {}", receipt.getTransactionHash());

            return new TransactionResponseDTO(
                    true,
                    receipt.getTransactionHash(),
                    request.getPrescriptionHash(),
                    "Prescription successfully redeemed. Medicine dispensed.",
                    request.getPharmacistAddress()
            );

        } catch (Exception e) {
            log.error("redeemPrescription failed: {}", e.getMessage());
            throw new RuntimeException("Failed to redeem prescription: " + e.getMessage());
        }
    }

    // ── WRITE: Revoke Prescription ────────────────────────────────────────────

    public TransactionResponseDTO revokePrescription(RevokeRequestDTO request) {
        try {
            log.info("Doctor {} revoking prescription: {}",
                    request.getDoctorAddress(), request.getPrescriptionHash());

            // Load contract instance signed by the DOCTOR's credentials
            Credentials doctorCreds = walletManager.getCredentials(request.getDoctorAddress());
            PharmacyTracker doctorContract = PharmacyTracker.load(
                    contractAddress, web3j, doctorCreds, gasProvider
            );

            byte[] hashBytes = hexStringToBytes32(request.getPrescriptionHash());
            TransactionReceipt receipt = doctorContract
                    .revokePrescription(hashBytes).send();

            log.info("Prescription revoked. Tx: {}", receipt.getTransactionHash());

            return new TransactionResponseDTO(
                    true,
                    receipt.getTransactionHash(),
                    request.getPrescriptionHash(),
                    "Prescription successfully revoked by issuing doctor.",
                    request.getDoctorAddress()
            );

        } catch (Exception e) {
            log.error("revokePrescription failed: {}", e.getMessage());
            throw new RuntimeException("Failed to revoke prescription: " + e.getMessage());
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String buildMessage(String status, boolean isExpired) {
        if (isExpired && "VALID".equals(status)) return "Prescription exists but has EXPIRED.";
        return switch (status) {
            case "VALID"    -> "Prescription is valid and ready for redemption.";
            case "REDEEMED" -> "Prescription has already been dispensed.";
            case "REVOKED"  -> "Prescription was cancelled by the issuing doctor.";
            default         -> "Unknown prescription state.";
        };
    }

    private byte[] hexStringToBytes32(String hex) {
        String clean = hex.startsWith("0x") ? hex.substring(2) : hex;
        while (clean.length() < 64) clean = "0" + clean;
        byte[] result = new byte[32];
        for (int i = 0; i < 32; i++) {
            result[i] = (byte) Integer.parseInt(clean.substring(i * 2, i * 2 + 2), 16);
        }
        return result;
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder("0x");
        for (byte b : bytes) sb.append(String.format("%02x", b));
        return sb.toString();
    }
}