const { Cashfree, CFEnvironment } = require("cashfree-pg");
const cashfree = new Cashfree(CFEnvironment.SANDBOX, "test", "test");
console.log(typeof cashfree.PGCreateOrder);
