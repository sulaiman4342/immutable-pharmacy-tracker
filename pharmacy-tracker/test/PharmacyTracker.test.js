const { ethers } = require("hardhat");
const { expect } = require("chai");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("PharmacyTracker — Full Security Test Suite", function () {

  // Shared state across all tests
  let tracker;
  let admin, doctor, doctor2, pharmacist, stranger;
  let validPrescriptionHash;

  // Helper: issue a standard prescription and capture its hash
  async function issuePrescription(durationDays = 30) {
    const patientHash  = ethers.keccak256(ethers.toUtf8Bytes("patient-001"));
    const medicineHash = ethers.keccak256(ethers.toUtf8Bytes("amoxicillin-500mg"));

    const tx = await tracker.connect(doctor).issuePrescription(
      patientHash,
      medicineHash,
      durationDays
    );
    const receipt = await tx.wait();

    // Extract the prescriptionHash from the emitted event
    const event = receipt.logs
      .map(log => { try { return tracker.interface.parseLog(log); } catch { return null; } })
      .find(e => e && e.name === "PrescriptionIssued");

    return event.args.prescriptionHash;
  }

  // Run before every test: deploy fresh contract + register roles
  beforeEach(async function () {
    [admin, doctor, doctor2, pharmacist, stranger] = await ethers.getSigners();

    const PharmacyTracker = await ethers.getContractFactory("PharmacyTracker");
    tracker = await PharmacyTracker.deploy();
    await tracker.waitForDeployment();

    // Register roles via admin
    await tracker.connect(admin).authorizeDoctor(doctor.address);
    await tracker.connect(admin).authorizePharmacist(pharmacist.address);
  });


  // ===========================================================================
  // SECTION 1: Identity Registry
  // ===========================================================================
  describe("1. Identity Registry", function () {

    it("should set the deployer as admin", async function () {
      expect(await tracker.admin()).to.equal(admin.address);
    });

    it("should allow admin to register a doctor", async function () {
      expect(await tracker.isDoctor(doctor.address)).to.be.true;
    });

    it("should allow admin to register a pharmacist", async function () {
      expect(await tracker.isPharmacist(pharmacist.address)).to.be.true;
    });

    it("should emit AccessGranted event when a doctor is registered", async function () {
  const doctorRole = ethers.encodeBytes32String("DOCTOR");
  await expect(tracker.connect(admin).authorizeDoctor(doctor2.address))
    .to.emit(tracker, "AccessGranted")
    .withArgs(doctor2.address, doctorRole);
});

    it("should allow admin to REVOKE a doctor's access", async function () {
      await tracker.connect(admin).revokeDoctor(doctor.address);
      expect(await tracker.isDoctor(doctor.address)).to.be.false;
    });

    // THREAT: Unauthorized registry modification
    it("[THREAT] should REVERT if a non-admin tries to register a doctor", async function () {
      await expect(
        tracker.connect(stranger).authorizeDoctor(stranger.address)
      ).to.be.revertedWith("Only admin can perform this action");
    });

    it("[THREAT] should REVERT if a non-admin tries to revoke a doctor", async function () {
      await expect(
        tracker.connect(stranger).revokeDoctor(doctor.address)
      ).to.be.revertedWith("Only admin can perform this action");
    });
  });


  // ===========================================================================
  // SECTION 2: Prescription Issuance
  // ===========================================================================
  describe("2. Prescription Issuance", function () {

    it("should allow a registered doctor to issue a prescription", async function () {
      const pHash = await issuePrescription();
      const result = await tracker.verifyPrescription(pHash);
      expect(result.status).to.equal(0); // 0 = VALID
      expect(result.doctor).to.equal(doctor.address);
    });

    it("should set the correct expiry date", async function () {
      const durationDays = 14;
      const pHash = await issuePrescription(durationDays);
      const result = await tracker.verifyPrescription(pHash);
      const now = await time.latest();
      // Expiry should be approximately now + 14 days (within 2 seconds tolerance)
      expect(result.expiryDate).to.be.closeTo(
        BigInt(now) + BigInt(durationDays * 24 * 60 * 60),
        2n
      );
    });

    it("should emit PrescriptionIssued event with correct args", async function () {
      const patientHash  = ethers.keccak256(ethers.toUtf8Bytes("patient-001"));
      const medicineHash = ethers.keccak256(ethers.toUtf8Bytes("amoxicillin-500mg"));
      await expect(
        tracker.connect(doctor).issuePrescription(patientHash, medicineHash, 30)
      ).to.emit(tracker, "PrescriptionIssued");
    });

    // THREAT TEST 1: Unauthorized Issuance
    it("[THREAT 1] should REVERT if a non-doctor tries to issue a prescription", async function () {
      const patientHash  = ethers.keccak256(ethers.toUtf8Bytes("patient-001"));
      const medicineHash = ethers.keccak256(ethers.toUtf8Bytes("amoxicillin-500mg"));
      await expect(
        tracker.connect(stranger).issuePrescription(patientHash, medicineHash, 30)
      ).to.be.revertedWith("Not an authorized doctor");
    });

    it("[THREAT 1] should REVERT if a revoked doctor tries to issue a prescription", async function () {
      // Admin revokes doctor mid-session (compromised wallet scenario)
      await tracker.connect(admin).revokeDoctor(doctor.address);
      const patientHash  = ethers.keccak256(ethers.toUtf8Bytes("patient-001"));
      const medicineHash = ethers.keccak256(ethers.toUtf8Bytes("amoxicillin-500mg"));
      await expect(
        tracker.connect(doctor).issuePrescription(patientHash, medicineHash, 30)
      ).to.be.revertedWith("Not an authorized doctor");
    });

    it("should REVERT if duration is zero", async function () {
      const patientHash  = ethers.keccak256(ethers.toUtf8Bytes("patient-001"));
      const medicineHash = ethers.keccak256(ethers.toUtf8Bytes("amoxicillin-500mg"));
      await expect(
        tracker.connect(doctor).issuePrescription(patientHash, medicineHash, 0)
      ).to.be.revertedWith("Duration must be at least 1 day");
    });
  });


  // ===========================================================================
  // SECTION 3: Redemption & Double-Spend Prevention
  // ===========================================================================
  describe("3. Prescription Redemption", function () {

    it("should allow a registered pharmacist to redeem a VALID prescription", async function () {
      const pHash = await issuePrescription();
      await tracker.connect(pharmacist).redeemPrescription(pHash);
      const result = await tracker.verifyPrescription(pHash);
      expect(result.status).to.equal(1); // 1 = REDEEMED
    });

    it("should emit PrescriptionRedeemed event on success", async function () {
      const pHash = await issuePrescription();
      await expect(tracker.connect(pharmacist).redeemPrescription(pHash))
        .to.emit(tracker, "PrescriptionRedeemed")
        .withArgs(pHash, pharmacist.address);
    });

    // THREAT TEST 2: Double-Spending / Prescription Reuse
    it("[THREAT 2] should REVERT on a second redemption attempt (double-spend)", async function () {
      const pHash = await issuePrescription();
      // First redemption — should succeed
      await tracker.connect(pharmacist).redeemPrescription(pHash);
      // Second redemption — must be rejected
      await expect(
        tracker.connect(pharmacist).redeemPrescription(pHash)
      ).to.be.revertedWith("Prescription is not valid or already redeemed/revoked");
    });

    // THREAT TEST: Non-pharmacist redemption attempt
    it("[THREAT 1] should REVERT if a non-pharmacist tries to redeem", async function () {
      const pHash = await issuePrescription();
      await expect(
        tracker.connect(stranger).redeemPrescription(pHash)
      ).to.be.revertedWith("Not an authorized pharmacist");
    });

    it("should REVERT if prescription does not exist", async function () {
      const fakePHash = ethers.keccak256(ethers.toUtf8Bytes("nonexistent"));
      await expect(
        tracker.connect(pharmacist).redeemPrescription(fakePHash)
      ).to.be.revertedWith("Prescription does not exist");
    });
  });


  // ===========================================================================
  // SECTION 4: Time-Lock / Expiry Enforcement
  // ===========================================================================
  describe("4. Time-Lock Expiry (Runtime Condition)", function () {

    // THREAT TEST 3: Expired Prescription Fraud
    it("[THREAT 3] should REVERT when redeeming an EXPIRED prescription", async function () {
      // Issue prescription with 1-day validity
      const pHash = await issuePrescription(1);

      // Fast-forward Hardhat's clock by 2 days
      await time.increase(2 * 24 * 60 * 60);

      await expect(
        tracker.connect(pharmacist).redeemPrescription(pHash)
      ).to.be.revertedWith("Prescription has expired");
    });

    it("should correctly report isExpired = true in verifyPrescription after expiry", async function () {
      const pHash = await issuePrescription(1);
      await time.increase(2 * 24 * 60 * 60);
      const result = await tracker.verifyPrescription(pHash);
      expect(result.isExpired).to.be.true;
    });

    it("should allow redemption of a prescription that has NOT yet expired", async function () {
      const pHash = await issuePrescription(30);
      // Advance only 10 days — still within 30-day window
      await time.increase(10 * 24 * 60 * 60);
      await expect(
        tracker.connect(pharmacist).redeemPrescription(pHash)
      ).to.not.be.reverted;
    });
  });


  // ===========================================================================
  // SECTION 5: Revocation Logic
  // ===========================================================================
  describe("5. Revocation Guards", function () {

    it("should allow the issuing doctor to revoke a VALID prescription", async function () {
      const pHash = await issuePrescription();
      await tracker.connect(doctor).revokePrescription(pHash);
      const result = await tracker.verifyPrescription(pHash);
      expect(result.status).to.equal(2); // 2 = REVOKED
    });

    it("should emit PrescriptionRevoked event on successful revocation", async function () {
      const pHash = await issuePrescription();
      await expect(tracker.connect(doctor).revokePrescription(pHash))
        .to.emit(tracker, "PrescriptionRevoked")
        .withArgs(pHash, doctor.address);
    });

    // THREAT TEST 4: Unauthorized Revocation
    it("[THREAT 4] should REVERT if a DIFFERENT doctor tries to revoke", async function () {
      // Register a second doctor
      await tracker.connect(admin).authorizeDoctor(doctor2.address);
      const pHash = await issuePrescription(); // Issued by doctor (not doctor2)

      await expect(
        tracker.connect(doctor2).revokePrescription(pHash)
      ).to.be.revertedWith("Only the issuing doctor can revoke this prescription");
    });

    it("[THREAT 4] should REVERT if a pharmacist tries to revoke", async function () {
      const pHash = await issuePrescription();
      await expect(
        tracker.connect(pharmacist).revokePrescription(pHash)
      ).to.be.revertedWith("Not an authorized doctor");
    });

    it("[THREAT 4] should REVERT if a stranger tries to revoke", async function () {
      const pHash = await issuePrescription();
      await expect(
        tracker.connect(stranger).revokePrescription(pHash)
      ).to.be.revertedWith("Not an authorized doctor");
    });

    // Post-redemption revocation — audit integrity test
    it("[THREAT] should REVERT if doctor tries to revoke an already REDEEMED prescription", async function () {
      const pHash = await issuePrescription();
      await tracker.connect(pharmacist).redeemPrescription(pHash);
      await expect(
        tracker.connect(doctor).revokePrescription(pHash)
      ).to.be.revertedWith("Cannot revoke: prescription is already redeemed or revoked");
    });

    it("should REVERT if doctor tries to revoke an already REVOKED prescription", async function () {
      const pHash = await issuePrescription();
      await tracker.connect(doctor).revokePrescription(pHash);
      await expect(
        tracker.connect(doctor).revokePrescription(pHash)
      ).to.be.revertedWith("Cannot revoke: prescription is already redeemed or revoked");
    });
  });


  // ===========================================================================
  // SECTION 6: verifyPrescription View Function
  // ===========================================================================
  describe("6. Verification (Read-Only)", function () {

    it("should return correct data for a VALID prescription", async function () {
      const pHash = await issuePrescription(30);
      const result = await tracker.verifyPrescription(pHash);
      expect(result.status).to.equal(0);     // VALID
      expect(result.isExpired).to.be.false;
      expect(result.doctor).to.equal(doctor.address);
    });

    it("should REVERT if queried hash does not exist", async function () {
      const fakePHash = ethers.keccak256(ethers.toUtf8Bytes("ghost"));
      await expect(
        tracker.verifyPrescription(fakePHash)
      ).to.be.revertedWith("Prescription does not exist");
    });
  });

});