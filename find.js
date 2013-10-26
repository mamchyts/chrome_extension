/**
 * OnLoad function
 * 
 * @return void
 */
window.onload = function(){

    // set new popup html code and close popup window
    window.bg_wnd = chrome.extension.getBackgroundPage();
    var rows = window.bg_wnd.bg.getMatches();

    // function render popup
    renderPopup(rows);
}


/**
 * Function set cars into html
 *
 * @param  array  $rows
 * @return void
 */
function renderPopup(rows)
{
    if(rows.length === 0){
        document.getElementById('popup_cars_rows').style.display = 'none';
        document.getElementById('popup_cars_rows_none').style.display = 'block';
        return 0;
    }
    else{
        document.getElementById('popup_cars_rows').style.display = 'block';
        document.getElementById('popup_cars_rows_none').style.display = 'none';
    }

    for (var i = 0, cnt = rows.length; i < cnt; i++)
        renderRow(rows[i]);
}


/**
 * Function set cars into html
 *
 * @param  object $row
 * @return void
 */
function renderRow(row)
{
    var tbl = document.getElementById('popup_cars_table').children[1];

    // add divided row
    var td = tbl.insertRow(-1).insertCell(-1);
    td.setAttribute('colspan', '3');
    td.innerHTML = '<hr style="border: 1px solid #909090; width: 75%">';

    var tr = tbl.insertRow(-1);
    var td1 = tr.insertCell(-1);
    var td2 = tr.insertCell(-1);
    var td3 = tr.insertCell(-1);
    var vacancy = [];
    var city    = [];

    var hash = {
        vacancy: 'вакансия',
        city: 'город',
    }

    var table_row = [];
    for(key in row){
        if(hash[key]){
            if(key == 'vacancy')
                vacancy.push(row[key]);
            if(key == 'city')
                city.push(row[key]);
        }
    }

    td1.innerHTML = vacancy.join(' ');;
    td2.innerHTML = city.join(' ');
    td3.innerHTML = (row.url === '')?'<b><em>Добавлено</em></b>':'<input type="button" value="Добавить" name="cars[]" class="button"><input type="hidden" value="'+row.url+'" name="url[]">';
    td3.children[0].addEventListener('click', function(){addToGrabber(event)}, false);
}


function addToGrabber(e)
{
    // hide fade on popup
    document.getElementById('loader').getElementsByTagName('img')[0].style.marginTop = (window.innerHeight/2-10)+'px';
    document.getElementById('loader').style.display = 'block';

    if(e && e.srcElement){
        var url = e.srcElement.parentNode.children[1].value;

        setTimeout(function(){
            var result = window.bg_wnd.bg.addUrlToGrabber(url);
            e.srcElement.parentNode.innerHTML = '<b><em>Добавлено</em></b>';

            // hide fade on popup
            document.getElementById('loader').style.display = 'none';
        }, 500);
    }
}

