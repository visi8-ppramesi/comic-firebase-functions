const functions = require("firebase-functions");

exports.createGopayCharge = functions
    .region('asia-east2')
    .https
    .onCall((data, context) => {
        const { grossAmount, orderId } = data.transactionDetails;
        const { email, fullName } = data.customerDetails;
        let firstName, lastName;
        if(fullName.split(' ').length < 2){
            firstName = fullName
            lastName = fullName
        }else{
            const splitName = fullName.split(' ')
            firstName = splitName[0]
            lastName = splitName[splitName.length - 1]
        }
        if (!context.auth) {
            throw new functions.https.HttpsError("unauthenticated", "You must be authenticated");
        }

        const midtransClient = require('midtrans-client');
        let core = new midtransClient.CoreApi({
            isProduction : false,
            serverKey : process.env.MIDTRANS_SERVER_KEY,
            clientKey : process.env.MIDTRANS_CLIENT_KEY
        });
     
        let parameter = {
            "payment_type": "gopay",
            "transaction_details": {
                "gross_amount": grossAmount,
                "order_id": orderId,
            },
            "customer_details": {
                "first_name": firstName,
                "last_name": lastName,
                "email": email
            },
            "gopay": {
                "enable_callback": true,
                "callback_url": process.env.MIDTRANS_CALLBACK_URL
            }
        };
        
        // charge transaction
        return core.charge(parameter)
            .then((chargeResponse) => {
                return chargeResponse
            });
    })