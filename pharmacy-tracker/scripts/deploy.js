const { ethers } = require("hardhat");

async function main() {

  // ── 1. Get signers ──────────────────────────────────────────────────────────
  const [admin, doctor, pharmacist] = await ethers.getSigners();

  console.log("═══════════════════════════════════════════════════");
  console.log("  Deploying PharmacyTracker Contract");
  console.log("═══════════════════════════════════════════════════");
  console.log("Admin address    :", admin.address);
  console.log("Doctor address   :", doctor.address);
  console.log("Pharmacist address:", pharmacist.address);

  // ── 2. Deploy ────────────────────────────────────────────────────────────────
  const PharmacyTracker = await ethers.getContractFactory("PharmacyTracker");
  const tracker = await PharmacyTracker.deploy();
  await tracker.waitForDeployment();

  const contractAddress = await tracker.getAddress();
  console.log("\n✅ Contract deployed to:", contractAddress);

  // ── 3. Register test roles ───────────────────────────────────────────────────
  console.log("\n── Registering test roles ──────────────────────────");

  const tx1 = await tracker.connect(admin).authorizeDoctor(doctor.address);
  await tx1.wait();
  console.log("✅ Doctor registered    :", doctor.address);

  const tx2 = await tracker.connect(admin).authorizePharmacist(pharmacist.address);
  await tx2.wait();
  console.log("✅ Pharmacist registered:", pharmacist.address);

  // ── 4. Smoke test — issue one prescription ───────────────────────────────────
  console.log("\n── Smoke Test: Issuing a prescription ──────────────");

  const patientHash  = ethers.keccak256(ethers.toUtf8Bytes("patient-001"));
  const medicineHash = ethers.keccak256(ethers.toUtf8Bytes("amoxicillin-500mg"));

  const tx3 = await tracker.connect(doctor).issuePrescription(
    patientHash,
    medicineHash,
    30  // 30-day validity
  );
  const receipt = await tx3.wait();

  // Extract the prescription hash from the emitted event
  const event = receipt.logs
    .map(log => { try { return tracker.interface.parseLog(log); } catch { return null; } })
    .find(e => e && e.name === "PrescriptionIssued");

  const pHash = event.args.prescriptionHash;
  console.log("✅ Prescription issued. Hash:", pHash);

  // ── 5. Verify it on chain ────────────────────────────────────────────────────
  const result = await tracker.verifyPrescription(pHash);
  console.log("✅ Verified on-chain:");
  console.log("   Status    :", result.status.toString(), "(0 = VALID)");
  console.log("   Expired   :", result.isExpired);
  console.log("   Doctor    :", result.doctor);

  // ── 6. Print config block for Spring Boot ────────────────────────────────────
  console.log("\n═══════════════════════════════════════════════════");
  console.log("  Copy these into your Spring Boot application.properties");
  console.log("═══════════════════════════════════════════════════");
  console.log(`blockchain.contract-address=${contractAddress}`);
  console.log(`blockchain.admin-address=${admin.address}`);
  console.log(`blockchain.rpc-url=http://127.0.0.1:8545`);
  console.log("═══════════════════════════════════════════════════");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });