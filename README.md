# IronWeb3Provider

IronWeb3Provider is Ethereum web3 provider used by IronWallet.

## How to Identify IronWeb3Provider

If Iron provider injected properly `isIron` will be `true`.

```javascript
// In the mobile app or browser extension, 
// window.ethereum has to injected to Dapps website. 
window.ethereum = new ironwallet.Provider({
    ethereum: {
        address: "0xE68c9d1A66b6dED69A901977268B6Adb5a2f2F70",
        chainId: 1,
        rpcUrl: "https://mainnet.infura.io/v3/apikey",
    }
});

// Then in the Dapps website, 
// you can check your website is accessed by IronWallet's Browser:
if (window.ethereum.isIron) {
    const web3 = new Web3(window.ethereum);
}
```

## Installation

IronWeb3Provider is built to [dist/iron.min.js](dist/iron.min.js).

Download then pack it into mobile wallet or browser extension and inject to any Dapps website to allow communicate with
IronWallet.

## License

IronWeb3Provider is available under the MIT license. See the LICENSE file for more info.
