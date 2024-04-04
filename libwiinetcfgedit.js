"use strict";

// config size is always 7004
const CFG_SIZE=7004;

// data types to DataView function suffixes
const U8='Uint8';
const U16='Uint16';
const U32='Uint32';
const SPECIAL='SPECIAL'; // special type
const SPECIAL_LENGTH='SPECIAL_LENGTH'; // denoting for total byte length property of mapping

// mapping for connection flags as bitwise and
const flagsmap={
    connselected :0b10000000, // is connection selected?
    pmturec      :0b01000000, // use PMTU recovery
    nettestpassed:0b00100000, // is the connection test passed (essential for fixing dolphin network breakage)
    useproxy     :0b00010000, // use proxy
    pppoe        :0b00001000, // use PPPoE
    dhcpenable   :0b00000100, // is DHCP enabled?
    dnsdhcpenable:0b00000010, // is DHCP enabled for DNS settings?
    wiredenable  :0b00000001 // if true, the connection will use the USB ethernet adapter. If false, it will use Wi-Fi instead.
};

const enctypes={
    open:0x00,
    wep64:0x01,
    wep128:0x02,
    wpapsktkip:0x04,
    wpa2psk:0x05,
    wpapskaes:0x06
}

// mappings for the options in order.
// padding will be ignored
// [field_name,type,count]
const mappings={
    mapping_header:[
        // ['',SPECIAL_LENGTH,0],
        ['version',U32,1], // version
        ['header4',U8,1], // valid connections
        ['header5',U8,1], // unknown
        ['linktimeoutsec',U8,1], // link timeout second(s)
        ['padding',U8,1],
        ['mapping_connection',SPECIAL,3] // Connections (handled specially, see mapping_connection below)
    ],mapping_connection:[
        // ['',SPECIAL_LENGTH,0],
        ['flags',U8,1], // connection flags (see flagsmap)
        ['padding',U8,3],
        ['ipaddr',U8,4], // manual IP Address
        ['nipaddr',U8,4], // Netmask IP
        ['gipaddr',U8,4], // Gateway IP
        ['dipaddr',U8,4], // DNS 1 IP Address
        ['d2ipaddr',U8,4], // DNS 2 IP Address
        ['padding',U8,2],
        ['mtu',U16,1], // MTU. Valid values  are 0 and 576-1500 range.
        ['padding',U8,8],
        ['mapping_proxy',SPECIAL,1], // Proxy (handled specially, see mapping_proxy below)
        ['padding',U8,1],
        ['mapping_proxy',SPECIAL,1], // seems to be a duplicate of PROXY
        ['padding',U8,1297],
        // wireless-specific settings
        ['ssid',U8,32], // Network SSID string
        ['padding',U8,1],
        ['ssid_len',U8,1], // length of ssid in bytes
        ['padding',U8,2],
        ['padding',U8,1],
        ['encryption',U8,1], // encryption (probably, see enctypes above)
        ['padding',U8,2],
        ['padding',U8,1],
        ['keylen',U8,1], // length of key (see below) in bytes. 0x00 for WEP64 and WEP128.
        ['unknown1',U8,1], // 0x00 or 0x01 toogled with a WPA-PSK (TKIP) and with a WEP entered with hex instead of ascii.
        ['padding',U8,1],
        ['key',U8,64], // Encryption key.  For WEP, key is stored 4 times (20 bytes for WEP64 and 52 bytes for WEP128) then padded with 0x00.
        ['padding',U8,236]
    ],mapping_proxy:[
        // ['',SPECIAL_LENGTH,0],
        ['useproxy',U8,1], // Proxy will be enabled if value is 0x01, otherwise if 0x00 will be disabled
        ['useproxyuserandpass',U8,1], // if 0x00 don't use username and password, otherwise 0x01
        ['padding',U8,2],
        ['proxyname',U8,255], // proxy name
        ['padding',U8,1],
        ['proxyport',U16,1], // proxy port ranging from 0 to 34463
        ['proxyusername',U8,32], // proxy username
        ['padding',U8,1],
        ['proxypassword',U8,32]
    ] // __attribute__((__packed__))
// so no additional paddings added for alignment
};

function generateMapping(mapping,cbyteoffset=0,existingMapping){
    let finalMapping={};
    if(existingMapping!==undefined){
        finalMapping=existingMapping;
    }
    for(let i=0;i<mapping.length;i++){
        let currentry=mapping[i];
        if(currentry[1]==SPECIAL){
            // console.log(currentry);
            for(let j=0;j<currentry[2];j++){
                let prfx=currentry[2]>1?(j+1).toString():"";
                let res=generateMapping(mappings[currentry[0]],cbyteoffset,finalMapping[currentry[0]]);
                finalMapping[currentry[0]+prfx]=res[0];
                cbyteoffset=res[1];
            }
            continue;
        }
        if(currentry[0]!=='padding'){
            if(finalMapping[currentry[0]]==undefined)finalMapping[currentry[0]]=[[],currentry[1],currentry[2]];
            finalMapping[currentry[0]][0].push(cbyteoffset);
        }
        switch(currentry[1]){
            case U8:
                cbyteoffset+=currentry[2];
                break;
            case U16:
                cbyteoffset+=2*currentry[2];
                break;
            case U32:
                cbyteoffset+=4*currentry[2];
                break;
        }
    }
    return [finalMapping,cbyteoffset];
}
const finalMappingResult=generateMapping(mappings.mapping_header);
console.log(...finalMappingResult);
const master_mappings=finalMappingResult[0];

/*
function processOffset(mapping){ // adds byte offset on entry[3]
    let cbyteoffset=0;
    for(let i=0;i<mapping.length;i++){
        if(mapping[i][1]==SPECIAL_LENGTH)continue; // ignore
        mapping[i].push(cbyteoffset);
        if(mapping[i][1]==U8)cbyteoffset+=mapping[i][2];
        else if(mapping[i][1]==U16)cbyteoffset+=2*mapping[i][2];
        else if(mapping[i][1]==U32)cbyteoffset+=4*mapping[i][2];
        else if(mapping[i][1]==SPECIAL){
            // handle SPECIAL types (e.g. mapping inside a mapping)
            cbyteoffset+=mappings[mapping[i][0]][0][2]*mapping[i][2]
        }
        mapping[0][2]=cbyteoffset; // store final byte count
    }
    return mapping;
}
// process in reverse order
processOffset(mappings.mapping_proxy);
processOffset(mappings.mapping_connection);
processOffset(mappings.mapping_header);*/

class WiiNetCfg{
    constructor(abuf){
        this.arraybuf=abuf;
        this.dview=new DataView(this.arraybuf);
    }
    setValue(name,value){
        let cmap=master_mappings[name];
        for(let offset of cmap[0]){
            this.dview['set'+cmap[1]](offset,value,true); // make sure for little endian
        }
    }
    getValue(name){
        let cmap=master_mappings[name];
        return this.dview['get'+cmap[1]](cmap[0][0],true); // take the first of duplicate on mapping_proxy (because mapping_proxy is duplicated)
    }
}
