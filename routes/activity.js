'use strict';

// dependencies
const Path = require('path');
const JWT = require(Path.join(__dirname, '..', 'lib', 'jwtDecoder.js'));
const util = require('util');
const https = require('https');
const fileSystem = require('fs');
const nodeCache = require('node-cache');
const nodemailer = require('nodemailer');
const queryst = require('querystring');
const FormData = require('form-data');
const schedule = require('node-schedule');

let currentDocumentID = '';
let folderID = 0;
let documentIDs = [];

const mc_auth = 'mc2r4cyc9k29nry3m8cxv1gxsdly.auth.marketingcloudapis.com';

const MC_CACHE = new nodeCache();
const FERRATUM_CACHE = new nodeCache();

let tokens = {
    'mc_token': '',
    'mc_expires_in': 0,
    'ferratum_token': '',
    'ferratum_token_expires_in': 0
}

let result = {
    'pdf_result': []
}

const MC_BODY_OAUTH = JSON.stringify({
    'grant_type': 'client_credentials',
    'client_id': process.env.MC_ID,
    'client_secret': process.env.MC_SECRET,
    "account_id": "7277530"
});

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

            currentDocumentID = decodedArgs.PDF_ID;
            folderID = decodedArgs.content_builder_folder;
            documentIDs.push(currentDocumentID);


           if(!FERRATUM_CACHE.has('f_token')) {
                getTokenFromFerratum(process.env.FERRATUM_ID, process.env.FERRATUM_SECRET);
                setTimeout(() => {
                    FERRATUM_CACHE.set('f_token', tokens.ferratum_token, tokens.ferratum_token_expires_in - 10);
                }, 1000);
            };   
            

            let pdfOption;
            let mcOption;
            let saveOption;

            console.log(documentIDs);

            setTimeout(() => {
                let currentID = documentIDs.pop()
                pdfOption = getOptionFor('retrieve_PDF', currentID);
                setTimeout(() => {
                    console.log(pdfOption);
                const req = https.request(pdfOption, (res) => {

                    var data = [];
                    res.on('data', (d) => {
                    data.push(d);

                    });

                    res.on('end', () => {
                        var buffer = Buffer.concat(data);
                        let pdfData = {
                            'buffer': buffer,
                            'id': currentID
                        }
                        result.pdf_result.push(pdfData);
                    });
                  });
                  
                  req.on('error', (e) => {
                    console.error(e);
                  });
                  req.end();
                }, 1500);
            }, 3500);

            setTimeout(() => {
                if(!MC_CACHE.has('mc_token')) {
                    mcOption = getOptionFor('MC_AUTH');  
                    setTimeout(() => {
                        getTokenFromMC(mcOption, MC_BODY_OAUTH);
                    }, 1000);
                    setTimeout(() => {
                        MC_CACHE.set('mc_token', tokens.mc_token, tokens.mc_expires_in - 10);
                    }, 3000);
                }
            }, 9000);

            setTimeout(() => {
                saveOption = getOptionFor('save_PDF');
            }, 15000);

            setTimeout(() => {
                let pdfToSave = result.pdf_result.pop();
                let fil = Buffer.from(pdfToSave.buffer).toString('base64');

                var MC_BODY_SAVE = JSON.stringify({
                name: pdfToSave.id,
                CustomerKey: pdfToSave.id,
                assetType: {
                    name: "PDF",
                    id: 127
                },
                category: {
                    id: folderID
                },
                file: fil
            });
                httpRequest(saveOption, MC_BODY_SAVE);
            }, 20000)

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

                    console.log(bodyToJson);

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

function getOptionFor(useFor, additionalInfo) {

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
            path: '/api/v1/attachments/' + additionalInfo,
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
            host: 'mc2r4cyc9k29nry3m8cxv1gxsdly.rest.marketingcloudapis.com',
            path: '/asset/v1/content/assets',
            port: 443,
            method: 'POST',
            headers: MC_HEADERS
        };

        return MC_Option;

    }else if(useFor == 'getOldAssets') {
        var MC_HEADERS = {
            'Authorization': 'Bearer ' + MC_CACHE.get('mc_token')
        };

        var MC_Option = {
            host: 'mc2r4cyc9k29nry3m8cxv1gxsdly.rest.marketingcloudapis.com',
            path: '/asset/v1/content/assets/query',
            port: 443,
            method: 'POST',
            headers: MC_HEADERS
        };

        return MC_Option;
    }else if(useFor == 'deleteAssets') {
        var MC_HEADERS = {
            'Authorization': 'Bearer ' + MC_CACHE.get('mc_token')
        };

        var MC_Option = {
            host: 'mc2r4cyc9k29nry3m8cxv1gxsdly.rest.marketingcloudapis.com',
            path: '/asset/v1/content/assets/' + additionalInfo + '?isCdnDelete=1',
            port: 443,
            method: 'DELETE',
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
                    console.log(ferratum_token)
                });
              })

              return true;
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