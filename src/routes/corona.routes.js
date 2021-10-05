const express = require('express');
const router = express.Router();
const schedule = require('node-schedule');

const CoronaData = require('../models/corona.model');

const AWS = require('aws-sdk');
AWS.config.update({region: 'eu-central-1'});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = "coronaTable-dev";

//runs schedule at fixed timeframe of 3h
schedule.scheduleJob('* 0 */3 * * *', () => {
    CoronaData()
        .then(json => {
            console.log(json);

            let params = {
                TableName: tableName,
                Item: json
            }

            dynamodb.put(params, (err, data) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log({success: 'post call succeed!', data: data});
                }
            });
        })
});

router.get('/', async (req, res) => {
    const today = new Date();
    today.setDate(today.getDate() - req.query.date);

    const params = {
        ExpressionAttributeNames: {"#dynamodb_date": "date"},
        ExpressionAttributeValues: {':v1': today.toISOString().split('T')[0]},
        KeyConditionExpression: "#dynamodb_date = :v1",
        ProjectionExpression: req.query['projExpr'] != null ? `#dynamodb_date, ${req.query['projExpr']}` : null,
        TableName: tableName
    }

    dynamodb.query(params).promise()
        .then(response => {
            res.status(200).json(response.Items);
        })
        .catch(err => {
            res.status(500).json(err)
        });
});

router.get('/last', async (req, res) => {
    const queryDate = new Date();
    queryDate.setDate(queryDate.getDate() - req.query['days']);

    const params = {
        ExpressionAttributeNames: {"#dynamodb_date": "date"},
        ExpressionAttributeValues: {':v1': queryDate.toISOString().split('T')[0]},
        FilterExpression: "#dynamodb_date >= :v1",
        ProjectionExpression: req.query['projExpr'] != null ? `#dynamodb_date, ${req.query['projExpr']}` : null,
        TableName: tableName
    }

    dynamodb.scan(params).promise()
        .then(response => {
            res.status(200).json(response.Items);
        })
        .catch(err => {
            res.status(500).json(err)
        });
});

router.get('/all', async (req, res) => {
    const params = {
        TableName: tableName,
        ExpressionAttributeNames: {"#dynamodb_date": "date"},
        ProjectionExpression: req.query['projExpr'] != null ? `#dynamodb_date, ${req.query['projExpr']}` : null,
    }
    try {
        const allData = await scanDynamoRecords(params, []);
        const body = {
            data: allData
        }
        res.json(body);
    } catch (error) {
        console.error('Do your custom error handling here. I am just ganna log it out: ', error);
        res.status(500).send(error);
    }
});

async function scanDynamoRecords(scanParams, itemArray) {
    try {
        const dynamoData = await dynamodb.scan(scanParams).promise();
        itemArray = itemArray.concat(dynamoData.Items);
        if (dynamoData.LastEvaluatedKey) {
            scanParams.ExclusiveStartKey = dynamoData.LastEvaluatedKey;
            return await scanDynamoRecords(scanParams, itemArray);
        }
        return itemArray;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = router;