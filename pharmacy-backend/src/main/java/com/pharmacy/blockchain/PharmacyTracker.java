package com.pharmacy.blockchain;

import io.reactivex.Flowable;
import io.reactivex.functions.Function;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.Callable;
import org.web3j.abi.EventEncoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Bool;
import org.web3j.abi.datatypes.Event;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.datatypes.generated.Bytes32;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.abi.datatypes.generated.Uint8;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameter;
import org.web3j.protocol.core.RemoteCall;
import org.web3j.protocol.core.RemoteFunctionCall;
import org.web3j.protocol.core.methods.request.EthFilter;
import org.web3j.protocol.core.methods.response.BaseEventResponse;
import org.web3j.protocol.core.methods.response.Log;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.tuples.generated.Tuple3;
import org.web3j.tuples.generated.Tuple4;
import org.web3j.tx.Contract;
import org.web3j.tx.TransactionManager;
import org.web3j.tx.gas.ContractGasProvider;

/**
 * <p>Auto generated code.
 * <p><strong>Do not modify!</strong>
 * <p>Please use the <a href="https://docs.web3j.io/command_line.html">web3j command line tools</a>,
 * or the org.web3j.codegen.SolidityFunctionWrapperGenerator in the 
 * <a href="https://github.com/web3j/web3j/tree/master/codegen">codegen module</a> to update.
 *
 * <p>Generated with web3j version 4.9.4.
 */
