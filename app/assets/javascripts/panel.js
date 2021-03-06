//when signed out, or session expires forward to sign in page
Ext.Ajax.on('requestexception', function(conn, response, options) {
  if (response.status === 401 && response.statusText === "Unauthorized") { window.location = '/users/sign_in'; }
}, this);

//Override default netzke time entry field
Ext.define('Ext.ux.form.field.DateTime', {
    extend:'Ext.form.FieldContainer',
    mixins:{
        field:'Ext.form.field.Field'
    },
    alias: 'widget.xdatetime',

    //configurables

    combineErrors: true,
    msgTarget: 'under',
    layout: 'hbox',
    readOnly: false,

    dateFormat: 'Y-m-d',
    dateSubmitFormat: 'Y-m-d',
    timeFormat: 'H:i:s',
    timeSubmitFormat: 'H:i:s',
    dateConfig:{},
    timeConfig:{},


    // properties

    dateValue: null, // Holds the actual date

    dateField: null,

    hourField: null,
    minuteField: null,
    ampmField: null,

    initComponent: function(){
        var me = this
            ,i = 0
            ,key
            ,tab;

        me.items = me.items || [];

        me.dateField = Ext.create('Ext.form.field.Date', Ext.apply({
            format:me.dateFormat,
            flex:1,
            isFormField:false, //exclude from field query's
            submitValue:false,
            submitFormat: me.dateSubmitFormat,
            readOnly: me.readOnly
        }, me.dateConfig));
        me.items.push(me.dateField);

        me.hourField = Ext.create('Ext.form.field.Number', {
                maxWidth: 25,
                allowBlank: false,
                allowOnlyWhitespace: false,
                blankText: "Hour cannot be blank.",
                allowDecimals: false,
                maxValue: 12,
                minValue: 1,
                maxLength: 2,
                enforceMaxLength: 2,
                hideTrigger: true,
                submitValue:false,
                flex:1,
                fieldStyle:     "text-align:right;",
                isFormField:false, //exclude from field query's
            });
        me.items.push(me.hourField);

        me.colon = Ext.create('Ext.draw.Text', {
                text: ':',
                padding: '3 3 0 3'
          });
        me.items.push(me.colon);

        me.minuteField = Ext.create('Ext.form.field.Text', {
                maxWidth: 30,
                allowBlank: false,
                allowOnlyWhitespace: false,
                blankText: "Minutes cannot be blank.",
                regex: /[012345]\d/,
                maxLength: 2,
                enforceMaxLength: 2,
                submitValue:false,
                flex:1,
                isFormField:false, //exclude from field query's
            });
        me.items.push(me.minuteField);


        me.ampmField = Ext.create('Ext.form.ComboBox', {
              maxWidth: 45,
              value: 'PM',
              store: ['AM', 'PM'],
              forceSelection: true,
              flex:1,
              editable: false
          });

        me.items.push(me.ampmField);

        for (; i < me.items.length; i++) {
            me.items[i].on('focus', Ext.bind(me.onItemFocus, me));
            me.items[i].on('blur', Ext.bind(me.onItemBlur, me));
            me.items[i].on('specialkey', function(field, event){
                key = event.getKey();
                tab = key == event.TAB;

                if (tab && me.focussedItem == me.dateField) {
                    event.stopEvent();
                    me.timeField.focus();
                    return;
                }

                me.fireEvent('specialkey', field, event);
            });
        }

        me.callParent();

        // this dummy is necessary because Ext.Editor will not check whether an inputEl is present or not
        this.inputEl = {
            dom: document.createElement('div'),
            swallowEvent:function(){}
        };

        me.initField();
    },

    focus:function(){
        this.callParent(arguments);
        this.dateField.focus();
    },

    onItemFocus:function(item){
        if (this.blurTask){
            this.blurTask.cancel();
        }
        this.focussedItem = item;
    },

    onItemBlur:function(item, e){
        var me = this;
        if (item != me.focussedItem){ return; }
        // 100ms to focus a new item that belongs to us, otherwise we will assume the user left the field
        me.blurTask = new Ext.util.DelayedTask(function(){
            me.fireEvent('blur', me, e);
        });
        me.blurTask.delay(100);
    },

    getValue: function(){
        var value = null
            ,date = this.dateField.getSubmitValue()
            ,time = null
            ,format;

        hour = this.hourField.getValue();
        minute = this.minuteField.getValue();
        ampm = this.ampmField.getValue();
        time = Ext.Date.parse(hour + " " + minute + " " + ampm, 'g i A');
        time = Ext.Date.format(time, this.timeSubmitFormat);

        if (date){
            if (time){
                format = this.getFormat();
                value = Ext.Date.parse(date + ' ' + time, format);
            } else {
                value = this.dateField.getValue();
            }
        }
        return value;
    },

    getSubmitValue: function(){
//        var value = this.getValue();
//        return value ? Ext.Date.format(value, this.dateTimeFormat) : null;

        var me = this
            ,format = me.getFormat()
            ,value = me.getValue();

        return value ? Ext.Date.format(value, format) : null;
    },

    setValue: function(value){
        if (Ext.isString(value) || Ext.isDate(value)){

            if( Ext.isDate(value)){
              dt = value;
            }else{
              dt = new Date(value);
              value = Ext.Date.parse(value, this.getFormat()); //this.dateTimeFormat
            }
            this.dateField.setValue(value);

            hour = Ext.Date.format(dt, 'g');
            minute = Ext.Date.format(dt, 'i');
            ampm = Ext.Date.format(dt, 'A');

            this.hourField.setValue(hour);
            this.minuteField.setRawValue(minute);
            this.ampmField.setValue(ampm);
        }
    },

    getFormat: function(){
        value = (this.dateField.submitFormat || this.dateField.format) + " " + (this.timeSubmitFormat || this.timeFormat);
        return value;
    },

    // Bug? A field-mixin submits the data from getValue, not getSubmitValue
    getSubmitData: function(){
        var me = this
            ,data = null;

        if (!me.disabled && me.submitValue && !me.isFileUpload()) {
            data = {};
            data[me.getName()] = '' + me.getSubmitValue();
        }
        return data;
    }
});



