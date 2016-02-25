/* global exports require process */
// deploy shape service for most used road bit type links
//


var shape_service = require('shapes_postgis').shape_geojson_generation
var async = require('async')
var _ = require('lodash')
var topojson = require('topojson')

var env = process.env
var puser = process.env.PSQL_USER 
var ppass = process.env.PSQL_PASS 
var phost = process.env.PSQL_HOST || '127.0.0.1'
var pport = process.env.PSQL_PORT || 5432

// options: options, or use environment variables
// * options.host:  the database host || process.env.PSQL_USER. Default 127.0.0.1
// * options.port:  the database port || process.env.PSQL_PASS. Default 5432
// * options.username: the db user    || process.env.PSQL_HOST. Required
// * options.password: the db user's password  || process.env.PSQL_PORT. Required

var default_options={'db':'spatialvds'
                    ,'table':'tempseg.mostusedroadbits'
                    ,'alias':'murb'
                    ,'geo_col':'seggeom'
                    ,'host':phost
                    ,'username':puser
                    ,'password':ppass
                    ,'select_properties':{'murb.year':'year'
                                         ,'murb.detector_id':'detector_id'
                                         ,'murb.refnum' : 'freeway'
                                         ,'murb.direction': 'direction'
                                         }
                    ,'id_col':['freeway','direction']
                    ,'where_clause':"murb.detector_id ~* 'vdsid'"
                    ,'dynamic_where_clause':{'year':{'lhs':'year',
                                                     'comp':'='
                                                    }}

                    }

// app must be an express app
exports.murb_links = function murb_links(options,app){

    if(options.host !== undefined)     default_options.host    =options.host
    if(options.port !== undefined)     default_options.port    =options.port
    if(options.username !== undefined) default_options.username=options.username
    if(options.password !== undefined) default_options.password=options.password

    var ss = shape_service(default_options)
    app.get('/detectors/murb/:year/:zoom/:column/:row.:format'
           ,function(req,res,next){
               return ss(req,res,next)
           }
           )

    return app

}

exports.murb_topojson = function murb_topojson(options,app){

    if(options.host !== undefined)     default_options.host    =options.host
    if(options.port !== undefined)     default_options.port    =options.port
    if(options.username !== undefined) default_options.username=options.username
    if(options.password !== undefined) default_options.password=options.password

    var ss = shape_service(default_options,writing_topojson_end_handler)
    app.get('/detectors/murb_topo/:year/:zoom/:column/:row.:format'
           ,function(req,res,next){
               return ss(req,res,next)
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

    res.writeHead(200, { 'Content-Type': 'application/json' })
        // convert geojson  to topojson
    var topo = topojson.topology(reformat)
//    console.log(topo)
    res.end(JSON.stringify(topo))

}
