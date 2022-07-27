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
let f_id = '';
let f_secret = '';
const mc_auth = 'mcf3lgm9bdfv0wpxc7ptkspjwc9y.auth.marketingcloudapis.com';

const MC_CACHE = new nodeCache();
const FERRATUM_CACHE = new nodeCache();

let tokens = {
    'mc_token': '',
    'mc_expires_in': 0,
    'ferratum_token': '',
    'ferratum_token_expires_in': 0
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

            f_id = decodedArgs.user;
            f_secret = decodedArgs.password;

            var MC_BODY_OAUTH = JSON.stringify({
                'grant_type': 'client_credentials',
                'client_id': mc_id,
                'client_secret': mc_secret
            });

           if(!FERRATUM_CACHE.has('f_token')) {
                getTokenFromFerratum(f_id, f_secret);
                setTimeout(() => {
                    FERRATUM_CACHE.set('f_token', tokens.ferratum_token, tokens.ferratum_token_expires_in - 10);
                }, 1000);
            };   
            

            let pdfOption;
            let mcOption;
            let saveOption;

            setTimeout(() => {
                pdfOption = getOptionFor('retrieve_PDF');
            }, 2500);

            setTimeout(() => {
                const req = https.request(pdfOption, (res) => {
                    res.on('data', (d) => {
                        
                      console.log('start');
                      console.log(d);
                      console.log('finish');
                      result.pdf_result = d;

                    });
                  });
                  
                  req.on('error', (e) => {
                    console.error(e);
                  });
                  req.end();
            }, 3500);

            setTimeout(() => {

               
                console.log('pdf result');
                console.log(result.pdf_result);
                console.log('pdf result');
            }, 6000);


            setTimeout(() => {
                if(!MC_CACHE.has('mc_token')) {
                    mcOption = getOptionFor('MC_AUTH');  
                    setTimeout(() => {
                        getTokenFromMC(mcOption, MC_BODY_OAUTH);
                    }, 1000);
                    setTimeout(() => {
                        MC_CACHE.set('mc_token', tokens.mc_token, tokens.mc_expires_in - 10);
                    }, 1500);
                }
            }, 7000);

            setTimeout(() => {
                saveOption = getOptionFor('save_PDF');
            }, 10000);

            setTimeout(() => {
                let fil = Buffer.from(result.pdf_result).toString('base64');
                let buff = new Buffer(fil, 'base64');
                let text = buff.toString('utf-8');
                console.log('base64');
                console.log(fil);

                console.log('text');
                console.log(text);

                var MC_BODY_SAVE = JSON.stringify({
                name: "PDF from custum activity",
                assetType: {
                    name: "PDF",
                    id: 127
                },
                category: {
                    id: 324936,
                    name: "Misho"
                },
                file: fil
            });
                httpRequest(saveOption, MC_BODY_SAVE);
            }, 11500)

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

function getTokenFromMC( optionsParam, postData ) {
        console.log(optionsParam);
        var req = https.request(optionsParam, function( res ) {

            // reject on bad status
            if ( res.statusCode < 200 || res.statusCode >= 300 ) {
                new Error('statusMessage=' + res.statusMessage);
            }

            // process data
            var body = '';
            res.on('data', function( chunk ) {
               body += chunk;
           });
            res.on('end', function() {
                try {
                    var bodyToString = body.toString();
                    var bodyToJson = JSON.parse(bodyToString);

                    tokens.mc_token = bodyToJson.access_token;
                    tokens.mc_expires_in = bodyToJson.expires_in;
                } catch(e) {
                   new Error('277-> error: ' + e);
                }
                
            });
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

function getOptionFor(useFor) {

    if(useFor == 'MC_AUTH') {
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
    }else if(useFor == 'retrieve_PDF') {
        var PDF_HEADERS = {
            'Authorization': 'Bearer ' + FERRATUM_CACHE.get('f_token')
        };

        var PDF_Options = {
            host: 'attachmentstore-ext.sit.ferratum.com',
            path: '/api/v1/attachments/f7703901-b291-4419-a030-81ecda9d3eec',
            port: 443,
            method: 'GET',
            headers: PDF_HEADERS,
            responseType: 'arraybuffer',
            responseEncoding: 'binary'
        };
        return PDF_Options;
    }else if(useFor == 'save_PDF') {
        var MC_HEADERS = {
            'Authorization': 'Bearer ' + MC_CACHE.get('mc_token')
        };

        var MC_Option = {
            host: 'mcf3lgm9bdfv0wpxc7ptkspjwc9y.rest.marketingcloudapis.com',
            path: '/asset/v1/content/assets',
            port: 443,
            method: 'POST',
            headers: MC_HEADERS
        };

        return MC_Option;
    }


}
function getTokenFromFerratum(id, secret){

            var form = new FormData();
            form.append('grant_type', 'client_credentials');
            form.append('client_id', id);
            form.append('client_secret', secret);

            console.log('First get token from Ferratum---------------')
           
            form.submit('https://auth-server-ext.sit.ferratum.com/oauth/token', function(err, res) {
                // res – response object (http.IncomingMessage)  //

                let body = '';

                res.on('data', function( chunk ) {
                    body += chunk;
                });

                res.on('end', function() {

                    let bodyToStr = body.toString();
                    let bodyToJson = JSON.parse(bodyToStr);

                    tokens.ferratum_token = bodyToJson.access_token
                    tokens.ferratum_token_expires_in = bodyToJson.expires_in;
                });
              })
}

function httpRequest( optionsParam, postData ) {
    console.log(optionsParam);
    var req = https.request(optionsParam, function( res ) {

        // reject on bad status
        if ( res.statusCode < 200 || res.statusCode >= 300 ) {
            new Error('statusMessage=' + res.statusMessage);
        }

        // process data
        var body = '';
        res.on('data', function( chunk ) {
           body += chunk;
       });
        res.on('end', function() {
            try {
                var bodyToString = body.toString();
                var bodyToJson = JSON.parse(bodyToString);

            } catch(e) {
               new Error('277-> error: ' + e);
            }
            
        });
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