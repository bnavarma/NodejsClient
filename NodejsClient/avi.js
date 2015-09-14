/* global ovsdb_request_handlers */
/* global clientUpdateHandler */
/* global clientRequestHandler */
/* global ovsdb_transact_request_handler */
/* global ovsdb_echo_request_handler */
/* global ovsdb_steal_request_handler */
/* global ovsdb_unlock_request_handler */
/* global ovsdb_lock_request_handler */
/* global ovsdb_get_schema_request_handler */
/* global ovsdb_monitor_cancel_request_handler */
/* global ovsdb_monitor_request_handler */
/* global ovsdb_commit */
/* global ovsdb_assert */
/* global ovsdb_comment */
/* global ovsdb_update */
/* global ovsdb_insert */
/* global ovsdb_delete */
/* global ovsdb_commit_transaction */
/* global ovsdb_start_transaction */
/* global ovsdb_get_schema */
/* global ovsdb_list_dbs_handler */
/* global ovsdb_list_dbs */
/* global ovsdb_echo */
/* global ovsdb_steal_lock */
/* global ovsdb_remove_lock */
/* global ovsdb_set_lock */
/* global ovsdb_idl_create */
/* global ovsdb_idl_cancel_monitor */
/* global ovsdb_idl_monitor_table */
/* global ovsdb_send_request */
/* global ovsdb_new_request */
/* global clientJSONHandler */
/* global clientDataHandler */
/* global have_lock */
/* global lock */
/* global monitor_requests */
/* global requests */
/* global monitor_id */
/* global id */
/* global client */
/* global avinash */
/* global indentation_level */
/* global buffer */
/* global idl */

idl = [];    
buffer = "";
indentation_level = 0;
avinash = "Avinash";
client = null;
id = 0;
monitor_id = 0;
requests = {};
monitor_requests = {};
lock = null;
have_lock = false;

clientDataHandler = function clientDataHandler(data){
    //console.log(data);
    for(var i = 0;i<data.length;i++){
        if(data[i] === '{'){
            indentation_level++;
            buffer += data[i];
        }
        else if(data[i] === '}'){
            indentation_level--;
            if(indentation_level === 0){
                buffer += data[i];
                clientJSONHandler(buffer);
                buffer = "";
            }
        }
        else{
            buffer += data[i];
        }
    }
};

clientJSONHandler = function clientJSONHandler(data){
    var obj = JSON.stringify(data);
    var ret = clientRequestHandler(obj);
    if(ret != true){
        console.log("Something went wrong");
    }
};

clientRequestHandler = function clientRequestHandler(obj){
      try{
          if(obj['id'] === null){
              return clientUpdateHandler(obj);
          }
          if(obj['error'] === null){
              console.log(obj['error']);
              delete monitor_requests[obj['id']];
              delete requests[obj['id']];
              return false;
          }
          ovsdb_request_handlers[requests[obj['id']][0]](obj);
          delete requests[obj['id']];
          delete requests[obj['id']];
      }
      catch(err){
          console.log(err);
          return false;
      }
};

clientUpdateHandler = function clientUpdateHandler(obj){
      
};

clientErrorHandler: function clientErrorHandler(err){
    console.log(err);
};

ovsdb_new_request = function ovsdb_new_request(){
    var request = {};
    id++
    request['id'] = id;
    return request
};    

ovsdb_send_request = function ovsdb_send_request(request, requestType){
    requests[request['id']] = [requestType,request];
    console.log(JSON.stringify(request));
    client.write(JSON.stringify(request));
};

ovsdb_idl_monitor_table = function ovsdb_idl_monitor_table(table){
    var request = ovsdb_new_request();
    request['method'] = "monitor"
    request['params'] = ["OpenHalon", monitor_id++,
        { table: {} }];
    monitor_requests[monitor_id] = request;
    ovsdb_send_request("monitor",request);
};

ovsdb_idl_monitor_table = function ovsdb_idl_monitor_column(table, column){
    var request = ovsdb_new_request();
    request['method'] = "monitor";
    request['params'] = ["OpenHalon", monitor_id++,
        { table: { "columns": column } }];
    monitor_requests[monitor_id] = request;
    ovsdb_send_request("monitor",request);
};

ovsdb_idl_cancel_monitor = function ovsdb_idl_cancel_monitor(id){
    var request = ovsdb_new_request();
    request['method'] = "monitor_cancel";
    request['params'] = id;
    ovsdb_send_request("monitor_cancel", request);
};

