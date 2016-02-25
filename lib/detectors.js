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

var path = require('path')
var default_config_file = '../json/detectors.json'
var _config={}
_config[default_config_file] = require(default_config_file)

/**
 * a function to get the json specified by the passed-in filename
 * @param {string} filename the file containing valid JSON config
 * info.  Must end in .js or .json as I use require to load it
 * @returns {Object}
 * @private
 */
function get_json_config(filename){
    if(_config[filename] !== undefined){
        return _config[filename]
    }
    // else I need to load the file
    // may as well do it synchronously using require

    _config[filename] = require(path.normalize(process.cwd()+'/'+ filename))
    return _config[filename]
}


/**
 *
 * @param {Object} options required
 * @param {string} options.host the database host, required
 * @param {number} options.port the database port, required
 * @param {string} options.username the database username, required
 * @param {string} options.password the database password, optional if
 * you use a .pgpass file or if the database does not require a
 * password
 * @param {string} config_file the external JSON file containing the
 * definitions of the various queries that are set up here.  Defaults
 * to '../json/carb_areas.json
 * @param {external:app} app The express app will get assigned various
 * routes and handlers
 * @returns {null} nothing is returned
 */
exports.detectors = function detectors(options,config_file,app){
    if(options === undefined) throw new Error('options object is required')
    if(app === undefined){
        // could be a problem, or could be that config_file is left to default
        if((typeof config_file) !== 'function') throw new Error('app must be an express function')
        app = config_file
        config_file = default_config_file
    }
    var opts = get_json_config(config_file)


    var vds_options={'db':'osm'
                ,'table':'newtbmap.tvd'
                ,'alias':'tvd'
                ,'select_properties':{'tvd.freeway_id' : 'freeway'
                                     ,'tvd.freeway_dir': 'direction'
                                     ,"'vdsid_' || id"   : 'detector_id'
                                     ,'vdstype'        : 'type'
                                     }
                ,'id_col':'detector_id'
                }
    var wim_options={'db':'osm'
                ,'table':'osm_upgraded_2010.twim'
                ,'alias':'twim'
                ,'select_properties':{'twim.freeway_id' : 'freeway'
                                     ,'twim.direction': 'direction'
                                     ,"'wimid_' || site_no"   : 'detector_id'
                                     ,'wim_type'        : 'type'
                                     }
                ,'id_col':['detector_id','direction']
                }

    var vss = shape_service(vds_options)
    var wss = shape_service(wim_options)
    app.get('/vds_detectors/:zoom/:column/:row.:format'
           ,function(req,res,next){
               return vss(req,res,next)
           }
           )

    app.get('/vds_detectors.:format'
           ,function(req,res,next){
               return vss(req,res,next)
           }
           )

    app.get('/wim_detectors/:zoom/:column/:row.:format'
           ,function(req,res,next){
               return wss(req,res,next)
           }
           )

    app.get('/wim_detectors.:format'
           ,function(req,res,next){
               return wss(req,res,next)
           }
           )

    var chained_service = function(req,res,next){
        async.parallel([function(cb){
            vss(req,res,next,function(data,req,res,next){
                cb(null,data)
            })
        }
                       ,function(cb){
                           wss(req,res,next,function(data,req,res,next){
                               cb(null,data)
                           })
                       }]
                      ,function(err,results){

            var data = results[0]
            var wim = results[1]
            if(data && data.features === undefined){
                data = wim
            }else{
                if(wim
                                && wim.features !== undefined
                                && wim.features.length){
                    data.features.push(wim.features)
                    data.features = _.flatten(data.features)
                }
            }
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify(data))
        })
        return null
    }
    app.get('/detectors/:zoom/:column/:row.:format',chained_service)
    app.get('/detectors.:format',chained_service)
    return app

}
