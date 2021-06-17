
// By Frode Eika Sandnes, Oslo Metropolitan University, Oslo, Norway, January-June, 2021


// for use with the automatic page corrector
var wcag = "none";
var increments = 0.05;  // accuracy of the corrections of a total of 1.

var defaultfg = [];	// store the defaultvalues as read
var defaultbg = [];	// store the defaultvalues as read

// list of most html tags - some are not realistic and could be removed
var tagNames = ["html","body","div","nav","ul","ol","li","a","p","h1","h2","h3","span","textarea","input","label","button","b","option","select","abbr","acronym","address","applet","area","article","aside","audio","base","basefont","bdi","bdo","blockquote","br","canvas","caption","center","cite","code","col","colgroup","data","datalist","dd","del","details","dfn","dialog","dl","dt","em","embed","fieldset","figcaption","figure","font","footer","form","h4","h5","h6","header","hr","i","iframe","img","input","ins","kbd","label","legend","link","main","map","mark","meter","noscript","object","optgroup","output","param","picture","pre","progress","q","rp","rt","ruby","s","samp","section","select","small","source","strong","sub","summary","sup","svg","table","tbody","td","template","tfoot","th","time","tr","track","tt","u","var","video","wbr"];

// for use with the interactive tool
function update()
	{
	var fg99 = document.getElementById("inpt").elements.namedItem("fgid").value;		
	var bg99 = document.getElementById("inpt").elements.namedItem("bgid").value;	
	
	var e = document.getElementById("original");	
	e.style.color = fg99;
	e.style.backgroundColor = bg99;		
	var e = document.getElementById("originalh2");	
	e.style.color = fg99;
	e.style.backgroundColor = bg99;		
	var e = document.getElementById("originalp");	
	e.style.color = fg99;
	e.style.backgroundColor = bg99;		
	
	e = document.getElementById("aa");	
	e.style.color = fg99;
	e.style.backgroundColor = bg99;		
	e = document.getElementById("aaa");	
	e.style.color = fg99;
	e.style.backgroundColor = bg99;	
	e = document.getElementById("aah2");	
	e.style.color = fg99;
	e.style.backgroundColor = bg99;	
	e = document.getElementById("aap");	
	e.style.color = fg99;
	e.style.backgroundColor = bg99;			
	e = document.getElementById("aaah2");	
	e.style.color = fg99;
	e.style.backgroundColor = bg99;			
	e = document.getElementById("aaap");	
	e.style.color = fg99;
	e.style.backgroundColor = bg99;		
	setTimeout(updateCorrect, 100);
	}
// create innHTML colour status string
function addColourInfo(id,fg,bg,ratio)
	{
	e = document.getElementById(id);
	e.innerHTML = "<ul><li>Foreground text: "+fg+"</li>"+
				  "<li>Background: "+bg+"</li>"+
				  "<li>Contrast ratio: "+(1/ratio).toFixed(2)+"</li></ul>";	
	}
// perform the interactive update
function updateElement(level,tag,outid)
	{
	var id = level+tag;
	var e = document.getElementById(id);	
	updateCorrectElement(e,level,tag);
	// output colour values
	var bg = getInheritedBackgroundColor(e);				
	var fg = window.getComputedStyle(e, null).getPropertyValue("color");	
	var bg2 = getRGB(bg);
	var fg2 = getRGB(fg);		
	var ratio = contrastRatio(fg2,bg2);
	addColourInfo(outid,fg,bg,ratio);	
	}
// come here after 100 ms to read the colour values from the browser after they have been set	
function updateCorrect()
	{
	// update status info
	var e = document.getElementById("original");	
	var bg = getInheritedBackgroundColor(e);				
	var fg = window.getComputedStyle(e, null).getPropertyValue("color");	
	var bg2 = getRGB(bg);
	var fg2 = getRGB(fg);		
	var ratio = contrastRatio(fg2,bg2);
	addColourInfo("info",fg,bg,ratio);

	updateElement("aa","h2","aa-h2");	
	updateElement("aa","p","aa-p");		
	updateElement("aaa","h2","aaa-h2");	
	updateElement("aaa","p","aaa-p");			
	}
