// By Frode Eika Sandnes, Oslo Metropolitan University, Oslo, Norway, August, 2021


// This is an example application usilizing the colourcorrector.js library

//  call on startup to populate the results values
setup();


// globals
var textElement,
	inputFH,
	inputFS,
	inputFL,

	inputBH,
	inputBS,
	inputPL,

	inputContrast,
	textSize,
	isBold,
	aa,
	aaa,
	none,

	FHvalue,
	FSvalue,
	FLvalue,

	BHvalue,
	BSvalue,
	BLvalue,
	ContrastValue,
	TextSizeValue,
	
	FGvalue,
	BGvalue,
	
	harmony;

	
// Application specific: for use with the interactive tool - update called whenever inputs are altered
function setup()
	{
	// connect variables to webpage
	textElement = document.getElementById("text");

	inputFH = document.getElementById("inputFH");
	inputFS = document.getElementById("inputFS");
	inputFL = document.getElementById("inputFL");

	inputBH = document.getElementById("inputBH");
	inputBS = document.getElementById("inputBS");
	inputBL = document.getElementById("inputBL");
		
	inputContrast = document.getElementById("inputContrast");
	textSize = document.getElementById("textSize");
	isBold = document.getElementById("isBold");
	aa = document.getElementById("aa");
	aaa = document.getElementById("aaa");
	none = document.getElementById("none");

	FHvalue = document.getElementById("FHvalue");	
	FSvalue = document.getElementById("FSvalue");	
	FLvalue = document.getElementById("FLvalue");	

	BHvalue = document.getElementById("BHvalue");	
	BSvalue = document.getElementById("BSvalue");	
	BLvalue = document.getElementById("BLvalue");		

	ContrastValue = document.getElementById("ContrastValue");	
	TextSizeValue = document.getElementById("TextSizeValue");	

	FGvalue = document.getElementById("FGvalue");	
	BGvalue = document.getElementById("BGvalue");	

	harmony = document.getElementById("harmony");	

	// connect handlers
	inputFH.oninput = () => {updateBackground();}
	inputFS.oninput = () => {updateBackground();}
	inputFL.oninput = () => {updateBackground();}

	inputBH.oninput = () => {updateText();}
	inputBS.oninput = () => {updateText();}
	inputBL.oninput = () => {updateText();}
	textSize.oninput = () => {
							setTextStyle();
							updateText();								
							}

	// if contrast slider moves - update the text first since it is smaller pixel real estate
	inputContrast.oninput = () => 	{
									updateText();
									}	

	isBold.oninput = () =>	{
							setTextStyle();
							updateText();																	
							}	

	aa.oninput = () => {setConformance();}	
	aaa.oninput = () => {setConformance();}	
	none.oninput = () => {setConformance();}	
	
	// Do initial paint
	setTextStyle();			
	updateText();
	}

function setTextStyle()
	{
	if (isBold.checked)
		{
		textElement.setAttribute("style","font-weight: bold; font-size: "+textSize.value+"px;");		
		}
	else
		{
		textElement.setAttribute("style","font-weight: normal; font-size: "+textSize.value+"px;");											
		}				
	}

function checkConformance()
	{
	var fg = hslToRgb(inputFH.value/100,
		inputFS.value/100,
		inputFL.value/100);
	var bg = hslToRgb(inputBH.value/100,
		inputBS.value/100,
		inputBL.value/100);
	var ratio = 1/contrastRatio(fg,bg);
	if (ratio > 7)
		{
		aaa.checked = true;
		}
	else if (isLarge() && ratio > 4.5)
		{
		aaa.checked = true;
		}
	else if (ratio >  4.5)
		{
		aa.checked = true;
		}	
	else if (isLarge() && ratio > 3)
		{
		aa.checked = true;
		}	
	else
		{
		none.checked = true;
		}
	}

function setConformance()
	{
	var prevContrast = inputContrast.value;
	if (aaa.checked)
		{
		inputContrast.value = 7;	
		}	
	else if (aaa.checked && isLarge())
		{
		inputContrast.value = 4.5;	
		}
	else if (aa.checked)
		{
		inputContrast.value = 4.5;	
		}	
	else if (aa.checked && isLarge())
		{
		inputContrast.value = 3;	
		}	
	else if (none.checked)
		{
		inputContrast.value = 1;	
		}
	// do colour update if requirements have become stricter		
	if (prevContrast < inputContrast.value)
		{			
		updateText();	
		}
	}



