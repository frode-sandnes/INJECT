
// By Frode Eika Sandnes, Oslo Metropolitan University, Oslo, Norway, January-June, 2021

// global status for increment colour change viewer
var increments = 0.05;  	// accuracy of the corrections of a total of 1.
var brightness = 0;			// default brightness 
var saturation = 0;			// default saturation
var hue = 0;				// default hue
var brightnessBackground = 0;	// default background brightness 
var saturationBackground = 0;	// default background saturation
var hueBackground = 0;		// default background hue

var relevantElements = new Map();	// all relevant elements
var aaCorrectedElements = new Map();	// all AA corrected elements
var aaaCorrectedElements = new Map();	// all AAA corrected elements

var aaAnnotations = "";
var aaaAnnotations = "";
var noAnnotations = getStatusMarkerString(0,"NONE");

// list of coordinates of where to insert marker to indicate contrast problems
var markers = [];
var markerMode = "on";

//  Starting point: event handler to ensure DOM is loaded before start is called..
window.addEventListener('DOMContentLoaded', (event) => start());
   
async function start()
    {		
    await browserUpdate();  // give control to the browser for the page to load and setup properly. In case defer is not set.
	// Then, determine if this is a general webpage test or special application (to avoid the app being tested).
	if (!document.getElementById("colour-corrector-app")) // set an element with this ID for applications
		{
		setup();	// used for other webpages with interactive inspection of colour contrasts
		}
    }
// togle marker mode
function toggleMarkerMode()
	{
	if (markerMode.match("on"))
		{
		markerMode = "off";
		}
	else	
		{
		markerMode = "on";	
		}
	updateState(); updateState(); updateState();		// make the state change visible
	}

// state machine based on function pointers
var updateState = noneState;	
function aaState()
	{
	colourAdjust(relevantElements,noAnnotations);	
	updateState = noneState;		// point to next state
	}
function aaaState()
	{
	colourAdjust(aaCorrectedElements,aaAnnotations);		
	updateState = aaState; 		// point to next state
	}
function noneState()
	{
	colourAdjust(aaaCorrectedElements,aaaAnnotations);			
	updateState = aaaState;		// point to next state
	}

// keyobard mappings
var keyboardMappings = new Map([
	["z", ()=>{updateState()}],
	["m", ()=>{toggleMarkerMode()}],
	["q", ()=>{colourIncrements(0,0,1,0,0,0)}], 
	["w", ()=>{colourIncrements(1,0,0,0,0,0)}],
	["e", ()=>{colourIncrements(0,1,0,0,0,0)}],
	["a", ()=>{colourIncrements(0,0,-1,0,0,0)}],
	["s", ()=>{colourIncrements(-1,0,0,0,0,0)}],	
	["d", ()=>{colourIncrements(0,-1,0,0,0,0)}],
	["r", ()=>{colourIncrements(0,0,0,0,0,1)}],
	["t", ()=>{colourIncrements(0,0,0,1,0,0)}],
	["y", ()=>{colourIncrements(0,0,0,0,1,0)}],
	["f", ()=>{colourIncrements(0,0,0,0,0,-1)}],
	["g", ()=>{colourIncrements(0,0,0,-1,0,0)}],	
	["h", ()=>{colourIncrements(0,0,0,0,-1,0)}]
]);

// this one is used for the analysis of generic webpages - called if not the special ID is set (see start()).		
async function setup()
	{
	// add tooltip styles to the document for more detailed info. - use 576 in style classname to reduce risk of name collision
	document.head.insertAdjacentHTML('beforeend', '<style>'
		+'.tooltip576 .tooltiptext576 {visibility: hidden; background-color: black; color: #fff; width:100%; font-size: 80%; z-index: 2147483647;}'
		+'.tooltip576:hover .tooltiptext576 {visibility: visible;</style>');  

	// add a marker element for attaching the markers
	var colourMarkers = document.createElement("div");
	colourMarkers.setAttribute("id", "colour_markers");
	colourMarkers.innerHTML = getStarterMarkerString();			// attach initial status message
	document.body.appendChild(colourMarkers);

	// add a marker element for incremental exploration status
	var incMarkers = document.createElement("div");
	incMarkers.setAttribute("id", "increment_markers");
	document.body.appendChild(incMarkers);

	await browserUpdate();

	window.addEventListener('keydown', function (e) 
			{
			if (keyboardMappings.has(e.key))
				{
				keyboardMappings.get(e.key)();	// call the respective function
				}														
			}
		);
	findRelevantElements(); // setting up tables 
	aaAnnotations = findColourAdjustments("aa",aaCorrectedElements);	// do an initial view of status
	aaaAnnotations = findColourAdjustments("aaa",aaaCorrectedElements);	// do an initial view of status
	updateState();	// show initial screen	-- go straight to aaa
	}
	
