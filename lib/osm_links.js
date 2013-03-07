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
var topojson = require('topojson')

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
                    ,'geo_col':'routeline'
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

    if(options.host !== undefined)     default_options.host    =options.host
    if(options.port !== undefined)     default_options.port    =options.port
    if(options.username !== undefined) default_options.username=options.username
    if(options.password !== undefined) default_options.password=options.password

    var s = shape_service(default_options)
    app.get('/osm_map/:zoom/:column/:row.:format'
           ,function(req,res,next){
                s(req,res,next)
            }
           )

    return app

}

exports.osm_topojson = function osm_topojson(options,app){

    if(options.host !== undefined)     default_options.host    =options.host
    if(options.port !== undefined)     default_options.port    =options.port
    if(options.username !== undefined) default_options.username=options.username
    if(options.password !== undefined) default_options.password=options.password

    var s = shape_service(default_options,writing_topojson_end_handler)
    app.get('/osm_topo_map/:zoom/:column/:row.:format'
           ,function(req,res,next){
                return s(req,res,next)
            }
           )

    return app

}

var writing_topojson_end_handler=function(data,req,res,next){
    // I want to break up the feature collection here, as I don't
    // really need it
    var reformat = _.map(data.features
                        ,function(f){
                             f.id = f.properties.id
                            return f
                        })

    res.writeHead(200, { 'Content-Type': 'application/json' });
        // convert geojson  to topojson
        var topo = topojson.topology(reformat)
//    console.log(topo)
        res.end(JSON.stringify(topo));

}
