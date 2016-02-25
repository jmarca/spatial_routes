var topojson = require('topojson')
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
module.exports=writing_topojson_end_handler
