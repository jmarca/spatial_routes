/* global exports require process */
// deploy shape service for the VDS detectors I need
//
// different routes, allowing variety of timings.  I think
//
// routes will be /counties, /airbasins, /airdistricts
//
//


var shape_service = require('shapes_postgis').shape_geojson_generation
var async = require('async')
var _ = require('lodash')

var env = process.env;
var puser = process.env.PSQL_USER ;
var ppass = process.env.PSQL_PASS ;
var phost = process.env.PSQL_HOST || '127.0.0.1';
var pport = process.env.PSQL_PORT || 5432;

// options: options, or use environment variables
// * options.host:  the database host || process.env.PSQL_USER. Default 127.0.0.1
// * options.port:  the database port || process.env.PSQL_PASS. Default 5432
// * options.username: the db user    || process.env.PSQL_HOST. Required
// * options.password: the db user's password  || process.env.PSQL_PORT. Required

var default_options={'db':'osm'
                    ,'table':'tempseg.numbered_route_lines'
                    ,'alias':'nrl'
                    ,'host':phost
                    ,'username':puser
                    ,'password':ppass
                    ,'select_properties':{'nrl.refnum' : 'freeway'
                                         ,'nrl.direction': 'direction'
                                         }
                    ,'id_col':['freeway','direction']
                    }

// app must be an express app
exports.osm_links = function osm_links(options,app){

    if(options.host !== undefined) phost = options.host
    if(options.port !== undefined) pport = options.port
    if(options.username !== undefined) puser = options.username
    if(options.password !== undefined) ppass = options.password

    app.get('/osm_map/:zoom/:column/:row.:format'
           ,shape_service(default_options)
           )

    return app

}