// defaults write com.adobe.CSXS.8 PlayerDebugMode 1
const path = require('path');
const rm = require('rimraf');
const fs = require('fs');
const config = {
    "cssFileName":"scss",
    "imgFileName":"images",
    "jsFileName":"js",
    "componentFileName":"components"
};



let cs= new CSInterface();
let DesktopPath =  cs.getSystemPath(SystemPath.MY_DOCUMENTS).replace(/Documents$/,'Desktop/');

let outputPresetPath = DesktopPath; //编译后的路径，默认为桌面
// var outputPresetPath = path.join(cs.getSystemPath(SystemPath.MY_DOCUMENTS),'../Desktop');
renderPath();


function loadJSX(fileName)
{
    var extensionRoot = cs.getSystemPath(SystemPath.EXTENSION) + "/jsx/";
    cs.evalScript('$.evalFile("' + extensionRoot + fileName + '")');
}

loadJSX("json2.js"); //为 ExtendScript 载入 JSON 库

// var a = '';
// for (var attr in SystemPath){
//     a +=attr+': '+cs.getSystemPath(SystemPath[attr])+'    ';
// }
class cretePage {
    constructor(data){
        this.data = data;
        this.copyStaticFile();
        this.createScss();
        this.createHTML();
    }
    createScss(){
        this.createScssMain();
    }
    // 移动静态文件
    copyStaticFile(){
        this.copyFileTo(path.join(__dirname,'static','package.json'), path.join(outputPresetPath, this.data.rootName, 'package.json'));
        this.copyFileTo(path.join(__dirname,'static','gulpFile.js'), path.join(outputPresetPath, this.data.rootName, 'gulpFile.js'));
        this.copyFileTo(path.join(__dirname,'static','_common_mixin.scss'), path.join(outputPresetPath,this.data.rootName,config.cssFileName,'_common_mixin.scss'));
    }
    copyFileTo(source,dest){
        fs.createReadStream(source).pipe(fs.createWriteStream(dest));
    }
    createScssMain(){
        var scss = '@import "./common_mixin";\n';
        scss += this._createScss( this.data.treeObj,-1,[0,0] );
        window.cep.fs.writeFile( path.join(outputPresetPath, this.data.rootName, config.cssFileName, 'index.scss'), scss );
    }
    _createScss(treeObj ,n,parentOffset){
        var _this = this, scss = '', bounds = treeObj.bounds, maxSize = false;
        if(bounds[2]-bounds[0]==_this.data.screen.width && bounds[3]-bounds[1]==_this.data.screen.height){
            maxSize = true;
        }
        scss+=`${_this.tab(n+1)}.${treeObj.name}{\n`;
        scss+=`${_this.tab(n+2)}position: absolute;\n`;
        scss+=`${_this.tab(n+2)}left: rpx(${bounds[0]-parentOffset[0]});\n`;
        if(parentOffset[0]==0 && parentOffset[1]==0 && !maxSize){
            var center = (bounds[3]-bounds[1])/2;
            var top = (bounds[1]+center)/_this.data.screen.height*100;
            scss+=`${_this.tab(n+2)}top: ${top}%;\n`;
            scss+=`${_this.tab(n+2)}margin-top: rpx(-${center});\n`;
        }else{
            scss+=`${_this.tab(n+2)}top: rpx(${bounds[1]-parentOffset[1]});\n`;
        }
        if(maxSize){
            scss+=`${_this.tab(n+2)}width: 100%;\n`;
            scss+=`${_this.tab(n+2)}height: 100%;\n`;
        }else{
            scss+=`${_this.tab(n+2)}width: rpx(${bounds[2]-bounds[0]});\n`;
            scss+=`${_this.tab(n+2)}height: rpx(${bounds[3]-bounds[1]});\n`;
        }
        if(!treeObj.tree){
            scss+=`${_this.tab(n+2)}background: url("..${treeObj.path+'/'+treeObj.name}.png") no-repeat center;\n`;
            if(maxSize){
                scss+=`${_this.tab(n+2)}background-size: cover;\n`;
            }else{
                scss+=`${_this.tab(n+2)}background-size: contain;\n`;
            }
        }else if(treeObj.bg){
            var width = treeObj.bg.bounds[2]-treeObj.bg.bounds[0];
            var height = treeObj.bg.bounds[3]-treeObj.bg.bounds[1];
            if(treeObj.bounds[2]-treeObj.bounds[0]==width && treeObj.bounds[3]-treeObj.bounds[1]==height){
                scss+=`${_this.tab(n+2)}background: url("..${treeObj.bg.path+'/'+treeObj.bg.name}.png") no-repeat center;\n`;
                if(maxSize){
                    scss+=`${_this.tab(n+2)}background-size: cover;\n`;
                }else{
                    scss+=`${_this.tab(n+2)}background-size: contain;\n`;
                }
            }else{
                maxSize = false;
                if(bounds[2]-bounds[0]== _this.data.screen.width && bounds[3]-bounds[1]== _this.data.screen.height){
                    maxSize = true;
                }
                scss+=`${_this.tab(n+2)}.${treeObj.bg.name}{\n`;
                scss+=`${_this.tab(n+3)}position: absolute;\n`;
                scss+=`${_this.tab(n+3)}left: rpx(${treeObj.bg.bounds[0]-bounds[0]});\n`;
                scss += `${_this.tab(n + 3)}top: rpx(${treeObj.bg.bounds[1] - bounds[1]});\n`;
                scss+=`${_this.tab(n+3)}width: rpx(${width});\n`;
                scss+=`${_this.tab(n+3)}height: rpx(${height});\n`;
                scss+=`${_this.tab(n+3)}background: url("..${treeObj.bg.path+'/'+treeObj.bg.name}.png") no-repeat center;\n`;
                scss+=`${_this.tab(n+3)}-webkit-background-size: contain;\n`;
                scss+=`${_this.tab(n+3)}background-size: contain;\n`;
                scss+=`${_this.tab(n+2)}}\n`;
            }
        }
        if(treeObj.tree && treeObj.tree.length>0){
            treeObj.tree.forEach(function(item){
                scss += _this._createScss(item ,n+1,[treeObj.bounds[0],treeObj.bounds[1]]);
            });
        }
        scss += _this.tab(n + 1) + '}\n';
        return scss;

    }
    createHTML() {
        //创建scss方法文件
        var _this = this;
        window.cep.fs.writeFile(outputPresetPath+_this.data.rootName+'/index.html',
            document.querySelector('.templates-html').innerHTML
                .replace(/\[\[\<\]\]/g,'<')
                .replace(/\[\[title\]\]/g,_this.data.rootName)
                .replace(/\[\[psd\]\]/g,_this.data.screen.width)
                .replace(/\[\[html\]\]/,_this.createDom(_this.data.treeObj,-1)));

    }
    readObj( name,treeObj ) {
        if( Object.prototype.toString.call(treeObj) == "[object Object]" ) {
            // alert(name)
            for(var i in treeObj) {
                this.readObj( i, treeObj[i] );
            }
        }else{
            // alert(name+":"+ treeObj );
        }
    }
    createDom(treeObj,n) {
        var _this = this, html = '';
        _this.readObj(treeObj.name, treeObj );
        html+=`${_this.tab(n+1)}<div class="${treeObj.name}">\n`;
        if(treeObj.bg){
            var width = treeObj.bg.bounds[2]-treeObj.bg.bounds[0];
            var height = treeObj.bg.bounds[3]-treeObj.bg.bounds[1];
            if(treeObj.bounds[2]-treeObj.bounds[0]!=width || treeObj.bounds[3]-treeObj.bounds[1]!=height){
                html+=`${_this.tab(n+2)}<div class="${treeObj.bg.name}"></div>\n`;
            }
        }
        if(treeObj.tree && treeObj.tree.length>0){
            treeObj.tree.forEach(function(item){
                html += _this.createDom(item ,n+1);
            });
        }
        html += _this.tab(n + 1) + '</div>\n';
        return html;
    }
    tab(n) {
        //返回tab字符串
        var str = '';
        for(var i =0;i<n;i++){
            str+='\t';
        }
        return str;
    }

}

