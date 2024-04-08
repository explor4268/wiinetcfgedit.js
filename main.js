"use strict";

const nonnumregex=/[\D]/g; // non-number regex

// handle IP Address input
function IPInputHandler(evt){
    if(this.value.match(/\./g)){
        this.value=this.value.split(".")[0];
        try{
            this.nextElementSibling.focus();
            this.nextElementSibling.select();
        }catch(err){}
    }else if(this.value.length==0){
        //this.value="0";
        try{this.previousElementSibling.focus();}catch(err){}
    }
    if(this.value.match(nonnumregex)!==null)this.value=this.value.replaceAll(nonnumregex,"");
    let pint=parseInt(this.value)
    if(Number.isNaN(pint))pint=0;
    if(pint>255)pint=255;
    else if(pint<0)pint=0;
    if(this.value!==pint.toString()){
        this.value=pint;
    }
}

// add event listener
document.querySelectorAll(".ipfield").forEach(e=>{
    e.addEventListener("input",IPInputHandler);
    // e.addEventListener("focus",()=>e.select());
});

// MTU value validation. Valid values are 0 and between 576-1500
f_mtu.addEventListener("input",function(evt){
    let pint=parseInt(this.value)
    if(Number.isNaN(pint))pint=0;
    if(pint>1500)pint=1500;
    else if(pint<0)pint=0;
    if(pint>0&&pint<576)this.classList.add("invalidinput");
    else this.classList.remove("invalidinput");
    if(this.value!==pint.toString()){
        this.value=pint;
    }
});

// Main, handle the actual GUI code

let cfgclass;
let curr_connection=1;

let generaloptElements=document.querySelectorAll('input.general-opt-input');

function updateAllValues(){
    fieldelements
}

f_conn.addEventListener("input",function(){
    curr_connection=parseInt(this.value);
    if(isNaN(curr_connection)||curr_connection<1||curr_connection>3)this.value=curr_connection=curr_connection>3?3:1;
    updateAllValues();
});

function handleFileInput(evt){
    if(fileupl.files.length!==1)return;
    if(fileupl.files[0].size!==CFG_SIZE){
        showError(`Your config file is not a valid config file. (size must be exactly ${CFG_SIZE} bytes, but your file is ${fileupl.files[0].size} bytes)`)
        return;
    }
    fileupl.files[0].arrayBuffer().then(abuf=>cfgclass=new WiiNetCfg(abuf));
}

function createBlankCfg(){
    if(cfgclass===undefined||confirm("Are you sure to create a new config file? All unsaved changes will be lost.")){
        cfgclass=new WiiNetCfg(new ArrayBuffer(CFG_SIZE));
    }
}

fileupl.addEventListener("change",handleFileInput);
createnewbtn.addEventListener("click",createBlankCfg);

function downloadConfig(){
    let blob=cfgclass.toBlob();
    let dllink=document.createElement("a");
    dllink.href=URL.createObjectURL(blob);
    dllink.download="config.dat";
    dllink.click();
}

dlbtn.addEventListener("click",downloadConfig);

// Hide JavaScript Warning with CSS transition effect.

nojs.style.height=nojs.scrollHeight+"px";
nojs.classList.add("nojs-transition");
setTimeout(()=>{nojs.style.height="0px";},0);
setTimeout(()=>{
    nojs.style.display="none";
},1100);
