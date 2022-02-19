// By Frode Eika Sandnes, Oslo Metropolitan University, Oslo, Norway, February 2022

// This javascript file is included in the source of the page to be analyzed
// The code that is called before page load to connect things

// Globals
var viewPortHeight = window.innerHeight; // height of the viewport during multiple page scroll
var viewPortHWidth = window.innerWidth; // width of the viewport during multiple page scroll
var delta = 10;	// distance between sample points

//  Starting point: event handler to ensure DOM is loaded before analyseAllRealEstate is called..
window.addEventListener('DOMContentLoaded', (event) => analyseAllRealEstate());

// cycle to the page a bit, pageHeight at a time, see what is visible
async function analyseAllRealEstate()
	{
	// initialize
	var prevTop = -1;	// used to see if there are movements or stuck.	
	histogram = new Map();	

	window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });    
    await browserUpdate();     
	samples = 0;			
	var currentTop = window.pageYOffset; 

	// calc effective doc height as scroll area - height of viewport
	var docHeight = document.body.scrollHeight - window.innerHeight;	
	while (currentTop > prevTop)	
		{
		// add to calculations
		analyseVisibleRealEstate();	
		// go to next screenful
		prevTop = currentTop;
		// give control back to browser	
		window.scrollBy(0, viewPortHeight);				
		// call the scroller again until reached the bottom	
		await browserUpdate(); 
		currentTop = window.pageYOffset; 		
		}
	outputRealEstateStatistics();	
	}

async function outputRealEstateStatistics()
    {
    // add a new tag for output
    var report = document.createElement('div');
    report.style.cssText = 'overflow: auto; border: 5px solid yellow; padding: 5px; background: black; color: yellow; min-height:80%; width: 98%; position:fixed; top:10%; bottom:10%; left:0%; z-index: 2;';
    report.id = "info";
    document.body.appendChild(report);   
    await browserUpdate(); // give control to browser for a bit 
    // traverse list of elements
    var sortedHistogram = new Map([...histogram.entries()].sort((a, b) => b[1] - a[1]));
    var txt = "<span id=\"closeInfo\" style=\"cursor: pointer; position: absolute; top: 0%;right: 1%; padding: 12px 16px; transform: translate(25%, -25%);\">x</span>"
			+"<table><tr><th scope=\"col\">Colour</th><th scope=\"col\">Area</th><th scope=\"col\">Colour harmony</th><th scope=\"col\">Contrast</th><th scope=\"col\">Constrast ratio = 3  </th><th scope=\"col\">Constrast ratio = 4.5</th><th scope=\"col\">Constrast ratio = 7</th></tr>";
    for (var p of sortedHistogram.keys())
        {
        var pair = JSON.parse(p);
        // get the colour pair frequency
        var c = sortedHistogram.get(p);
        var cPst = (100*c/samples).toFixed(1)+"%";
        // prepare output
        txt += "<tr>" 
                    + "<td><span style=\"color: "+pair[0]+"; background: "+pair[1]+"\"> Text </span>: "
                    + pair[0] + " on " + pair[1] + "</td><td>" + cPst + "</td><td>"+harmony.get(p)+"</td><td>"+ratio.get(p)+"</td><td>"+correction3.get(p)+"</td><td>"+correction45.get(p)+"</td><td>"+correction7.get(p)
                +"</td></tr>";
        }
    // output the report
    txt += "<caption>Summary of page colours ("+histogram.size+" colour pairs)</caption></table>";
    report.innerHTML = txt;

	// add the close functionality
	await browserUpdate(); 	
	document.getElementById("closeInfo").addEventListener("click", function() 
		{
		this.parentElement.style.display = 'none';
	  	});
    }

// global var for bookkeeping	
var histogram = new Map();	
var ratio = new Map();
var harmony = new Map();	
var correction3 = new Map();	// the three levels of corrections	
var correction45 = new Map();	
var correction7 = new Map();	
var samples = 0;
// measure the current visible area - add to the accumulated results
function analyseVisibleRealEstate()
	{
	for (var i=0;i<viewPortHWidth;i+=delta)
		{
		for (var j=0;j<viewPortHeight;j+=delta)
			{
			samples++;
		 	var e = document.elementFromPoint(i, j);
			// check that the element is relevant
			if (e == null)
				{
				continue;
				}
			if (["HTML","BODY","DIV"].includes(e.tagName))
				{
				continue;
				}
			if (!isVisible(e))				// visibility attribute and opacity 
				{
				continue;	
				}
			if (e.nodeType != Node.TEXT_NODE && e.nodeType != Node.COMMENT_NODE)
				{	
                // get the colours
                var bg = getInheritedBackgroundColor(e);
	            var fg = window.getComputedStyle(e, null).getPropertyValue("color");	
                var bg2 = getRGB(bg);
                var fg2 = getRGB(fg);	       
                var bgn = findName(bg2.r, bg2.g, bg2.b).name;
                var fgn = findName(fg2.r, fg2.g, fg2.b).name;                   
                var pair = JSON.stringify([fgn,bgn]);    
				
				// track histogram
				if (histogram.has(pair))
					{
					var c = histogram.get(pair);
					c++;
					histogram.set(pair,c);
					}
				else
					{
					histogram.set(pair,1);
					}

				// track ratio
				var contrast = 1/contrastRatio(fg2,bg2);
				ratio.set(pair,contrast.toFixed(1));

				// track harmony
				var fgHSL = rgbToHsl(fg2.r, fg2.g, fg2.b);
				var bgHSL = rgbToHsl(bg2.r, bg2.g, bg2.b);
				var fAngle = fgHSL.h*2*Math.PI;
				var bAngle = bgHSL.h*2*Math.PI;		
				harmony.set(pair,harmonyName(fAngle,bAngle).toLowerCase());
				// track correction
				correction3.set(pair,findColorCorrection(3,fg2,bg2));
				correction45.set(pair,findColorCorrection(4.5,fg2,bg2));
				correction7.set(pair,findColorCorrection(7,fg2,bg2));
				}
			}	
		}
	}
	
function findColorCorrection(limit,fg2,bg2)
	{
	var contrast = 1/contrastRatio(fg2,bg2);		
	var text = "";
	if (limit > contrast)
		{
		var fg2 = searchForContrast(fg2,bg2,1/limit);			
		contrast = 1/contrastRatio(fg2,bg2);
		if (limit > contrast)
			{	// we also need to adjust background
			bg2 = searchForContrast(bg2,fg2,1/limit);				
			}	
		var bgn = findName(bg2.r, bg2.g, bg2.b).name;
		var fgn = findName(fg2.r, fg2.g, fg2.b).name;    
		text = "<span style=\"color: "+fgn+"; background: "+bgn+"\"> Text </span>: "+fgn + " on "+ bgn; 
		}	
	return text;
	}

// Utility function browser: return true only if element is visible, or not opaque.
function isVisible(e) 
	{
	var style = getComputedStyle(e);
	if (style.visibility !== 'visible')
		{
		return false;
		}
	if (style.opacity < 0.1) 
		{
		return false;
		}
	// also check opacity of parent	-- seems that element becomes opaque although browser says no - this will not work if nested further down the tree.
	style = getComputedStyle(e.parentElement);	
	if (style.opacity < 0.1) 
		{
		return false;
		}
	return true;
	}

// Utility function browser: sleep and give control back to browser.
function browserUpdate() 
	{
	var ms = 1000; // number of millisecs to pause before returning
	return new Promise(resolve => setTimeout(resolve, ms));
	}	