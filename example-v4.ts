// @ts-nocheck
import {
  NftSwapV4,
  UserFacingERC721AssetDataSerializedV4,
  UserFacingERC20AssetDataSerializedV4,
  SupportedChainIdsV4
} from 'nft-swap-sdk-k';
import { ethers } from 'ethers';

// self calling async function
(async () => {
  // In this example, we'll swap CryptoPunk #69 for 420 WETH
  const CRYPTOPUNK: UserFacingERC721AssetDataSerializedV4 = {
    tokenAddress: '0x53cb4AAF7D729439F6c4b30939ed9f4279b4e66d', // MTK contract address
    tokenId: '0', // MTK #0
    type: 'ERC721', // Must be one of 'ERC721', or 'ERC1155'
  };
  const CHAIN_ID = SupportedChainIdsV4.Baobab; // Baobab testnet
  const FOUR_THOUSAND_TWENTY_WETH: UserFacingERC20AssetDataSerializedV4 = {
    tokenAddress: '0xcce28911bdab0a204f550afe022d064060b1a0d2', // MT contract address
    amount: '42000000000000000000', // 420 Wrapped-ETH (WETH is 18 digits)
    type: 'ERC20',
  };
  // Set up the provider and signer for the maker (owner of the punk)
  const provider = new ethers.providers.StaticJsonRpcProvider(
    'https://api.baobab.klaytn.net:8651'
  ); // Replace with your own Infura API key
  const walletAddressMaker = '0x1E...bf0'; // Replace with your own Maker wallet address
  const privateKeyMaker = '0xea0...779'; // Replace with your own Maker private key
  const signerForMaker = new ethers.Wallet(privateKeyMaker, provider); // Replace with your own private key
  // [Part 1: Maker (owner of the Punk) creates trade]
  let nftSwapSdk = new NftSwapV4(provider, signerForMaker, CHAIN_ID, {
    zeroExExchangeProxyContractAddress:
      '0xef01352610ffe924821afaa27a29ee048caa09b7',
  });

  await nftSwapSdk.approveTokenOrNftByAsset(CRYPTOPUNK, walletAddressMaker);
  const order = nftSwapSdk.buildOrder(
    CRYPTOPUNK, // Maker asset to swap
    FOUR_THOUSAND_TWENTY_WETH, // Taker asset to swap
    walletAddressMaker
  );
  const signedOrder = await nftSwapSdk.signOrder(order);

  const walletAddressTaker = '0xfd0...D9B'; // Replace with your own Taker wallet address
  const privateKeyTaker = '0x7fd...e487'; // Replace with your own Taker private key
  const signerForTaker = new ethers.Wallet(privateKeyTaker, provider); // Replace with your own private key
  // [Part 2: Taker (wants to buy the punk) fills trade]
  nftSwapSdk = new NftSwapV4(provider, signerForTaker, CHAIN_ID, {
    zeroExExchangeProxyContractAddress:
      '0xef01352610ffe924821afaa27a29ee048caa09b7',
  });

  await nftSwapSdk.approveTokenOrNftByAsset(
    FOUR_THOUSAND_TWENTY_WETH,
    walletAddressTaker
  );
  const fillTx = await nftSwapSdk.fillSignedOrder(signedOrder); // it seems this feature isn't enabled yet, that's why getting execution reverted error. NativeOrder should be tested.
  const fillTxReceipt = await nftSwapSdk.awaitTransactionHash(fillTx.hash);
  console.log(`🎉 🥳 Order filled. TxHash: ${fillTxReceipt.transactionHash}`);
})();
