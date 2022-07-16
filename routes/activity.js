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
const FormData = require('form-data');

let mc_id = '';
let mc_secret = '';
const mc_auth = 'mcf3lgm9bdfv0wpxc7ptkspjwc9y.auth.marketingcloudapis.com';

let tokens = {
    'mc_token': '',
    'ferratum_token': ''
}

let result = {
    'pdf_result': ''
}

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
            console.log( '366 -> error: ', err );
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

            var MC_BODY_OAUTH = JSON.stringify({
                'grant_type': 'client_credentials',
                'client_id': mc_id,
                'client_secret': mc_secret
            });

           
            
            let mcOptions = getOption('MC_AUTH')

            getTokenFromFerratum();

            let pdfOption;
            let mcOption;

            setTimeout(() => {
                pdfOption = getOption('PDF');
            }, 1500);

            console.log('end of execute');

            setTimeout(() => {
                httpRequest(pdfOption);
            }, 3000);

            setTimeout(() => {
                console.log('pdf result');
                console.log(result.pdf_result);
                console.log('pdf result');
            }, 6000);

            setTimeout(() => {
                mcOption = getOption('MC_AUTH');
            }, 7000);

            setTimeout(() => {
                httpRequest(mcOption, MC_BODY_OAUTH);
            }, 9000);

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

function httpRequest( optionsParam, postData ) {
        var req = https.request(optionsParam, function( res ) {
            console.log('before status');
            // reject on bad status
            if ( res.statusCode < 200 || res.statusCode >= 300 ) {
                new Error('statusMessage=' + res.statusMessage);
            }
            console.log('before status');
            // process data
            var body = '';
            res.on('data', function( chunk ) {
               body += chunk;
           });
            res.on('end', function() {
                try {
                    var bodyToString = body.toString();
                    var bodyToJson = JSON.parse(bodyToString);

                    console.log('here is response')
                    console.log(bodyToJson);
                    result.pdf_result = bodyToJson;
                    

                } catch(e) {
                   new Error('277-> error: ' + e);
                }
                
            });

            console.log('end of request');
        });
        req.on('error', function( err ) {
            console.log('283 -> error: ', err);
                new Error('284 -> error: ' + err);
        });
        if ( postData ) {
            req.write( postData );
        }
        req.end();
}

function getOption(toUseFor) {

    if(toUseFor == 'MC_AUTH') {
        var MC_OAUTH_HEADERS = {
            'Content-Type': 'application/json'
        };
        
        var mcOptions = {
            host: mc_auth,
            path: '/v2/token',
            port: 443,
            method: 'POST',
            headers: MC_OAUTH_HEADERS
        };

        return mcOptions;
    }else if(toUseFor == 'PDF') {
        var PDF_HEADERS = {
            'Authorization': 'Bearer ' + tokens.ferratum_token
        };

        var PDF_Options = {
            host: 'attachmentstore-ext.sit.ferratum.com',
            path: '/api/v1/attachments/f7703901-b291-4419-a030-81ecda9d3eec',
            method: 'GET',
            headers: PDF_HEADERS
        };
        return PDF_Options;
    }


}
function getTokenFromFerratum(){

            var form = new FormData();
            form.append('grant_type', 'client_credentials');
            form.append('client_id', 'C-ASSET_REGISTRY');
            form.append('client_secret', '4GWs5w3wpTc');

            console.log('First get token from Ferratum---------------')
           
            form.submit('https://auth-server-ext.sit.ferratum.com/oauth/token', function(err, res) {
                // res – response object (http.IncomingMessage)  //

                let body = '';

                res.on('data', function( chunk ) {
                    body += chunk;
                });

                res.on('end', function() {

                    let bodyToStr = body.toString();
                    let js = JSON.parse(bodyToStr);

                    tokens.ferratum_token = js.access_token;
                });
              })
    }