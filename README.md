# createHtml(com.adobe.myCreateHtml)        
CEP插件，用于快速将psd输出为html+css+img    

CEP 概述： 
```
CEP 即是 Common Extensibility Platform：通用扩展平台，    
CEP 上运行的实际上一个可以与宿主程序（调用这个扩展的程序，比如 Photoshop）进行交互 Web APP，    
它的界面是由 HTML5 网页构成，通过 JavaScript 调用 ExtendScript 与宿主交互（如操作图层），通过 Node.js 与本地操作系统交互(如读写文件、调用本地程序)
```


CEP 开发，需要了解以下： 
```
--HTML + CSS + JS 的网页开发基础概念    
--ExtendScript 的相关概念    
--对要开发的宿主应用（如 PhotoShop）的了解    
CEP插件开发教程参考http://nullice.com/archives/1622   
```

1.安装abobe photoshop cc版本        
2.配置开发环境    
```
 --->打开到注册表（运行 regedit）    
  CC 、CC 2014：HKEY_CURRENT_USER\Software\Adobe\CSXS.5    
  CC 2015：HKEY_CURRENT_USER\Software\Adobe\CSXS.6    
  CC 2015.5：HKEY_CURRENT_USER\Software\Adobe\CSXS.7     
  
 --->添加 字符串值 项 PlayerDebugMode，将值设置为 1  
  
```

3.CEP 扩展存放的目录  
```
 CC 2014, CC 2015, CC 2015.1      
 Windows 32 位	C:\Program Files\Common Files\Adobe\CEP\extensions\    
 Windows 64 位	C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\    
 Windows 通用	C:\Users\系统用户名\AppData\Roaming\Adobe\CEP\extensions\    
 OS X	/Library/Application Support/Adobe/CEP/extensions/     
 CC     
 Windows 32 位	C:\Program Files\Common Files\Adob\CEPServiceManager4\extensions\    
 Windows 64 位	C:\Program Files\Common Files\Adob\CEPServiceManager4\extensions\     
 Windows 通用	C:\Users\系统用户名\AppData\Roaming\Adobe\CEPServiceManager4\extensions\     
 OS X	/Library/Application Support/Adobe/CEP/extensions/     

```
   
4.运行项目   
 ```
 项目下运行： npm i 
 ```  
  打开photoshop cc ,     
  打开一张要编译的psd,对psd图层根据要生成的DOM结构进行处理      
  弹出，编译窗口 ：文件窗口-》扩展工具-》选择 CREATE HTML     
  点击编译     
  ```
  在编译目录下会生成编译好的文件，依次运行
  npm i    
  gulp
  将css文件在html中引入，运行npm start  
  ```
     
  
  
  
     
 

