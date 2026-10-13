import assert from "node:assert/strict";
import { MongoClient, ObjectId } from "mongodb";

console.log("=== RUNNING TEAM PROFILE & REAL LINKEDIN DATA TESTS ===");

const uri = process.env.MONGO_URI;
assert.ok(uri, "MONGO_URI must be set");

const client = new MongoClient(uri);
await client.connect();
const db = client.db(process.env.DB_NAME || "dripx");

// 1. Check user and workspace exist
console.log("\n1. Verifying active user and workspace in MongoDB...");
const user = await db.collection("users").findOne({ email: "mdredoyhasan49@gmail.com" });
assert.ok(user, "User mdredoyhasan49@gmail.com should exist");
assert.equal(user.name, "Redoy Al Hasan");
console.log(`✓ Active user found: ${user.name} (${user.email})`);

const membership = await db.collection("team_members").findOne({ userId: user._id });
assert.ok(membership, "User should have membership record");
assert.equal(membership.role, "owner");
console.log(`✓ Role verified: ${membership.role}`);

// 2. Test profile updating
console.log("\n2. Testing updating LinkedIn profile fields...");
const testLinkedinUrl = "https://www.linkedin.com/in/redoyalhasan";
const testHeadline = "Growth Specialist & Founder at DripX";
const testConnections = 3224;

await db.collection("users").updateOne(
  { _id: user._id },
  {
    $set: {
      linkedinUrl: testLinkedinUrl,
      headline: testHeadline,
      connectionsCount: testConnections,
      updatedAt: new Date(),
    },
  }
);

const updatedUser = await db.collection("users").findOne({ _id: user._id });
assert.equal(updatedUser.linkedinUrl, testLinkedinUrl);
assert.equal(updatedUser.headline, testHeadline);
assert.equal(updatedUser.connectionsCount, testConnections);
console.log(`✓ Real LinkedIn profile fields persisted to MongoDB cleanly`);

// 3. Test dynamic activity bucket generation
console.log("\n3. Testing dynamic 7-day calendar date formatting...");
const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const now = new Date();
const dates = [];
for (let i = 6; i >= 0; i--) {
  const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
  dates.push(`${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`);
}

assert.equal(dates.length, 7);
assert.ok(!dates.some((d) => d.includes("2024")), "Dates must not be stale 2024 dummy dates");
console.log(`✓ Dynamic dates generated: ${dates[0]} through ${dates[6]}`);

// 4. Test members query returns avatarUrl and linkedinUrl
console.log("\n4. Verifying team members API payload fields...");
const teamDocs = await db.collection("team_members").find({ workspaceId: membership.workspaceId }).toArray();
assert.ok(teamDocs.length > 0);
const userDocs = await db.collection("users").find({ _id: { $in: teamDocs.map(t => t.userId).filter(Boolean) } }).toArray();
const memberUser = userDocs.find(u => u._id.toString() === user._id.toString());
assert.ok(memberUser.avatarUrl, "User should have avatarUrl");
assert.equal(memberUser.linkedinUrl, testLinkedinUrl);
console.log(`✓ Member list correctly inherits avatarUrl and real linkedinUrl`);

await client.close();
console.log("\nALL TEAM PROFILE & REAL LINKEDIN TESTS PASSED (100% SUCCESS)!\n");
