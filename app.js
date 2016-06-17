(function() {
  return {
    defaultState: "phase0",
    requests: {
        sendData: function(data){
            return {
                url: '/api/v2/imports/tickets/create_many.json',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(data)
            };
        }
    },
    events: {
      'pane.activated': 'prepareApp',
      'click .selections .option': 'switchToPhase',
      'click .option.tickets .dropdown.li.title, #ex00': 'ex00',
      'click .option.tickets .tickets.li.title, #ex01': 'ex01',
      'click .option.users .dropdown.li.title, #ex10': 'ex10',
      'click .option.organizations .dropdown.li.title, #ex20': 'ex20',
      'click .option.voice .li.title, #ex30': 'ex30',
      'click .option.zopim .li.title, #ex40': 'ex40',
      'click #upload_link': 'uploadFile',
      'change #upload': 'getFileContents',
      'dragover .drop .wzrd': 'allowDrop',
      'drop .drop .wzrd': 'dropFile',
      'click .IWphase1 .backbtn': 'goBackHome'
    },
    ex00: function(evt) {
        this.switchToPhase1('00', evt); //tickets - tickets
        this.store('selectionURL', '/api/v2/imports/tickets/create_many.json');
    },
    ex01: function(evt) {
        this.switchToPhase1('01', evt); //tickets - dropdown
        this.store('selectionURL', '/api/v2/ticket_fields.json');
    },
    ex10: function(evt) {
        this.switchToPhase1('10', evt); //users - dropdown
        this.store('selectionURL', '/api/v2/user_fields.json');
    },
    ex20: function(evt) {
        this.switchToPhase1('20', evt); //organizations - dropdown
        this.store('selectionURL', '/api/v2/organization_fields.json');
    },
    ex30: function(evt) {
        this.switchToPhase1('30', evt); //voice - placeholder
    },
    ex40: function(evt) {
        this.switchToPhase1('40', evt); //zopim - placeholder
    },
    switchBackground: function(color){
        this.$('.inheritbkgd').css('background-color', color);
    },
    findselectionbyTypeID: function(id){
        var selection = id.charAt(0);
        switch(selection) {
            case '0':
                selection = 'tickets';
                break;
            case '1':
                selection = 'users';
                break;
            case '2':
                selection = 'organizations';
                break;
            case '3':
                selection = 'voice';
                break;
            case '4':
                selection = 'zopim';
                break;
        }
        return selection;
    },
    findOptionsBySelection: function(id) {
        var selection = id.charAt(0);
        var options = [];
        switch(selection) {
            case '0': //tickets
                options = ['Dropdown Field', 'Tickets'];
                break;
            case '1': // users
                options = ['Dropdown Field'];
                break;
            case '2': // organizations
                options = ['Dropdown Field'];
                break;
            case '3': //voice
                options = ['Many Greetings'];
                break;
            case '4': // zopim
                options = ['Chats'];
                break;
        }
        return options;
    },
    sendMessage: function(type, what){
        services.notify("You have selected to " + type + " " + what + ".");
    },
    goBackHome: function(){
        this.switchTo('phase0');
        this.$('header.IWphase1')[0].classList.remove('IWphase1');
        this.$('header')[0].classList.add('IWphase0');
        this.switchBackground(this.store('brandingcolor'));
    },
    dropFile: function(evt){
        evt.preventDefault();
        this.getFileContents(evt);
    },
    allowDrop: function(evt) {
        evt.stopPropagation();
        evt.preventDefault();
    },
    prepareApp: function() {
        var that = this;
        var tabparent = "";
        var tabparent = this.$(that.$(that.$('#mainsection')[0].parentNode.parentNode.parentNode.parentNode).find('#tabs')[0]).find(".ember-view.tab.add")[0];
        var tabelem = tabparent ? tabparent : "";
        if (tabelem){
            var tabcolor = getComputedStyle(tabelem, null).getPropertyValue("background-color");
            if (tabcolor) {
                this.store('brandingcolor', tabcolor);
                this.switchBackground(tabcolor);
            }
        }
        this.$('#mainsection')[0].parentNode.style.padding = 0;
        this.$('#mainsection')[0].parentNode.style.marginTop = '0px';
        this.$('#mainsection')[0].parentNode.style.backgroundColor = '#e7e7e7';
    },
    switchToPhase: function(evt) {
        //start animation
        var that = this;
        if (this.$(".animateli").length > 0) {
            this.$(".animateli")[0].classList.add('hideli');
            setTimeout(function(){
                that.$(".hideli")[0].classList.remove('hideli');
            }, 150);
            this.$(".animateli")[0].classList.remove('animateli');
        }
        evt.currentTarget.classList.add('animateli');
    },
    switchToPhase1: function(typeids, evt) {
        if (evt.currentTarget.id.substring(0, 2) == "ex"){ //clicked from subtype menu?
            this.store('selection', evt.currentTarget.id.substring(2));
        } else {
             this.store('selection', typeids);
        }
        var typeid = this.store('selection');
        var selection = this.findselectionbyTypeID(typeid);
        var options = this.findOptionsBySelection(typeid);
        var selectedoption = parseInt(typeid.charAt(1))
        var title = selection.charAt(0).toUpperCase() + selection.slice(1);
        this.switchTo('phase1');
        this.$('#selectionpart')[0].innerHTML = '<div class="icon ' + selection + '"></div><span class="choice txt">' + title + '</span>';
        this.$('header')[0].classList.remove('IWphase0');
        this.$('header')[0].classList.add('IWphase1');
        this.switchBackground(this.store('brandingcolor'));
        var choices = false;
        for (var i = 0; i < options.length; i++) {
            if (!choices) {
                choices = '<li id="ex' + parseInt(typeid.charAt(0)) + i + '"' + (selectedoption == i ? 'class="selected"' : '') + '><a>' + options[i] + '</a></li>';
            } else {
                choices += '<li id="ex' + parseInt(typeid.charAt(0)) + i + '"' + (selectedoption == i ? 'class="selected"' : '') + '><a>' + options[i] + '</a></li>';
            }
        }
        this.$('.choice .subtype.dropdown-menu')[0].innerHTML = choices;
        this.sendMessage("import", selection);
    },
    uploadFile: function(e){
        e.preventDefault();
        e.stopPropagation();
        this.$('#upload:hidden').trigger('click');
    },
    getFileContents: function(evt){
        this.switchTo('phase2');
        if (typeof this.$('header.IWphase1')[0] !== 'undefined'){
            this.$('header.IWphase1')[0].classList.remove('IWphase1');
            this.$('header')[0].classList.add('IWphase2');
        }
        var that = this;
        var f =  evt.target.files ? evt.target.files[0] : evt.dataTransfer.files[0];
        if (f) {
            /* globals FileReader */
            var r = new FileReader();
            r.onload = function(e) {
                var c = e.target.result;
                var obj = that.CSVtoJSON(c, that.guessDelimiter(c));
                that.prepareUpload(obj);
            };
            r.readAsText(f);
            that.store('previewfile', null);
        }
    },
    prepareUpload: function(results){
        this.uploadTickets(results[2]["tickets"], "tickets");
    },
    uploadTickets: function(results, type){
        var n = 100;
        var lists = _.groupBy(results, function(element, index){
            return Math.floor(index/n);
        });
        lists = _.toArray(lists); //Added this to convert the returned object to an array.
        for (var i = 0; i < lists.length; i++){
            var o = {};
            o[ type ] = lists[i];
            /*jshint -W083 */
            this.promise(function(done, fail) {
                this.ajax('sendData', o).then(
                    function(results) {
                        console.dir(results);
                        // do something with the data
                        done();     // ok to save the ticket
                    },
                    function(results) {
                        console.dir(results.responseText);
                        done();     // failed, but save the ticket anyway
                    }
                );
            });
        }
    },
    guessDelimiter: function(text){
        var delimiters = [";",",","\t"];
        var count = [];
        _.each(delimiters, function(n, i){
            count[i] = text.split("\n")[0].split(n).length;
        });
        var max = count[0];
        var maxIndex = 0;
        for (var i = 1; i < count.length; i++){
            if (count[i] > max) {
                maxIndex = i;
                max = count[i];
            }
        }
        return delimiters[maxIndex];
    },
	CSVtoJSON: function(strData, strDelimiter){
        if( strData.substr(-1) !== "\n" ) strData += "\n";
        // Create a regular expression to parse the CSV values.
        var objPattern = new RegExp(
            (
                // Delimiters.
                "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                // Quoted fields.
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                // Standard fields.
                "([^\"\\" + strDelimiter + "\\r\\n]*))"
            ),
            "gi"
            );
        
        // Create an array to hold our data.
        var jsonData = [];
        //if importing tickets
        var jsonData2 = {};
        ///////////////// create the name of the object based on what is selected in the interface
        var sel = 'tickets';
        jsonData2[ sel ] = [];
        ////////////
        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null;
        var keys = [];
        var row = [];
        var results = [];
        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while ((arrMatches = objPattern.exec( strData )) !== null){
            // Get the delimiter that was found.
            var strMatchedDelimiter = arrMatches[ 1 ];

            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            var newRow = strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter);
            var strMatchedValue;
            if ( newRow ){
                // first row is the keys
                if(!keys.length){
                    keys = row;
                } else {
                    // Since we have reached a new row of data,
                    // add an empty row to our data array.
                    // combine row with keys
                    var data = {};
                    var data2 = {};
                    for (var i = 0; i < row.length; i++){
                        //store in array if preview is possible
                        if(!this.isFunction(row[i]) && typeof row[i] !== 'undefined'){
                            var contentB = row[i].toLowerCase();
                            if (contentB == "false"){
                                row[i] = false;
                            } else if (contentB == "true"){
                                row[i] = true;
                            }
                            data[ keys[i] ] = row[i];
                            if (keys[i].split("/").length > 1){
                                var d3 = keys[i].split("/");
                                var d3string = "data2";
                                //
                                for (var d = 0; d < d3.length; d++){
                                    var variable = d3string;
                                    var exec, condition;
                                    if (isNaN(d3[d])){
                                        if(!isNaN(d3[d - 1]) && d > 0){
                                            exec = d3string + " = {}";
                                            condition = "if (typeof " + variable + " == 'undefined'){" + exec + "}";
                                            /*jshint -W061 */
                                            eval(condition);
                                        }
                                        d3string += "['" + d3[d] +  "']";
                                    } else {
                                        //initialize object for previous d3 if it exists
                                        exec = d3string + " = [];";
                                        condition = "if (typeof " + variable + " == 'undefined'){" + exec + "}";
                                        /*jshint -W061 */
                                        eval(condition);
                                        d3string += "[" + d3[d] + "]";
                                    }
                                }
                                d3string += isNaN(row[i]) ? " = '" + row[i] + "'" : " = " + row[i];
                                /*jshint -W061 */
                                eval(d3string);
                            } else {
                                data2[ keys[i] ] = row[i];
                            }
                        }
                    }
                    jsonData.push( data );
                    //if importing tickets
                    jsonData2[ "tickets" ].push( data2 );
                }
                // eighter way reset the row
                row = [];
            }


            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).
            if (arrMatches[ 2 ]){

                // We found a quoted value. When we capture
                // this value, unescape any double quotes.
                strMatchedValue = arrMatches[ 2 ].replace(
                    new RegExp( "\"\"", "g" ),
                    "\""
                    );
            } else {
                // We found a non-quoted value.
                strMatchedValue = arrMatches[ 3 ];
            }
            // Now that we have our value string, let's add
            // it to the data array.
            row.push( strMatchedValue );
        }
        results.push(jsonData); //results[0]
        results.push(keys); //results[1]
        results.push(jsonData2); //results[2]
        // Return the parsed data.
        return( results );
    },
    isFunction: function(functionToCheck){
        var getType = {};
        return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    },
  };
}());
