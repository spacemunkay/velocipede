{
  initComponent: function(){
    // calling superclass's initComponent
    this.callParent();

    // setting the 'rowclick' event
    var view = this.getComponent('bikes').getView();
    view.on('itemclick', function(view, record){
      // The beauty of using Ext.Direct: calling 3 endpoints in a row, which results in a single call to the server!
      this.selectBike({bike_id: record.get('id')});
      if( this.queryById('bike_logs') ){
        this.queryById('bike_logs').getStore().load();
      }
      if( this.queryById('tasks') ){
        this.queryById('tasks').getStore().load();
      }
    }, this);
  }
}