// run on startup - setting up tables of original colours
function findRelevantElements()
	{				
	for (var e of document.querySelectorAll("*")) 
		{
		if (isStopTag(e))		// skip stop tag elmements (html, script, etc.)
			{
			continue;
			}
		if (isTagWithoutText(e)) // skip elements without text content
			{
			continue;				
			}			
		var bg = getInheritedBackgroundColor(e);
		var fg = window.getComputedStyle(e, null).getPropertyValue("color");	
		var bg2 = getRGB(bg);
		var fg2 = getRGB(fg);		
		relevantElements.set(e,
								{
								fg: fg, 
								bg: bg
								});				
		}
	}

// add an offset and truncate according to limits
function addAndTrunc(value,offset,min,max)
	{
	var v = value + offset;
	v = (v > max)? max: v;
	v = (v < min)? min: v;	
	return v;
	}
// colour increments based on keyboard keystrokes	
function colourIncrements(sInc,lInc,hInc,sIncB,lIncB,hIncB)
	{
console.log("dete");		
	var steps = 1/increments;
	brightness = addAndTrunc(brightness,lInc,-steps,steps);
	saturation = addAndTrunc(saturation,sInc,-steps,steps);
	hue 	   = addAndTrunc(hue,hInc,-steps,steps);
	brightnessBackground = addAndTrunc(brightnessBackground,lIncB,-steps,steps);
	saturationBackground = addAndTrunc(saturationBackground,sIncB,-steps,steps);
	hueBackground  	     = addAndTrunc(hueBackground,hIncB,-steps,steps);

	for (var e of relevantElements.keys()) 
		{
		var colour = relevantElements.get(e);
		var bg = colour.bg;	
		var fg = colour.fg;				
		var bg2 = getRGB(bg);
		var fg2 = getRGB(fg);
		var fghsl = rgbToHsl(fg2.r, fg2.g, fg2.b);
		var bghsl = rgbToHsl(bg2.r, bg2.g, bg2.b);

		fghsl.s = addAndTrunc(fghsl.s,saturation*increments,0,1);
		fghsl.l = addAndTrunc(fghsl.l,brightness*increments,0,1);	
		fghsl.h = addAndTrunc(fghsl.h,hue*increments,0,1);
		bghsl.s = addAndTrunc(bghsl.s,saturationBackground*increments,0,1);
		bghsl.l = addAndTrunc(bghsl.l,brightnessBackground*increments,0,1);	
		bghsl.h = addAndTrunc(bghsl.h,hueBackground*increments,0,1);

		fg2 = hslToRgb(fghsl.h,fghsl.s,fghsl.l);			
		fg2 = colorString(fg2);
		setColour(e,fg2);

		bg2 = hslToRgb(bghsl.h,bghsl.s,bghsl.l);			
		bg2 = colorString(bg2);
		e.style.backgroundColor = bg2;	
		}
	var e = document.getElementById("increment_markers");
	e.innerHTML = getIncrementStatusMarkerString();  
	var e = document.getElementById("colour_markers");
	e.innerHTML = "";	// remove status message as in increment mode 		
	wcag = "none";		// reset the state so that all elements are recoloured when returning		
	}

// Utility function formatting - the fixed text box giving status
function getStarterMarkerString()
	{
	return "<span style=\"background: black; color: yellow; font-weight: bold;font-size: 100%;position: fixed; left: 20%; width: 60%; top: 40%; height: 20%; z-index: 2147483647;\">"
		+"Wait, analyzing document.... "
	 	+"</span>";
	}	
// Utility function formatting - the fixed text box giving status
function getStatusMarkerString(n,conformanceLevel)
	{
	return "<span style=\"background: black; color: lime; font-weight: bold;font-size: 100%;position: fixed; bottom: 5%; left: 5%; z-index: 2147483647;\">Status: ["
		+conformanceLevel.toUpperCase()+", issues: "+n+"]"
		+"<br><small>Controls: Z (cycle), M (markers), Q-Y,A-H (incr)</small>"
	 	+"</span>";
	}