function isLarge()
	{
	var fontSize = parseFloat(textSize.value);		
	if (isBold.checked && fontSize > 14)
		{
		return true;	
		}	
	if (fontSize > 18)
		{
		return true;	
		}
	return false;		
	}

function updateBackground()
	{
	update(backgroundSearch);
	}
function updateText()
	{
	update(textSearch);
	}		

function backgroundSearch(fg,bg,limit)
	{
	bg = searchForContrast(bg,fg,limit);			
	var ratio = contrastRatio(fg,bg);
	if (ratio > limit)
		{	// we also need to adjust foreground
		fg = searchForContrast(fg,bg,limit);				
		}	
	return [fg, bg, ratio];		
	}
function textSearch(fg,bg,limit)
	{
	var fg = searchForContrast(fg,bg,limit);			
	ratio = contrastRatio(fg,bg);
	if (ratio > limit)
		{	// we also need to adjust background
		bg = searchForContrast(bg,fg,limit);				
		}	
	return [fg, bg, ratio];		
	}
function update(search)
	{
	var fg = hslToRgb(inputFH.value/100,
		inputFS.value/100,
		inputFL.value/100);
	var bg = hslToRgb(inputBH.value/100,
		inputBS.value/100,
		inputBL.value/100);
	var ratio = contrastRatio(fg,bg);
	var limit = 1/inputContrast.value;
	if (ratio > limit)
		{
		[fg, bg, ratio] = search(fg,bg,limit);
		}
	// update sliders
	var fgHSL = rgbToHsl(fg.r, fg.g, fg.b);
	var bgHSL = rgbToHsl(bg.r, bg.g, bg.b);

	// Possible improvement - replace to if statements with if-else - and more FL and BL outside of if statement as they are executed in both blocks.
//	inputFH.value = fgHSL.h*100;		// not setting this to avoid instability and oscilations
	if (search == backgroundSearch)			// checking which function is passed to this function
		{	
		//inputFS.value = fgHSL.s*100;		// not setting foreground saturation to avoid oscilation (when adjusting backround) 
		inputFL.value = fgHSL.l*100;		// but set lightness as it is the most important.

		inputBS.value = bgHSL.s*100;		// need to set the new saturation of the background
		inputBL.value = bgHSL.l*100;		// need to also set the new lightness of the background
		}

//	inputBH.value = bgHSL.h*100;		// not setting this to avoid instability and oscilations	
	if (search == textSearch)			// checking which function is passed to this function
		{
		//inputBS.value = bgHSL.s*100;		// not setting background saturation to avoid oscilation (when adjusting text) 
		inputBL.value = bgHSL.l*100;		// but set lightness as it is the most important.

		inputFS.value = fgHSL.s*100;		// need to set the new saturation of the text
		inputFL.value = fgHSL.l*100;		// need to also set the new lightness of the text
		}

	// Do the change
	fg = colorString(fg);
	setColour(textElement,fg);	
	bg = colorString(bg);
	textElement.style.backgroundColor = bg;	

	// update text labels
	FHvalue.innerText = inputFH.value;
	FSvalue.innerText = inputFS.value;
	FLvalue.innerText = inputFL.value;

	BHvalue.innerText = inputBH.value;
	BSvalue.innerText = inputBS.value;
	BLvalue.innerText = inputBL.value;

	ContrastValue.innerText = inputContrast.value; 
	TextSizeValue.innerText = textSize.value; 

	FGvalue.innerText = fg;
	BGvalue.innerText = bg;

	analyseHarmony(ratio);
	checkConformance();			
	}

function analyseHarmony(ratio)
	{
	// find angle between hues based on cross product of hue vectors.
	var f = inputFH.value;		
	var b = inputBH.value;	
	var fAngle = 2*Math.PI*f/100;
	var bAngle = 2*Math.PI*b/100;
	var fx = Math.cos(fAngle);
	var fy = Math.sin(fAngle);
	var bx = Math.cos(bAngle);
	var by = Math.sin(bAngle);
	var crossProd = fx*bx + fy*by;
	var angle = Math.acos(crossProd);
	angle = 180*angle/Math.PI;
	if (angle < 30)
		{
		harmony.innerText = "Monochrome";
		}
	else if (angle < 60)
		{
		harmony.innerText = "Neightbour";
		}
	else if (angle < 150)
		{
		harmony.innerText = "Tetriadic";
		}
	else	
		{
		harmony.innerText = "Complimentary";
		}
	harmony.innerText += " ("+(1/ratio).toFixed(2)+")";
	}