function updateCorrectElement(e, level, tag)
	{
	var bg = getInheritedBackgroundColor(e);				
	var fg = window.getComputedStyle(e, null).getPropertyValue("color");	
	var bg2 = getRGB(bg);
	var fg2 = getRGB(fg);
			
	var ratio = contrastRatio(fg2,bg2);
	var limit = contrastLevel(tag,level);
	if (ratio > limit)
		{
		fg2 = searchForContrast(fg2,bg2,limit);			
		ratio = contrastRatio(fg2,bg2);
		if (ratio > limit)
			{	// we also need to adjust background
			bg2 = searchForContrast(bg2,fg2,limit);				
			}					
		}
	// Do the change
	fg2 = colorString(fg2);
	setColour(e,fg2);	
	bg2 = colorString(bg2);
	e.style.backgroundColor = bg2;		
	}
// link to this routine in the html code either from the body onload or a button onclick - sets up keystroke callbacks.		
function setup()
	{
	window.addEventListener('keydown', function (e) 
				{
				if (e.ctrlKey && e.keyCode == 90) 
					{
					// Ctrl + z pressed
					if (wcag.includes("aaa"))
						{
						wcag = "aa";
						}
					else if (wcag.includes("none"))
						{
						wcag = "aaa";
						}
					else
						{
						wcag = "none";
						}
					colourAdjust();
					console.log("state "+wcag);
					}				
				else if (e.ctrlKey && e.keyCode == 37)
					{
					colourIncrements(-increments,0);						
					}
				else if (e.ctrlKey && e.keyCode == 38)
					{
					colourIncrements(0,-increments);	
					}
				else if (e.ctrlKey && e.keyCode == 39)
					{
					colourIncrements(increments,0);						
					}
				else if (e.ctrlKey && e.keyCode == 40)
					{
					colourIncrements(0,increments);	
					}					
				}
			);
	colourCorrect();
	console.log("state "+wcag);
	}
	
// colour increments based on keyboard keystrokes	
function colourIncrements(sInc,lInc)
	{
	var i = 0;
	for (var tag of tagNames)
		{		
		for (var e of document.querySelectorAll(tag)) 
			{
			var bg = getInheritedBackgroundColor(e);				
			var fg = window.getComputedStyle(e, null).getPropertyValue("color");				
			var bg2 = getRGB(bg);
			var fg2 = getRGB(fg);
			var fghsl = rgbToHsl(fg2.r, fg2.g, fg2.b);
			fghsl.s += sInc;
			fghsl.l += lInc;
			fghsl.s = (fghsl.s > 1)? 1: fghsl.s;
			fghsl.s = (fghsl.s < 0)? 0: fghsl.s;
			fghsl.l = (fghsl.l > 1)? 1: fghsl.l;
			fghsl.l = (fghsl.l < 0)? 0: fghsl.l;			
			fg2 = hslToRgb(fghsl.h,fghsl.s,fghsl.l);			
			fg2 = colorString(fg2);
			setColour(e,fg2);
			}
		}	
	}
// Factored a separate routine to make it easier to alter colour setting code	
function setColour(e,fg2)
	{
// Issue of !important is unreaolsved		
//console.log(e.style.cssText);		
/*	if (e.style.cssText.includes("important"))
		{
		alert("found important");
		}*/
	e.style.color = fg2;	
//	e.setAttribute('style', 'color: '+fg2+'  !impoarant;;');		
	}
	
// run with keystroke
function colourAdjust()
	{		
	var i = 0;
	for (var tag of tagNames)
		{		
		for (var e of document.querySelectorAll(tag)) 
			{
			var bg = defaultbg[i];
			var fg = defaultfg[i++];
			var bg2 = getRGB(bg);
			var fg2 = getRGB(fg);
			
			var ratio = contrastRatio(fg2,bg2);
			var limit = contrastLevel(tag,wcag);
			if (!wcag.includes("none"))
				{				
				if (ratio > limit)
					{
					fg2 = searchForContrast(fg2,bg2,limit);
					// info to developer
					console.log("WCAG level "+wcag+":Corrected foreground color of "+tag+" with html ");
					console.log(e);
					if (e.innerText.length > 0)
						{
						console.log(e.innerText);
						}
					console.log("\tfrom "+fg);
					console.log("\tto "+colorString(fg2));
					console.log("\tRadio of "+(1/ratio).toFixed(2)+" (limit = "+(1/limit).toFixed(1)+") with background "+colorString(bg2));
					ratio = contrastRatio(fg2,bg2);
					if (ratio > limit)
						{	// we also need to adjust background
						bg2 = searchForContrast(bg2,fg2,limit);
						console.log("\tAlse needed to correct the background color.");
						console.log("\tfrom "+bg);
						console.log("\tto "+colorString(bg2));		
						}					
					console.log("\n\n");					
					}
				}
			// Do the change
			fg2 = colorString(fg2);
			setColour(e,fg2);			
			bg2 = colorString(bg2);
			e.style.backgroundColor = bg2;	
			}
		}
	}
	
