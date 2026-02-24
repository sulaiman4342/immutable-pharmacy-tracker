package com.pharmacy.config;

import com.pharmacy.blockchain.PharmacyTracker;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.gas.ContractGasProvider;
import org.web3j.tx.gas.StaticGasProvider;

import java.math.BigInteger;

@Configuration
public class Web3jConfig {

    @Value("${blockchain.rpc-url}")
    private String rpcUrl;

    @Value("${blockchain.contract-address}")
    private String contractAddress;

    private static final BigInteger GAS_LIMIT = BigInteger.valueOf(6_721_975L);
    private static final BigInteger GAS_PRICE = BigInteger.valueOf(20_000_000_000L);

    @Bean
    public Web3j web3j() {
        return Web3j.build(new HttpService(rpcUrl));
    }

    @Bean
    public ContractGasProvider gasProvider() {
        return new StaticGasProvider(GAS_PRICE, GAS_LIMIT);
    }

    /**
     * Admin-signed contract instance — used for registry operations only.
     * For doctor/pharmacist operations, BlockchainService loads a
     * fresh contract instance with the correct actor's credentials.
     */
    @Bean
    public PharmacyTracker pharmacyTracker(Web3j web3j,
                                           WalletManager walletManager,
                                           ContractGasProvider gasProvider) {
        return PharmacyTracker.load(
                contractAddress,
                web3j,
                walletManager.getAdminCredentials(),
                gasProvider
        );
    }
}