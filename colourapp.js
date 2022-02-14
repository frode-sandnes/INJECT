// By Frode Eika Sandnes, Oslo Metropolitan University, Oslo, Norway, January-June, 2021


// This is an example application usilizing the colourcorrector.js library
// Originally inside colourcorrector.js, but separated out to keep core code smaller and generic.

//  Starting point: event handler to ensure DOM is loaded before update is called..
//  call on startup to populate the results values
window.addEventListener('DOMContentLoaded', (event) => update());

// Application specific: for use with the interactive tool - update called whenever inputs are altered
function update()
	{
	var fg99 = document.getElementById("inpt").elements.namedItem("fgid").value;		
	var bg99 = document.getElementById("inpt").elements.namedItem("bgid").value;	
	
    for (var id of ["original","originalh2","originalp","aa","aaa","aah2","aap","aaah2","aaap"])
        {
        var e = document.getElementById(id);	
        e.style.color = fg99;
        e.style.backgroundColor = bg99;	
        }
	setTimeout(updateCorrect, 100);
	}

function findColourDescription(c)
	{
	// get the colour names using colournamelookup.js
	var cVector = getRGB(c);	
	var cName = findName(cVector.r,cVector.g,cVector.b);
	return "<b>" + cName.name + "</b> (dev. "+colourDeviation(cName,cVector.r,cVector.g,cVector.b)+")";
	}
// Application specific: create innHTML colour status string
function addColourInfo(id,fg,bg,ratio)
	{
	var fgName = findColourDescription(fg);
	var bgName = findColourDescription(bg);
	// output the result
	e = document.getElementById(id);
	e.innerHTML = "<ul><li>Foreground text: "+fg+", "+fgName+"</li>"+
				  "<li>Background: "+bg+", "+bgName+"</li>"+
				  "<li>Contrast ratio: "+(1/ratio).toFixed(2)+"</li></ul>";	
	}
// Application specific: perform the interactive update
function updateElement(level,tag,outid)
	{
	var id = level+tag;
	var e = document.getElementById(id);	
	updateCorrectElement(e,level);
	// output colour values
	var bg = getInheritedBackgroundColor(e);				
	var fg = window.getComputedStyle(e, null).getPropertyValue("color");	
	var bg2 = getRGB(bg);
	var fg2 = getRGB(fg);		
	var ratio = contrastRatio(fg2,bg2);
	addColourInfo(outid,fg,bg,ratio);	
	}
// Application specific: come here after 100 ms to read the colour values from the browser after they have been set	
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
// Application specific	
function updateCorrectElement(e, level)
	{
	var bg = getInheritedBackgroundColor(e);				
	var fg = window.getComputedStyle(e, null).getPropertyValue("color");	
	var bg2 = getRGB(bg);
	var fg2 = getRGB(fg);
			
	var ratio = contrastRatio(fg2,bg2);
	var limit = contrastLevel(e,level);
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