function getIncrementStatusMarkerString()
	{
	return "<span style=\"background: black; color: magenta; font-weight: bold;font-size: 50%;position: fixed; top: 2%; right: 2%; z-index: 2147483647;\">"
		+"text<br>H: "+(100*hue*increments).toFixed(0)+"% (q/a)<br>S: "+(100*saturation*increments).toFixed(0)+"% (w/s)<br> L: "+(100*brightness*increments).toFixed(0)+"% (e/d)<br><br>"
		+"background<br>H: "+(100*hueBackground*increments).toFixed(0)+"% (r/f)<br>S: "+(100*saturationBackground*increments).toFixed(0)+"% (t/g)<br> L: "+(100*brightnessBackground*increments).toFixed(0)+"% (y/h)"
	 	+"</span>";
	}	
// Utility function formatting - the marker for each issue
function getIssueMarkerString(x,y,c,txt)
	{
	return "<div class=\"tooltip576\" style=\"position: absolute; top: "+y+"px;left: "+x+"px; z-index: 2147483646;\"><span style=\"background: yellow; color: red; font-weight: bold;font-size: 200%;\">["+c+"]</span><span class=\"tooltiptext576\">"+txt+"</span></div>";
	}

// Utility function logger: log the change in foreground colour
function logColourChange(c,e,fg,fg2,ratio,limit,bg2,conformanceLevel)
	{
	var stringLen = 40;  // The length of the content to inlude			
	var tag = e.tagName;		
	console.log("\n\n");					
	console.log("===============================================================");
	console.log("Issue "+(c)+": WCAG level "+conformanceLevel+":Corrected foreground color of "+tag+" with html ");
	console.log(e);
	if (e.innerText.length > 0)
		{
		console.log("\tContent: \""+e.innerText.substring(0,stringLen)+"\"");
		}
	console.log("\tfrom "+fg);
	console.log("\tto "+colorString(fg2));
	console.log("\tRadio of "+(1/ratio).toFixed(2)+" (limit = "+(1/limit).toFixed(1)+") with background "+colorString(bg2));
	}
// Utility function logger: log the change in background colour
function logBackgroundChange(bg,bg2)
	{
	console.log("\tAlse needed to correct the background color.");
	console.log("\tfrom "+bg);
	console.log("\tto "+colorString(bg2));				
	}
function makeToolTipText(fg,fg2)
	{
	return " Text " +fg+"/ -> " + colorString(fg2)+"/";
	}	
function makeToolTipBackground(bg,bg2)
	{
	return ", background "
		+bg+"/ -> "+colorString(bg2)+"/";
	}
// build the data structure with adjustments
function findColourAdjustments(conformanceLevel,m,annotations)
	{		
	markers = [];	// reset the list of markers to be indicated as it will vary from case to case
	var toolTip = []; 
	var c = 1;	
	for (var e of relevantElements.keys()) 
		{
		var colours = relevantElements.get(e);	

		var bg = colours.bg;
		var fg = colours.fg;
		var bg2 = getRGB(bg);
		var fg2 = getRGB(fg);
		
		var ratio = contrastRatio(fg2,bg2);
		var limit = contrastLevel(e,conformanceLevel);
		if (ratio > limit)
			{
			// store the coordinate of the element that needs to be altered in order to mark it
			var rect = e.getBoundingClientRect();
			markers.push(rect);						

			fg2 = searchForContrast(fg2,bg2,limit);
			logColourChange(c++,e,fg,fg2,ratio,limit,bg2,conformanceLevel);
			var toolTipText = makeToolTipText(fg,fg2);
			ratio = contrastRatio(fg2,bg2);			
			if (ratio > limit)
				{	// we also need to adjust background
				bg2 = searchForContrast(bg2,fg2,limit);
				logBackgroundChange(bg,bg2);
				toolTipText += makeToolTipBackground(bg,bg2);				
				}		
			toolTip.push(toolTipText);								
			}		
		// Store the change
		fg2 = colorString(fg2);
		bg2 = colorString(bg2);			
		m.set(e,
				{
				fg: fg2,
				bg: bg2
				});
		}

	// add the end - add visual markers and status indicator
	var annotations = "";
	c = 1; // counter
	var bodyRect = document.body.getBoundingClientRect(); // need reference to body as origin
	for (var rect of markers)
		{
		var toolTipText = toolTip[markers.indexOf(rect)];	
		var x = rect.x; // retrieve the coordinates of the tag
		var y = rect.y;
		// add  colour marker element 
		annotations += getIssueMarkerString(Math.floor(x-bodyRect.x), Math.floor(y-bodyRect.y), c++,toolTipText);
		}
	annotations += getStatusMarkerString(c-1,conformanceLevel);
	return annotations;
	}
	
