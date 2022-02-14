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
    report.style.cssText = 'overflow: auto; border: 5px solid yellow; padding: 5px; background: black; color: yellow; min-height:50%; width: 50%; position:fixed; top:25%; right:25%; bottom:25%; left:25%; z-index: 2;';
    report.id = "info";
    document.body.appendChild(report);   
    await browserUpdate(); // give control to browser for a bit 
    // traverse list of elements
    var sortedHistogram = new Map([...histogram.entries()].sort((a, b) => b[1] - a[1]));
    var txt = "<span id=\"closeInfo\" style=\"cursor: pointer; position: absolute; top: 0%;right: 0%; padding: 12px 16px; transform: translate(25%, -25%);\">x</span>"
			+"<h2>Colour summary ("+histogram.size+" colour pairs)</h2><p>Percent of total area.</p><ul>";
    for (var p of sortedHistogram.keys())
        {
        var pair = JSON.parse(p);
        // get the colour pair frequency
        var c = sortedHistogram.get(p);
        var cPst = (100*c/samples).toFixed(1)+"%";
        // prepare output
        txt += "<li>" 
                    + "<span style=\"color: "+pair[0]+"; background: "+pair[1]+"\"> Text </span>: "
                    + pair[0] + " on " + pair[1] + " (" + cPst + ")"
                +"</li>";
        }
    // output the report
    txt += "</ul>";
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
				}
			}	
		}
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