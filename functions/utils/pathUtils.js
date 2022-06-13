
exports.getObjectPath = function(pathArr){
    const pathObject = {}
    for(let i = 0; i < pathArr.length; i += 2){
        pathObject[pathArr[i]] = pathArr[i + 1]
    }

    return path
}