const hre = require("hardhat");
const { encryptDataField, decryptNodeResponse } = require("@swisstronik/utils");

const sendShieldedTransaction = async (signer, destination, data, value) => {
  const rpclink = hre.network.config.url;
  const [encryptedData] = await encryptDataField(rpclink, data);
  return await signer.sendTransaction({
    from: signer.address,
    to: destination,
    data: encryptedData,
    value,
  });
};

async function main() {
  // Replace with the address of your deployed proxy contract
  const proxyAddress = "0xD0a80b1867ce772ff083639de57C5b7AFaa9e5a8"; 

  // Replace with the address of your new implementation contract
  const newImplementationAddress = "0x9279E96fd94fA530b25E877471882413E5D628e0"; 
  
  const [signer] = await hre.ethers.getSigners();
  const contractFactory = await hre.ethers.getContractFactory("SwisstronikProxy");
  const proxyContract = contractFactory.attach(proxyAddress);

  // Prepare the data for the upgradeTo function call
  const functionName = "upgradeTo";
  const upgradeToTxData = proxyContract.interface.encodeFunctionData(functionName, [newImplementationAddress]);

  // Send the shielded transaction to upgrade the proxy to the new implementation
  const upgradeTx = await sendShieldedTransaction(signer, proxyAddress, upgradeToTxData, 0);
  await upgradeTx.wait();

  console.log("Proxy upgraded successfully. Transaction Receipt: ", upgradeTx);
}

main().catch((error) => {
  console.error("Error during upgrade:", error);
  process.exitCode = 1;
});
