const express = require('express')
const PORT  = 8080;
const app = express();
const Depreciation = require('./DepreciationSchema')
const mongoose = require('mongoose');
const { getYear, getMonth, addMonths , format } = require('date-fns');
const { createObjectCsvWriter } = require('csv-writer');

app.use(express.json());

app.post('/calculate_asset_depreciation',async(req,res)=>{

    const { asset , salvage , durationInYears , durationInPercentage , startDate , assetId , companyId } = req.body;

    if(!asset|| !salvage || !(durationInYears || durationInPercentage)|| !startDate){
        res.status(400).json({msg:"Enter all values"});
    }
    else{
        const duration = (durationInYears || (100/durationInPercentage).toFixed(2) )
        const deprication = (asset - (asset*salvage/100))/duration;
        let currentDate = new Date(startDate); 
        const data = [];
        
        for (let i = 0; i < duration * 12; i++) { 

            let financialYear = getYear(currentDate) + (getMonth(currentDate) >= 3 ? 1 : 0);
            let currentYear = getYear(currentDate);
            let formattedDate = format(currentDate, 'yyyy/MM/dd');

            data.push({'financialYear':`FY${financialYear-1}-${financialYear}` ,'date':formattedDate ,'amount':deprication/12 , 'year':currentYear, "assetId": assetId, "companyId":companyId })

            currentDate = addMonths(currentDate, 1);
        }
        
        await Depreciation.deleteMany({assetId,companyId});
        await Depreciation.insertMany(data);
        
        res.status(200).json(data);
    }
})



app.post('/depreciation-report', async(req,res)=>{

    const { fyear, companyId } = req.body;

    const document = await Depreciation.find({financialYear:`FY${fyear-1}-${fyear}` , companyId});

    const csvHeader = [
        { id: 'financialYear', title: 'Financial Year' },
        { id: 'date', title: 'Date' },
        { id: 'amount', title: 'Amount' },
        { id: 'year', title: 'Year' },
        { id: 'assetId', title: 'AssetId' },
        { id: 'companyId', title: 'CompanyId' },
    ];

    const csvWriter = createObjectCsvWriter({
    path: 'output.csv', 
    header: csvHeader
    });
    

    try{
        await csvWriter.writeRecords(document)
        res.status(200).download('output.csv', 'output.csv');
    }catch(err){
        res.status(500).json({error:err})
    }

})


mongoose.connect('mongodb://127.0.0.1:27017/Task-Depreciation')
.then(()=>{console.log('DB connected')})
.catch(err=>{ console.error('Error', err);;})

app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
})