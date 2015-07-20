module.exports = {
    avinash: "Avinash",
    
    client : null,
    
    id : 0,
    
    requests: {},

    clientDataHandler: function clientDataHandler(data){
        console.log(data);
    },

    clientErrorHandler: function clientErrorHandler(err){
        console.log(err);
    },

    idl: {},
    
    ovsdb_new_request: function ovsdb_new_request(){
        var request = {};
        this.id++
        request['id'] = this.id;
        return request
    },
    
    ovsdb_send_request: function ovsdb_send_request(request){
        this.requests[request['id']] = request;
        this.client.write(JSON.stringify(request));
    },
    
    ovsdb_idl_add_table: function ovsdb_idl_add_table(table){
        var request = this.ovsdb_new_request();
        request['method'] = "monitor"
        request['params'] = ["OpenHalon", null,
            { "Open_vSwitch": { "columns": "hostname" } }];
        this.ovsdb_send_request(request);
    },

    ovsdb_idl_create: function ovsdb_idl_create(remote, monitor, retry){
        var net = require('net');
        this.client = new net.Socket();
        this.client.on('data', this.clientDataHandler);
        this.client.on('error', this.clientErrorHandler);
        this.client.connect({ port: remote });
        return this.idl;
    },

    ovsdb_list_dbs: function ovsdb_list_dbs(){
        var request = this.ovsdb_new_request();
        request['method'] = "list_dbs";
        request['params'] = [];
        this.ovsdb_send_request(request);
    },

    ovsdb_list_dbs_handler: function ovsdb_list_dbs_handler(id){
        id = 0;
        this.id = id;
    },

    ovsdb_get_schema: function ovsdb_get_schema(db){
        var request = this.ovsdb_new_request();
        request['method'] = "get_schema";
        request['params'] = [db];
        this.ovsdb_send_request(request);
    },

    ovsdb_get_schema_handler: function ovsdb_get_schema_handler(id){

    },

    ovsdb_start_transaction: function ovsdb_start_transaction(){
        var txn = this.ovsdb_new_request();
        txn['method'] = "transact";
        txn['params'] = ["OpenHalon"];
        return txn;
    },
    
    ovsdb_commit_transaction: function ovsdb_commit_transaction(txn){
        return this.ovsdb_send_request(txn);
    },

    ovsdb_open_vswitch_set_hostname: function ovsdb_open_vswitch_set_hostname(txn, row, name){
        var uuid = Object.keys(row)[0];
        var t = { "where": [["_uuid", '==', ["uuid", uuid]]] };
        t["op"] = "update";
        t["row"] = { "hostname": name };
        t["table"] = "Open_vSwitch";
        txn['params'].push(t);
        return txn;
    },

    ovsdb_insert_open_vswitch: function ovsdb_insert_open_vswitch(row, uuid){
        var txn = this.ovsdb_start_transaction();
        var t = { "op": "insert", table: "Open_vSwitch" };
        if (row != null) {
            t['row'] = row;
        }
        else {
            t['row'] = {};
        }
        if (uuid != null) {
            t['uuid-name'] = uuid;
        }
        else {
            t['uuid-name'] = {};
        }
        txn['params'].push(t);
        return ovsdb_commit_transaction(txn);
    },

    ovsdb_delete_open_vswitch: function ovsdb_delete_open_vswitch(row){
        var uuid = Object.keys(row)[0];
        var txn = this.ovsdb_start_transaction();
        var t = { "where": [["_uuid", '==', ["uuid", uuid]]] };
        t["op"] = "delete";
        t["table"] = "Open_vSwitch";
        txn['params'].push(t);
        return ovsdb_commit_transaction(txn);
    }
}