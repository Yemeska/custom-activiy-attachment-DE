'use strict';

// dependencies
const Path = require('path');
const JWT = require(Path.join(__dirname, '..', 'lib', 'jwtDecoder.js'));
const util = require('util');
const https = require('https');
const fileSystem = require('fs');
const nodeCache = require('node-cache');
const nodemailer = require('nodemailer');
const request_promise = require('request-promise');
const request = require('request');
const queryst = require('querystring');
const textEncoder = require('text-encoding');
const text = new textEncoder.TextEncoder();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const mc_id = '';
const mc_secret = '';
const mc_auth = 'https://mcf3lgm9bdfv0wpxc7ptkspjwc9y.auth.marketingcloudapis.com/v1/requestToken';

let contactCounter = 0;



exports.logExecuteData = [];

function logData(req) {
    exports.logExecuteData.push({
        body: req.body,
        headers: req.headers,
        trailers: req.trailers,
        method: req.method,
        url: req.url,
        params: req.params,
        query: req.query,
        route: req.route,
        cookies: req.cookies,
        ip: req.ip,
        path: req.path,
        host: req.hostname,
        fresh: req.fresh,
        stale: req.stale,
        protocol: req.protocol,
        secure: req.secure,
        originalUrl: req.originalUrl
    });

}

exports.edit = function (req, res) {
    JWT(req.body, process.env.jwtSecret_NEXT_FERRATUM, (err, decoded) => {

        if (err) {
            console.log( '343 -> error: ', err);
            console.error(err);
            return res.status(401).end();
        }

        if ( decoded ) {
            logData(req);
            res.status(200).send('Edit');

        } else {
            console.log( '354 -> error: not decoded' );
            console.error('inArguments invalid.');
            return res.status(400).end();
        }

    });
};

exports.save = function (req, res) {
    JWT(req.body, process.env.jwtSecret_NEXT_FERRATUM, (err, decoded) => {
        if (err) {
            console.log("err");
            console.log( '366 -> error: ', error );
            console.error(err);
            return res.status(401).end();
        }

        if ( decoded ) {
            logData(req);
            res.status(200).send('Save');

        } else {
            console.log( '377 -> error: not decoded' );
            console.error('inArguments invalid.');
            return res.status(400).end();
        }

    });
};

exports.execute = function (req, res) {
    JWT(req.body, process.env.jwtSecret_NEXT_FERRATUM, (err, decoded) => {
        if ( err ) {
            console.log('390 -> FAILED', err);
            console.error( err );
            return res.status(401).end();
        }
        if ( decoded && decoded.inArguments && decoded.inArguments.length > 0 ) {

            let decodedArgs = decoded.inArguments[0];

            mc_id = decodedArgs.mc_client_id;
            mc_secret = decodedArgs.mc_client_secret;

            let cre = {
                mc_id,
                mc_secret
            }

            let response = await fetch(mc_auth, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(cre)
              });

              let result = await response.json();

              console.log(result);

            console.log(mc_id);
            console.log(mc_secret);

            res.status(200).json( {success: 'true'} );
        } else {
            console.log('564 -> FAILED');
            console.error('inArguments invalid.');
            return res.status(400).end();
        }
    });
};

exports.publish = function (req, res) {
    JWT(req.body, process.env.jwtSecret_NEXT_FERRATUM, (err, decoded) => {

        if (err) {
            console.log( '575 -> error: ', err );
            console.error(err);
            return res.status(401).end();
        }

        if ( decoded ) {
            logData(req);
            return res.status(200).send('Publish');

        } else {
            console.log( '586 -> error: not decoded' );
            console.error('inArguments invalid.');
            return res.status(400).end();
        }

    });
};

exports.validate = function (req, res) {
    JWT(req.body, process.env.jwtSecret_NEXT_FERRATUM, (err, decoded) => {

        if (err) {
            console.log( '598 -> error: ', err );
            console.error(err);
            return res.status(401).end();
        }

        if ( decoded ) {
            logData(req);
            return res.status(200).json({success: true});

        } else {
            console.log( '609 -> error: not decoded' );
            console.error('inArguments invalid.');
            return res.status(400).end();
        }

    });
};