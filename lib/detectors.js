/* global exports require process */
// deploy shape service for the VDS detectors I need
//
// different routes, allowing variety of timings.  I think
//
// routes will be /counties, /airbasins, /airdistricts
//
//


var shape_service = require('shapes_postgis').shape_geojson_generation


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

// app must be an express app
exports.detectors = function detectors(options,app){

    if(options.host !== undefined) phost = options.host
    if(options.port !== undefined) pport = options.port
    if(options.username !== undefined) puser = options.username
    if(options.password !== undefined) ppass = options.password

    app.get('/vds_detectors/:zoom/:column/:row.:format'
           ,shape_service({'db':'osm'
                          ,'table':'newtbmap.tvd'
                          ,'alias':'tvd'
                          ,'host':phost
                          ,'username':puser
                          ,'password':ppass
                          ,'select_properties':{'tvd.freeway_id' : 'freeway'
                                               ,'tvd.freeway_dir': 'direction'
                                               ,"'vdsid_' || id"   : 'detector_id'
                                               ,'vdstype'        : 'type'
                                               }
                          ,'id_col':'detector_id'
                          })
           )

    app.get('/wim_detectors/:zoom/:column/:row.:format'
           ,shape_service({'db':'osm'
                          ,'table':'osm_upgraded_2010.twim'
                          ,'alias':'twim'
                          ,'host':phost
                          ,'username':puser
                          ,'password':ppass
                          ,'select_properties':{'twim.freeway_id' : 'freeway'
                                               ,'twim.direction': 'direction'
                                               ,"'wimid_' || site_no"   : 'detector_id'
                                               ,'wim_type'        : 'type'
                                               }
                          ,'id_col':'detector_id'
                          })
           )
}