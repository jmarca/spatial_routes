/* global exports require process */
// deploy shape service for the VDS detectors I need
//
// different routes, allowing variety of timings.  I think
//
// routes will be /counties, /airbasins, /airdistricts
//
//


var shape_service = require('shapes_postgis').shape_geojson_generation
var topojson = require('topojson')

var path = require('path')
var default_config_file = '../json/osm_links.json'
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
 * to json/osm_links.json
 * @param {external:app} app The express app will get assigned various
 * routes and handlers
 * @returns {null} nothing is returned
 */
exports.osm_links = function osm_links(options,config_file,app){
    var s,opts
    if(options === undefined) throw new Error('options object is required')
    if(app === undefined){
        // could be a problem, or could be that config_file is left to default
        if((typeof config_file) !== 'function') throw new Error('app must be an express function')
        app = config_file
        config_file = default_config_file
    }
    opts = get_json_config(config_file)
    opts = Object.assign({},opts,options)
    s = shape_service(opts)
    app.get('/osm_map/:zoom/:column/:row.:format'
            ,function(req,res,next){
                return s(req,res,next)
            })

    return app

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
exports.osm_topojson = function osm_topojson(options,config_file,app){
    var s,opts
    if(options === undefined) throw new Error('options object is required')
    if(app === undefined){
        // could be a problem, or could be that config_file is left to default
        if((typeof config_file) !== 'function') throw new Error('app must be an express function')
        app = config_file
        config_file = default_config_file
    }
    opts = get_json_config(config_file)
    opts = Object.assign({},opts,options)
    s = shape_service(opts,writing_topojson_end_handler)
    app.get('/osm_topo_map/:zoom/:column/:row.:format'
            ,function(req,res,next){
                return s(req,res,next)
            })

    return app

}

/**
 * A function to convert OSM results into topojson
 * @param {} data
 * @param {Object} req
 * @param {Object} res
 * @param {function} next
 * @returns {} null
 * @private
 */
function writing_topojson_end_handler(data,req,res,next){
    var topo,reformat
    // I want to break up the feature collection here, as I don't
    // really need it
    reformat = data.features.map(function(f){
        f.id = f.properties.id
        return f
    })

    res.writeHead(200, { 'Content-Type': 'application/json' })
    // convert geojson  to topojson
    topo = topojson.topology(reformat)
    //    console.log(topo)
    res.end(JSON.stringify(topo))
    return null
}
