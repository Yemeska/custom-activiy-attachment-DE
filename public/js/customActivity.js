define(['postmonger'], function (Postmonger) {
    'use strict';

    var activity = require('./routes/activity');

    var connection = new Postmonger.Session();
    var payload = {};

    var requestedInteractionDefaults = {}; // object returned from requestedInteractionDefaults
    let steps = [ 
        { "label": "Enter Data", "key": "step1" },
        { "label": "Check credentials", "key": "step2" }
    ];
    
    let currentStep = steps[0].key;

    let user = '';
    let password = '';
    let MCClientId = '';
    let MCClientSecret = '';
    let content_builder_folder = '';
    let eventDefinitionKey = '';
    let PDFID = '';
    let activityID = '';
    let customizationArrayLiterals = {};

    
    $(window).ready(onRender);
    
    connection.on('initActivity', initialize);
    connection.on('requestedTokens', onGetTokens);
    connection.on('requestedEndpoints', onGetEndpoints);
    connection.on('clickedNext', clickedNext);
    connection.on('clickedBack', clickedBack);
    connection.on('gotoStep', gotoStep);
   
    function onRender() {
        // JB will respond the first time 'ready' is called with 'initActivity'
        connection.trigger('ready');
        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');
        connection.trigger('requestInteractionDefaults');
        connection.trigger('requestTriggerEventDefinition');
        connection.trigger('requestSchema');
        connection.trigger('requestInteraction');
    }

    function initialize(data) {
        if (data) {
            payload = data;
        }
        
        var hasInArguments = Boolean(
            payload['arguments'] &&
            payload['arguments'].execute &&
            payload['arguments'].execute.inArguments &&
            payload['arguments'].execute.inArguments.length > 0
        );

        var inArguments = hasInArguments ? payload['arguments'].execute.inArguments : {};

        activityID = payload['arguments'].activityId;
        let ck = payload['arguments'].contactKey;
        
        let htmlList = $( 'ul.customizations' );

        $.each( customizationArrayLiterals, (i) => {
            let listTag = $( '<li/>' )
                    .addClass( 'viber-customs-list' )
                    .appendTo( htmlList );
            let listRow = $( '<a/>' )
                        .addClass( 'viber-customs-row ')
                        .text( customizationArrayLiterals[i] )
                        .css( 'color', 'white' )
                        .appendTo( listTag );
        });

        // keeping the values of previously saved inputs
        $.each(inArguments, function (index, inArgument) {
            $.each(inArgument, function (key, val) {
                $( '#user' ).val( inArgument['user'] );
                $( '#password' ).val( inArgument['password'] );
                $( '#mc_client_id' ).val( inArgument['mc_client_id'] );
                $( '#mc_client_secret' ).val( inArgument['mc_client_secret'] );
                $( '#content_builder_folder').val( inArgument['content_builder_folder'] );
            });
        });
        
        connection.trigger('updateButton', {
            button: 'next',
            text: 'next',
            visible: true
        });

    }

    function clickedNext() {

        user = $('#user').val();
        password = $('#password').val();
        MCClientId = $('#mc_client_id').val();
        MCClientSecret = $('#mc_client_secret').val();

        let f_token = activity.getTokenFromFerratum(user, password);

        if (f_token == true) {
            save();
        }
    }

    function clickedBack() {
        connection.trigger('prevStep');
    }
    function gotoStep( step ) {
        connection.trigger( 'ready ');
    }

    /**
     * @desc function to utilize show/hide inputs, text, buttons between steps
     * 
     * @param {object} step object that holds the current step 
     * @param {*} stepIndex 
     */
    
    function onGetTokens( tokens ) {
        console.log( tokens );
    }

    function onGetEndpoints( endpoints ) {
        console.log( endpoints );
    }

    /**
     * @desc requestedTriggerEventDefinition event that returns information from the entry point DE
     *       *entry point Data Extension - every journy has an entry point where it gets all the records
     */
    connection.on('requestedTriggerEventDefinition',
    function( eventDefinitionModel ) {
        if ( eventDefinitionModel ) {
            eventDefinitionKey = eventDefinitionModel.eventDefinitionKey;
            console.log('eventDefinitionModel: ', eventDefinitionModel);
        }
    });

    /**
     * @desc requestedInteractionDefaults is the default settings of the journey, 
     *       mainly used for mobile number
     */
    connection.on('requestedInteractionDefaults',
    function( settings ) {
        if ( settings ) {
            requestedInteractionDefaults = settings;
        }
    });

    connection.on('requestedSchema', function (data ) {
        requestSchema = data['schema'];
    })
    
    connection.on('requestedInteraction', function ( data ) {
        console.log( 'requestedInteraction', data );

    });
    /**
     * @desc anytime Done is clicked on the modal window, save() is called
     */
    function save() {
        user = $('#user').val();
        password = $('#password').val();
        MCClientId = $('#mc_client_id').val();
        MCClientSecret = $('#mc_client_secret').val();
        content_builder_folder = $('#content_builder_folder').val();
        PDFID = '{{Event.' + eventDefinitionKey + '.\"PDF_ID\"}}';
        let holderPayloadData = {};
    
        if ( Boolean(user) ) {
            holderPayloadData['user'] = user;
        }
        if ( Boolean(password) ) {
            holderPayloadData['password'] = password;
        }
        if( Boolean(MCClientId) ) {
            holderPayloadData['mc_client_id'] = MCClientId;
        }
        if( Boolean(MCClientSecret) ) {
            holderPayloadData['mc_client_secret'] = MCClientSecret;
        }
        if( Boolean(content_builder_folder) ) {
            holderPayloadData['content_builder_folder'] = content_builder_folder;
        }

        holderPayloadData['PDF_ID'] = PDFID;

        payload['arguments'].execute.inArguments = [{}];

        payload['arguments'].execute.inArguments[0] = holderPayloadData;

        payload['metaData'].isConfigured = true;
     
        connection.trigger('updateActivity', payload);
    }
});