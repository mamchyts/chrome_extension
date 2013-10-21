/**
 * Function return element by id
 *
 * @version 2012-07-22
 * @param   string   id    title of id
 * @return  Object
 */
function $(id)
{
    return document.getElementById(id);
}


/**
 * Function remove spaces in begin and end of string
 *
 * @version 2012-11-05
 * @param   string  str
 * @return  string
 */
function trim(str)
{
    return String(str).replace(/^\s+|\s+$/g, '');
}


/**
 * Ajax object
 *
 * Send request by post/get to some url
 *
 * @version 2013-02-13
 * @param   Object  params
 * @return  Object
 */
window.Ajax = function(params)
{
    this.options = {
        // default url
        url: '',

        // default method
        method: 'get',

        // Is synchronous request?
        async: true,

        // in seconds 
        timeout: 10000,

        // json|xml|text
        response:'json',

        // callback function, in default - empty function
        onComplete: function(){}
    };

    // set config params
    this.setConfig(params);

    // initialize
    this.init(params);
};

/**
 * Pablic methods
 */
window.Ajax.prototype = {

    /**
     * some internal params
     */
    xml_http_request: null,
    timeout: null,


    /**
     * configure functionality
     */
    setConfig: function(opt)
    {
        // set url
        if(opt.url != undefined)
            this.options.url = opt.url;

        // set method
        if(opt.method != undefined)
            this.options.method = opt.method;

        // set asynchronus param
        if(opt.async != undefined)
            this.options.async = opt.async;

        // set timeout
        if(opt.timeout != undefined)
            this.options.timeout = opt.timeout;

        // set response type
        if(opt.response != undefined)
            this.options.response = opt.response;

        // set callback functions
        if((opt.onComplete != undefined) && (typeof(opt.onComplete) == 'function'))
            this.options.onComplete = opt.onComplete;
    },

    /**
     * Initialize XMLHTTPRequest
     */
    init: function()
    {
        // Cross-browser compatibility for browsers
        if (typeof XMLHttpRequest != 'undefined') {
            this.xml_http_request = new XMLHttpRequest();
        }
        else{
            try {
                this.xml_http_request = new ActiveXObject("Msxml2.XMLHTTP");
            }
            catch (e) {
                try {
                    this.xml_http_request = new ActiveXObject("Microsoft.XMLHTTP");
                } catch (E) {
                    alert('Your browser don\'t support Ajax technology. Please download real browser :)');
                }
            }
        }

        var self_ = this;

        // open XMLHttpRequest
        this.xml_http_request.open(self_.options.method, self_.options.url, self_.options.async);

        // set callback function for XMLHttpRequest
        this.xml_http_request.onreadystatechange = function(){
            if((self_.xml_http_request.readyState == 4) && (self_.xml_http_request.status > 0)){

                // delete timeout
                clearTimeout(self_.timeout);

                if(self_.options.response === 'json')
                    var response = JSON.parse(self_.xml_http_request.responseText);
                else{
                    if(self_.options.response === 'xml')
                        var response = self_.xml_http_request.responseXML;
                    else
                        var response = self_.xml_http_request.responseText;
                }
                self_.options.onComplete(response);
            }
        }
    },


    /**
     * Set some headers if need
     */
    setRequestHeader: function(name, value)
    {
        this.xml_http_request.setRequestHeader(name, value);
    },


    /**
     * Send request
     */
    send: function(params)
    {
        this.xml_http_request.send(params);

        var self_ = this;

        // set timeout need for abort request
        this.timeout = setTimeout( function(){ self_.xml_http_request.abort(); }, this.options.timeout);
    },


    /**
     * Abort request
     */
    abort: function()
    {
        this.xml_http_request.abort();
    }
}
