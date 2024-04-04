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

function warn(msg){
    alert(msg);
}

// Main

let cfgclass;

function handleFileInput(evt){
    if(fileupl.files.length!==1)return;
    if(fileupl.files[0].size!==CFG_SIZE){
        warn(`Not a valid config file. (size must be exactly ${CFG_SIZE} bytes)`)
    }
    fileupl.files[0].arrayBuffer().then(abuf=>cfgclass=new WiiNetCfg(abuf));
}

fileupl.addEventListener("change",handleFileInput)
createnewbtn.addEventListener("click",function(){
    cfgclass=new WiiNetCfg(new ArrayByffer(CFG_SIZE));
});


// Hide JavaScript Warning with CSS transition effect.

nojs.style.height=(nojs.offsetHeight-4)+"px";
nojs.classList.add("nojs-transition");
setTimeout(()=>{nojs.style.height="0px";},0);
setTimeout(()=>{
    nojs.style.display="none";
    nojs.style.border="none";
},1100);
