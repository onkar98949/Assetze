const express = require('express')
const PORT  = 8080;
const app = express();

app.use(express.json());


app.post('/calculate_asset_depreciation',(req,res)=>{

    const { asset , salvage , duration} = req.body;

    if(!asset|| !salvage || !duration){
        res.status(400).json({msg:"Enter all values"})
    }else{
        const deprication = (asset - (asset*salvage/100))/duration;
        res.status(200).json({value:deprication})
    }

})


app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
})