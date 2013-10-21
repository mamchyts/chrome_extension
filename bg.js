/**
 * OnLoad function
 * 
 * @return void
 */
window.onload = function(){

    // tmp storage
    window.bg = new bgObj();

    // some variables  !!! important
    window.bg.api_site_host = 'http://katran.by';

    // get all graber hosts:   !!!once!!!
    new Ajax({
        url: window.bg.api_site_host+'/regexp.php',
        response: 'json',
        async: false,
        onComplete: function(data){
            if(data && data.status && (data.status === 'ok'))
                window.bg.grabber_hosts = data.data;
        }
    }).send();

    // set handler to tabs
    chrome.tabs.onActivated.addListener(function(info) {
        window.bg.onActivated(info);
    });

    // set handler to tabs:  need for seng objects
    chrome.extension.onConnect.addListener(function(port){
        port.onMessage.addListener(factory);
    });

    // set handler to extention on icon click
    chrome.browserAction.onClicked.addListener(function(tab) {
        window.bg.onClicked(tab);
    });

    // set handler to tabs
    chrome.tabs.onUpdated.addListener(function(id, info, tab) {
        // if tab load
        if (info && info.status && (info.status.toLowerCase() === 'complete')){
            // if user open empty tab or ftp protocol and etc.
            if(!id || !tab || !tab.url || (tab.url.indexOf('http:') == -1))
                return 0;

            // save tab info if need
            window.bg.push(tab);

            // connect with new tab, and save object
            var port = chrome.tabs.connect(id);
            window.bg.tabs[id].port_info = port;

            // run function in popup.html
            chrome.tabs.executeScript(id, {code:"initialization()"});

            // send id, hosts and others information into popup.js
            window.bg.tabs[id].port_info.postMessage({method:'setTabId', data:id});
            window.bg.tabs[id].port_info.postMessage({method:'setHosts', data:window.bg.grabber_hosts});
            window.bg.tabs[id].port_info.postMessage({method:'run'});

            // if user is logged into application set find.html popup
            if(window.bg.user.id)
                chrome.browserAction.setPopup({popup: "find.html"});
        };
    });

    window.bg.onAppReady();
};


/**
 * Functino will be called when popup.js send some data by port interface
 * 
 * @return void
 */
function factory(obj){
    if(obj && obj.method){
        if(obj.data)
            window.bg[obj.method](obj.data);
        else
            window.bg[obj.method]();
    }
}


/**
 * Popup object
 *
 * @version 2013-10-11
 * @return  Object
 */
window.bgObj = function(){
};


/**
 * Pablic methods
 */
window.bgObj.prototype = {

    /**
     * some internal params
     */
    tabs: {},
    user: {},
    popup_dom: {},
    active_tab: {},
    grabber_hosts: {},
    done_urls: [],

    /**
     * init() function
     */
    onAppReady: function()
    {
        // if user not logged into application set login.html popup
        chrome.browserAction.setPopup({popup: "login.html"});
    },

    /**
     * Function add tab into $tabs object, if need
     */
    push: function(tab)
    {
        if(tab.id && (tab.id != 0)){
            if(!this.tabs[tab.id])
                this.tabs[tab.id] = {tab_obj:tab};
        }
    },

    /**
     * Function will be called from popup.js
     */
    mustParsed: function(data)
    {
        if(this.tabs[data.tab_id]){
            var id = data.tab_id;
            this.tabs[id].must_parsed = data.find;

            // run parser in popup.js, if need
            if(this.tabs[id].must_parsed && (this.tabs[id].must_parsed === true))
                this.tabs[id].port_info.postMessage({method:'parsePage'});
        }
    },

    /**
     * Function will be called from popup.js
     */
    matchesCount: function(data)
    {
        if(data.tab_id && this.tabs[data.tab_id]){
            var id = data.tab_id;
            this.tabs[id].matches = data.matches;
            this.tabs[id].matches_count = this.tabs[id].matches.length+'';

            if(this.tabs[id].matches_count && this.tabs[id].matches_count != '0'){
                chrome.browserAction.setBadgeText({text: this.tabs[id].matches_count});
                return 0;
            }
        }

        // show default text
        chrome.browserAction.setBadgeText({text:''});
    },

    /**
     * Function will be called when user change active tab
     */
    onActivated: function(info)
    {
        // set active tab
        this.active_tab = info;

        var data = {};
        data.matches  = [];

        if(info.tabId){
            data.tab_id  = info.tabId;
            if(!this.tabs[data.tab_id])
                this.tabs[data.tab_id] = {};
            if(!this.tabs[data.tab_id].matches)
                this.tabs[data.tab_id].matches = [];

            data.matches = this.tabs[data.tab_id].matches;
        }

        // set actual count of matches for current tab
        this.matchesCount(data);

        // if user is logged into application set find.html popup
        if(this.user.id)
            chrome.browserAction.setPopup({popup: "find.html"});
    },

    /**
     * Function will be called when user click on extension icon
     */
    onClicked: function(tab)
    {
        alert('Произошла ошибка. Обратитесь к разработчикам данного приложения.');
        return 0;
    },

    /**
     * Function will be called from login.js
     */
    loginUser: function(user_data)
    {
        var self = this;
        var json_data = false;

        // get all graber hosts:   !!!once!!!
        new Ajax({
            url: window.bg.api_site_host+'/login.php?user='+encodeURIComponent(JSON.stringify(user_data)),
            method: 'post',
            response: 'json',
            async: false,
            onComplete: function(data){
                if(data && data.status){
                    // if login - ok
                    if(data.status === 'ok')
                        self.user = data.data;

                    json_data = data;
                }
            }
        }).send();

        // return value for login.js
        return json_data;
    },

    /**
     * Function will be called from login.js and others places
     */
    setPopup: function(popup_file)
    {
        chrome.browserAction.setPopup({tabId: this.active_tab.tabId, popup: popup_file});
    },

    /**
     * Function will be called from find.js and others places
     */
    getMatches: function()
    {
        // init if need
        if(!this.tabs[this.active_tab.tabId])
            this.tabs[this.active_tab.tabId] = {};
        if(!this.tabs[this.active_tab.tabId].matches)
            this.tabs[this.active_tab.tabId].matches = [];

        // if user alredy send this url - remove
        for(var i = 0, cnt = this.tabs[this.active_tab.tabId].matches.length; i < cnt; i++){
            for(var j = 0, len = this.done_urls.length; j < len; j++){
                if(this.tabs[this.active_tab.tabId].matches[i].url === this.done_urls[j]){
                    this.tabs[this.active_tab.tabId].matches[i].url = '';
                    break;
                }
            }
        }

        return this.tabs[this.active_tab.tabId].matches;
    },

    /**
     * Function will be called from find.js and others places
     */
    addUrlToGrabber: function(url)
    {
        // if $url == ''  -  already used
        if(json_data.status && (json_data.status === 'ok')){
            var matches = this.tabs[this.active_tab.tabId].matches;
            for(var i = 0, cnt = matches.length; i < cnt; i++){
                if(matches[i].url && (matches[i].url === url))
                    matches[i].url = '';
                    this.done_urls.push(url);
            }
        }

        // return value for login.js
        return json_data;
    },


    /**
     * Empty method
     */
    empty: function()
    {
    }
}
