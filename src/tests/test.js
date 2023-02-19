// Copyright © 2022-2023 Iron Wallet.
//
// This file is part of Iron Wallet. The full copyright notice, including
// terms governing use, modification, and redistribution, is contained in the
// file LICENSE at the root of the source code distribution tree.

"use strict";

require("../index");
require("whatwg-fetch");
const ethUtil = require("ethereumjs-util");
const Web3 = require("web3");
const ironwallet = window.ironwallet;

const mainnet = {
  address: "0xE68c9d1A66b6dED69A901977268B6Adb5a2f2F70",
  chainId: 1,
  rpcUrl: "https://mainnet.infura.io/v3/<key>",
};

const goerli = {
  address: "0xE68c9d1A66b6dED69A901977268B6Adb5a2f2F70",
  chainId: 5,
  rpcUrl: "https://goerli.infura.io/v3/a725d338d5164dceb9c8e010fd561e46",
};

const bsc = {
  address: "0xE68c9d1A66b6dED69A901977268B6Adb5a2f2F70",
  chainId: 56,
  rpcUrl: "https://bsc-dataseed1.binance.org",
};

describe("IronWeb3Provider constructor tests", () => {
  test("test constructor.name", () => {
    const provider = new ironwallet.Provider({ ethereum: {} });
    const web3 = new Web3(provider);
    expect(web3.currentProvider.constructor.name).toBe("IronWeb3Provider");
    expect(web3.currentProvider.isIron).toBe(true);
  });

  test("test Ethereum setAddress", () => {
    const provider = new ironwallet.Provider({
      ethereum: {
        chainId: 1,
        rpcUrl: "",
        isMetaMask: false,
      },
    });
    const address = mainnet.address;
    expect(provider.address).toBe("");
    expect(provider.isMetaMask).toBeFalsy();

    provider.setAddress(address);
    expect(provider.address).toBe(address.toLowerCase());
    expect(provider.ready).toBeTruthy();
  });

  test("test setConfig", (done) => {
    const provider = new ironwallet.Provider({ ethereum: goerli });
    const web3 = new Web3(provider);

    expect(web3.currentProvider.chainId).toEqual("0x5");
    expect(web3.currentProvider.networkVersion).toEqual("5");

    web3.currentProvider.setConfig({ ethereum: mainnet });
    expect(web3.currentProvider.chainId).toEqual("0x1");
    expect(web3.currentProvider.networkVersion).toEqual("1");
    expect(web3.currentProvider.rpc.rpcUrl).toBe(mainnet.rpcUrl);

    expect(provider.request).not.toBeUndefined;
    expect(provider.on).not.toBeUndefined;

    web3.version.getNetwork((error, id) => {
      expect(id).toBe("1");
      done();
    });
  });

  test("test eth_chainId", (done) => {
    const provider = new ironwallet.Provider({ ethereum: bsc });
    const web3 = new Web3(provider);

    let request = { jsonrpc: "2.0", method: "eth_chainId", id: 123 };

    provider.request(request).then((chainId) => {
      expect(chainId).toEqual("0x38");
    });

    const response = web3.currentProvider.send(request);
    expect(response.result).toBe("0x38");

    web3.currentProvider.sendAsync(request, (error, result) => {
      expect(result.result).toEqual("0x38");
      done();
    });
  });

  test("test eth_accounts", (done) => {
    const provider = new ironwallet.Provider({ ethereum: mainnet });
    const web3 = new Web3(provider);
    const addresses = ["0xe68c9d1a66b6ded69a901977268b6adb5a2f2f70"];

    web3.eth.getAccounts((error, accounts) => {
      expect(accounts).toEqual(addresses);
    });

    provider.request({ method: "eth_accounts" }).then((accounts) => {
      expect(accounts).toEqual(addresses);
    });

    web3.currentProvider.sendAsync(
      { method: "eth_accounts" },
      (error, data) => {
        expect(data.result).toEqual(addresses);
        done();
      }
    );
  });

  test("test eth_sign", (done) => {
    const provider = new ironwallet.Provider({ ethereum: mainnet });
    const web3 = new Web3(provider);
    const addresses = ["0xE68c9d1A66b6dED69A901977268B6Adb5a2f2F70"];
    const signed =
      "0x730ec377cfc7090e08366fad4758aad721dbb51e187efe45426a7e56d1ff053947ab1a7b0bd7b138c48a9f3d3b92bd83f4265abbe9876930faaf7fbb980b219d1c";

    ironwallet.postMessage = (message) => {
      provider.sendResponse(message.id, signed);
    };

    var hash = ethUtil.keccak256(
      Buffer.from("An amazing message, for use with MetaMask!", "utf8")
    );
    var hex = "0x" + hash.toString("hex");
    web3.eth.sign(addresses[0], hex, (err, result) => {
      expect(result).toEqual(signed);
      done();
    });
  });

  test("test personal_sign", (done) => {
    const provider = new ironwallet.Provider({ ethereum: bsc });
    const signed =
      "0xf3a9e21a3238b025b7edf5013876548cfb2f2a838aca573de88c91ea9aecf7190cd6330a0172bd5d106841647831f30065f644eddc2f86091e1bb370c9ff833f1c";

    ironwallet.postMessage = (message) => {
      const buffer = Buffer.from(message.object.data);
      if (buffer.length === 0) {
        throw new Error("message is not hex!");
      }
      provider.sendResponse(message.id, signed);
    };

    const request = {
      method: "personal_sign",
      params: [
        "{\"version\":\"0.1.2\",\"timestamp\":\"1602823075\",\"token\":\"0x4b0f1812e5df2a09796481ff14017e6005508003\",\"type\":\"vote\",\"payload\":{\"proposal\":\"QmSV53XuYi28XfdNHDhBVp2ZQwzeewQNBcaDedRi9PC6eY\",\"choice\":1,\"metadata\":{}}}",
        "0xE68c9d1A66b6dED69A901977268B6Adb5a2f2F70",
      ],
      id: 1602823075454,
    };

    expect(Buffer.from(request.params[0], "hex").length).toEqual(0);

    provider.request(request).then((result) => {
      expect(result).toEqual(signed);
      done();
    });
  });

  test("test eth_signTypedData_v4", (done) => {
    const provider = new ironwallet.Provider({ ethereum: mainnet });
    const signed =
      "0x7aff0e37900fc2eb5e78c56b07246a0904b3ba642cab17917d7524110b83fe04296790ff076a7dd31b2a11ded9fcbe3959fe872b7c18fa79f5146807855fcce41b";

    ironwallet.postMessage = (message) => {
      provider.sendResponse(message.id, signed);
    };

    const request = require("./eth_signTypedData_v4.json");
    

    provider.request(request).then((result) => {
      expect(result).toEqual(signed);
      done();
    });
  });

  test("test batched sendAsync", (done) => {
    const provider = new ironwallet.Provider({ ethereum: bsc });
    const web3 = new Web3(provider);
    const request = [
      {
        jsonrpc: "2.0",
        id: 11,
        method: "eth_call",
        params: [
          {
            data: "0x06fdde03",
            to: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
          },
          "latest",
        ],
      },
      {
        jsonrpc: "2.0",
        id: 12,
        method: "eth_call",
        params: [
          {
            data: "0x313ce567",
            to: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
          },
          "latest",
        ],
      },
    ];
    const expectedResult = [
      {
        jsonrpc: "2.0",
        id: 11,
        result:
          "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000a4255534420546f6b656e00000000000000000000000000000000000000000000",
      },
      {
        jsonrpc: "2.0",
        id: 12,
        result:
          "0x0000000000000000000000000000000000000000000000000000000000000012",
      },
    ];
    web3.currentProvider.sendAsync(request, (error, result) => {
      expect(result).toEqual(expectedResult);
      done();
    });
  });
}); // end of top describe()
