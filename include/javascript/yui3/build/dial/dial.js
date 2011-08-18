/*
 Copyright (c) 2010, Yahoo! Inc. All rights reserved.
 Code licensed under the BSD License:
 http://developer.yahoo.com/yui/license.html
 version: 3.3.0
 build: 3167
 */
YUI.add('dial',function(Y){var supportsVML=false,testVMLNode;if(Y.UA.ie&&Y.UA.ie<9){supportsVML=true;}
var Lang=Y.Lang,Widget=Y.Widget,Node=Y.Node;function Dial(config){Dial.superclass.constructor.apply(this,arguments);}
Dial.NAME="dial";Dial.ATTRS={min:{value:-220},max:{value:220},diameter:{value:100},value:{value:0,validator:function(val){return this._validateValue(val);}},minorStep:{value:1},majorStep:{value:10},stepsPerRev:{value:100},decimalPlaces:{value:0},strings:{valueFn:function(){return Y.Intl.get('dial');}},handleDist:{value:0.75}};function makeClassName(str){return Y.ClassNameManager.getClassName(Dial.NAME,str);}
Dial.CSS_CLASSES={label:makeClassName("label"),labelString:makeClassName("label-string"),valueString:makeClassName("value-string"),northMark:makeClassName("north-mark"),ring:makeClassName('ring'),ringVml:makeClassName('ring-vml'),marker:makeClassName("marker"),markerUser:makeClassName("marker-user"),markerUserVml:makeClassName("marker-user-vml"),centerButton:makeClassName("center-button"),centerButtonVml:makeClassName('center-button-vml'),resetString:makeClassName("reset-str"),handle:makeClassName("handle"),handleUser:makeClassName("handle-user"),handleUserVml:makeClassName("handle-user-vml"),markerHidden:makeClassName("marker-hidden"),dragging:Y.ClassNameManager.getClassName("dd-dragging")};var labelId=Dial.CSS_CLASSES.label+Y.guid();Dial.LABEL_TEMPLATE='<div id="'+labelId+'" class="'+Dial.CSS_CLASSES.label+'"><span class="'+Dial.CSS_CLASSES.labelString+'">{label}</span><span class="'+Dial.CSS_CLASSES.valueString+'"></span></div>';if(supportsVML===false){Dial.RING_TEMPLATE='<div class="'+Dial.CSS_CLASSES.ring+'"><div class="'+Dial.CSS_CLASSES.northMark+'"></div></div>';Dial.MARKER_TEMPLATE='<div class="'+Dial.CSS_CLASSES.marker+' '+Dial.CSS_CLASSES.markerHidden+'"><div class="'+Dial.CSS_CLASSES.markerUser+'"></div></div>';Dial.CENTER_BUTTON_TEMPLATE='<div class="'+Dial.CSS_CLASSES.centerButton+'"><div class="'+Dial.CSS_CLASSES.resetString+'">{resetStr}</div></div>';Dial.HANDLE_TEMPLATE='<div class="'+Dial.CSS_CLASSES.handle+'"><div class="'+Dial.CSS_CLASSES.handleUser+'" aria-labelledby="'+labelId+'" aria-valuetext="" aria-valuemax="" aria-valuemin="" aria-valuenow="" role="slider"  tabindex="0" title="{tooltipHandle}"></div></div>';}else{Dial.RING_TEMPLATE='<div class="'+Dial.CSS_CLASSES.ring+' '+Dial.CSS_CLASSES.ringVml+'">'+'<div class="'+Dial.CSS_CLASSES.northMark+'"></div>'+'<v:oval strokecolor="#ceccc0" strokeweight="1px"><v:fill type=gradient color="#8B8A7F" color2="#EDEDEB" angle="45"/></v:oval>'+'</div>'+'';Dial.MARKER_TEMPLATE='<div class="'+Dial.CSS_CLASSES.marker+' '+Dial.CSS_CLASSES.markerHidden+'">'+'<div class="'+Dial.CSS_CLASSES.markerUserVml+'">'+'<v:oval stroked="false">'+'<v:fill opacity="20%" color="#000"/>'+'</v:oval>'+'</div>'+'</div>'+'';Dial.CENTER_BUTTON_TEMPLATE='<div class="'+Dial.CSS_CLASSES.centerButton+' '+Dial.CSS_CLASSES.centerButtonVml+'">'+'<v:oval strokecolor="#ceccc0" strokeweight="1px">'+'<v:fill type=gradient color="#C7C5B9" color2="#fefcf6" colors="35% #d9d7cb, 65% #fefcf6" angle="45"/>'+'<v:shadow on="True" color="#000" opacity="10%" offset="2px, 2px"/>'+'</v:oval>'+'<div class="'+Dial.CSS_CLASSES.resetString+'">{resetStr}</div>'+'</div>'+'';Dial.HANDLE_TEMPLATE='<div class="'+Dial.CSS_CLASSES.handle+'">'+'<div class="'+Dial.CSS_CLASSES.handleUserVml+'" aria-labelledby="'+labelId+'" aria-valuetext="" aria-valuemax="" aria-valuemin="" aria-valuenow="" role="slider"  tabindex="0" title="{tooltipHandle}">'+'<v:oval stroked="false">'+'<v:fill opacity="20%" color="#6C3A3A"/>'+'</v:oval>'+'</div>'+'</div>'+'';}
Y.extend(Dial,Widget,{renderUI:function(){this._renderLabel();this._renderRing();this._renderMarker();this._renderCenterButton();this._renderHandle();if(supportsVML){this._setVMLSizes();}
this._setBorderRadius();this.contentBox=this.get("contentBox");this._centerX=this.get('diameter')/ 2;this._centerY=this.get('diameter')/ 2;this._handleDist=this._centerX*this.get('handleDist');this._originalValue=this.get('value');this._timesWrapped=0;this._angle=this._getAngleFromValue(this.get('value'));this._setTimesWrapedFromValue(this.get('value'));this._handleUserNode.set('aria-valuemin',this.get('min'));this._handleUserNode.set('aria-valuemax',this.get('max'));},_setBorderRadius:function(){var dia=this.get('diameter');this._ringNode.setStyle('WebkitBorderRadius',Math.floor(dia*0.5)+'px');this._handleUserNode.setStyle('WebkitBorderRadius',Math.floor(dia*0.1)+'px');this._markerUserNode.setStyle('WebkitBorderRadius',Math.floor(dia*0.05)+'px');this._centerButtonNode.setStyle('WebkitBorderRadius',Math.floor(dia*0.25)+'px');},bindUI:function(){this.after("valueChange",this._afterValueChange);var boundingBox=this.get("boundingBox"),keyEventSpec=(!Y.UA.opera)?"down:":"press:",keyLeftRightSpec=(!Y.UA.opera)?"down:":"press:";keyEventSpec+="38, 40, 33, 34, 35, 36";keyLeftRightSpec+="37, 39";Y.on("key",Y.bind(this._onDirectionKey,this),boundingBox,keyEventSpec);Y.on("key",Y.bind(this._onLeftRightKey,this),boundingBox,keyLeftRightSpec);Y.on('mouseenter',Y.bind(this._dialCenterOver,this),this._centerButtonNode);Y.on('mouseleave',Y.bind(this._dialCenterOut,this),this._centerButtonNode);Y.on('click',Y.bind(this._resetDial,this),this._centerButtonNode);Y.on('mousedown',Y.bind(function(){this._handleUserNode.focus();},this),this._handleNode);var dd1=new Y.DD.Drag({node:this._handleNode,on:{'drag:drag':Y.bind(this._handleDrag,this),'drag:start':Y.bind(this._handleDragStart,this),'drag:end':Y.bind(this._handleDragEnd,this)}});},_setTimesWrapedFromValue:function(val){if(val%this.get('stepsPerRev')===0){this._timesWrapped=(val / this.get('stepsPerRev'))-1;}else{this._timesWrapped=Math.floor(val / this.get('stepsPerRev'));}},_dialCenterOver:function(e){this._resetString.setContent(Y.substitute('{resetStr}',this.get('strings')));},_dialCenterOut:function(e){this._resetString.setContent('');},_handleDrag:function(e){var handleCenterX=e.pageX+this._handleUserNodeRadius,handleCenterY=e.pageY+this._handleUserNodeRadius;var ang=Math.atan((this._centerYOnPage-handleCenterY)/(this._centerXOnPage-handleCenterX))*(180 / Math.PI),deltaX=(this._centerXOnPage-handleCenterX);if(deltaX<0){ang=(ang+90);}else{ang=(ang-90);}
if(handleCenterY<this._centerYOnPage){if((this._prevX<=this._centerXOnPage)&&(handleCenterX>this._centerXOnPage)){this._timesWrapped=(this._timesWrapped+1);}else if((this._prevX>this._centerXOnPage)&&(handleCenterX<=this._centerXOnPage)){this._timesWrapped=(this._timesWrapped-1);}}
this._prevX=handleCenterX;var newValue=this._getValueFromAngle(ang);if((newValue>this.get('min'))&&(newValue<this.get('max'))){this.set('value',newValue);}else if(newValue>this.get('max')){this.set('value',this.get('max'));}else if(newValue<this.get('min')){this.set('value',this.get('min'));}},_handleDragStart:function(e){this._markerNode.removeClass(Dial.CSS_CLASSES.markerHidden);if(!this._prevX){this._prevX=this._handleNode.getX();}
this._centerYOnPage=(this._ringNode.getY()+this._centerY);this._centerXOnPage=(this._ringNode.getX()+this._centerX);},_handleDragEnd:function(){var node=this._handleNode;node.transition({duration:0.08,easing:'ease-in',left:this._setNodeToFixedRadius(this._handleNode,true)[0]+'px',top:this._setNodeToFixedRadius(this._handleNode,true)[1]+'px'},Y.bind(function(){this._markerNode.addClass(Dial.CSS_CLASSES.markerHidden);this._prevX=this._handleNode.getX();},this));this._setTimesWrapedFromValue(this.get('value'));},_setNodeToFixedRadius:function(obj,typeArray){var thisAngle=(this._angle-90),rad=(Math.PI / 180),newY=Math.round(Math.sin(thisAngle*rad)*this._handleDist),newX=Math.round(Math.cos(thisAngle*rad)*this._handleDist),dia=parseInt(obj.getStyle('width'),10);newY=newY-(dia*0.5);newX=newX-(dia*0.5);if(typeArray){return[this._centerX+newX,this._centerX+newY];}else{obj.setStyle('left',(this._centerX+newX)+'px');obj.setStyle('top',(this._centerX+newY)+'px');}},syncUI:function(){this._uiSetValue(this.get("value"));},_setVMLSizes:function(){var dia=this.get('diameter');var setSize=function(node,dia,percent){var suffix='px';node.getElementsByTagName('oval').setStyle('width',(dia*percent)+suffix);node.getElementsByTagName('oval').setStyle('height',(dia*percent)+suffix);node.setStyle('width',(dia*percent)+suffix);node.setStyle('height',(dia*percent)+suffix);};setSize(this._ringNode,dia,1.0);setSize(this._handleNode,dia,0.2);setSize(this._handleUserNode,dia,0.2);setSize(this._markerNode,dia,0.1);setSize(this._markerUserNode,dia,0.1);setSize(this._centerButtonNode,dia,0.5);this._handleUserNodeRadius=(dia*0.1);this._markerUserNodeRadius=(dia*0.05);},_renderLabel:function(){var contentBox=this.get("contentBox"),label=contentBox.one("."+Dial.CSS_CLASSES.label);if(!label){label=Node.create(Y.substitute(Dial.LABEL_TEMPLATE,this.get('strings')));contentBox.append(label);}
this._labelNode=label;this._valueStringNode=this._labelNode.one("."+Dial.CSS_CLASSES.valueString);},_renderRing:function(){var contentBox=this.get("contentBox"),ring=contentBox.one("."+Dial.CSS_CLASSES.ring);if(!ring){ring=contentBox.appendChild(Dial.RING_TEMPLATE);ring.setStyles({width:this.get('diameter')+'px',height:this.get('diameter')+'px'});}
this._ringNode=ring;},_renderMarker:function(){var contentBox=this.get("contentBox"),marker=contentBox.one("."+Dial.CSS_CLASSES.marker);if(!marker){marker=contentBox.one('.'+Dial.CSS_CLASSES.ring).appendChild(Dial.MARKER_TEMPLATE);}
this._markerNode=marker;if(supportsVML===true){this._markerUserNode=this._markerNode.one('.'+Dial.CSS_CLASSES.markerUserVml);}else{this._markerUserNode=this._markerNode.one('.'+Dial.CSS_CLASSES.markerUser);}
this._markerUserNodeRadius=parseInt(this._markerUserNode.getStyle('width'),10)*0.5;},_setXYResetString:function(){this._resetString.setStyle('top',(this._centerButtonNode.get('region').height / 2)-(this._resetString.get('region').height / 2)+'px');this._resetString.setStyle('left',(this._centerButtonNode.get('region').width / 2)-(this._resetString.get('region').width / 2)+'px');},_renderCenterButton:function(){var contentBox=this.get("contentBox"),centerButton=contentBox.one("."+Dial.CSS_CLASSES.centerButton);if(!centerButton){centerButton=Node.create(Y.substitute(Dial.CENTER_BUTTON_TEMPLATE,this.get('strings')));contentBox.one('.'+Dial.CSS_CLASSES.ring).append(centerButton);}
this._centerButtonNode=centerButton;this._resetString=this._centerButtonNode.one('.'+Dial.CSS_CLASSES.resetString);this._setXYResetString();this._resetString.setContent('');var offset=this.get('diameter')*0.25;this._centerButtonNode.setStyle('left',(offset)+'px');this._centerButtonNode.setStyle('top',(offset)+'px');},_renderHandle:function(){var contentBox=this.get("contentBox"),handle=contentBox.one("."+Dial.CSS_CLASSES.handle);if(!handle){handle=Node.create(Y.substitute(Dial.HANDLE_TEMPLATE,this.get('strings')));contentBox.one('.'+Dial.CSS_CLASSES.ring).append(handle);}
this._handleNode=handle;if(supportsVML===true){this._handleUserNode=this._handleNode.one('.'+Dial.CSS_CLASSES.handleUserVml);}else{this._handleUserNode=this._handleNode.one('.'+Dial.CSS_CLASSES.handleUser);}
this._handleUserNodeRadius=parseInt(this._handleUserNode.getStyle('width'),10)*0.5;},_setLabelString:function(str){this.get("contentBox").one("."+Dial.CSS_CLASSES.labelString).setContent(str);},_setResetString:function(str){this.set('strings.resetStr',str);this.get("contentBox").one("."+Dial.CSS_CLASSES.resetString).setContent(str);this._setXYResetString();this._resetString.setContent('');},_setTooltipString:function(str){this._handleUserNode.set('title',str);},_onDirectionKey:function(e){e.preventDefault();switch(e.charCode){case 38:this._incrMinor();break;case 40:this._decrMinor();break;case 36:this._resetDial();break;case 35:this._setToMax();break;case 33:this._incrMajor();break;case 34:this._decrMajor();break;}},_onLeftRightKey:function(e){e.preventDefault();switch(e.charCode){case 37:this._decrMinor();break;case 39:this._incrMinor();break;}},_incrMinor:function(){var newVal=(this.get('value')+this.get("minorStep"));newVal=Math.min(newVal,this.get("max"));this.set('value',newVal.toFixed(this.get('decimalPlaces'))-0);},_decrMinor:function(){var newVal=(this.get('value')-this.get("minorStep"));newVal=Math.max(newVal,this.get("min"));this.set('value',newVal.toFixed(this.get('decimalPlaces'))-0);},_incrMajor:function(){var newVal=(this.get('value')+this.get("majorStep"));newVal=Math.min(newVal,this.get("max"));this.set('value',newVal.toFixed(this.get('decimalPlaces'))-0);},_decrMajor:function(){var newVal=(this.get('value')-this.get("majorStep"));newVal=Math.max(newVal,this.get("min"));this.set('value',newVal.toFixed(this.get('decimalPlaces'))-0);},_setToMax:function(){this.set('value',this.get("max"));},_setToMin:function(){this.set('value',this.get("min"));},_resetDial:function(){this.set('value',this._originalValue);this._handleUserNode.focus();},_getAngleFromValue:function(newVal){var nonWrapedPartOfValue=newVal%this.get('stepsPerRev');var angleFromValue=nonWrapedPartOfValue / this.get('stepsPerRev')*360;return angleFromValue;},_getValueFromAngle:function(angle){if(angle<0){angle=(360+angle);}else if(angle===0){angle=360;}
var value=(angle / 360)*this.get('stepsPerRev');value=(value+(this._timesWrapped*this.get('stepsPerRev')));return value.toFixed(this.get('decimalPlaces'))-0;},_afterValueChange:function(e){this._uiSetValue(e.newVal);},_uiSetValue:function(val){this._angle=this._getAngleFromValue(val);if(this._handleNode.hasClass(Dial.CSS_CLASSES.dragging)===false){this._setTimesWrapedFromValue(val);this._setNodeToFixedRadius(this._handleNode,false);this._prevX=this._handleNode.getX();}
this._valueStringNode.setContent(val);this._handleUserNode.set('aria-valuenow',val);this._handleUserNode.set('aria-valuetext',val);this._setNodeToFixedRadius(this._markerNode,false);if((val===this.get('max'))||(val===this.get('min'))){if(this._markerUserNode.hasClass('marker-max-min')===false){this._markerUserNode.addClass('marker-max-min');if(supportsVML===true){this._markerUserNode.getElementsByTagName('fill').set('color','#AB3232');}}}else{if(supportsVML===true){this._markerNode.getElementsByTagName('fill').set('color','#000');}
if(this._markerUserNode.hasClass('marker-max-min')===true){this._markerUserNode.removeClass('marker-max-min');}}},_validateValue:function(val){var min=this.get("min"),max=this.get("max");return(Lang.isNumber(val)&&val>=min&&val<=max);}});Y.Dial=Dial;},'3.3.0',{requires:['widget','dd-drag','substitute','event-mouseenter','transition','intl'],skinnable:true,lang:['en','es']});