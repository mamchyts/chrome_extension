/**
 * OnLoad function
 * 
 * @return void
 */
window.onload = function(){

    // set some events handlers
    document.getElementById('popup_login_form').onsubmit = function(obj){
        // fade popup
        document.getElementById('loader').style.display = 'block';
        document.getElementById('error_message').innerHTML = '&nbsp;';

        if(obj.target.elements && obj.target.elements.length && (obj.target.elements.length === 3)){
            var data = {};
            data.login = obj.target.elements[0].value;
            data.pass  = obj.target.elements[1].value;

            setTimeout(function(){
                var bg_wnd = chrome.extension.getBackgroundPage();
                var result = bg_wnd.bg.loginUser(data);

                if(result && result.status && (result.status === 'error'))
                    document.getElementById('error_message').innerHTML = result.mess;
                else{
                    // set new popup html code and close popup window
                    bg_wnd.bg.setPopup('find.html');
                    window.close();
                }

                // hide fade on popup
                document.getElementById('loader').style.display = 'none';
            }, 500);
        }
        return false;
    };

}