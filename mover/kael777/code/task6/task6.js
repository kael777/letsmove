import moment from 'moment'
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { NAVISDKClient } from 'navi-sdk'
import { Sui,pool,USDC } from 'navi-sdk/dist/address.js'
// import { Pool, PoolConfig } from "navi-sdk/dist/types";
import { depositCoin, SignAndSubmitTXB, borrowCoin, withdrawCoin } from 'navi-sdk/dist/libs/PTB/index.js';

const words = `clever reveal depart double shadow fade seek salute sleep staff left industry`
const poolName = 'USDC'; // Supported: Sui/NAVX/vSui/USDC/USDT/WETH/CETUS/HAsui

const client = new NAVISDKClient({mnemonic: words, networkType: "mainnet"})

// 地址
const account = client.accounts[0];

const main = async () => {
    try{
        let usdcAmount = parseFloat(`0.${moment().format("MMDDHH")}`)*1e6
        console.error(`you want to flash loan:${usdcAmount} usdc`)
        console.log(`account address is:${account.address}`)
        // // 1.存入1SUI
        // let res = await account.depositToNavi(Sui, 1)
        // console.log(res)
        // console.log(`deposit Sui over ===============================`)
        // // 1-2.取出SUI
        // res = await account.withdraw(Sui, 1)
        // console.log(res)

        // ptb
        const Usdc_pool = pool[USDC.symbol];
        const Sui_pool = pool[Sui.symbol];
        const txb = new TransactionBlock();
        txb.setGasBudget(1_000_000_000)
        txb.setSender(account.address);
        // 1.存入1sui
        const x = txb.splitCoins(txb.gas,[txb.pure(1e6)])
        await depositCoin(txb,Sui_pool,x,1*1e6)
        // 2.借出时间戳usdt
        const [borrowedCoin] = await borrowCoin(txb,Usdc_pool,usdcAmount);
        // 3.还usdc
        await depositCoin(txb,Usdc_pool,borrowedCoin,usdcAmount)
        // 4.取出sui
        await withdrawCoin(txb,Sui_pool,1*1e6)
        const result = SignAndSubmitTXB(txb, account.client, account.keypair);
        console.log("result: ", result);
    }catch(e){
        console.error(e)
    }
}

main()