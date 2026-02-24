// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title Immutable Pharmacy Prescription Tracker (v2 - Final)
 * @author Student Project - Blockchain & Cybersecurity Module
 * @dev Implements secure issuance, redemption, and revocation of prescriptions.
 *      Enforces dual-registry RBAC, time-lock expiry, and double-spend prevention.
 *
 * Security Model:
 *  - Only Admin can register/revoke Doctors and Pharmacists
 *  - Only registered Doctors can issue prescriptions
 *  - Only registered Pharmacists can redeem prescriptions
 *  - Only the ORIGINAL issuing Doctor can revoke their own prescription
 *  - Expiry is a RUNTIME CHECK (not a stored state) enforced at redemption
 */
contract PharmacyTracker {

    // =========================================================================
    // STATE VARIABLES
    // =========================================================================

    address public admin;

    /**
     * @dev Stored on-chain states. EXPIRED is NOT a stored state —
     *      it is a derived runtime condition checked in redeemPrescription().
     */
    enum Status { VALID, REDEEMED, REVOKED }

    struct Prescription {
        address doctorAddress;  // Issuing doctor's wallet (used for ownership check in revoke)
        Status  status;         // Current lifecycle state
        uint256 expiryDate;     // Unix timestamp; checked at runtime, never stored as a state
    }

    /// @dev Dual registry — both roles must be authorized by Admin before interacting
    mapping(address => bool) public isDoctor;
    mapping(address => bool) public isPharmacist;

    /// @dev Primary data store: prescriptionHash => Prescription struct
    mapping(bytes32 => Prescription) public prescriptions;


    // =========================================================================
    // EVENTS (For Spring Boot / Web3j backend tracking)
    // =========================================================================

    event PrescriptionIssued(bytes32 indexed prescriptionHash, address indexed doctor);
    event PrescriptionRedeemed(bytes32 indexed prescriptionHash, address indexed pharmacist);
    event PrescriptionRevoked(bytes32 indexed prescriptionHash, address indexed doctor);

    /// @dev bytes32 role labels: use "DOCTOR" or "PHARMACIST" for gas efficiency
    event AccessGranted(address indexed account, bytes32 indexed role);
    event AccessRevoked(address indexed account, bytes32 indexed role);


    // =========================================================================
    // MODIFIERS
    // =========================================================================

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }


    // =========================================================================
    // CONSTRUCTOR
    // =========================================================================

    constructor() {
        admin = msg.sender;
    }


    // =========================================================================
    // IDENTITY REGISTRY (Admin Only)
    // =========================================================================

    /// @notice Grants Doctor role to a wallet address
    function authorizeDoctor(address _doctor) external onlyAdmin {
        isDoctor[_doctor] = true;
        emit AccessGranted(_doctor, bytes32("DOCTOR"));
    }

    /// @notice Grants Pharmacist role to a wallet address
    function authorizePharmacist(address _pharmacist) external onlyAdmin {
        isPharmacist[_pharmacist] = true;
        emit AccessGranted(_pharmacist, bytes32("PHARMACIST"));
    }

    /**
     * @notice Revokes Doctor role — critical for compromised wallet scenarios.
     * @dev Without this, a stolen Doctor wallet could issue fraudulent prescriptions indefinitely.
     */
    function revokeDoctor(address _doctor) external onlyAdmin {
        isDoctor[_doctor] = false;
        emit AccessRevoked(_doctor, bytes32("DOCTOR"));
    }

    /**
     * @notice Revokes Pharmacist role — critical for compromised wallet scenarios.
     */
    function revokePharmacist(address _pharmacist) external onlyAdmin {
        isPharmacist[_pharmacist] = false;
        emit AccessRevoked(_pharmacist, bytes32("PHARMACIST"));
    }


    // =========================================================================
    // CORE BUSINESS LOGIC
    // =========================================================================

    /**
     * @notice Issues a new prescription. Only callable by a registered Doctor.
     * @dev Hash is generated on-chain using doctor address, patient/medicine data,
     *      block.timestamp, and block.number to prevent collisions and miner manipulation.
     *
     * @param _patientHash  keccak256 hash of the patient identifier (computed off-chain)
     * @param _medicineHash keccak256 hash of the medicine details (computed off-chain)
     * @param _durationInDays Number of days until the prescription expires
     */
    function issuePrescription(
        bytes32 _patientHash,
        bytes32 _medicineHash,
        uint256 _durationInDays
    ) external {
        require(isDoctor[msg.sender], "Not an authorized doctor");
        require(_durationInDays > 0, "Duration must be at least 1 day");

        // Robust Hash Generation (Blueprint Section 5.1)
        // Combines: doctor identity + patient + medicine + timestamp + block number
        bytes32 pHash = keccak256(abi.encodePacked(
            msg.sender,
            _patientHash,
            _medicineHash,
            block.timestamp,
            block.number
        ));

        // Collision guard: reject if this exact hash already maps to a prescription
        require(
            prescriptions[pHash].doctorAddress == address(0),
            "Prescription hash collision - try again"
        );

        prescriptions[pHash] = Prescription({
            doctorAddress: msg.sender,
            status:        Status.VALID,
            expiryDate:    block.timestamp + (_durationInDays * 1 days)
        });

        emit PrescriptionIssued(pHash, msg.sender);
    }

    /**
     * @notice Redeems a prescription. Only callable by a registered Pharmacist.
     *
     * @dev Enforces three guards in order:
     *      1. Pharmacist role check
     *      2. Prescription existence check
     *      3. Status == VALID (double-spend prevention)
     *      4. Runtime time-lock (EXPIRED is a condition, not a stored state)
     *
     * @param _pHash The prescriptionHash issued by the doctor
     */
    function redeemPrescription(bytes32 _pHash) external {
        require(isPharmacist[msg.sender], "Not an authorized pharmacist");

        Prescription storage p = prescriptions[_pHash];

        // Existence check: uninitialised structs return address(0)
        require(p.doctorAddress != address(0), "Prescription does not exist");

        // Double-spend prevention (Blueprint Section 5, Rule 2)
        require(p.status == Status.VALID, "Prescription is not valid or already redeemed/revoked");

        // Time-Lock: EXPIRED is evaluated at runtime — it is NEVER stored as a state
        require(block.timestamp <= p.expiryDate, "Prescription has expired");

        p.status = Status.REDEEMED;
        emit PrescriptionRedeemed(_pHash, msg.sender);
    }

    /**
     * @notice Allows the original issuing Doctor to revoke a prescription before it is used.
     *
     * @dev Enforces three guards:
     *      1. Caller must be a registered Doctor
     *      2. Caller must be the ORIGINAL issuing Doctor (ownership check)
     *      3. Prescription must still be VALID (prevents post-redemption cancellation)
     *
     * @param _pHash The prescriptionHash to revoke
     */
    function revokePrescription(bytes32 _pHash) external {
        require(isDoctor[msg.sender], "Not an authorized doctor");

        Prescription storage p = prescriptions[_pHash];

        // Existence check
        require(p.doctorAddress != address(0), "Prescription does not exist");

        // Ownership check: only the issuing doctor can revoke (Blueprint Section 5.3)
        require(p.doctorAddress == msg.sender, "Only the issuing doctor can revoke this prescription");

        // Prevents revoking an already-redeemed prescription (post-dispensing audit integrity)
        require(p.status == Status.VALID, "Cannot revoke: prescription is already redeemed or revoked");

        p.status = Status.REVOKED;
        emit PrescriptionRevoked(_pHash, msg.sender);
    }

    /**
     * @notice Read-only check for a pharmacist to verify prescription state before redemption.
     * @dev This is a free view call (no gas cost). Used by the React frontend to display
     *      status before the pharmacist commits to a redeemPrescription() transaction.
     *
     * @param _pHash The prescriptionHash to inspect
     * @return status      Current stored status (VALID / REDEEMED / REVOKED)
     * @return expiryDate  Unix timestamp of expiry
     * @return isExpired   Derived runtime condition: true if block.timestamp > expiryDate
     * @return doctor      Wallet address of the original issuing doctor
     */
    function verifyPrescription(bytes32 _pHash)
        external
        view
        returns (
            Status  status,
            uint256 expiryDate,
            bool    isExpired,
            address doctor
        )
    {
        Prescription storage p = prescriptions[_pHash];
        require(p.doctorAddress != address(0), "Prescription does not exist");

        return (
            p.status,
            p.expiryDate,
            block.timestamp > p.expiryDate,  // Derived — never stored
            p.doctorAddress
        );
    }
}
