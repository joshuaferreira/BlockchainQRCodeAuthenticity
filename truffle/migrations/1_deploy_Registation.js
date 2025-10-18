const ProductVerifier = artifacts.require("ProductVerifier");

module.exports = function (deployer, network, accounts) {
  // Deploy ProductVerifier contract; deployer (accounts[0]) will be set as owner in constructor
  deployer.deploy(ProductVerifier);
};
