import logHead from "./utils/logHead";
import logTail from "./utils/logTail";
import AWS from "aws-sdk";
import {NON_CHECKOUT_REPORTS_TABLE} from "./constants/nonCheckoutReports/config";

const addNonCheckoutReport = async (event, context) => {
    logHead("addNonCheckoutReport", event);

    try {
        const {awsRequestId: id} = context;
        const {email, timestamp, url} = event;
        let dynamodb = new AWS.DynamoDB.DocumentClient();
        const params = {
            TableName: NON_CHECKOUT_REPORTS_TABLE,
            Key: {id},
            UpdateExpression: "SET #email = :email, #url = :url, #timestamp = :timestamp",
            ExpressionAttributeValues: {
                ":timestamp": timestamp,
                ":email": email,
                ":url" : url
            },
            ExpressionAttributeNames: {
                "#timestamp": "timestamp",
                "#email": "email",
                "#url" : "url"
            }
        };
        await dynamodb.update(params).promise();

    } catch (e) {
        logTail("nonCheckoutReport", e);
        return false;
    }
    logTail("nonCheckoutReport", event.url);

    return true;
};

export default addNonCheckoutReport;