@SuppressWarnings("rawtypes")
public class PharmacyTracker extends Contract {
    public static final String BINARY = "0x6080604052348015600f57600080fd5b50600080546001600160a01b03191633179055610c7e806100316000396000f3fe608060405234801561001057600080fd5b50600436106100b45760003560e01c80636f60d226116100715780636f60d2261461012d5780637b464e931461014057806382946ee214610195578063996440c6146101c8578063f851a440146101eb578063f971f3f11461021657600080fd5b80630416af27146100b95780631b788175146100ce578063377e949f146100e157806339c59de9146100f45780634bfc1ec51461010757806358c9202c1461011a575b600080fd5b6100cc6100c7366004610a7f565b610239565b005b6100cc6100dc366004610a7f565b6102c0565b6100cc6100ef366004610aaf565b610345565b6100cc610102366004610a7f565b6104f9565b6100cc610115366004610ac8565b61057b565b6100cc610128366004610a7f565b6107b9565b6100cc61013b366004610aaf565b61083d565b61017d61014e366004610aaf565b600360205260009081526040902080546001909101546001600160a01b03821691600160a01b900460ff169083565b60405161018c93929190610b2c565b60405180910390f35b6101b86101a3366004610a7f565b60026020526000908152604090205460ff1681565b604051901515815260200161018c565b6101b86101d6366004610a7f565b60016020526000908152604090205460ff1681565b6000546101fe906001600160a01b031681565b6040516001600160a01b03909116815260200161018c565b610229610224366004610aaf565b610a16565b60405161018c9493929190610b57565b6000546001600160a01b0316331461026c5760405162461bcd60e51b815260040161026390610b89565b60405180910390fd5b6001600160a01b038116600081815260016020526040808220805460ff1916905551652227a1aa27a960d11b92917f6161f38d7bcbdabae613358e81c1e09bb790d78ad5ef6863c32d798ca667fa9091a350565b6000546001600160a01b031633146102ea5760405162461bcd60e51b815260040161026390610b89565b6001600160a01b038116600081815260026020526040808220805460ff19166001179055516914121054935050d254d560b21b92917fbd4f54568b7c91392f03009967e46b0688bd75843f35612613c087fd973cea5391a350565b3360009081526002602052604090205460ff166103a45760405162461bcd60e51b815260206004820152601c60248201527f4e6f7420616e20617574686f72697a656420706861726d6163697374000000006044820152606401610263565b600081815260036020526040902080546001600160a01b03166103d95760405162461bcd60e51b815260040161026390610bcb565b60008154600160a01b900460ff1660028111156103f8576103f8610af4565b146104635760405162461bcd60e51b815260206004820152603560248201527f507265736372697074696f6e206973206e6f742076616c6964206f7220616c726044820152741958591e481c995919595b59590bdc995d9bdad959605a1b6064820152608401610263565b80600101544211156104b75760405162461bcd60e51b815260206004820152601860248201527f507265736372697074696f6e20686173206578706972656400000000000000006044820152606401610263565b805460ff60a01b1916600160a01b178155604051339083907ff6eedbe4f25a45ceb54d0e97ce156eeda67a739030d6530a7fb4f0ba7a2fb87e90600090a35050565b6000546001600160a01b031633146105235760405162461bcd60e51b815260040161026390610b89565b6001600160a01b038116600081815260026020526040808220805460ff19169055516914121054935050d254d560b21b92917f6161f38d7bcbdabae613358e81c1e09bb790d78ad5ef6863c32d798ca667fa9091a350565b3360009081526001602052604090205460ff166105d55760405162461bcd60e51b81526020600482015260186024820152772737ba1030b71030baba3437b934bd32b2103237b1ba37b960411b6044820152606401610263565b600081116106255760405162461bcd60e51b815260206004820152601f60248201527f4475726174696f6e206d757374206265206174206c65617374203120646179006044820152606401610263565b6040516bffffffffffffffffffffffff193360601b166020820152603481018490526054810183905242607482015243609482015260009060b40160408051601f198184030181529181528151602092830120600081815260039093529120549091506001600160a01b0316156106ee5760405162461bcd60e51b815260206004820152602760248201527f507265736372697074696f6e206861736820636f6c6c6973696f6e202d2074726044820152663c9030b3b0b4b760c91b6064820152608401610263565b60408051606081018252338152600060208201529081016107128462015180610c18565b61071c9042610c35565b90526000828152600360209081526040909120825181546001600160a01b039091166001600160a01b031982168117835592840151919283916001600160a81b03191617600160a01b83600281111561077757610777610af4565b021790555060409182015160019091015551339082907fa553d5b572d4decb69e54cd4e860e1307ead7f547a8e4dbc67b0dc0b2c073efe90600090a350505050565b6000546001600160a01b031633146107e35760405162461bcd60e51b815260040161026390610b89565b6001600160a01b0381166000818152600160208190526040808320805460ff191690921790915551652227a1aa27a960d11b92917fbd4f54568b7c91392f03009967e46b0688bd75843f35612613c087fd973cea5391a350565b3360009081526001602052604090205460ff166108975760405162461bcd60e51b81526020600482015260186024820152772737ba1030b71030baba3437b934bd32b2103237b1ba37b960411b6044820152606401610263565b600081815260036020526040902080546001600160a01b03166108cc5760405162461bcd60e51b815260040161026390610bcb565b80546001600160a01b031633146109425760405162461bcd60e51b815260206004820152603460248201527f4f6e6c79207468652069737375696e6720646f63746f722063616e207265766f60448201527335b2903a3434b990383932b9b1b934b83a34b7b760611b6064820152608401610263565b60008154600160a01b900460ff16600281111561096157610961610af4565b146109d45760405162461bcd60e51b815260206004820152603a60248201527f43616e6e6f74207265766f6b653a20707265736372697074696f6e206973206160448201527f6c72656164792072656465656d6564206f72207265766f6b65640000000000006064820152608401610263565b805460ff60a01b1916600160a11b178155604051339083907f55ffd9bd2bd2d91b860b57252a03213efb9c63f119dc7ea97bbbccf079bc3ecd90600090a35050565b60008181526003602052604081208054829182918291906001600160a01b0316610a525760405162461bcd60e51b815260040161026390610bcb565b805460019091015460ff600160a01b8304169550935042841092506001600160a01b031690509193509193565b600060208284031215610a9157600080fd5b81356001600160a01b0381168114610aa857600080fd5b9392505050565b600060208284031215610ac157600080fd5b5035919050565b600080600060608486031215610add57600080fd5b505081359360208301359350604090920135919050565b634e487b7160e01b600052602160045260246000fd5b60038110610b2857634e487b7160e01b600052602160045260246000fd5b9052565b6001600160a01b038416815260608101610b496020830185610b0a565b826040830152949350505050565b60808101610b658287610b0a565b602082019490945291151560408301526001600160a01b0316606090910152919050565b60208082526022908201527f4f6e6c792061646d696e2063616e20706572666f726d2074686973206163746960408201526137b760f11b606082015260800190565b6020808252601b908201527f507265736372697074696f6e20646f6573206e6f742065786973740000000000604082015260600190565b634e487b7160e01b600052601160045260246000fd5b8082028115828204841417610c2f57610c2f610c02565b92915050565b80820180821115610c2f57610c2f610c0256fea26469706673582212200fdd07f6ac8b9deaad93f62caad8a7bcfdd058d672d2016212945eecdc9cf8bd64736f6c634300081c0033";

