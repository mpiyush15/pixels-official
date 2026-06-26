import { Cashfree, CFEnvironment } from "cashfree-pg";

const cashfree = new Cashfree(
  process.env.CASHFREE_MODE === "PROD" ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX,
  process.env.CASHFREE_CLIENT_ID || "",
  process.env.CASHFREE_CLIENT_SECRET || ""
);

export default cashfree;
