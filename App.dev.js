Ext.define('RallyPokerApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    layout: 'fit', // Sets child tabpanel to 100% height

    initComponent: function() {
        this.callParent(arguments);
        this.teamMembers = {};
        this.ProjectStore = Ext.create('Rally.data.WsapiDataStore', {
            model: 'Project',
            fetch: ['TeamMembers'],
            filters: [
                { property: 'ObjectID', value: this.getContext().getProject().ObjectID }
            ],
            autoLoad: true,
            listeners: {
                beforeload: function(store) {
                    this.getEl().mask('Loading...');
                },
                load: this._loadProjectStore,
                scope: this
            }
        });
    },

    launch: function() {
        // @todo initialize dropdown list of iterations - default to current
        // Ext.create('Ext.Container', {
        //  items: [{xtype: 'rallyiterationcombobox'}],
        //  renderTo: Ext.getBody().dom
        // });

        // @todo initialize the list of stories - includes hashed messages
        this.add({
            xtype: 'tabpanel',
            renderTo: document.body,
            tabBar: {
                orientation: 'vertical',
            },
            tabPosition: 'left',
            plain: true,
            items: [{
                title: 'Foo'
            }, {
                title: 'Bar',
                tabConfig: {
                    title: 'Custom Title',
                    tooltip: 'A button tooltip' // not working?
                }
            }]
        });

        // @todo fetch TurnMessages embedded in DiscussionStream 
        // this.DiscussionStore = Ext.create('Rally.data.WsapiDataStore', {
        //  model: 'ConversationPost',
        //  fetch: ['Text'],
        //  // filters: [
        //  //  { property: 'Artifact', value: this.getContext().getProject().ObjectID }
        //  // ],
        //  autoLoad: true,
        //  listeners: {
        //      // beforeload: function(store) {
        //      //  this.getEl().mask('Loading...');
        //      // },
        //      load: this._loadDiscussionStore,
        //      scope: this
        //  }
        // });

        // Example message contents: UserID + 4-bit point-selection value
        var message = [this.getContext().getUser().ObjectID, 020];
        var encoded = this.TurnMessage.compile(message, this.Base62.encode);
        var decoded = this.TurnMessage.decompile(encoded, this.Base62.decode);
        this.add({
            xtype: 'component',
            html: message.join(" + ") + "<br />" + encoded + "<br />" + decoded.join(" + "), // 'Welcome to the poker table!',
            listeners: {
                afterrender: function() {
                    Ext.create('Rally.ui.tooltip.ToolTip', {
                        target: this.getEl(), //Ext.getCmp('appwrapper'),
                        html: 'Click the gear to view it fullscreen!',
                        closableOnce: true,
                        closeAction: 'destroy',
                        autoShow: true,
                        shadow: 'drop',
                        // defaultAlign: 'tr-tr',
                    });
                }
            },
        });
        // @todo initialize poker deck - map point values, set up card presentation
        // @tooo initialize Team Members - thumbnails for 'chat heads'
    },

    /**
     * Base-62 lib to obfuscate numeric strings for turn-based messaging
     * All praises due - https://github.com/andrew/base62.js
     */
    Base62: (function (){
        var chars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
        return {
            encode: function(i){
                if (i === 0) {return '0'}
                var s = '';
                while (i > 0) {
                    s = chars[i % 62] + s;
                    i = Math.floor(i/62);
                }
                return s;
            },
            decode: function(a,b,c,d){
                for (
                    b = c = (a === (/\W|_|^$/.test(a += "") || a)) - 1;
                    d = a.charCodeAt(c++);
                ) {
                    b = b * 62 + d - [, 48, 29, 87][d >> 5];
                }
                return b
            },
        };
    }()),

    /**
     * Unix Timestamp + strings from arguments
     * ==> encoded message + custom delimiters
     */
    TurnMessage: (function (){
        var sep = ["/", "&"];
        return {
            compile: function(M){
                var i, ln = M.unshift(new Date().getTime()), s = "";
                for (i = 0; i < ln; i++) {
                    s += (sep[i] || sep[1]) + (arguments[1] ? arguments[1](M[i]) : M[i]);
                }
                return s;
            },
            decompile: function(s){
                var r = new RegExp("^" + sep[0] + "\\w+(?:" + sep[1] + "\\w+)+$");
                if (!r.test(s)) {return false}
                var M = s.slice(1).split(sep[1]);
                if (arguments[1]) {
                    var i, ln = M.length;
                    for (i = 0; i < ln; i++) {
                        M[i] = arguments[1](M[i]);
                    }
                }
                return M;
            },
        };
    }()),

    _loadProjectStore: function(store, result, success) {
        if(success) {
            var t = result[0].data.TeamMembers,
                uid;
            for(var i=0; i<t.length; i++) {
                uid = t[i]._ref.match(/\d+$/)[0];
                this.teamMembers[uid] = t[i];
            }

            var welcome = 'You are a ' + (this.teamMembers.hasOwnProperty(this.getContext().getUser().ObjectID) ? 'Pig. Oink, oink.' : 'Chicken. Try harder!');
            this.add({
                xtype: 'component',
                html: welcome,
            });

            this.getEl().unmask();
        }
    },

    _loadDiscussionStore: function(store, result, success) {
        if(success) {}
    },
});