Ext.define('Ext.ux.form.field.ColorCombo', {
    extend:'Ext.form.FieldContainer',
    mixins:{
        field:'Ext.form.field.Field'
    },
    alias: 'widget.xcolorcombo',

    //configurables
    combineErrors: true,
    msgTarget: 'under',
    layout: 'hbox',
    readOnly: false,

    // properties
    colorValue: null,
    /**
     * @property dateField
     * @type Ext.form.field.Date
     */
    colorField: null,

    initComponent: function(){
        var me = this
            ,i = 0
            ,key
            ,tab;

        me.items = me.items || [];

        me.colorField = Ext.create('Ext.form.field.Trigger', {
            flex:1,
            isFormField:false, //exclude from field query's
            submitValue:false,
            readOnly: me.readOnly,
            onTriggerClick: function() {
              //show renders, so put first
              me.picker.show();
              me.picker.alignTo(me.colorField.inputEl);
            }
        });
        me.items.push(me.colorField);

        me.picker = Ext.create('Ext.picker.Color', {
          renderTo: document.body,
          floating: true,
          hidden: true,
          style: {
            backgroundColor: "#fff"
          },
          listeners: {
            scope:this,
            select: function(field, value, opts){
              me.setValue(value);
              me.picker.hide();
            }
          }
        });
        me.items.push(me.picker);

        for (; i < me.items.length; i++) {
            me.items[i].on('focus', Ext.bind(me.onItemFocus, me));
            me.items[i].on('blur', Ext.bind(me.onItemBlur, me));
            me.items[i].on('specialkey', function(field, event){
                key = event.getKey();
                tab = key == event.TAB;

                if (tab && me.focussedItem == me.dateField) {
                    event.stopEvent();
                    me.timeField.focus();
                    return;
                }

                me.fireEvent('specialkey', field, event);
            });
        }

        me.callParent();

        // this dummy is necessary because Ext.Editor will not check whether an inputEl is present or not
        this.inputEl = {
            dom: document.createElement('div'),
            swallowEvent:function(){}
        };

        me.initField();
    },
    focus:function(){
        this.callParent(arguments);
        this.colorField.focus();
        var me = this;
    },

    onItemFocus:function(item){
        if (this.blurTask){
            this.blurTask.cancel();
        }
        this.focussedItem = item;
    },

    onItemBlur:function(item, e){
        var me = this;
        if (item != me.focussedItem){ return; }
        // 100ms to focus a new item that belongs to us, otherwise we will assume the user left the field
        me.blurTask = new Ext.util.DelayedTask(function(){
            me.picker.hide();
            me.fireEvent('blur', me, e);
        });
        me.blurTask.delay(100);
    },

    getValue: function(){
        var value = null
            ,color = this.colorField.getSubmitValue();

        if (color){
          value = this.colorField.getValue();
        }
        return value;
    },

    getSubmitValue: function(){
//        var value = this.getValue();
//        return value ? Ext.Date.format(value, this.dateTimeFormat) : null;

        var me = this
            ,value = me.getValue();

        return value;
    },

    setValue: function(value){
        this.colorField.setValue(value);
    },
    // Bug? A field-mixin submits the data from getValue, not getSubmitValue
    getSubmitData: function(){
        var me = this
            ,data = null;

        if (!me.disabled && me.submitValue && !me.isFileUpload()) {
            data = {};
            data[me.getName()] = '' + me.getSubmitValue();
        }
        return data;
    }
});
