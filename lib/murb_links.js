/* global exports require process */
// deploy shape service for most used road bit type links
//


var shape_service = require('shapes_postgis').shape_geojson_generation
var topojson_handler = require('./topojson_end_handler.js')
var path = require('path')
var default_config_file = '../json/murb_links.json'
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
 * grab Most Used Road Bit (MURB) links from the database
 * @param {Object} options required
 * @param {string} options.host the database host, required
 * @param {number} options.port the database port, required
 * @param {string} options.username the database username, required
 * @param {string} options.password the database password, optional if
 * you use a .pgpass file or if the database does not require a
 * password
 * @param {string} config_file the external JSON file containing the
 * definitions of the various queries that are set up here.  Defaults
 * to json/murb_links.json
 * @param {external:app} app The express app will get assigned various
 * routes and handlers
 * @returns {null} nothing is returned
 */
exports.murb_links = function murb_links(options,config_file,app){
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
    app.get('/detectors/murb/:year/:zoom/:column/:row.:format'
            ,function(req,res,next){
                return s(req,res,next)
            })

    return app

}

/**
 * grab Most Used Road Bit (MURB) links from the database, topojson version
 * @param {Object} options required
 * @param {string} options.host the database host, required
 * @param {number} options.port the database port, required
 * @param {string} options.username the database username, required
 * @param {string} options.password the database password, optional if
 * you use a .pgpass file or if the database does not require a
 * password
 * @param {string} config_file the external JSON file containing the
 * definitions of the various queries that are set up here.  Defaults
 * to json/murb_links.json
 * @param {external:app} app The express app will get assigned various
 * routes and handlers
 * @returns {null} nothing is returned
 */
exports.murb_topojson = function murb_topojson(options,config_file,app){
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
    s = shape_service(opts,topojson_handler)
    app.get('/detectors/murb_topo/:year/:zoom/:column/:row.:format'
           ,function(req,res,next){
               return s(req,res,next)
           })

    return app

}