// get hex string for comparison to aim	
function hexString(c)	
	{
	return "#"+Math.round(c.r).toString(16)+Math.round(c.g).toString(16)+Math.round(c.b).toString(16);	
	}
	
// run on startup - setting up tables of original colours
function colourCorrect()
	{				
	for (var tag of tagNames)
		{		
		for (var e of document.querySelectorAll(tag)) 
			{
			var bg = getInheritedBackgroundColor(e);
			var fg = window.getComputedStyle(e, null).getPropertyValue("color");			
			defaultfg.push(fg);  // physical copy of string
			defaultbg.push(bg);
			}
		}
	}
	
function searchForContrast(fg,bg,limit)
	{
	var fghsl = rgbToHsl(fg.r, fg.g, fg.b);
	var bghsl = rgbToHsl(bg.r, bg.g, bg.b);
	var minL = -1;
	var minDist = 100;
	var t;
	for (var l = 0;l<1;l += 0.01)
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
	if (minL < 0)  //-1  // we did not find anything so setting the most extreme lightness preparing for 
		{
		minL = (bghsl.l > 0.5) ? 0: 1;
		}
	t = hslToRgb(fghsl.h,fghsl.s,minL);
	return t;
	}			
// create a html colour string 	
function colorString(rgb)
	{
	return "rgb("+Math.round(rgb.r)+", "+Math.round(rgb.g)+", "+Math.round(rgb.b)+")";
	}
// find the most appropriate contrast level	
function contrastLevel(tag, wcag)
	{
	var level = 0;
	if (wcag.includes("aaa"))
		{
		if (tag.includes("h1")||tag.includes("h2")||tag.includes("h3"))
			{
			level = 1/4.5;
			}
		else	
			{
			level = 1/7;
			}
		}
	else if (wcag.includes("none"))
		{
		level = 100;
		}
	else // aa
		{
		if (tag.includes("h1")||tag.includes("h2")||tag.includes("h3"))
			{
			level = 1/3;
			}
		else	
			{
			level = 1/4.5;
			}		
		}
	return level;
	}
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

function getDefaultBackground() 
	{
	// have to add to the document in order to use getComputedStyle
	var div = document.createElement("div")
	document.head.appendChild(div)
	var bg = window.getComputedStyle(div).backgroundColor
	document.head.removeChild(div)
	return bg
	}
		
function getRGB(str)
	{
	var white = {
			r: 255,
			g: 255,
			b: 255
			};
	if (str.includes("rgba(0, 0, 0, 0)"))
		{
		return white;
/*			{
			r: 255,
			g: 255,
			b: 255
			};*/
		}
	var match = str.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/);
	return match ? {
		r: match[1],
		g: match[2],
		b: match[3]
		} : {};
	}
	
function hexToRgb(hex) 
	{
	var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	hex = hex.replace(shorthandRegex, function(m, r, g, b) 
		{
		return r + r + g + g + b + b;
		});

	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? 
		{
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
		} : null;
	}

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

function contrastRatio2(fgrgb,bgrgb)
	{
	var L1 = luminance(bgrgb.r, bgrgb.g, bgrgb.b);
	var L2 = luminance(fgrgb.r, fgrgb.g, fgrgb.b);		
	var ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
	return ratio;
	}
	
function contrastRatio(fgrgb,bgrgb)
	{
	const bgluminance = luminance(bgrgb.r, bgrgb.g, bgrgb.b);
	const fgluminance = luminance(fgrgb.r, fgrgb.g, fgrgb.b);
	const ratio = bgluminance > fgluminance 
		? ((fgluminance + 0.05) / (bgluminance + 0.05))
		: ((bgluminance + 0.05) / (fgluminance + 0.05));
	return ratio;
	}	
// colour space mapping
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
// colour space conversion
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
