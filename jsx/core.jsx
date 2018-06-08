var _lock = false;
var document = null;
var imgList=[];
var folderList=[];
var treeList={};
var index = 0;
var nameList={ps_resource:0};
var rootName = '';
var outputPresetPath = '';

function init(desktop_path,cssFileName) {
    imgList=[];
    folderList = [];
    index = 0;
    nameList={ps_resource:0};
    document = app.activeDocument;
    rootName = document.name.replace(/\..*$/,'');
    outputPresetPath = desktop_path||'';
    treeList={
        name:rootName,
        bounds:[0,0,app.activeDocument.width.value,app.activeDocument.height.value],
        tree:[],
    };
    folderList.push('/'+cssFileName);
    map(document,folderList[folderList.length-1],treeList.tree);
    return JSON.stringify({rootName:rootName,folderList:folderList});
}
function getTree() {
    format(treeList);
    return JSON.stringify(treeList);
}
function format(list) {
    list.bounds = [document.width.value,document.height.value,0,0];
    for(var i =0;i<list.tree.length;i++){
        var item = list.tree[i];
        if(!item.tree){
            item.bounds=imgList[item.index].bounds;
            list.bounds =[
                Math.min(item.bounds[0],list.bounds[0]),
                Math.min(item.bounds[1],list.bounds[1]),
                Math.max(item.bounds[2],list.bounds[2]),
                Math.max(item.bounds[3],list.bounds[3]),
            ];
        }else{
            var subBounds = format(item);
            list.bounds =[
                Math.min(subBounds[0],list.bounds[0]),
                Math.min(subBounds[1],list.bounds[1]),
                Math.max(subBounds[2],list.bounds[2]),
                Math.max(subBounds[3],list.bounds[3]),
            ];
        }
    }
    return list.bounds;
}
function createImg() {
    if(!imgList[index])return;
    var name = imgList[index].name;
    var desc1582 = new ActionDescriptor();
    var ref563 = new ActionReference();
    ref563.putName( charIDToTypeID( "Lyr " ), name);
    desc1582.putReference( charIDToTypeID( "null" ), ref563 );
    executeAction( charIDToTypeID( "slct" ), desc1582, DialogModes.NO );

    if(document.activeLayer.visible){
        cope();
    }else{
        index++;
        createImg();
    }
}
function rename(layer) {
    // layer.name = layer.name.replace(/(\W|\_\d+|\_$)/g,'').replace(/\d/g,'')||'ps_resource';
    if(nameList[layer.name]){
        layer.name+='_'+(nameList[layer.name]++);
    }else{
        nameList[layer.name] = 1;
    }
    // alert(JSON.stringify(nameList));
}
function map(doc,path,tree) {
    for(var i = doc.artLayers.length-1;i>=0;i--){
        //图层

        rename(doc.artLayers[i]);
        imgList.push({
            name:doc.artLayers[i].name,
            path:path,
        });
        tree.push({
            name:doc.artLayers[i].name,
            path:path,
            index:imgList.length-1,
            bounds:[]
        });

    }
    for(var i = doc.layerSets.length-1;i>=0;i--){
        rename(doc.layerSets[i]);
        folderList.push(path+'/'+doc.layerSets[i].name);
        var _tree = [];
        tree.push({
            name:doc.layerSets[i].name,
            bounds:[],
            tree:_tree,
        });
        map(doc.layerSets[i],folderList[folderList.length-1],_tree);
    }
}
function cope() {
    //复制图层
    var name = imgList[index].name;
    if(name.indexOf('.') !== -1){
        name = name.split('.')[1];
    }
    var ref167 = new ActionReference();
    ref167.putClass( charIDToTypeID( "Dcmn" ) );

    var ref168 = new ActionReference();
    ref168.putEnumerated( charIDToTypeID( "Lyr " ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ) );

    var desc361 = new ActionDescriptor();
    desc361.putReference( charIDToTypeID( "null" ), ref167 );
    desc361.putString( charIDToTypeID( "Nm  " ), name );
    desc361.putReference( charIDToTypeID( "Usng" ), ref168 );

    executeAction( charIDToTypeID( "Mk  "), desc361, DialogModes.NO );
    trim();
}
function trim() {
    //裁切
    var width = app.activeDocument.width.value;
    var height = app.activeDocument.height.value;
    imgList[index].bounds = [];
    app.activeDocument.trim (TrimType.TRANSPARENT, true,true,false,false);
    imgList[index].bounds[0]=width-app.activeDocument.width.value;
    imgList[index].bounds[1]=height-app.activeDocument.height.value;
    app.activeDocument.trim (TrimType.TRANSPARENT, false,false,true,true);
    imgList[index].bounds[2]=imgList[index].bounds[0]+app.activeDocument.width.value;
    imgList[index].bounds[3]=imgList[index].bounds[1]+app.activeDocument.height.value;
    save();
}
function save() {
    //另存为
    var idExpr = charIDToTypeID( "Expr" );
    var desc367 = new ActionDescriptor();
    var idUsng = charIDToTypeID( "Usng" );
    var desc368 = new ActionDescriptor();
    var idOp = charIDToTypeID( "Op  " );
    var idSWOp = charIDToTypeID( "SWOp" );
    var idOpSa = charIDToTypeID( "OpSa" );
    desc368.putEnumerated( idOp, idSWOp, idOpSa );
    var idDIDr = charIDToTypeID( "DIDr" );
    desc368.putBoolean( idDIDr, true );
    var idIn = charIDToTypeID( "In  " );
    desc368.putPath( idIn, new File( outputPresetPath+rootName+imgList[index].path ) );
    var idFmt = charIDToTypeID( "Fmt " );
    var idIRFm = charIDToTypeID( "IRFm" );
    var idPNtwofour = charIDToTypeID( "PN24" );
    desc368.putEnumerated( idFmt, idIRFm, idPNtwofour );
    var idIntr = charIDToTypeID( "Intr" );
    desc368.putBoolean( idIntr, false );
    var idTrns = charIDToTypeID( "Trns" );
    desc368.putBoolean( idTrns, true );
    var idMtt = charIDToTypeID( "Mtt " );
    desc368.putBoolean( idMtt, true );
    var idEICC = charIDToTypeID( "EICC" );
    desc368.putBoolean( idEICC, false );
    var idMttR = charIDToTypeID( "MttR" );
    desc368.putInteger( idMttR, 255 );
    var idMttG = charIDToTypeID( "MttG" );
    desc368.putInteger( idMttG, 255 );
    var idMttB = charIDToTypeID( "MttB" );
    desc368.putInteger( idMttB, 255 );
    var idSHTM = charIDToTypeID( "SHTM" );
    desc368.putBoolean( idSHTM, false );
    var idSImg = charIDToTypeID( "SImg" );
    desc368.putBoolean( idSImg, true );
    var idSWsl = charIDToTypeID( "SWsl" );
    var idSTsl = charIDToTypeID( "STsl" );
    var idSLAl = charIDToTypeID( "SLAl" );
    desc368.putEnumerated( idSWsl, idSTsl, idSLAl );
    var idSWch = charIDToTypeID( "SWch" );
    var idSTch = charIDToTypeID( "STch" );
    var idCHDc = charIDToTypeID( "CHDc" );
    desc368.putEnumerated( idSWch, idSTch, idCHDc );
    var idSWmd = charIDToTypeID( "SWmd" );
    var idSTmd = charIDToTypeID( "STmd" );
    var idMDCC = charIDToTypeID( "MDCC" );
    desc368.putEnumerated( idSWmd, idSTmd, idMDCC );
    var idohXH = charIDToTypeID( "ohXH" );
    desc368.putBoolean( idohXH, false );
    var idohIC = charIDToTypeID( "ohIC" );
    desc368.putBoolean( idohIC, true );
    var idohAA = charIDToTypeID( "ohAA" );
    desc368.putBoolean( idohAA, true );
    var idohQA = charIDToTypeID( "ohQA" );
    desc368.putBoolean( idohQA, true );
    var idohCA = charIDToTypeID( "ohCA" );
    desc368.putBoolean( idohCA, false );
    var idohIZ = charIDToTypeID( "ohIZ" );
    desc368.putBoolean( idohIZ, true );
    var idohTC = charIDToTypeID( "ohTC" );
    var idSToc = charIDToTypeID( "SToc" );
    var idOCzerothree = charIDToTypeID( "OC03" );
    desc368.putEnumerated( idohTC, idSToc, idOCzerothree );
    var idohAC = charIDToTypeID( "ohAC" );
    var idSToc = charIDToTypeID( "SToc" );
    var idOCzerothree = charIDToTypeID( "OC03" );
    desc368.putEnumerated( idohAC, idSToc, idOCzerothree );
    var idohIn = charIDToTypeID( "ohIn" );
    desc368.putInteger( idohIn, -1 );
    var idohLE = charIDToTypeID( "ohLE" );
    var idSTle = charIDToTypeID( "STle" );
    var idLEzerothree = charIDToTypeID( "LE03" );
    desc368.putEnumerated( idohLE, idSTle, idLEzerothree );
    var idohEn = charIDToTypeID( "ohEn" );
    var idSTen = charIDToTypeID( "STen" );
    var idENzerozero = charIDToTypeID( "EN00" );
    desc368.putEnumerated( idohEn, idSTen, idENzerozero );
    var idolCS = charIDToTypeID( "olCS" );
    desc368.putBoolean( idolCS, false );
    var idolEC = charIDToTypeID( "olEC" );
    var idSTst = charIDToTypeID( "STst" );
    var idSTzerozero = charIDToTypeID( "ST00" );
    desc368.putEnumerated( idolEC, idSTst, idSTzerozero );
    var idolWH = charIDToTypeID( "olWH" );
    var idSTwh = charIDToTypeID( "STwh" );
    var idWHzeroone = charIDToTypeID( "WH01" );
    desc368.putEnumerated( idolWH, idSTwh, idWHzeroone );
    var idolSV = charIDToTypeID( "olSV" );
    var idSTsp = charIDToTypeID( "STsp" );
    var idSPzerofour = charIDToTypeID( "SP04" );
    desc368.putEnumerated( idolSV, idSTsp, idSPzerofour );
    var idolSH = charIDToTypeID( "olSH" );
    var idSTsp = charIDToTypeID( "STsp" );
    var idSPzerofour = charIDToTypeID( "SP04" );
    desc368.putEnumerated( idolSH, idSTsp, idSPzerofour );
    var idolNC = charIDToTypeID( "olNC" );
    var list95 = new ActionList();
    var desc369 = new ActionDescriptor();
    var idncTp = charIDToTypeID( "ncTp" );
    var idSTnc = charIDToTypeID( "STnc" );
    var idNCzerozero = charIDToTypeID( "NC00" );
    desc369.putEnumerated( idncTp, idSTnc, idNCzerozero );
    var idSCnc = charIDToTypeID( "SCnc" );
    list95.putObject( idSCnc, desc369 );
    var desc370 = new ActionDescriptor();
    var idncTp = charIDToTypeID( "ncTp" );
    var idSTnc = charIDToTypeID( "STnc" );
    var idNConenine = charIDToTypeID( "NC19" );
    desc370.putEnumerated( idncTp, idSTnc, idNConenine );
    var idSCnc = charIDToTypeID( "SCnc" );
    list95.putObject( idSCnc, desc370 );
    var desc371 = new ActionDescriptor();
    var idncTp = charIDToTypeID( "ncTp" );
    var idSTnc = charIDToTypeID( "STnc" );
    var idNCtwoeight = charIDToTypeID( "NC28" );
    desc371.putEnumerated( idncTp, idSTnc, idNCtwoeight );
    var idSCnc = charIDToTypeID( "SCnc" );
    list95.putObject( idSCnc, desc371 );
    var desc372 = new ActionDescriptor();
    var idncTp = charIDToTypeID( "ncTp" );
    var idSTnc = charIDToTypeID( "STnc" );
    var idNCtwofour = charIDToTypeID( "NC24" );
    desc372.putEnumerated( idncTp, idSTnc, idNCtwofour );
    var idSCnc = charIDToTypeID( "SCnc" );
    list95.putObject( idSCnc, desc372 );
    var desc373 = new ActionDescriptor();
    var idncTp = charIDToTypeID( "ncTp" );
    var idSTnc = charIDToTypeID( "STnc" );
    var idNCtwofour = charIDToTypeID( "NC24" );
    desc373.putEnumerated( idncTp, idSTnc, idNCtwofour );
    var idSCnc = charIDToTypeID( "SCnc" );
    list95.putObject( idSCnc, desc373 );
    var desc374 = new ActionDescriptor();
    var idncTp = charIDToTypeID( "ncTp" );
    var idSTnc = charIDToTypeID( "STnc" );
    var idNCtwofour = charIDToTypeID( "NC24" );
    desc374.putEnumerated( idncTp, idSTnc, idNCtwofour );
    var idSCnc = charIDToTypeID( "SCnc" );
    list95.putObject( idSCnc, desc374 );
    desc368.putList( idolNC, list95 );
    var idobIA = charIDToTypeID( "obIA" );
    desc368.putBoolean( idobIA, false );
    var idobIP = charIDToTypeID( "obIP" );
    desc368.putString( idobIP, "" );
    var idobCS = charIDToTypeID( "obCS" );
    var idSTcs = charIDToTypeID( "STcs" );
    var idCSzeroone = charIDToTypeID( "CS01" );
    desc368.putEnumerated( idobCS, idSTcs, idCSzeroone );
    var idovNC = charIDToTypeID( "ovNC" );
    var list96 = new ActionList();
    var desc375 = new ActionDescriptor();
    var idncTp = charIDToTypeID( "ncTp" );
    var idSTnc = charIDToTypeID( "STnc" );
    var idNCzeroone = charIDToTypeID( "NC01" );
    desc375.putEnumerated( idncTp, idSTnc, idNCzeroone );
    var idSCnc = charIDToTypeID( "SCnc" );
    list96.putObject( idSCnc, desc375 );
    var desc376 = new ActionDescriptor();
    var idncTp = charIDToTypeID( "ncTp" );
    var idSTnc = charIDToTypeID( "STnc" );
    var idNCtwozero = charIDToTypeID( "NC20" );
    desc376.putEnumerated( idncTp, idSTnc, idNCtwozero );
    var idSCnc = charIDToTypeID( "SCnc" );
    list96.putObject( idSCnc, desc376 );
    var desc377 = new ActionDescriptor();
    var idncTp = charIDToTypeID( "ncTp" );
    var idSTnc = charIDToTypeID( "STnc" );
    var idNCzerotwo = charIDToTypeID( "NC02" );
    desc377.putEnumerated( idncTp, idSTnc, idNCzerotwo );
    var idSCnc = charIDToTypeID( "SCnc" );
    list96.putObject( idSCnc, desc377 );
    var desc378 = new ActionDescriptor();
    var idncTp = charIDToTypeID( "ncTp" );
    var idSTnc = charIDToTypeID( "STnc" );
    var idNConenine = charIDToTypeID( "NC19" );
    desc378.putEnumerated( idncTp, idSTnc, idNConenine );
    var idSCnc = charIDToTypeID( "SCnc" );
    list96.putObject( idSCnc, desc378 );
    var desc379 = new ActionDescriptor();
    var idncTp = charIDToTypeID( "ncTp" );
    var idSTnc = charIDToTypeID( "STnc" );
    var idNCzerosix = charIDToTypeID( "NC06" );
    desc379.putEnumerated( idncTp, idSTnc, idNCzerosix );
    var idSCnc = charIDToTypeID( "SCnc" );
    list96.putObject( idSCnc, desc379 );
    var desc380 = new ActionDescriptor();
    var idncTp = charIDToTypeID( "ncTp" );
    var idSTnc = charIDToTypeID( "STnc" );
    var idNCtwofour = charIDToTypeID( "NC24" );
    desc380.putEnumerated( idncTp, idSTnc, idNCtwofour );
    var idSCnc = charIDToTypeID( "SCnc" );
    list96.putObject( idSCnc, desc380 );
    var desc381 = new ActionDescriptor();
    var idncTp = charIDToTypeID( "ncTp" );
    var idSTnc = charIDToTypeID( "STnc" );
    var idNCtwofour = charIDToTypeID( "NC24" );
    desc381.putEnumerated( idncTp, idSTnc, idNCtwofour );
    var idSCnc = charIDToTypeID( "SCnc" );
    list96.putObject( idSCnc, desc381 );
    var desc382 = new ActionDescriptor();
    var idncTp = charIDToTypeID( "ncTp" );
    var idSTnc = charIDToTypeID( "STnc" );
    var idNCtwofour = charIDToTypeID( "NC24" );
    desc382.putEnumerated( idncTp, idSTnc, idNCtwofour );
    var idSCnc = charIDToTypeID( "SCnc" );
    list96.putObject( idSCnc, desc382 );
    var desc383 = new ActionDescriptor();
    var idncTp = charIDToTypeID( "ncTp" );
    var idSTnc = charIDToTypeID( "STnc" );
    var idNCtwotwo = charIDToTypeID( "NC22" );
    desc383.putEnumerated( idncTp, idSTnc, idNCtwotwo );
    var idSCnc = charIDToTypeID( "SCnc" );
    list96.putObject( idSCnc, desc383 );
    desc368.putList( idovNC, list96 );
    var idovCM = charIDToTypeID( "ovCM" );
    desc368.putBoolean( idovCM, false );
    var idovCW = charIDToTypeID( "ovCW" );
    desc368.putBoolean( idovCW, false );
    var idovCU = charIDToTypeID( "ovCU" );
    desc368.putBoolean( idovCU, true );
    var idovSF = charIDToTypeID( "ovSF" );
    desc368.putBoolean( idovSF, true );
    var idovCB = charIDToTypeID( "ovCB" );
    desc368.putBoolean( idovCB, true );
    var idovSN = charIDToTypeID( "ovSN" );
    desc368.putString( idovSN, "images" );
    var idSaveForWeb = stringIDToTypeID( "SaveForWeb" );
    desc367.putObject( idUsng, idSaveForWeb, desc368 );
    executeAction( idExpr, desc367, DialogModes.NO );
    close();
}
function close() {
    //关闭当前窗口
    app.activeDocument.close (SaveOptions.DONOTSAVECHANGES);
    index++;
    createImg();
}
