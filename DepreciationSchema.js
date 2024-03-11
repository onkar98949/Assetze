const mongoose = require('mongoose');

const DepreciationSchema = new mongoose.Schema({
    financialYear:{ type:String },
    amount:{ type:Number },
    date:{ type:String },
    year:{ type:String },
    assetId:{ type:String },
    companyId:{ type:String },
})

module.exports = mongoose.model('Depreciation',DepreciationSchema);

