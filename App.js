// Generated by CoffeeScript 1.6.2
Ext.define('RallyPokerApp', {
  extend: 'Rally.app.App',
  id: 'RallyPokerApp',
  componentCls: 'app',
  models: [],
  layout: 'card',
  items: [
    {
      id: 'storypicker',
      layout: {
        reserveScrollbar: true
      },
      autoScroll: true,
      dockedItems: [
        {
          items: [
            {
              id: 'iterationfilter',
              xtype: 'toolbar'
            }
          ]
        }
      ]
    }, {
      id: 'storyview',
      layout: {
        reserveScrollbar: true
      },
      autoScroll: true,
      dockedItems: [
        {
          items: [
            {
              id: 'storyheader',
              xtype: 'toolbar',
              items: [
                {
                  id: 'storyback',
                  xtype: 'button',
                  html: 'Back'
                }, {
                  id: 'storytitle',
                  xtype: 'component'
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  Base62: (function() {
    var chars;

    chars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    return {
      encode: function(i) {
        var s;

        if (i === 0) {
          return;
        }
        s = '';
        while (i > 0) {
          s = chars[i % 62] + s;
          i = Math.floor(i / 62);
        }
        return s;
      },
      decode: function(a, b, c, d) {
        for (
          b = c = (a === (/\W|_|^$/.test(a += "") || a)) - 1;
          d = a.charCodeAt(c++);
        ) {
          b = b * 62 + d - [, 48, 29, 87][d >> 5];
        }
        return b;
      }
    };
  })(),
  PokerMessage: (function() {
    var env, esc, msg, pkg, sep;

    esc = function(str) {
      return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    };
    sep = ['/', '&'];
    msg = new RegExp("^" + sep[0] + "\\w+(?:" + sep[1] + "\\w+)+$");
    env = ['[[', ']]'];
    pkg = new RegExp(esc(env[0]) + "(" + sep[0] + ".+?)" + esc(env[1]));
    return {
      compile: function(M) {
        var a, fn, s;

        fn = arguments[1] || function(x) {
          return x;
        };
        a = Ext.clone(M);
        a[0] = sep[0] + fn(M[0]);
        s = a.length === 1 ? a[0] : a.reduce(function(p, c, i) {
          return p + sep[1] + fn(c);
        });
        return env[0] + s + env[1];
      },
      extract: function(s) {
        var a;

        if (s && (a = s.match(pkg))) {
          return a.pop();
        } else {
          return false;
        }
      },
      parse: function(s) {
        var M, i, _i, _len, _results;

        if (!msg.test(s)) {
          return false;
        }
        M = s.slice(1).split(sep[1]);
        if (arguments[1] == null) {
          return M;
        } else {
          _results = [];
          for (_i = 0, _len = M.length; _i < _len; _i += 1) {
            i = M[_i];
            _results.push(arguments[1](i));
          }
          return _results;
        }
      }
    };
  })(),
  launch: function() {
    var _this = this;

    this.IterationsStore = Ext.create('Rally.data.WsapiDataStore', {
      model: 'Iteration',
      fetch: ['Name'],
      sorters: [
        {
          property: 'Name',
          direction: 'DESC'
        }
      ],
      autoLoad: true,
      listeners: {
        load: function(store, result, success) {
          if (success) {
            _this.IterationFilter.setValue('Deprecated');
          }
        }
      }
    });
    this.IterationFilter = Ext.create('Ext.form.ComboBox', {
      fieldLabel: 'Iteration',
      store: this.IterationsStore,
      queryMode: 'local',
      displayField: 'Name',
      valueField: 'Name',
      listeners: {
        change: function(field, newValue, oldValue, options) {
          _this.StoriesStore.load({
            filters: [
              {
                property: 'Iteration.Name',
                value: newValue
              }
            ]
          });
        }
      }
    });
    this.down('#iterationfilter').add(this.IterationFilter);
    this.StoriesStore = Ext.create('Rally.data.WsapiDataStore', {
      model: 'User Story',
      fetch: ['ObjectID', 'FormattedID', 'Name'],
      sorters: [
        {
          property: 'Name',
          direction: 'DESC'
        }
      ]
    });
    this.StoryList = Ext.create('Ext.view.View', {
      store: this.StoriesStore,
      tpl: new Ext.XTemplate('<tpl for=".">', '<div style="padding: .5em 0;" class="storylistitem" data-id="{ObjectID}">', '<span class="storylistitem-id">{FormattedID}: {Name}</span>', '</div>', '</tpl>'),
      itemSelector: 'div.storylistitem',
      emptyText: 'No stories available',
      listeners: {
        click: {
          element: 'el',
          fn: function(e, t) {
            var StoryListItem, storyListItemId, storyListItemName;

            StoryListItem = Ext.get(Ext.get(t).findParent('.storylistitem'));
            storyListItemName = StoryListItem.child('.storylistitem-id').getHTML();
            Ext.get('storytitle').update(storyListItemName);
            storyListItemId = StoryListItem.getAttribute('data-id');
            _this.CurrentStory.load({
              filters: [
                {
                  property: 'ObjectID',
                  value: storyListItemId
                }
              ]
            });
            _this.DiscussionsStore.load({
              filters: [
                {
                  property: 'Artifact.ObjectID',
                  value: storyListItemId
                }
              ]
            });
            _this.getLayout().setActiveItem('storyview');
          }
        }
      }
    });
    this.down('#storypicker').add(this.StoryList);
    Ext.getCmp('storyback').on('click', function() {
      _this.getLayout().setActiveItem('storypicker');
    });
    this.CurrentStory = Ext.create('Rally.data.WsapiDataStore', {
      model: 'userstory',
      limit: 1,
      fetch: ['ObjectID', 'LastUpdateDate', 'Description', 'Attachments', 'Notes', 'Discussion']
    });
    this.StoryPage = Ext.create('Ext.view.View', {
      store: this.CurrentStory,
      tpl: new Ext.XTemplate('<tpl for=".">', '<div class="storydetail" data-id="{ObjectID}">', '<small class="storydetail-date">Last Updated: {[this.prettyDate(values.LastUpdateDate)]}</small>', '<div class="storydetail-description">', '{Description}', '</div>', '<div class="storydetail-attachments">', '<h3>Attachments<h3>{Attachments}', '</div>', '<div class="storydetail-notes">', '<h3>Notes<h3>{Notes}', '</div>', '</div>', '</tpl>', {
        prettyDate: function(date) {
          var day_diff, diff;

          diff = ((new Date()).getTime() - date.getTime()) / 1000;
          day_diff = Math.floor(diff / 86400);
          if (isNaN(day_diff) || day_diff < 0 || day_diff >= 31) {
            return;
          }
          return day_diff === 0 && (diff < 60 && "just now" || diff < 120 && "1 minute ago" || diff < 3600 && Math.floor(diff / 60) + " minutes ago" || diff < 7200 && "1 hour ago" || diff < 86400 && Math.floor(diff / 3600) + " hours ago") || day_diff === 1 && "Yesterday" || day_diff < 7 && day_diff + " days ago" || day_diff < 31 && Math.ceil(day_diff / 7) + " weeks ago";
        }
      }),
      itemSelector: 'div.storydetail'
    });
    this.down('#storyview').add(this.StoryPage);
    this.DiscussionMessageField = new Ext.data.Field({
      name: 'Message',
      type: 'string',
      convert: function(v, rec) {
        var message;

        if (message = _this.PokerMessage.extract(rec.get('Text'))) {
          return (_this.PokerMessage.parse(message, _this.Base62.decode)).pop();
        } else {
          return false;
        }
      }
    });
    Rally.data.ModelFactory.getModel({
      type: 'conversationpost',
      success: function(Model) {
        _this.models['conversationpost'] = Ext.clone(Model);
        Model.prototype.fields.items.push(_this.DiscussionMessageField);
        Model.setFields(Model.prototype.fields.items);
      }
    });
    this.DiscussionsStore = Ext.create('Rally.data.WsapiDataStore', {
      model: 'conversationpost',
      fetch: ['User', 'CreationDate', 'Text', 'Message']
    });
    this.DiscussionThread = Ext.create('Ext.view.View', {
      store: this.DiscussionsStore,
      tpl: new Ext.XTemplate('<tpl for=".">', '<tpl if="Message !== false">', '<tpl if="!this.shownMessages">{% this.shownMessages = true %}', '<div class="messagethread">', '<h3>Who\'s Voted</h3>', '<ul class="messageitems">', '</tpl>', '</tpl>', '<tpl if="xindex == xcount && this.shownMessages">', '<tpl for="whoVoted">', '<li>{name} at {when}</li>', '</tpl>', '</ul>', '</div>', '</tpl>', '</tpl>', '<div id="messageaddnew"></div>', '<tpl for=".">', '<tpl if="Message === false">', '<tpl if="!this.shownDiscussion">{% this.shownDiscussion = true %}', '<div class="discussionthread">', '<h3>Discussion</h3>', '</tpl>', '<div class="discussionitem">', '<small class="discussionitem-id">{User._refObjectName}: {CreationDate}</small>', '<p class="discussionitem-text">{Text}</p>', '</div>', '</tpl>', '<tpl if="xindex == xcount && this.shownDiscussion">', '</div>', '</tpl>', '</tpl>', {
        accountRef: "/user/" + Rally.environment.getContext().getUser().ObjectID,
        accountVoted: false,
        shownMessages: false,
        shownDiscussion: false,
        whoVoted: {}
      }),
      prepareData: function(data, index, record) {
        var D, V, k, _i, _len, _ref;

        if (data.Message) {
          var timestamp = data.CreationDate.getTime();
          if ((this.tpl.whoVoted[data.User._ref] == null) || timestamp > this.tpl.whoVoted[data.User._ref].when) {
            this.tpl.whoVoted[data.User._ref] = {
              when: timestamp,
              user: data.User._ref,
              name: data.User._refObjectName,
              vote: data.Message
            };
          }
        }
        if (index + 1 === this.store.data.length) {
          var whenVoted = [], voteMap = {};
          data.whoVoted = [];
          _ref = this.tpl.whoVoted;
          for (k in _ref) {
            V = _ref[k];
            if (k === this.tpl.accountRef) {
              this.tpl.accountVoted = V.vote;
            }
            if (this.tpl.whoVoted.hasOwnProperty(k)) {
              whenVoted.push(V.when);
              voteMap[V.when] = V;
            }
          }
          whenVoted.sort();
          for (_i = 0, _len = whenVoted.length; _i < _len; _i++) {
            k = whenVoted[_i];
            D = new Date(voteMap[k].when);
            voteMap[k].when = Ext.util.Format.date(D, 'g:iA') + ' on ' + Ext.util.Format.date(D, 'm-d-Y');
            data.whoVoted.push(voteMap[k]);
          }
        }
        return data;
      },
      listeners: {
        refresh: function() {
          this.StoryEstimator = Ext.create('RallyPokerApp.EstimateSelector', {
            cipher: Rally.environment.getContext().getUser().ObjectID % 10,
            renderTo: Ext.query('#messageaddnew')[0]
          });
          this.StoryEstimator.update({
            vote: this.tpl.accountVoted
          });
        }
      },
      itemSelector: 'div.discussionitem'
    });
    this.down('#storyview').add(this.DiscussionThread);
  }
});

Ext.define('RallyPokerApp.EstimateSelector', {
  extend: 'Ext.Container',
  cls: 'estimateselector',
  config: {
    cipher: 0,
    deck: [
      {
        value: 00,
        label: '?'
      }, {
        value: 01,
        label: '0'
      }, {
        value: 02,
        label: '&#189;'
      }, {
        value: 03,
        label: '1'
      }, {
        value: 04,
        label: '2'
      }, {
        value: 05,
        label: '3'
      }, {
        value: 06,
        label: '5'
      }, {
        value: 07,
        label: '8'
      }, {
        value: 010,
        label: '13'
      }, {
        value: 011,
        label: '20'
      }, {
        value: 012,
        label: '40'
      }, {
        value: 013,
        label: '100'
      }
    ]
  },
  constructor: function(config) {
    this.mergeConfig(config);
    this.callParent([config]);
  },
  update: function(data) {
    var C, l, _i, _len, _ref;

    if (data.vote) {
      data.vote = this._decode(data.vote);
      this.callParent([data]);
    } else {
      this.callParent([data]);
      l = Ext.query('#messageaddnew')[0];
      _ref = this.config.deck;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        C = _ref[_i];
        Ext.create('Ext.Component', {
          id: 'pokercard-' + C.value,
          cls: 'pokercard',
          html: C.label,
          config: C,
          listeners: {
            click: {
              element: 'el',
              fn: this._onCardClick
            }
          },
          renderTo: l
        });
      }
    }
  },
  tpl: new Ext.XTemplate('<tpl for=".">', '<tpl if="vote">', '<h3>You voted: {vote}</h3>', '<tpl else>', '<h3>Cast your vote</h3>', '</tpl>', '</tpl>'),
  _encode: function(v) {
    return (v + this.config.cipher) % this.config.deck.length;
  },
  _decode: function(v) {
    return this.config.deck[(v = (v - this.config.cipher) % this.config.deck.length) < 0 ? this.config.deck.length + v : v].label;
  },
  _onCardClick: function(e, t) {
    var App, compiled, message, record;

    App = Ext.getCmp('RallyPokerApp');
    message = [new Date().getTime(), this.config.accountId, Ext.getCmp(t.id).config.value];
    compiled = App.PokerMessage.compile(message, App.Base62.encode);
    record = Ext.create(App.models['conversationpost']);
    record.set({
      Artifact: App.CurrentStory.data.keys[0],
      User: this.config.accountId,
      Text: 'Pointed this story with RallyPoker.<span style="display:none">' + encodeURIComponent(compiled) + '<\/span>'
    });
    record.save({
      failure: function(b, o) {
        debugger;        alert('Error submitting your estimate.');
      }
    });
  }
});