ovsdb_idl_create = function ovsdb_idl_create(remote, monitor, retry){
    var net = require('net');
    client = new net.Socket();
    client.on('data', clientDataHandler);
    client.on('error', clientErrorHandler);
    client.connect({ port: remote });
    return idl;
};

ovsdb_set_lock = function ovsdb_set_lock(id){
    var request = ovsdb_new_request();
    lock = id;
    request['method'] = "lock";
    request['params'] = [id];
    return ovsdb_send_request("lock",request);
};

ovsdb_remove_lock = function ovsdb_remove_lock(id){
    var request = ovsdb_new_request();
    lock = null;
    request['method'] = "unlock";
    request['params'] = [id];
    return ovsdb_send_request("unlock",request);
};

ovsdb_steal_lock = function ovsdb_steal_lock(id){
    var request = ovsdb_new_request();
    request['method'] = "steal";
    request['params'] = [id];
    return ovsdb_send_request("steal",request);
};

ovsdb_echo = function ovsdb_echo(){
    var request = ovsdb_new_request();
    request['method'] = "echo";
    request['params'] = { "Avi": "Why be a King, when you can be a God" };
    return ovsdb_send_request("echo",request);
};

ovsdb_list_dbs = function ovsdb_list_dbs(){
    var request = ovsdb_new_request();
    request['method'] = "list_dbs";
    request['params'] = [];
    ovsdb_send_request("list_dbs",request);
};

ovsdb_list_dbs_handler = function ovsdb_list_dbs_handler(id){
    id = 0;
    id = id;
};

ovsdb_get_schema = function ovsdb_get_schema(db){
    var request = ovsdb_new_request();
    request['method'] = "get_schema";
    request['params'] = [db];
    ovsdb_send_request("get_schema",request);
};

ovsdb_start_transaction = function ovsdb_start_transaction(){
    var txn = ovsdb_new_request();
    txn['method'] = "transact";
    txn['params'] = ["OpenHalon"];
    return txn;
};

ovsdb_commit_transaction = function ovsdb_commit_transaction(txn){
    if (lock != null) {
        ovsdb_assert(txn, lock);
    }
    return ovsdb_send_request("transact",txn);
};

ovsdb_delete = function ovsdb_delete(txn, table, rows){
    var conditions = [];
    for (var i = 0; i < rows.length; i++) {
        var uuid = Object.keys(rows[i])[0];
        conditions.push(["_uuid", "==", ["uuid", uuid]]);
    }
    var t = { "op": "delete", "table": table, "where": conditions };
    txn["params"].push(t);
    return txn;
};

ovsdb_insert = function ovsdb_insert(txn, table, row, uuid_name){
    if (row == null) {
        row = {};
    }
    var t = { "op": "insert", "table": table, "row": row };
    if (uuid_name != null) {
        t["uuid-name"] = uuid_name;
    }
    txn["params"].push(t);
    return txn;
};

ovsdb_update = function ovsdb_update(txn, table, old_row, new_row, conditions){
    var uuid = Object.keys(old_row)[0];
    var t = { "where": [["__uuid", "==", ["uuid", uuid]]] };
    t["op"] = "update";
    t["table"] = table;
    if (conditions != null) {
        for (var i = 0; i < conditions.length; i++) {
            t["where"].push(conditions[i]);
        }
    }
    txn["params"].push(t);
    return txn;
};

ovsdb_comment = function ovsdb_comment(txn, comment){
    var t = { "op": "comment", "comment": comment };
    txn["params"].push(t);
    return txn;
};

ovsdb_assert = function ovsdb_assert(txn, lock_id){
    var t = { "op": "assert", "lock": lock_id };
    txn["params"].push(t);
    return txn;
};

ovsdb_commit = function ovsdb_commit(txn, durable){
    var t = { "op": "commit", "durable": durable };
    txn["params"].push(t);
    return txn;
};

ovsdb_request_handlers = {
    "monitor": ovsdb_monitor_request_handler,
    "monitor_cancel": ovsdb_monitor_cancel_request_handler,
    "get_schema": ovsdb_get_schema_request_handler,
    "lock": ovsdb_lock_request_handler,
    "unlock": ovsdb_unlock_request_handler,
    "steal": ovsdb_steal_request_handler,
    "echo": ovsdb_echo_request_handler,
    "transact": ovsdb_transact_request_handler
};

ovsdb_monitor_request_handler = function ovsdb_monitor_request_handler(request){

};

ovsdb_monitor_cancel_request_handler = function ovsdb_monitor_cancel_request_handler(request){

};

