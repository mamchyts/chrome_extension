// set handler to tabs:  need for seng objects to backgroung.js
chrome.extension.onConnect.addListener(function(port){
    port.onMessage.addListener(factory);
});


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
 * Functino will be called from background.js
 * 
 * @return void
 */
function initialization(){
    window.popup = new popupObj();
}


/**
 * Functino will be called when background.js send some data by port interface
 * 
 * @return void
 */
function factory(obj){
    if(obj && obj.method){
        if(obj.data)
            window.popup[obj.method](obj.data);
        else
            window.popup[obj.method]();
    }
}


/**
 * Popup object
 *
 * @version 2013-10-11
 * @return  Object
 */
window.popupObj = function(){
};


/**
 * Pablic methods
 */
window.popupObj.prototype = {

    /**
     * some internal params
     */
    available_hosts: [],
    total_host: null,
    matches: [],
    tab_id: null,
    port: null,
    cars: [],

    /**
     * Function will be called from bg.js
     */
    setHosts: function(hosts)
    {
        this.available_hosts = hosts;
    },

    /**
     * Function will be called from bg.js
     */
    setTabId: function(id)
    {
        this.tab_id = id;
    },

    /**
     * Function check total host
     */
    run: function()
    {
        // get total host
        if(document.location.host && (document.location.host != ''))
            this.total_host = document.location.host;
        else if(document.location.hostname && (document.location.hostname != ''))
            this.total_host = document.location.hostname;

        if(!this.total_host || (this.total_host === ''))
            return 0;

        var find = false;
        // if total host in array $available_hosts - parse page for finde cars
        for (host in this.available_hosts) {
            if(this.total_host.indexOf(host) != -1){
                this.total_host = host;
                find = true;
                break;
            }
        };

        // create connection to backgroung.html and send request
        this.port = chrome.extension.connect();
        this.port.postMessage({method:'mustParsed', data:{tab_id:this.tab_id, find:find}});
    },

    /**
     * Function will be called from bg.js
     * Parse page
     */
    parsePage: function()
    {
        // reset variable before parse
        this.matches = [];

        if(!this.available_hosts[this.total_host])
            return 0;

        var html = window.document.body.innerHTML;
        var reg_exp = this.available_hosts[this.total_host];
        var matches = {};
        var match = [];
        var find = false;
        for(var i = 0, len = reg_exp.length; i < len; i++) {
            var exp = new RegExp(reg_exp[i].reg_exp, reg_exp[i].flag);
            match = exp.exec(html);

            if(match && match.length && reg_exp[i].index){
                matches[reg_exp[i].field] = trim(match[reg_exp[i].index]);
                find = true;
            }
            else if(match && match.length){
                matches[reg_exp[i].field] = match;
                find = true;
            }
        }

        // this url will be send to site
        if(find === true){
            matches.url = document.location.href;
            this.matches.push(matches);
        }

        // send count of matches
        this.port.postMessage({method:'matchesCount', data:{tab_id:this.tab_id, matches: this.matches}});
    }
}
