// Copyright © 2022-2023 Iron Wallet.
//
// This file is part of Iron Wallet. The full copyright notice, including
// terms governing use, modification, and redistribution, is contained in the
// file LICENSE at the root of the source code distribution tree.

"use strict";

import { EventEmitter } from "events";

class BaseProvider extends EventEmitter {
  constructor(config) {
    super();
    this.isDebug = !!config.isDebug;
    this.isIron = true;
  }

  /**
   * @private Internal js -> native message handler
   */
  postMessage(handler, id, data) {
    let object = {
      id: id,
      name: handler,
      object: data,
      network: this.providerNetwork,
    };
    if (window.ironwallet.postMessage) {
      window.ironwallet.postMessage(object);
    } else {
      console.error("postMessage is not available");
    }
  }

  /**
   * @private Internal native result -> js
   */
  sendResponse(id, result) {
    let callback = this.callbacks.get(id);
    if (this.isDebug) {
      console.log(
        `<== sendResponse id: ${id}, result: ${JSON.stringify(result)}`
      );
    }
    if (callback) {
      callback(null, result);
      this.callbacks.delete(id);
    } else {
      console.log(`callback id: ${id} not found`);
    }
  }

  /**
   * @private Internal native error -> js
   */
   sendError(id, error) {
    console.log(`<== ${id} sendError ${error}`);
    let callback = this.callbacks.get(id);
    if (callback) {
      callback(error instanceof Error ? error : new Error(error), null);
      this.callbacks.delete(id);
    }
  }
}

module.exports = BaseProvider;