ovsdb_get_schema_request_handler = function ovsdb_get_schema_request_handler(request){

};

ovsdb_lock_request_handler = function ovsdb_lock_request_handler(request){

};

ovsdb_unlock_request_handler = function ovsdb_unlock_request_handler(request){

};

ovsdb_steal_request_handler = function ovsdb_steal_request_handler(request){

};

ovsdb_echo_request_handler = function ovsdb_echo_request_handler(request){

};

ovsdb_transact_request_handler = function ovsdb_transact_request_handler(request){
    
};
module.exports = {
  
    sample: function sample(int){
        console.log(monitor_id);
    }
}

//{ "id":2,"method":"transact","params":["OpenHalon", { "lock":"halon_vtysh_1175","op":"assert"}, { "where":[["_uuid","==",["uuid","b10d9ca9-d2a3-4a56-8ae5-e6134a2aea06"]]],"row": { "hostname":"avi"},"op":"update","table":"Open_vSwitch"}]}
var schema = {"id":1,"result":{"cksum":"4176295192 103140","name":"OpenHalon","version":"0.1.8","tables":{"BGP_Router":{"isRoot":true,"indexes":[["vrf","asn"]],"columns":{"asn":{"type":{"key":{"minInteger":1,"maxInteger":4294967295,"type":"integer"}}},"redistribute":{"type":{"max":2,"min":0,"key":{"type":"string","enum":["set",["connected","static"]]}}},"deterministic_med":{"type":{"min":0,"key":"boolean"}},"status":{"ephemeral":true,"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"external_ids":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"other_config":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"router_id":{"type":{"min":0,"key":{"maxLength":15,"type":"string"}}},"networks":{"type":{"max":"unlimited","min":0,"key":{"maxLength":49,"type":"string"}}},"maximum_paths":{"type":{"min":0,"key":{"minInteger":1,"maxInteger":255,"type":"integer"}}},"vrf":{"type":{"key":{"type":"uuid","refTable":"VRF"}}},"gr_stale_timer":{"type":{"min":0,"key":{"minInteger":1,"maxInteger":3600,"type":"integer"}}},"always_compare_med":{"type":{"min":0,"key":"boolean"}},"timers":{"type":{"max":2,"min":0,"key":"string","value":"integer"}}}},"Radius_Server":{"indexes":[["ip_address"]],"columns":{"passkey":{"type":{"min":0,"key":{"maxLength":32,"type":"string"}}},"retries":{"type":{"min":0,"key":{"minInteger":0,"maxInteger":5,"type":"integer"}}},"udp_port":{"type":{"min":0,"key":{"minInteger":0,"maxInteger":65535,"type":"integer"}}},"priority":{"type":{"key":{"minInteger":0,"maxInteger":64,"type":"integer"}}},"timeout":{"type":{"min":0,"key":{"minInteger":1,"maxInteger":60,"type":"integer"}}},"ip_address":{"mutable":false,"type":"string"}}},"BGP_Route":{"isRoot":true,"indexes":[["vrf","prefix","peer"]],"columns":{"sub_address_family":{"mutable":false,"type":{"min":0,"key":{"type":"string","enum":["set",["multicast","unicast","vpn"]]}}},"prefix":{"mutable":false,"type":{"key":{"maxLength":49,"type":"string"}}},"distance":{"mutable":false,"type":{"min":0,"key":{"minInteger":0,"maxInteger":255,"type":"integer"}}},"bgp_nexthops":{"type":{"max":"unlimited","min":0,"key":{"type":"uuid","refTable":"BGP_Nexthop"}}},"address_family":{"mutable":false,"type":{"min":0,"key":{"type":"string","enum":["set",["ipv4","ipv6"]]}}},"peer":{"type":{"key":{"maxLength":45,"type":"string"}}},"vrf":{"mutable":false,"type":{"key":{"refType":"weak","type":"uuid","refTable":"VRF"}}},"path_attributes":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"metric":{"mutable":false,"type":{"min":0,"key":{"minInteger":0,"maxInteger":4294967295,"type":"integer"}}}}},"Open_vSwitch":{"maxRows":1,"isRoot":true,"columns":{"statistics":{"ephemeral":true,"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"bufmon_config":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"aaa":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"next_cfg":{"type":"integer"},"asset_tag_number":{"type":"string"},"boot_time":{"type":"integer"},"hostname":{"type":"string"},"management_vrf":{"type":{"min":0,"key":{"type":"uuid","refTable":"VRF"}}},"vrfs":{"type":{"max":"unlimited","min":0,"key":{"type":"uuid","refTable":"VRF"}}},"status":{"ephemeral":true,"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"external_ids":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"daemons":{"type":{"max":"unlimited","min":0,"key":{"type":"uuid","refTable":"Daemon"}}},"manager_options":{"type":{"max":"unlimited","min":0,"key":{"type":"uuid","refTable":"Manager"}}},"logrotate_config":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"lldp_statistics":{"ephemeral":true,"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"cur_cfg":{"type":"integer"},"mgmt_intf":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"radius_servers":{"type":{"max":64,"min":0,"key":{"type":"uuid","refTable":"Radius_Server"}}},"auto_provisioning_status":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"lacp_config":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"dns_servers":{"type":{"max":"unlimited","min":0,"key":"string"}},"db_version":{"type":{"min":0,"key":"string"}},"next_hw":{"type":"integer"},"cur_hw":{"type":"integer"},"bridges":{"type":{"max":"unlimited","min":0,"key":{"type":"uuid","refTable":"Bridge"}}},"mgmt_intf_status":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"subsystems":{"type":{"max":"unlimited","min":0,"key":{"type":"uuid","refTable":"Subsystem"}}},"bufmon_info":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"other_config":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"management_mac":{"type":{"key":{"maxLength":17,"minLength":17,"type":"string"}}},"software_info":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"ssl":{"type":{"min":0,"key":{"type":"uuid","refTable":"SSL"}}},"switch_version":{"type":{"min":0,"key":"string"}},"ecmp_config":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"system_mac":{"type":{"key":{"maxLength":17,"minLength":17,"type":"string"}}}}},"Route_Map":{"isRoot":true,"indexes":[["name"]],"columns":{"name":{"type":{"key":{"maxLength":80,"type":"string"}}},"external_ids":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"other_config":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"status":{"ephemeral":true,"type":{"max":"unlimited","min":0,"key":"string","value":"string"}}}},"Temp_sensor":{"indexes":[["name"]],"columns":{"name":{"mutable":false,"type":"string"},"fan_state":{"ephemeral":true,"type":{"key":{"type":"string","enum":["set",["fast","max","medium","normal"]]}}},"location":{"type":"string"},"min":{"type":"integer"},"other_config":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"status":{"ephemeral":true,"type":{"min":0,"key":{"type":"string","enum":["set",["critical","emergency","fault","low_critical","max","min","normal","uninitialized"]]}}},"external_ids":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"temperature":{"type":"integer"},"max":{"type":"integer"},"hw_config":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}}}},"BGP_Nexthop":{"columns":{"ip_address":{"mutable":false,"type":{"min":0,"key":{"maxLength":45,"type":"string"}}},"type":{"type":{"min":0,"key":{"type":"string","enum":"unicast"}}}}},"Neighbor":{"isRoot":true,"indexes":[["vrf","ip_address"]],"columns":{"vrf":{"type":{"key":{"refType":"weak","type":"uuid","refTable":"VRF"}}},"mac":{"type":{"min":0,"key":"string"}},"port":{"type":{"min":0,"key":{"refType":"weak","type":"uuid","refTable":"Port"}}},"state":{"type":{"min":0,"key":{"type":"string","enum":["set",["failed","incomplete","permanent","reachable","stale"]]}}},"status":{"ephemeral":true,"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"ip_address":{"type":{"key":{"maxLength":45,"type":"string"}}},"address_family":{"type":{"min":0,"key":{"type":"string","enum":["set",["ipv4","ipv6"]]}}}}},"DHCPSrv_Static_Host":{"indexes":[["ip_address"]],"columns":{"client_id":{"type":{"min":0,"key":"string"}},"lease_duration":{"type":{"min":0,"key":"integer"}},"client_hostname":{"type":{"min":0,"key":"string"}},"mac_addresses":{"type":{"max":"unlimited","min":0,"key":{"maxLength":17,"minLength":17,"type":"string"}}},"set_tags":{"type":{"max":"unlimited","min":0,"key":"string"}},"ip_address":{"type":{"key":{"maxLength":45,"type":"string"}}}}},"Route_Map_Entries":{"isRoot":true,"indexes":[["route_map","preference"]],"columns":{"description":{"type":{"min":0,"key":{"maxLength":80,"type":"string"}}},"status":{"ephemeral":true,"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"set":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"external_ids":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"other_config":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"preference":{"type":"integer"},"exitpolicy":{"type":{"min":0,"key":{"type":"string","enum":["set",["goto","next"]]}}},"match":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"action":{"type":{"key":{"type":"string","enum":["set",["deny","permit"]]}}},"goto_target":{"type":{"min":0,"key":{"type":"uuid","refTable":"Route_Map_Entries"}}},"call":{"type":{"min":0,"key":{"type":"uuid","refTable":"Route_Map_Entries"}}},"route_map":{"type":{"key":{"type":"uuid","refTable":"Route_Map"}}}}},"DHCPSrv_Match":{"columns":{"set_tag":{"type":"string"},"option_value":{"type":{"min":0,"key":"string"}},"option_number":{"type":{"min":0,"key":"integer"}},"option_name":{"type":{"min":0,"key":"string"}}}},"VLAN":{"indexes":[["name"]],"columns":{"name":{"mutable":false,"type":"string"},"description":{"type":{"min":0,"key":"string"}},"id":{"mutable":false,"type":{"key":{"minInteger":1,"maxInteger":4094,"type":"integer"}}},"other_config":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"oper_state_reason":{"type":{"min":0,"key":{"type":"string","enum":["set",["admin_down","no_member_port","ok","unknown"]]}}},"external_ids":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"admin":{"type":{"min":0,"key":{"type":"string","enum":["set",["down","up"]]}}},"oper_state":{"type":{"min":0,"key":{"type":"string","enum":["set",["down","unknown","up"]]}}},"internal_usage":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"hw_vlan_config":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}}}},"SSL":{"maxRows":1,"columns":{"bootstrap_ca_cert":{"type":"boolean"},"certificate":{"type":"string"},"private_key":{"type":"string"},"external_ids":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"ca_cert":{"type":"string"}}},"Nexthop":{"columns":{"selected":{"type":{"min":0,"key":"boolean"}},"external_ids":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"other_config":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"status":{"ephemeral":true,"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"type":{"type":{"min":0,"key":{"type":"string","enum":"unicast"}}},"weight":{"type":{"min":0,"key":{"minInteger":0,"maxInteger":4294967295,"type":"integer"}}},"ip_address":{"mutable":false,"type":{"min":0,"key":{"maxLength":45,"type":"string"}}},"ports":{"mutable":false,"type":{"max":"unlimited","min":0,"key":{"refType":"weak","type":"uuid","refTable":"Port"}}}}},"BGP_Neighbor":{"isRoot":true,"indexes":[["bgp_router","name"]],"columns":{"statistics":{"ephemeral":true,"type":{"max":"unlimited","min":0,"key":"string","value":"integer"}},"name":{"type":{"key":{"maxLength":80,"type":"string"}}},"tcp_port_number":{"type":{"min":0,"key":{"minInteger":0,"maxInteger":65535,"type":"integer"}}},"remote_as":{"type":{"min":0,"key":{"minInteger":1,"maxInteger":4294967295,"type":"integer"}}},"remove_private_as":{"type":{"min":0,"key":"boolean"}},"passive":{"type":{"min":0,"key":"boolean"}},"strict_capability_match":{"type":{"min":0,"key":"boolean"}},"password":{"type":{"min":0,"key":{"maxLength":80,"type":"string"}}},"is_peer_group":{"type":{"min":0,"key":"boolean"}},"maximum_prefix_limit":{"type":{"min":0,"key":{"minInteger":1,"maxInteger":4294967295,"type":"integer"}}},"capability":{"type":{"min":0,"key":{"type":"string","enum":["set",["dynamic","orf"]]}}},"description":{"type":{"min":0,"key":{"maxLength":80,"type":"string"}}},"bgp_peer_group":{"type":{"min":0,"key":{"type":"uuid","refTable":"BGP_Neighbor"}}},"override_capability":{"type":{"min":0,"key":"boolean"}},"advertisement_interval":{"type":{"min":0,"key":{"minInteger":0,"maxInteger":600,"type":"integer"}}},"other_config":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"external_ids":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"status":{"ephemeral":true,"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"shutdown":{"type":{"min":0,"key":"boolean"}},"weight":{"type":{"min":0,"key":{"minInteger":0,"maxInteger":65535,"type":"integer"}}},"bgp_router":{"type":{"key":{"type":"uuid","refTable":"BGP_Router"}}},"inbound_soft_reconfiguration":{"type":{"min":0,"key":"boolean"}},"allow_as_in":{"type":{"min":0,"key":{"minInteger":1,"maxInteger":10,"type":"integer"}}},"local_interface":{"type":{"min":0,"key":{"type":"uuid","refTable":"Interface"}}},"local_as":{"type":{"min":0,"key":{"minInteger":1,"maxInteger":4294967295,"type":"integer"}}},"route_maps":{"type":{"max":2,"min":0,"key":{"type":"string","enum":["set",["in","out"]]},"value":{"type":"uuid","refTable":"Route_Map"}}},"timers":{"type":{"max":2,"min":0,"key":"string","value":"integer"}}}},"bufmon":{"isRoot":true,"indexes":[["hw_unit_id","name"]],"columns":{"trigger_threshold":{"type":{"min":0,"key":{"minInteger":0,"type":"integer"}}},"name":{"type":"string"},"counter_value":{"ephemeral":true,"type":{"min":0,"key":{"minInteger":0,"type":"integer"}}},"counter_vendor_specific_info":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"hw_unit_id":{"type":"integer"},"status":{"type":{"min":0,"key":{"type":"string","enum":["set",["not-properly-configured","ok","triggered"]]}}},"enabled":{"type":"boolean"}}},"Interface":{"indexes":[["name"]],"columns":{"name":{"mutable":false,"type":"string"},"lldp_neighbor_info":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"statistics":{"ephemeral":true,"type":{"max":"unlimited","min":0,"key":"string","value":"integer"}},"lldp_statistics":{"ephemeral":true,"type":{"max":"unlimited","min":0,"key":"string","value":"integer"}},"options":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"type":{"type":{"key":{"type":"string","enum":["set",["internal","system"]]}}},"split_parent":{"type":{"min":0,"key":{"type":"uuid","refTable":"Interface"}}},"split_children":{"type":{"max":4,"min":0,"key":{"type":"uuid","refTable":"Interface"}}},"admin_state":{"ephemeral":true,"type":{"min":0,"key":{"type":"string","enum":["set",["down","up"]]}}},"error":{"type":{"min":0,"key":"string"}},"hw_intf_info":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"link_resets":{"ephemeral":true,"type":{"min":0,"key":"integer"}},"mac_in_use":{"ephemeral":true,"type":{"min":0,"key":"string"}},"lacp_current":{"ephemeral":true,"type":{"min":0,"key":"boolean"}},"mtu":{"ephemeral":true,"type":{"min":0,"key":"integer"}},"external_ids":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"hw_bond_config":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"other_config":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"status":{"ephemeral":true,"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"link_state":{"ephemeral":true,"type":{"min":0,"key":{"type":"string","enum":["set",["down","up"]]}}},"hw_intf_config":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"pm_info":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"link_speed":{"ephemeral":true,"type":{"min":0,"key":"integer"}},"duplex":{"ephemeral":true,"type":{"min":0,"key":{"type":"string","enum":["set",["full","half"]]}}},"pause":{"ephemeral":true,"type":{"min":0,"key":{"type":"string","enum":["set",["none","rx","rxtx","tx"]]}}},"user_config":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"lacp_status":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}}}},"Daemon":{"indexes":[["name"]],"columns":{"cur_hw":{"type":"integer"},"is_hw_handler":{"type":"boolean"},"name":{"mutable":false,"type":"string"}}},"VRF":{"indexes":[["name"]],"columns":{"ports":{"type":{"max":"unlimited","min":0,"key":{"type":"uuid","refTable":"Port"}}},"name":{"mutable":false,"type":{"key":{"maxLength":32,"type":"string"}}},"external_ids":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"other_config":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"dhcp_server":{"type":{"min":0,"key":{"type":"uuid","refTable":"DHCP_Server"}}}}},"DHCP_Server":{"columns":{"matches":{"type":{"max":"unlimited","min":0,"key":{"type":"uuid","refTable":"DHCPSrv_Match"}}},"ranges":{"type":{"max":"unlimited","min":0,"key":{"type":"uuid","refTable":"DHCPSrv_Range"}}},"other_config":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"dhcp_options":{"type":{"max":"unlimited","min":0,"key":{"type":"uuid","refTable":"DHCPSrv_Option"}}},"bootp":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"static_hosts":{"type":{"max":"unlimited","min":0,"key":{"type":"uuid","refTable":"DHCPSrv_Static_Host"}}}}},"Bridge":{"indexes":[["name"]],"columns":{"name":{"mutable":false,"type":"string"},"vlans":{"type":{"max":4094,"min":0,"key":{"type":"uuid","refTable":"VLAN"}}},"datapath_type":{"type":"string"},"external_ids":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"other_config":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"status":{"ephemeral":true,"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"datapath_id":{"ephemeral":true,"type":{"min":0,"key":"string"}},"ports":{"type":{"max":"unlimited","min":0,"key":{"type":"uuid","refTable":"Port"}}},"datapath_version":{"type":"string"}}},"Subsystem":{"indexes":[["name"]],"columns":{"name":{"mutable":false,"type":"string"},"hw_desc_dir":{"type":"string"},"temp_sensors":{"type":{"max":"unlimited","min":0,"key":{"type":"uuid","refTable":"Temp_sensor"}}},"other_config":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"external_ids":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"type":{"type":{"min":0,"key":{"type":"string","enum":["set",["chassis","line_card","mezz_card","system","uninitialized"]]}}},"next_mac_address":{"type":{"key":{"maxLength":17,"minLength":17,"type":"string"}}},"macs_remaining":{"type":"integer"},"other_info":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"asset_tag_number":{"type":"string"},"power_supplies":{"type":{"max":"unlimited","min":0,"key":{"type":"uuid","refTable":"Power_supply"}}},"interfaces":{"type":{"max":"unlimited","min":0,"key":{"type":"uuid","refTable":"Interface"}}},"fans":{"type":{"max":"unlimited","min":0,"key":{"type":"uuid","refTable":"Fan"}}},"leds":{"type":{"max":"unlimited","min":0,"key":{"type":"uuid","refTable":"LED"}}}}},"Route":{"isRoot":true,"indexes":[["vrf","from","prefix"]],"columns":{"selected":{"type":{"min":0,"key":"boolean"}},"sub_address_family":{"mutable":false,"type":{"min":0,"key":{"type":"string","enum":["set",["multicast","unicast","vpn"]]}}},"prefix":{"mutable":false,"type":{"key":{"maxLength":49,"type":"string"}}},"distance":{"mutable":false,"type":{"min":0,"key":{"minInteger":0,"maxInteger":255,"type":"integer"}}},"protocol_specific":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"address_family":{"mutable":false,"type":{"min":0,"key":{"type":"string","enum":["set",["ipv4","ipv6"]]}}},"from":{"mutable":false,"type":{"key":{"type":"string","enum":["set",["BGP","connected","static"]]}}},"protocol_private":{"type":{"min":0,"key":"boolean"}},"vrf":{"mutable":false,"type":{"key":{"refType":"weak","type":"uuid","refTable":"VRF"}}},"nexthops":{"type":{"max":"unlimited","min":0,"key":{"type":"uuid","refTable":"Nexthop"}}},"metric":{"mutable":false,"type":{"min":0,"key":{"minInteger":0,"maxInteger":4294967295,"type":"integer"}}}}},"Power_supply":{"indexes":[["name"]],"columns":{"name":{"mutable":false,"type":"string"},"hw_config":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"external_ids":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"other_config":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"status":{"ephemeral":true,"type":{"min":0,"key":{"type":"string","enum":["set",["fault_absent","fault_input","fault_output","ok","unknown"]]}}}}},"LED":{"indexes":[["id"]],"columns":{"state":{"type":{"min":0,"key":{"type":"string","enum":["set",["flashing","off","on"]]}}},"id":{"mutable":false,"type":"string"},"hw_config":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"external_ids":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"other_config":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"status":{"ephemeral":true,"type":{"min":0,"key":{"type":"string","enum":["set",["fault","ok","uninitialized"]]}}}}},"DHCPSrv_Range":{"indexes":[["name"]],"columns":{"name":{"mutable":false,"type":"string"},"lease_duration":{"type":{"min":0,"key":"integer"}},"constructor":{"type":{"min":0,"key":{"refType":"weak","type":"uuid","refTable":"Port"}}},"end_ip_address":{"type":{"min":0,"key":{"maxLength":45,"type":"string"}}},"start_ip_address":{"type":{"key":{"maxLength":45,"type":"string"}}},"broadcast":{"type":{"min":0,"key":{"maxLength":45,"type":"string"}}},"prefix_len":{"type":{"min":0,"key":{"minInteger":64,"type":"integer"}}},"netmask":{"type":{"min":0,"key":{"maxLength":15,"type":"string"}}},"set_tag":{"type":{"min":0,"key":"string"}},"match_tags":{"type":{"max":"unlimited","min":0,"key":"string"}},"is_static":{"type":{"min":0,"key":"boolean"}}}},"Port":{"indexes":[["name"]],"columns":{"name":{"mutable":false,"type":"string"},"statistics":{"ephemeral":true,"type":{"max":"unlimited","min":0,"key":"string","value":"integer"}},"mac":{"type":{"min":0,"key":"string"}},"ip4_address_secondary":{"type":{"max":"unlimited","min":0,"key":{"maxLength":18,"type":"string"}}},"trunks":{"type":{"max":4096,"min":0,"key":{"minInteger":1,"maxInteger":4094,"type":"integer"}}},"ip6_address":{"type":{"min":0,"key":{"maxLength":49,"type":"string"}}},"vlan_options":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"tag":{"type":{"min":0,"key":{"minInteger":1,"maxInteger":4094,"type":"integer"}}},"ip4_address":{"type":{"min":0,"key":{"maxLength":18,"type":"string"}}},"bond_active_slave":{"type":{"min":0,"key":"string"}},"status":{"ephemeral":true,"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"external_ids":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"bond_options":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"other_config":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"bond_mode":{"type":{"min":0,"key":{"type":"string","enum":["set",["l2-src-dst-hash","l3-src-dst-hash"]]}}},"ip6_address_secondary":{"type":{"max":"unlimited","min":0,"key":{"maxLength":49,"type":"string"}}},"interfaces":{"type":{"max":8,"min":0,"key":{"type":"uuid","refTable":"Interface"}}},"vlan_mode":{"type":{"min":0,"key":{"type":"string","enum":["set",["access","native-tagged","native-untagged","trunk"]]}}},"lacp":{"type":{"min":0,"key":{"type":"string","enum":["set",["active","off","passive"]]}}},"hw_config":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"lacp_status":{"ephemeral":true,"type":{"max":"unlimited","min":0,"key":"string","value":"string"}}}},"Fan":{"indexes":[["name"]],"columns":{"name":{"mutable":false,"type":"string"},"external_ids":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"direction":{"type":{"key":{"type":"string","enum":["set",["b2f","f2b"]]}}},"other_config":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"status":{"ephemeral":true,"type":{"min":0,"key":{"type":"string","enum":["set",["fault","ok","uninitialized"]]}}},"rpm":{"ephemeral":true,"type":{"min":0,"key":"integer"}},"hw_config":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"speed":{"type":{"key":{"type":"string","enum":["set",["fast","max","medium","normal","slow"]]}}}}},"DHCPSrv_Option":{"columns":{"option_value":{"type":{"min":0,"key":"string"}},"match_tags":{"type":{"max":"unlimited","min":0,"key":"string"}},"ipv6":{"type":{"min":0,"key":"boolean"}},"option_name":{"type":{"min":0,"key":"string"}},"option_number":{"type":{"min":0,"key":"integer"}}}},"Prefix_List_Entries":{"isRoot":true,"indexes":[["prefix_list","sequence"]],"columns":{"prefix":{"type":{"key":{"maxLength":43,"type":"string"}}},"le":{"type":{"min":0,"key":{"minInteger":1,"maxInteger":32,"type":"integer"}}},"prefix_list":{"type":{"key":{"type":"uuid","refTable":"Prefix_List"}}},"external_ids":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"other_config":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"action":{"type":{"key":{"type":"string","enum":["set",["deny","permit"]]}}},"sequence":{"type":{"key":{"minInteger":1,"maxInteger":4294967295,"type":"integer"}}},"ge":{"type":{"min":0,"key":{"minInteger":1,"maxInteger":32,"type":"integer"}}}}},"CLI_Alias":{"isRoot":true,"indexes":[["alias_name"]],"columns":{"alias_name":{"type":"string"},"alias_definition":{"type":"string"},"external_ids":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"other_config":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}}}},"Prefix_List":{"isRoot":true,"indexes":[["name"]],"columns":{"name":{"type":{"key":{"maxLength":80,"type":"string"}}},"description":{"type":{"min":0,"key":{"maxLength":80,"type":"string"}}},"external_ids":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"other_config":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}}}},"Manager":{"indexes":[["target"]],"columns":{"is_connected":{"ephemeral":true,"type":"boolean"},"connection_mode":{"type":{"min":0,"key":{"type":"string","enum":["set",["in-band","out-of-band"]]}}},"external_ids":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"other_config":{"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"status":{"ephemeral":true,"type":{"max":"unlimited","min":0,"key":"string","value":"string"}},"target":{"type":"string"},"inactivity_probe":{"type":{"min":0,"key":"integer"}},"max_backoff":{"type":{"min":0,"key":{"minInteger":1000,"type":"integer"}}}}}}},"error":null}