// display the changes with annotations according to keystroke commands
function colourAdjust(m,annotations)
	{		
	var e = document.getElementById("colour_markers");
	e.innerHTML = "";	// remove the markers  
	
	for (var e of m.keys()) 
		{
		var colour = m.get(e);
		var bg = colour.bg;
		var fg = colour.fg;
		var bg2 = getRGB(bg);
		var fg2 = getRGB(fg);
		
		// Do the change
		fg2 = colorString(fg2);
		setColour(e,fg2);			
		bg2 = colorString(bg2);			
		e.style.backgroundColor = bg2;	
		}

	// add the end - add visual triangular red markers 
	if (markerMode.match("on"))
		{	
		var e = document.getElementById("colour_markers");
		e.innerHTML = annotations; 
		var e = document.getElementById("increment_markers");
		e.innerHTML = "";	// remove the increment marker, as we are now in cyucling mode 
		}  		
	}
	
// return true if the tag is in the set of stop-tags, i.e. tags that are not to be be considered
function isStopTag(e)
	{
	var stopTags = ["html","head","body","script","link","title"];
	var tag = e.tagName;
	tag = tag.toLowerCase();
	return stopTags.includes(tag);
	}
	

// Utility function contrast: find colours that satisfies the given contrast limit - this is the essence of this project.
// the "new" version with iterative subdivision - now goes to 3 levels of precision, but only with
// 30 iterations. Precision beyond this is not visible or detectable due to the limited precision 
// in the contrast equations.
function searchForContrast(fg,bg,limit)
	{	
	var fghsl = rgbToHsl(fg.r, fg.g, fg.b);
	var bghsl = rgbToHsl(bg.r, bg.g, bg.b);
	var minL = -1;
	var minDist = 100;
	var t;

	var from = 0;
	var to = 1;
	var step = 0.1;
	var levelOfPrecision = 4;
		
	// loop through each digit of precision at a time.
	for (var decimals = 1;decimals < levelOfPrecision; decimals++)
		{
		// search across the current level of precision
		for (var l = from;l<to;l += step)
			{
			fghsl.l = l;
			t = hslToRgb(fghsl.h,fghsl.s,fghsl.l);
			var ratio = contrastRatio(t,bg);
			if (ratio < limit)
				{
				if (minDist > Math.abs(l - bghsl.l))
					{
					minDist = Math.abs(l - bghsl.l);
					minL = l;
					}
				}
			}
		from = (minL > 0)? minL - step: 0;
		to = (minL <1 )? minL + step: 1;
		step /= 10;	// go one level down in precision.			
		}
	if (minL < 0)  //-1  // we did not find anything so setting the most extreme lightness preparing for 
		{
		minL = (bghsl.l > 0.5) ? 0: 1;
		}
	t = hslToRgb(fghsl.h,fghsl.s,minL);
	return t;
	}		

// Utility function contrast: get the appropriate contrast limit based on size and conformance level. 
function contrastLevel(e, wcag)
	{
	var level = 100;	// default, status none - i.e. no colour correction.
	if (wcag.includes("aaa"))
		if (isLargeText(e))		level = 1/4.5;
		else					level = 1/7;
	else if (wcag.includes("aa"))
		if (isLargeText(e))		level = 1/3;
		else					level = 1/4.5;
	return level;
	}

// Utility function for browser: Set the colour of an element	
function setColour(e,fg2)
	{
	e.style.color = fg2;		
	}
	
// Utility function for browser: check if a text has text contents (ignore nesting). If it has no text content it should be ignored.
function isTagWithoutText(e)
	{
	if (typeof e.childNodes[0] == 'undefined')
		{
		return true;		// has no children - empty - it is withoutChild!
		}	
	// get the text
	var divText = "";
	for (var child of e.childNodes)
		{
		if (child.nodeValue != null)
			{
			divText += child.nodeValue;
			}
		}
	if (typeof divText == 'undefined')
		{
		return true;	// text not defined - it is withoutChild!
		}	
	// clear away spaces
	divText = divText.replace(/\n/g,"").replace(/\t/g,"").replace(/\s/g,"")
	if (divText == "")
		{
		return true;	// text is empty - it is withoutChild!
		}						
	return false; // it much have text
	}

// Utility function for browser:  determine if the text is considered "large" or not.
// Changed from using H-tags as indicator of large text to the following definition:
// "Large text is defined as 14 point (typically 18.66px) and bold or larger, or 18 point (typically 24px) or larger.
// find the most appropriate contrast level":
// described at: https://webaim.org/resources/contrastchecker/	
function isLargeText(e)
	{
	var style = window.getComputedStyle(e, null).getPropertyValue('font-size');
	var fontSize = parseFloat(style);		
	if (isBold(e) && fontSize > 14)
		{
		return true;	
		}	
	if (fontSize > 18)
		{
		return true;	
		}
	return false;		
	}

