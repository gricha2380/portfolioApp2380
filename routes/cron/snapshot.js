const express = require('express');
const router = express.Router();
const User = require('../../models/user')
const formatDate = require('../../middleware/formatDate').formatDate;
const superagent = require('superagent'); 
const got = require('got');

// const mongoose = require('mongoose');
// mongoose.connect(process.env.mongoPortfolioAppURL)
// mongoose.set('debug', true);

let coinAPI = "https://api.coinmarketcap.com/v1/ticker/"; // e.g.: https://api.coinmarketcap.com/v1/ticker/Ethereum
let stockAPI = {
    "start": "https://api.iextrading.com/1.0/stock/",
    "end": "/delayed-quote"
} // e.g.: https://api.iextrading.com/1.0/stock/aapl/delayed-quote


router.get('/', (req, res, next) => {
    // protect against hammering: create table for today's date. If current day > saved day then run

    let assetHolder=[], promises=[];
    let data = {
        totalValue: {
            portfolioValue: 0, portfolioGrowth: 0, portfolioGains: 0, stockValue: 0, stockGrowth: 0, stockGains: 0, cryptoValue: 0, cryptoGrowth: 0, cryptoGains: 0, cryptoCount: 0, stockCount: 0
        },
        assets:[]
    }

    User.find({"email":"gregor.richardson@gmail.com"}, 'assets', (err, portfolio) => {
        if(err){
          console.log(err);
        } else{          
            portfolio.forEach((p,i,arr)=>{
                console.log("what my name is",p._id)
                let id = p._id;
                console.log("how many assets",p.assets.length)
                data.assets=p.assets;
                console.log("what hold data asset", data.assets)

                p.assets.forEach((asset,index) => {
                    if (asset.type=='stock') {
                        console.log('its a stock!',data.assets[index].name)
                        promises.push(superagent.get(stockAPI.start+data.assets[index].symbol+stockAPI.end).then((res) => {  
                            data.totalValue.stockCount++;  
                            data.assets[index].price = res.body.delayedPrice;
                            data.totalValue.portfolioValue += (data.assets[index].quantity * data.assets[index].price);
                            data.totalValue.portfolioGrowth += (data.assets[index].price / data.assets[index].purchasePrice) - 1;
                            data.totalValue.portfolioGains += (data.assets[index].price - data.assets[index].purchasePrice) * data.assets[index].quantity;
                            data.totalValue.stockValue += (data.assets[index].quantity * data.assets[index].price);
                            data.totalValue.stockGrowth += (data.assets[index].price / data.assets[index].purchasePrice) - 1;
                            data.totalValue.stockGains += (data.assets[index].price - data.assets[index].purchasePrice) * data.assets[index].quantity;
                            // console.log("what I know...",data.assets[index])
                        }).catch(console.error))
                    }
                    if (asset.type=='crypto') {
                        console.log('its a crypto!', data.assets[index].name)
                        promises.push(superagent.get(coinAPI+data.assets[index].name).then((res) => {
                            data.totalValue.cryptoCount++;  
                            data.assets[index].price = res.body[0].price_usd;
                            data.totalValue.portfolioValue += (data.assets[index].quantity * data.assets[index].price);
                            data.totalValue.portfolioGrowth += (data.assets[index].price / data.assets[index].purchasePrice) - 1;
                            data.totalValue.portfolioGains += (data.assets[index].price - data.assets[index].purchasePrice) * data.assets[index].quantity;
                            data.totalValue.cryptoValue += (data.assets[index].quantity * data.assets[index].price);
                            data.totalValue.cryptoGrowth += (data.assets[index].price / data.assets[index].purchasePrice) - 1;
                            data.totalValue.cryptoGains += (data.assets[index].price - data.assets[index].purchasePrice) * data.assets[index].quantity;
                            // console.log("what I know...",data.assets[index])
                        }).catch(console.error))
                    }
                })
                Promise.all(promises).then((results) => {
                    let item = {
                        "date": formatDate('slash'),
                        "unix": Date.now(),
                        "cryptoCount": data.totalValue.cryptoCount,
                        "cryptoGains": data.totalValue.cryptoGains,
                        "cryptoValue": data.totalValue.cryptoValue,
                        "portfolioGains": data.totalValue.portfolioGains,
                        "portfolioValue": data.totalValue.portfolioValue,
                        "stockCount": data.totalValue.stockCount,
                        "stockGains": data.totalValue.stockGains,
                        "stockValue": data.totalValue.stockValue
                    }
                    item.portfolioGrowth = (item.portfolioValue/(item.portfolioValue - item.portfolioGains)-1)*100;
                    item.cryptoGrowth = (item.cryptoValue/(item.cryptoValue - item.cryptoGains)-1)*100;
                    item.stockGrowth = (item.stockValue/(item.stockValue - item.stockGains)-1)*100;
                    
                    console.log(`${item.date} new snapshot added...`,item)
                    let update  = { $push: {snapshots: item}}; 
                    let options = { new: true }; 
                    let query = { _id: id }; 
                    User.findOneAndUpdate(query, update, options, (err, asset)=>{ 
                        if (err) throw err;
                        console.log(`${item.date} new snapshot added...`,portfolio[index])
                        res.json({"snapshot": item}) // browser test
                    });
                        // portfolio.update({$push: {snapshots: item}})
                        // res.json({"snapshot": item}) // browser test
                }).catch(console.error);

            })
        } // end else
    })

})

module.exports = router;