    public static final String FUNC_ADMIN = "admin";

    public static final String FUNC_AUTHORIZEDOCTOR = "authorizeDoctor";

    public static final String FUNC_AUTHORIZEPHARMACIST = "authorizePharmacist";

    public static final String FUNC_ISDOCTOR = "isDoctor";

    public static final String FUNC_ISPHARMACIST = "isPharmacist";

    public static final String FUNC_ISSUEPRESCRIPTION = "issuePrescription";

    public static final String FUNC_PRESCRIPTIONS = "prescriptions";

    public static final String FUNC_REDEEMPRESCRIPTION = "redeemPrescription";

    public static final String FUNC_REVOKEDOCTOR = "revokeDoctor";

    public static final String FUNC_REVOKEPHARMACIST = "revokePharmacist";

    public static final String FUNC_REVOKEPRESCRIPTION = "revokePrescription";

    public static final String FUNC_VERIFYPRESCRIPTION = "verifyPrescription";

    public static final Event ACCESSGRANTED_EVENT = new Event("AccessGranted", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Address>(true) {}, new TypeReference<Bytes32>(true) {}));
    ;

    public static final Event ACCESSREVOKED_EVENT = new Event("AccessRevoked", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Address>(true) {}, new TypeReference<Bytes32>(true) {}));
    ;

    public static final Event PRESCRIPTIONISSUED_EVENT = new Event("PrescriptionIssued", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Bytes32>(true) {}, new TypeReference<Address>(true) {}));
    ;

    public static final Event PRESCRIPTIONREDEEMED_EVENT = new Event("PrescriptionRedeemed", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Bytes32>(true) {}, new TypeReference<Address>(true) {}));
    ;

    public static final Event PRESCRIPTIONREVOKED_EVENT = new Event("PrescriptionRevoked", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Bytes32>(true) {}, new TypeReference<Address>(true) {}));
    ;

    @Deprecated
    protected PharmacyTracker(String contractAddress, Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit) {
        super(BINARY, contractAddress, web3j, credentials, gasPrice, gasLimit);
    }

    protected PharmacyTracker(String contractAddress, Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        super(BINARY, contractAddress, web3j, credentials, contractGasProvider);
    }

    @Deprecated
    protected PharmacyTracker(String contractAddress, Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        super(BINARY, contractAddress, web3j, transactionManager, gasPrice, gasLimit);
    }

    protected PharmacyTracker(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        super(BINARY, contractAddress, web3j, transactionManager, contractGasProvider);
    }

    public static List<AccessGrantedEventResponse> getAccessGrantedEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = staticExtractEventParametersWithLog(ACCESSGRANTED_EVENT, transactionReceipt);
        ArrayList<AccessGrantedEventResponse> responses = new ArrayList<AccessGrantedEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            AccessGrantedEventResponse typedResponse = new AccessGrantedEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.account = (String) eventValues.getIndexedValues().get(0).getValue();
            typedResponse.role = (byte[]) eventValues.getIndexedValues().get(1).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<AccessGrantedEventResponse> accessGrantedEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new Function<Log, AccessGrantedEventResponse>() {
            @Override
            public AccessGrantedEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(ACCESSGRANTED_EVENT, log);
                AccessGrantedEventResponse typedResponse = new AccessGrantedEventResponse();
                typedResponse.log = log;
                typedResponse.account = (String) eventValues.getIndexedValues().get(0).getValue();
                typedResponse.role = (byte[]) eventValues.getIndexedValues().get(1).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<AccessGrantedEventResponse> accessGrantedEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(ACCESSGRANTED_EVENT));
        return accessGrantedEventFlowable(filter);
    }

    public static List<AccessRevokedEventResponse> getAccessRevokedEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = staticExtractEventParametersWithLog(ACCESSREVOKED_EVENT, transactionReceipt);
        ArrayList<AccessRevokedEventResponse> responses = new ArrayList<AccessRevokedEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            AccessRevokedEventResponse typedResponse = new AccessRevokedEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.account = (String) eventValues.getIndexedValues().get(0).getValue();
            typedResponse.role = (byte[]) eventValues.getIndexedValues().get(1).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<AccessRevokedEventResponse> accessRevokedEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new Function<Log, AccessRevokedEventResponse>() {
            @Override
            public AccessRevokedEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(ACCESSREVOKED_EVENT, log);
                AccessRevokedEventResponse typedResponse = new AccessRevokedEventResponse();
                typedResponse.log = log;
                typedResponse.account = (String) eventValues.getIndexedValues().get(0).getValue();
                typedResponse.role = (byte[]) eventValues.getIndexedValues().get(1).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<AccessRevokedEventResponse> accessRevokedEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(ACCESSREVOKED_EVENT));
        return accessRevokedEventFlowable(filter);
    }

    public static List<PrescriptionIssuedEventResponse> getPrescriptionIssuedEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = staticExtractEventParametersWithLog(PRESCRIPTIONISSUED_EVENT, transactionReceipt);
        ArrayList<PrescriptionIssuedEventResponse> responses = new ArrayList<PrescriptionIssuedEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            PrescriptionIssuedEventResponse typedResponse = new PrescriptionIssuedEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.prescriptionHash = (byte[]) eventValues.getIndexedValues().get(0).getValue();
            typedResponse.doctor = (String) eventValues.getIndexedValues().get(1).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<PrescriptionIssuedEventResponse> prescriptionIssuedEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new Function<Log, PrescriptionIssuedEventResponse>() {
            @Override
            public PrescriptionIssuedEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(PRESCRIPTIONISSUED_EVENT, log);
                PrescriptionIssuedEventResponse typedResponse = new PrescriptionIssuedEventResponse();
                typedResponse.log = log;
                typedResponse.prescriptionHash = (byte[]) eventValues.getIndexedValues().get(0).getValue();
                typedResponse.doctor = (String) eventValues.getIndexedValues().get(1).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<PrescriptionIssuedEventResponse> prescriptionIssuedEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(PRESCRIPTIONISSUED_EVENT));
        return prescriptionIssuedEventFlowable(filter);
    }

    public static List<PrescriptionRedeemedEventResponse> getPrescriptionRedeemedEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = staticExtractEventParametersWithLog(PRESCRIPTIONREDEEMED_EVENT, transactionReceipt);
        ArrayList<PrescriptionRedeemedEventResponse> responses = new ArrayList<PrescriptionRedeemedEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            PrescriptionRedeemedEventResponse typedResponse = new PrescriptionRedeemedEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.prescriptionHash = (byte[]) eventValues.getIndexedValues().get(0).getValue();
            typedResponse.pharmacist = (String) eventValues.getIndexedValues().get(1).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<PrescriptionRedeemedEventResponse> prescriptionRedeemedEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new Function<Log, PrescriptionRedeemedEventResponse>() {
            @Override
            public PrescriptionRedeemedEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(PRESCRIPTIONREDEEMED_EVENT, log);
                PrescriptionRedeemedEventResponse typedResponse = new PrescriptionRedeemedEventResponse();
                typedResponse.log = log;
                typedResponse.prescriptionHash = (byte[]) eventValues.getIndexedValues().get(0).getValue();
                typedResponse.pharmacist = (String) eventValues.getIndexedValues().get(1).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<PrescriptionRedeemedEventResponse> prescriptionRedeemedEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(PRESCRIPTIONREDEEMED_EVENT));
        return prescriptionRedeemedEventFlowable(filter);
    }

    public static List<PrescriptionRevokedEventResponse> getPrescriptionRevokedEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = staticExtractEventParametersWithLog(PRESCRIPTIONREVOKED_EVENT, transactionReceipt);
        ArrayList<PrescriptionRevokedEventResponse> responses = new ArrayList<PrescriptionRevokedEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            PrescriptionRevokedEventResponse typedResponse = new PrescriptionRevokedEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.prescriptionHash = (byte[]) eventValues.getIndexedValues().get(0).getValue();
            typedResponse.doctor = (String) eventValues.getIndexedValues().get(1).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<PrescriptionRevokedEventResponse> prescriptionRevokedEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new Function<Log, PrescriptionRevokedEventResponse>() {
            @Override
            public PrescriptionRevokedEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(PRESCRIPTIONREVOKED_EVENT, log);
                PrescriptionRevokedEventResponse typedResponse = new PrescriptionRevokedEventResponse();
                typedResponse.log = log;
                typedResponse.prescriptionHash = (byte[]) eventValues.getIndexedValues().get(0).getValue();
                typedResponse.doctor = (String) eventValues.getIndexedValues().get(1).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<PrescriptionRevokedEventResponse> prescriptionRevokedEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(PRESCRIPTIONREVOKED_EVENT));
        return prescriptionRevokedEventFlowable(filter);
    }

    public RemoteFunctionCall<String> admin() {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(FUNC_ADMIN, 
                Arrays.<Type>asList(), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Address>() {}));
        return executeRemoteCallSingleValueReturn(function, String.class);
    }

    public RemoteFunctionCall<TransactionReceipt> authorizeDoctor(String _doctor) {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(
                FUNC_AUTHORIZEDOCTOR, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(160, _doctor)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteFunctionCall<TransactionReceipt> authorizePharmacist(String _pharmacist) {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(
                FUNC_AUTHORIZEPHARMACIST, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(160, _pharmacist)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteFunctionCall<Boolean> isDoctor(String param0) {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(FUNC_ISDOCTOR, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(160, param0)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Bool>() {}));
        return executeRemoteCallSingleValueReturn(function, Boolean.class);
    }

    public RemoteFunctionCall<Boolean> isPharmacist(String param0) {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(FUNC_ISPHARMACIST, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(160, param0)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Bool>() {}));
        return executeRemoteCallSingleValueReturn(function, Boolean.class);
    }

    public RemoteFunctionCall<TransactionReceipt> issuePrescription(byte[] _patientHash, byte[] _medicineHash, BigInteger _durationInDays) {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(
                FUNC_ISSUEPRESCRIPTION, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(_patientHash), 
                new org.web3j.abi.datatypes.generated.Bytes32(_medicineHash), 
                new org.web3j.abi.datatypes.generated.Uint256(_durationInDays)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteFunctionCall<Tuple3<String, BigInteger, BigInteger>> prescriptions(byte[] param0) {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(FUNC_PRESCRIPTIONS, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(param0)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Address>() {}, new TypeReference<Uint8>() {}, new TypeReference<Uint256>() {}));
        return new RemoteFunctionCall<Tuple3<String, BigInteger, BigInteger>>(function,
                new Callable<Tuple3<String, BigInteger, BigInteger>>() {
                    @Override
                    public Tuple3<String, BigInteger, BigInteger> call() throws Exception {
                        List<Type> results = executeCallMultipleValueReturn(function);
                        return new Tuple3<String, BigInteger, BigInteger>(
                                (String) results.get(0).getValue(), 
                                (BigInteger) results.get(1).getValue(), 
                                (BigInteger) results.get(2).getValue());
                    }
                });
    }

    public RemoteFunctionCall<TransactionReceipt> redeemPrescription(byte[] _pHash) {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(
                FUNC_REDEEMPRESCRIPTION, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(_pHash)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteFunctionCall<TransactionReceipt> revokeDoctor(String _doctor) {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(
                FUNC_REVOKEDOCTOR, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(160, _doctor)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteFunctionCall<TransactionReceipt> revokePharmacist(String _pharmacist) {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(
                FUNC_REVOKEPHARMACIST, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(160, _pharmacist)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteFunctionCall<TransactionReceipt> revokePrescription(byte[] _pHash) {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(
                FUNC_REVOKEPRESCRIPTION, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(_pHash)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteFunctionCall<Tuple4<BigInteger, BigInteger, Boolean, String>> verifyPrescription(byte[] _pHash) {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(FUNC_VERIFYPRESCRIPTION, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Bytes32(_pHash)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Uint8>() {}, new TypeReference<Uint256>() {}, new TypeReference<Bool>() {}, new TypeReference<Address>() {}));
        return new RemoteFunctionCall<Tuple4<BigInteger, BigInteger, Boolean, String>>(function,
                new Callable<Tuple4<BigInteger, BigInteger, Boolean, String>>() {
                    @Override
                    public Tuple4<BigInteger, BigInteger, Boolean, String> call() throws Exception {
                        List<Type> results = executeCallMultipleValueReturn(function);
                        return new Tuple4<BigInteger, BigInteger, Boolean, String>(
                                (BigInteger) results.get(0).getValue(), 
                                (BigInteger) results.get(1).getValue(), 
                                (Boolean) results.get(2).getValue(), 
                                (String) results.get(3).getValue());
                    }
                });
    }

    @Deprecated
    public static PharmacyTracker load(String contractAddress, Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit) {
        return new PharmacyTracker(contractAddress, web3j, credentials, gasPrice, gasLimit);
    }

    @Deprecated
    public static PharmacyTracker load(String contractAddress, Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        return new PharmacyTracker(contractAddress, web3j, transactionManager, gasPrice, gasLimit);
    }

    public static PharmacyTracker load(String contractAddress, Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        return new PharmacyTracker(contractAddress, web3j, credentials, contractGasProvider);
    }

    public static PharmacyTracker load(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        return new PharmacyTracker(contractAddress, web3j, transactionManager, contractGasProvider);
    }

    public static RemoteCall<PharmacyTracker> deploy(Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        return deployRemoteCall(PharmacyTracker.class, web3j, credentials, contractGasProvider, BINARY, "");
    }

    public static RemoteCall<PharmacyTracker> deploy(Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        return deployRemoteCall(PharmacyTracker.class, web3j, transactionManager, contractGasProvider, BINARY, "");
    }

    @Deprecated
    public static RemoteCall<PharmacyTracker> deploy(Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit) {
        return deployRemoteCall(PharmacyTracker.class, web3j, credentials, gasPrice, gasLimit, BINARY, "");
    }

    @Deprecated
    public static RemoteCall<PharmacyTracker> deploy(Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        return deployRemoteCall(PharmacyTracker.class, web3j, transactionManager, gasPrice, gasLimit, BINARY, "");
    }

    public static class AccessGrantedEventResponse extends BaseEventResponse {
        public String account;

        public byte[] role;
    }

    public static class AccessRevokedEventResponse extends BaseEventResponse {
        public String account;

        public byte[] role;
    }

    public static class PrescriptionIssuedEventResponse extends BaseEventResponse {
        public byte[] prescriptionHash;

        public String doctor;
    }

    public static class PrescriptionRedeemedEventResponse extends BaseEventResponse {
        public byte[] prescriptionHash;

        public String pharmacist;
    }

    public static class PrescriptionRevokedEventResponse extends BaseEventResponse {
        public byte[] prescriptionHash;

        public String doctor;
    }
}
