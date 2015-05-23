/**
 * Created by dx.yang on 15/5/18.
 */

(function() {

    var guid = require('./guid');

    var allRequests = {};

    var ModelRequestConfig = {
        //useCache boolean
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
        var rt = defer.promise();

        var cacheKey = params['url'];

        if (params['data']) {
            cacheKey += jQuery.toJSON(params['data']);
        }

        var cachePool = arguments.callee.Cache;

        if (params['useCache'] && cachePool[cacheKey]) {
            setTimeout(function(){
                delete allRequests[rt.__request_uniq_id__];
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
                delete allRequests[rt.__request_uniq_id__];
            }).fail(function(xhr, textStatus) {
                if (xhr.status == 200) {
                    defer.rejectWith(ajax, [xhr.status, 'JSON解析失败']);
                } else {
                    defer.rejectWith(ajax, [xhr.status, xhr.statusText]);
                }
                delete allRequests[rt.__request_uniq_id__];
            });
        }


        rt.__ajax__ = ajax;
        rt.__request_uniq_id__ = guid('react_ajax_uniq_id');
        allRequests[rt.__request_uniq_id__] = rt;
        rt.abort = function() {
            ajax.abort();
            delete allRequests[rt.__request_uniq_id__];
        };
        return rt;
    };

    Rajax.Cache = {};

    Rajax.stopAllRequest = function() {
        $.each(allRequests, function(k, v) {
            v && v.abort && v.abort();
        });
        allRequests = {};
    };

    module.exports = Rajax;

})();

