/**
 * Created by dx.yang on 15/5/18.
 */

(function() {

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

    var allRequests = {};

    var ModelRequestConfig = {
        //用于请求url的前缀
        Prefix:'',
        //用户判断请求是否成功的字段
        CodeField:'code',
        //CodeField的成功赋值
        SuccessCode:0,
        //返回数据的字段
        DataField:'data',
        //返回错误信息的字段
        ErrorField:'data'
    };


    var Rajax = function(params) {

        var defaultConfig = {
            'type':'POST',
            dataType:'json'
        };

        params = jQuery.extend(defaultConfig, params);

        params['url'] = ModelRequestConfig.Prefix + params['url'];

        var defer = jQuery.Deferred();

        var cacheKey = params['url'];

        if (params['data']) {
            cacheKey += jQuery.toJSON(params['data']);
        }

        var cachePool = arguments.callee.Cache;

        if (params['useCache'] && cachePool[cacheKey]) {
            setTimeout(function(){
                defer.resolveWith(null, [cachePool[cacheKey]]);
            }, 10);
        } else {
            var ajax = jQuery.ajax(params).done(function(json) {
                if (json[ModelRequestConfig.CodeField] === ModelRequestConfig.SuccessCode) {
                    defer.resolveWith(ajax, [json[ModelRequestConfig.DataField]]);

                    if (params['useCache']) {
                        cachePool[cacheKey] = json[ModelRequestConfig.DataField];
                    }

                } else {
                    defer.rejectWith(ajax, [json[ModelRequestConfig.CodeField], json[ModelRequestConfig.ErrorField]]);
                }
            }).fail(function(xhr, textStatus) {
                if (xhr.status == 200) {
                    defer.rejectWith(ajax, [xhr.status, 'JSON解析失败']);
                } else {
                    defer.rejectWith(ajax, [xhr.status, xhr.statusText]);
                }
            });
        }


        var rt = defer.promise();
        rt.ajax = ajax;
        return rt;
    };

    Rajax.Cache = {};



})();

