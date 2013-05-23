// Generated by CoffeeScript 1.6.2
Ext.define('RallyPokerApp', {
  extend: 'Rally.app.App',
  componentCls: 'app',
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
            var StoryListItem, storyListItemName;

            StoryListItem = Ext.get(t).findParent('.storylistitem');
            storyListItemName = Ext.get(StoryListItem).child('.storylistitem-id').getHTML();
            Ext.get('storytitle').update(storyListItemName);
            _this.CurrentStory.load({
              filters: [
                {
                  property: 'ObjectID',
                  value: Ext.get(t).findParent('.storylistitem').getAttribute('data-id')
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
      fetch: ['ObjectID', 'LastUpdateDate', 'Description', 'Attachments', 'Notes', 'Discussion'],
      listeners: {
        load: function(store, result, success) {
          if (result[0].data.Discussion.length) {
            _this.DiscussionsStore.load({
              filters: [
                {
                  property: 'ObjectID',
                  value: result[0].data.Discussion[0].ObjectID
                }
              ]
            });
          }
        }
      }
    });
    this.StoryPage = Ext.create('Ext.view.View', {
      store: this.CurrentStory,
<<<<<<< HEAD
      tpl: new Ext.XTemplate('<tpl for=".">', '<div class="storydetail" data-id="{ObjectID}">', '<small class="storydetail-date">Last Updated: {LastUpdateDate}</small>', '<div class="storydetail-description">', '{Description}', '</div>', '<div class="storydetail-attachments">', '<h3>Attachments<h3>{Attachments}', '</div>', '<div class="storydetail-notes">', '<h3>Notes<h3>{Notes}', '</div>', '</div>', '</tpl>'),
=======
      tpl: new Ext.XTemplate('<tpl for=".">', '<div class="storydetail" data-id="{ObjectID}">', '<span class="storydetail-date">Last Updated: {[this.prettyDate(values.LastUpdateDate)]}</span>', '<div class="storydetail-description">', '{Description}', '</div>', '<div class="storydetail-attachments">', '<h3>Attachments<h3>{Attachments}', '</div>', '<div class="storydetail-notes">', '<h3>Notes<h3>{Notes}', '</div>', '<div class="storydetail-discussion">', '<h3>Discussion<h3>{Discussion}', '</div>', '</div>', '</tpl>', {
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
>>>>>>> gh-10
      itemSelector: 'div.storydetail'
    });
    this.down('#storyview').add(this.StoryPage);
    this.DiscussionsStore = Ext.create('Rally.data.WsapiDataStore', {
      model: 'conversationpost',
      fetch: ['User', 'CreationDate', 'Text']
    });
    this.DiscussionThread = Ext.create('Ext.view.View', {
      store: this.DiscussionsStore,
      tpl: new Ext.XTemplate('<div class="discussionthread">', '<h3>Discussion</h3>', '<tpl for=".">', '<div class="discussionitem">', '<small class="discussionitem-id">{User._refObjectName}: {CreationDate}</small>', '<p class="discussionitem-text">{Text}</p>', '</div>', '</tpl>', '</div>'),
      itemSelector: 'div.discussionitem'
    });
    this.down('#storyview').add(this.DiscussionThread);
  }
});
