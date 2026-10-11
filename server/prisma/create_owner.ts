import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import readline from "readline";

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

function prompt(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

function getCliArg(name: string): string | null {
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith(`--${name}=`)) {
      return arg.split("=")[1];
    }
  }
  return null;
}

async function main() {
  console.log("==================================================");
  console.log("  Developer CLI: Provision / Update Owner Account ");
  console.log("==================================================\n");

  const positionalArgs = process.argv.slice(2).filter((a) => !a.startsWith("-"));

  let email =
    process.env.EMAIL ||
    getCliArg("email") ||
    (positionalArgs[0] && positionalArgs[0].includes("@") ? positionalArgs[0] : null);

  let password =
    process.env.PASSWORD ||
    getCliArg("password") ||
    positionalArgs[1] ||
    null;

  let name =
    process.env.NAME ||
    getCliArg("name") ||
    positionalArgs[2] ||
    null;

  let phone =
    process.env.PHONE ||
    getCliArg("phone") ||
    positionalArgs[3] ||
    null;

  const hasCliArgs = !!email && !!password;

  if (!email) {
    email = await prompt("Enter Owner Email: ");
  }
  if (!email || !email.includes("@")) {
    console.error("❌ Error: A valid email address is required.");
    process.exit(1);
  }

  if (!password) {
    password = await prompt("Enter Owner Password: ");
  }
  if (!password || password.length < 6) {
    console.error("❌ Error: Password must be at least 6 characters.");
    process.exit(1);
  }

  if (!name && !hasCliArgs) {
    name = (await prompt("Enter Owner Full Name (optional): ")) || null;
  }
  if (!phone && !hasCliArgs) {
    phone = (await prompt("Enter Owner Phone (optional): ")) || null;
  }

  console.log("\nProcessing...");
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    const updated = await prisma.user.update({
      where: { email },
      data: {
        passwordHash,
        role: "OWNER",
        name: name || existingUser.name,
        phone: phone || existingUser.phone
      }
    });
    console.log(`\n✅ Existing user updated successfully to OWNER!`);
    console.log(`   ID:    ${updated.id}`);
    console.log(`   Email: ${updated.email}`);
    console.log(`   Name:  ${updated.name || "N/A"}`);
    console.log(`   Role:  ${updated.role}`);
  } else {
    const created = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "OWNER",
        name: name || "Property Owner",
        phone
      }
    });
    console.log(`\n🎉 New OWNER account created successfully!`);
    console.log(`   ID:    ${created.id}`);
    console.log(`   Email: ${created.email}`);
    console.log(`   Name:  ${created.name || "N/A"}`);
    console.log(`   Role:  ${created.role}`);
  }

  console.log("\n==================================================");
  console.log("  Owner credentials provisioned and ready to login!");
  console.log("==================================================");
}

main()
  .catch((e) => {
    console.error("❌ Failed to create owner:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
