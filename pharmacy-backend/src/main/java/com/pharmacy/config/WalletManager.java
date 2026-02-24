package com.pharmacy.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.web3j.crypto.Credentials;

import java.util.HashMap;
import java.util.Map;

/**
 * Manages wallet credentials for different actors.
 *
 * In a real production system, private keys would come from a Hardware
 * Security Module (HSM) or encrypted vault. For this academic project,
 * we load them from application.properties. Never commit real private
 * keys to source control.
 */
@Slf4j
@Component
public class WalletManager {

    // Map of walletAddress (lowercase) -> Credentials
    private final Map<String, Credentials> walletRegistry = new HashMap<>();

    private final Credentials adminCredentials;

    public WalletManager(
            @Value("${blockchain.admin-private-key}") String adminKey,
            @Value("${blockchain.doctor-private-key}") String doctorKey,
            @Value("${blockchain.pharmacist-private-key}") String pharmacistKey
    ) {
        // Load admin credentials
        this.adminCredentials = Credentials.create(adminKey);
        walletRegistry.put(adminCredentials.getAddress().toLowerCase(), adminCredentials);

        // Load doctor credentials
        Credentials doctorCreds = Credentials.create(doctorKey);
        walletRegistry.put(doctorCreds.getAddress().toLowerCase(), doctorCreds);

        // Load pharmacist credentials
        Credentials pharmacistCreds = Credentials.create(pharmacistKey);
        walletRegistry.put(pharmacistCreds.getAddress().toLowerCase(), pharmacistCreds);

        log.info("WalletManager initialized with {} wallets", walletRegistry.size());
        log.info("Admin address    : {}", adminCredentials.getAddress());
        log.info("Doctor address   : {}", doctorCreds.getAddress());
        log.info("Pharmacist address: {}", pharmacistCreds.getAddress());
    }

    /**
     * Returns credentials for a given wallet address.
     * Throws if the address is not registered — prevents unauthorized signing.
     */
    public Credentials getCredentials(String walletAddress) {
        Credentials creds = walletRegistry.get(walletAddress.toLowerCase());
        if (creds == null) {
            throw new IllegalArgumentException(
                    "No credentials found for wallet: " + walletAddress +
                            ". Only pre-registered wallets can sign transactions."
            );
        }
        return creds;
    }

    public Credentials getAdminCredentials() {
        return adminCredentials;
    }
}