// 编译
let pop = function () {
    // //获取用户选择路径
    // var changeBtn = document.getElementById('changeBtn');
    // alert(changeBtn.value);

    cs.evalScript("init('"+outputPresetPath+"','"+config.imgFileName+"')",function (folderObject) {


        // window.cep.fs.DeleteFileOrDirectory(path.join(outputPresetPath,folderObject.rootName));

        folderObject = JSON.parse(folderObject);
        rm(path.join(outputPresetPath,folderObject.rootName), err => {
            if (err) throw err;
            // fs.rmdirSync(path.join(outputPresetPath,folderObject.rootName));
            // window.cep.fs.DeleteFileOrDirectory(path.join(outputPresetPath,folderObject.rootName));
            folderObject.folderList.push('/'+ config.cssFileName);
            folderObject.folderList.push('/'+ config.jsFileName);
            folderObject.folderList.push('/'+ config.componentFileName);
            folderObject.folderList.forEach(function (item) {
                window.cep.fs.makedir(path.join(outputPresetPath,folderObject.rootName,item));
            });
            alert(44)
            cs.evalScript("createImg()");

            cs.evalScript("getTree()",function (treeList) {
                treeList = JSON.parse(treeList);
                formatTree(treeList);
                var formatObj = {
                    rootName:treeList.name,
                    screen:{
                        width:treeList.bounds[2],
                        height:treeList.bounds[3],
                    },
                    treeObj:treeList,
                };
                treeList.name = treeList.name.replace(/\W/g,'').replace(/(^[_\d]+)/g,'')||'ps_components';
                treeList.name += '_'+Math.floor(Math.random()*100000);
                new cretePage(formatObj);
            });

        })

    });
};

// 改变编译路径
let changePath = function(){
    let result = window.cep.fs.showOpenDialog (true, true, "修改编译后的路径", "D:/", "");
    if(result.data){
        outputPresetPath = path.join(result.data[0],'/');
        outputPresetPath = outputPresetPath.replace(/\\/g,'/');
        renderPath();
    }


};

function formatTree(treeObj) {
    var child_node = 0;
    treeObj.tree.forEach(function (item) {
        if(!item.tree)child_node++;
    });
    if(child_node==1){
        treeObj.bg = treeObj.tree.splice(0,1)[0];
    }
    treeObj.tree.forEach(function (item) {
        if(item.tree){
            formatTree(item);
        }
    });
}

// 修改路径后的渲染
function renderPath(){
    document.getElementById('createPath').innerHTML = outputPresetPath;
}