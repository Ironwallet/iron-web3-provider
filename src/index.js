// Copyright © 2022-2023 Iron Wallet.
//
// This file is part of Iron Wallet. The full copyright notice, including
// terms governing use, modification, and redistribution, is contained in the
// file LICENSE at the root of the source code distribution tree.

"use strict";

import IronWeb3Provider from "./ethereum_provider";

window.ironwallet = {
    Provider: IronWeb3Provider,
    postMessage: null,
};