// Utility function for browser: determine if the element text is in bold - then it is considered "large".
function isBold(e) 
	{
	var fontWeight = getComputedStyle(e).fontWeight;
	if (!fontWeight)
		{
		return false;	
		}
	return (Number(fontWeight) > 400 || fontWeight === 'bold' || fontWeight === 'bolder'); 
	}	

// Utility functions brower: getting the actual colour of an element in the DOM
// what the background colour is depends on other elements in the DOM tree
function getInheritedBackgroundColor(el) 
	{
	// get default style for current browser
	var defaultStyle = getDefaultBackground() // typically "rgba(0, 0, 0, 0)"
  
	// get computed color for el
	var backgroundColor = window.getComputedStyle(el).backgroundColor
  
	// if we got a real value, return it
	if (backgroundColor != defaultStyle) return backgroundColor

	// if we've reached the top parent el without getting an explicit color, return default
	if (!el.parentElement) return defaultStyle
  
	// otherwise, recurse and try again on parent element
	return getInheritedBackgroundColor(el.parentElement)
	}

// Utility functions brower: get the rendered colour of an element	
function getDefaultBackground() 
	{
	// have to add to the document in order to use getComputedStyle
	var div = document.createElement("div")
	document.head.appendChild(div)
	var bg = window.getComputedStyle(div).backgroundColor
	document.head.removeChild(div)
	return bg
	}
		
// Utility functions colour string processing: read rgb string.	
function getRGB(str)
	{
	var white = {
			r: 255,
			g: 255,
			b: 255
			};
	if (str.includes("rgba(0, 0, 0, 0)"))	// the default bkack transparent background is really white.
		{
		return white;
		}
	var match = str.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/);
	return match ? {
		r: match[1],
		g: match[2],
		b: match[3]
		} : {};
	}
	
// Utility functions colour string processing: create a html colour string 	
function colorString(rgb)
	{
	return "rgb("+Math.round(rgb.r)+", "+Math.round(rgb.g)+", "+Math.round(rgb.b)+")";
	}

// Utility functions contrast: colour luminance as defined in WCAG
function luminance(r, g, b) 
	{
    var a = [r, g, b].map(function (v) 
		{
        v /= 255;
        return v <= 0.03928
            ? v / 12.92
            : Math.pow( (v + 0.055) / 1.055, 2.4 );
		});
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
	}

// Utility functions contrast: contrast calculations as defined in WCAG
function contrastRatio(fgrgb,bgrgb)
	{
	const bgluminance = luminance(bgrgb.r, bgrgb.g, bgrgb.b);
	const fgluminance = luminance(fgrgb.r, fgrgb.g, fgrgb.b);
	const ratio = bgluminance > fgluminance 
		? ((fgluminance + 0.05) / (bgluminance + 0.05))
		: ((bgluminance + 0.05) / (fgluminance + 0.05));
	return ratio;
	}	

// Utility functions colour space: from rgb to hsl conversion
function rgbToHsl(r, g, b)
	{
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min)
		{
        h = s = 0; // achromatic
		}
	else
		{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max)
			{
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
			}
        h /= 6;
		}

	return {
		h: h,
		s: s,
		l: l
		};		
	}

// Utility functions colour space: from hsl to rgb conversion	
function hslToRgb(h, s, l)
	{
    var r, g, b;

    if(s == 0)
		{
        r = g = b = l; // achromatic
		}
	else
		{
        function hue2rgb(p, q, t)
			{
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
			}

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
		}

	return {
		r: r*255,
		g: g*255,
		b: b*255
		};	
	}

// Utility function general: sleep and give control back to browser.
function browserUpdate() 
	{
	var ms = 10; // number of millisecs to pause before returning
	return new Promise(resolve => setTimeout(resolve, ms));
	}

// Utility function for colour harmony names -  Angles in radians
function harmonyName(fAngle,bAngle)
	{
	var name = "";
	var fx = Math.cos(fAngle);
	var fy = Math.sin(fAngle);
	var bx = Math.cos(bAngle);
	var by = Math.sin(bAngle);
	var crossProd = fx*bx + fy*by;
	var angle = Math.acos(crossProd);
	angle = 180*angle/Math.PI;
	if (angle < 30)
		{
		name = "Monochrome";
		}
	else if (angle < 60)
		{
		name = "Neightbour";
		}
	else if (angle < 150)
		{
		name = "Tetriadic";
		}
	else	
		{
		name = "Complimentary";
		}		
	return name;
	}