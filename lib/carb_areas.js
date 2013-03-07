/* global exports require process */
// deploy shape service for the CARB-specific areas I need
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
exports.carb_areas = function carb_areas(options,app){

    if(options.host !== undefined) phost = options.host
    if(options.port !== undefined) pport = options.port
    if(options.username !== undefined) puser = options.username
    if(options.password !== undefined) ppass = options.password


    var county_handler = shape_service({'db':'spatialvds'
                          ,'table':'public.carb_counties_aligned_03'
                          ,'alias':'counties'
                          ,'host':phost
                          ,'port':pport
                          ,'username':puser
                          ,'password':ppass
                          ,'select_properties':{'gid'           : 'gid'
                                               ,'a.fips'         :'fips'
                                               ,'cacoa_'       : 'cacoa_'
                                               ,'cacoa_id'     : 'id'
                                               ,'coname'       : 'coname'
                                               ,'a.name'         : 'name'
                                               ,'conum'        : 'conum'
                                               ,'display'      : 'display'
                                               ,'symbol'       : 'symbol'
                                               ,'islandname'   : 'islandname'
                                               ,'baysplinte'   : 'baysplinte'
                                               ,'cntyi_area'   : 'cntyi_area'
                                               ,'island_id'    : 'island_id'
                                               ,'bay_id'       : 'bay_id'
                                               }
                          ,'id_col':['fips','gid']
                          ,'geo_col':'geom4326'
                          ,'join_tables':[{'table':'counties_fips'
                                          ,'alias':'a'
                                          ,'join' :'on (counties.name ~* a.name)'}
                                         ]
                          })
    // set the routes
    app.get('/counties/:zoom/:column/:row.:format?'
           ,function(req,res,next){
                return county_handler(req,res,next)
            }
           )
    app.get('/counties.:format?'
           ,function(req,res,next){
                return county_handler(req,res,next)
            }
           )

    var basin_handler = shape_service({'db':'spatialvds'
                          ,'table':'public.carb_airbasins_aligned_03'
                          ,'alias':'airbasins'
                          ,'host':phost
                          ,'port':pport
                          ,'username':puser
                          ,'password':ppass
                          ,'select_properties':{'gid'           : 'gid'
                                               ,'perimeter'  : 'perimeter'
                                               ,'area'       : 'area'
                                               ,'abasa_'     : 'abasa_'
                                               ,'abasa_id'   : 'id'
                                               ,'basin_name' : 'name'
                                               ,'ab'         : 'ab'
                                               }
                          ,'id_col':['name','gid']
                          ,'geo_col':'geom_4326'
                          })
    app.get('/airbasins/:zoom/:column/:row.:format?'
           ,function(req,res,next){
                return basin_handler(req,res,next)
            }
           )
    app.get('/airbasins.:format?'
           ,function(req,res,next){
                return basin_handler(req,res,next)
            }
           )

    var district_handler = shape_service({'db':'spatialvds'
                          ,'table':'public.carb_airdistricts_aligned_03'
                          ,'alias':'airdistricts'
                          ,'host':phost
                          ,'port':pport
                          ,'username':puser
                          ,'password':ppass
                          ,'select_properties':{'gid'           : 'gid'
                                               ,'disti_area' : 'area'
                                               ,'adisa_'     : 'adisa_'
                                               ,'adisa_id'   : 'id'
                                               ,'name'       : 'name'
                                               ,'dis'         : 'dis'
                                               ,'disn' : 'disn'
                                               ,'display' : 'display'
                                               ,'dist_type': 'dist_type'
                                               }
                          ,'id_col':['name','gid']
                          ,'geo_col':'geom4326'
                          })
    app.get('/airdistricts/:zoom/:column/:row.:format?'
           ,function(req,res,next){
                return district_handler(req,res,next)
            }
           )
    app.get('/airdistricts.:format?'
           ,function(req,res,next){
                return district_handler(req,res,next)
            }
           )
}
