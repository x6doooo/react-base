/**
 * Created by dx.yang on 15/5/20.
 */

// uniq ID
var limit = 65535;
function createBaseArray() {
    return [0, 0];
}
var cacheNums = {};
var guid = function(key) {
    var nums = cacheNums[key];
    if (!nums) {
        nums = cacheNums[key] = createBaseArray();
    }
    var idx = 0;
    var len = nums.length;
    while(idx < len) {
        if (++nums[idx] > limit) {
            nums[idx] = 0;
            idx++;
        } else {
            break;
        }
    }
    var id = nums.join('-');
    if (key) {
        id = key + '-' + id;
    }
    return id;
};

module.exports = guid;
