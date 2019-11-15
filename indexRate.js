const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 5000
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:true
});

  app.use(express.static(path.join(__dirname, 'public')))
  app.set('views', path.join(__dirname, 'views'))
  app.set('view engine', 'ejs')
  app.get('/', function(req, res)
          {
            res.render('pages/index');
          });
  app.get('/postalRateCalc', calculateRate);
  app.get('db', async function(req, res)
       {
            try
            {
                const client = await pool.connect();
                const result = await client.query('SELECT * FROM test_table');
                const results = {'results': (result) ? result.rows : null};
                res.render('pages/db', results);
                client.release();
            }//end of try
            catch(err)
                {
                    console.error(err);
                    res.send("Error " + err);
                }//end catch
        });
  app.listen(PORT, function()
             {
                console.log(`Listening on`, PORT);
             });

function calculateRate(req, res)
{
    let weight = Number(req.query.weight);
    let mailType = req.query.mailType;
    mailType = mailType.toLowerCase();

    let result = 0;

//console.log(mailType);
    if (mailType == "stamped")
        {
            if((weight < 1) || (weight > 0))
                {
                    result = .55
                }
               else if ((weight < 2) || (weight > 1))
                {
                    result = .70
                }
            else if ((weight < 3) || (weight > 2))
                {
                    result = .85
                }
            else if((weight < 3.5) || (weight > 3))
                {
                    result = 1.00
                }
            else (weight > 3.5)
                {
                    result = "Your envelope is too large for stamped mail pricing.  Please select Flats to get your correct rate."
                }
        }//end if stamped


    const params = {mailType: mailType, weight: weight, result: result };

    res.render('pages/getRate', params);


}
