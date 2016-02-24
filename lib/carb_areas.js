/* global exports require process */
// deploy shape service for the CARB-specific areas I need
//
// routes will be /counties, /airbasins, /airdistricts
//
//



var shape_service = require('shapes_postgis').shape_geojson_generation
var path = require('path')

var default_config_file = '../json/carb_areas.json'
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
exports.carb_areas = function carb_areas(options,config_file,app){
    if(options === undefined) throw new Error('options object is required')
    if(typeof app === undefined){
        // could be a problem, or could be that config_file is left to default
        console.log(typeof config_file)
        app = config_file
        config_file = default_config_file
    }

    var opts = get_json_config(config_file)


    var optch = Object.assign({},opts.county_handler,options)
    var county_handler = shape_service(optch)
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

    var optbh = Object.assign({},opts.basin_handler,options)
    var basin_handler = shape_service(optbh)
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

    var optdh = Object.assign({},opts.district_handler,options)
    var district_handler = shape_service(optdh)
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

    var optgh = Object.assign({},opts.grid4k_handler,options)
    var grid4k_handler = shape_service(optgh)
    app.get('/grid4k/:zoom/:column/:row.:format?'
           ,function(req,res,next){
                return grid4k_handler(req,res,next)
            }
           )
    app.get('/grid4k.:format?'
           ,function(req,res,next){
                return grid4k_handler(req,res,next)
            }
           )
    return null
}
