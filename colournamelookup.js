// JavaScript routines for lookup up the colour name with closest match to an r,g,b colour vector.
// Frode Eika Sandnes, Oslo Metropolitan University, February, 2022.

// Colour name definitions supported by most browsers - used as basis for description
var names = [
    {"name":"aqua","red":0,"green":255,"blue":255,"status":"supported"}
   ,{"name":"black","red":0,"green":0,"blue":0,"status":"supported"}
   ,{"name":"blue","red":0,"green":0,"blue":255,"status":"supported"}
   ,{"name":"fuchsia","red":255,"green":0,"blue":255,"status":"supported"}
   ,{"name":"gray","red":128,"green":128,"blue":128,"status":"supported"}
   ,{"name":"green","red":0,"green":128,"blue":0,"status":"supported"}
   ,{"name":"lime","red":0,"green":255,"blue":0,"status":"supported"}
   ,{"name":"maroon","red":128,"green":0,"blue":0,"status":"supported"}
   ,{"name":"navy","red":0,"green":0,"blue":128,"status":"supported"}
   ,{"name":"olive","red":128,"green":128,"blue":0,"status":"supported"}
   ,{"name":"purple","red":128,"green":0,"blue":128,"status":"supported"}
   ,{"name":"red","red":255,"green":0,"blue":0,"status":"supported"}
   ,{"name":"silver","red":192,"green":192,"blue":192,"status":"supported"}
   ,{"name":"teal","red":0,"green":128,"blue":128,"status":"supported"}
   ,{"name":"white","red":255,"green":255,"blue":255,"status":"supported"}
   ,{"name":"yellow","red":255,"green":255,"blue":0,"status":"supported"}
   ,{"name":"aliceblue","red":240,"green":248,"blue":255,"status":"extended"}
   ,{"name":"antiquewhite","red":250,"green":235,"blue":215,"status":"extended"}
   ,{"name":"aqua","red":0,"green":255,"blue":255,"status":"extended"}
   ,{"name":"aquamarine","red":127,"green":255,"blue":212,"status":"extended"}
   ,{"name":"azure","red":240,"green":255,"blue":255,"status":"extended"}
   ,{"name":"beige","red":245,"green":245,"blue":220,"status":"extended"}
   ,{"name":"bisque","red":255,"green":228,"blue":196,"status":"extended"}
   ,{"name":"black","red":0,"green":0,"blue":0,"status":"extended"}
   ,{"name":"blanchedalmond","red":255,"green":235,"blue":205,"status":"extended"}
   ,{"name":"blue","red":0,"green":0,"blue":255,"status":"extended"}
   ,{"name":"blueviolet","red":138,"green":43,"blue":226,"status":"extended"}
   ,{"name":"brown","red":165,"green":42,"blue":42,"status":"extended"}
   ,{"name":"burlywood","red":222,"green":184,"blue":135,"status":"extended"}
   ,{"name":"cadetblue","red":95,"green":158,"blue":160,"status":"extended"}
   ,{"name":"chartreuse","red":127,"green":255,"blue":0,"status":"extended"}
   ,{"name":"chocolate","red":210,"green":105,"blue":30,"status":"extended"}
   ,{"name":"coral","red":255,"green":127,"blue":80,"status":"extended"}
   ,{"name":"cornflowerblue","red":100,"green":149,"blue":237,"status":"extended"}
   ,{"name":"cornsilk","red":255,"green":248,"blue":220,"status":"extended"}
   ,{"name":"crimson","red":220,"green":20,"blue":60,"status":"extended"}
   ,{"name":"cyan","red":0,"green":255,"blue":255,"status":"extended"}
   ,{"name":"darkblue","red":0,"green":0,"blue":139,"status":"extended"}
   ,{"name":"darkcyan","red":0,"green":139,"blue":139,"status":"extended"}
   ,{"name":"darkgoldenrod","red":184,"green":134,"blue":11,"status":"extended"}
   ,{"name":"darkgray","red":169,"green":169,"blue":169,"status":"extended"}
   ,{"name":"darkgreen","red":0,"green":100,"blue":0,"status":"extended"}
   ,{"name":"darkkhaki","red":189,"green":183,"blue":107,"status":"extended"}
   ,{"name":"darkmagenta","red":139,"green":0,"blue":139,"status":"extended"}
   ,{"name":"darkolivegreen","red":85,"green":107,"blue":47,"status":"extended"}
   ,{"name":"darkorange","red":255,"green":140,"blue":0,"status":"extended"}
   ,{"name":"darkorchid","red":153,"green":50,"blue":204,"status":"extended"}
   ,{"name":"darkred","red":139,"green":0,"blue":0,"status":"extended"}
   ,{"name":"darksalmon","red":233,"green":150,"blue":122,"status":"extended"}
   ,{"name":"darkseagreen","red":143,"green":188,"blue":143,"status":"extended"}
   ,{"name":"darkslateblue","red":72,"green":61,"blue":139,"status":"extended"}
   ,{"name":"darkslategray","red":47,"green":79,"blue":79,"status":"extended"}
   ,{"name":"darkturquoise","red":0,"green":206,"blue":209,"status":"extended"}
   ,{"name":"darkviolet","red":148,"green":0,"blue":211,"status":"extended"}
   ,{"name":"deeppink","red":255,"green":20,"blue":147,"status":"extended"}
   ,{"name":"deepskyblue","red":0,"green":191,"blue":255,"status":"extended"}
   ,{"name":"dimgray","red":105,"green":105,"blue":105,"status":"extended"}
   ,{"name":"dodgerblue","red":30,"green":144,"blue":255,"status":"extended"}
   ,{"name":"firebrick","red":178,"green":34,"blue":34,"status":"extended"}
   ,{"name":"floralwhite","red":255,"green":250,"blue":240,"status":"extended"}
   ,{"name":"forestgreen","red":34,"green":139,"blue":34,"status":"extended"}
   ,{"name":"fuchsia","red":255,"green":0,"blue":255,"status":"extended"}
   ,{"name":"gainsboro","red":220,"green":220,"blue":220,"status":"extended"}
   ,{"name":"ghostwhite","red":248,"green":248,"blue":255,"status":"extended"}
   ,{"name":"gold","red":255,"green":215,"blue":0,"status":"extended"}
   ,{"name":"goldenrod","red":218,"green":165,"blue":32,"status":"extended"}
   ,{"name":"gray","red":127,"green":127,"blue":127,"status":"extended"}
   ,{"name":"green","red":0,"green":128,"blue":0,"status":"extended"}
   ,{"name":"greenyellow","red":173,"green":255,"blue":47,"status":"extended"}
   ,{"name":"honeydew","red":240,"green":255,"blue":240,"status":"extended"}
   ,{"name":"hotpink","red":255,"green":105,"blue":180,"status":"extended"}
   ,{"name":"indianred","red":205,"green":92,"blue":92,"status":"extended"}
   ,{"name":"indigo","red":75,"green":0,"blue":130,"status":"extended"}
   ,{"name":"ivory","red":255,"green":255,"blue":240,"status":"extended"}
   ,{"name":"khaki","red":240,"green":230,"blue":140,"status":"extended"}
   ,{"name":"lavender","red":230,"green":230,"blue":250,"status":"extended"}
   ,{"name":"lavenderblush","red":255,"green":240,"blue":245,"status":"extended"}
   ,{"name":"lawngreen","red":124,"green":252,"blue":0,"status":"extended"}
   ,{"name":"lemonchiffon","red":255,"green":250,"blue":205,"status":"extended"}
   ,{"name":"lightblue","red":173,"green":216,"blue":230,"status":"extended"}
   ,{"name":"lightcoral","red":240,"green":128,"blue":128,"status":"extended"}
   ,{"name":"lightcyan","red":224,"green":255,"blue":255,"status":"extended"}
   ,{"name":"lightgoldenrodyellow","red":250,"green":250,"blue":210,"status":"extended"}
   ,{"name":"lightgreen","red":144,"green":238,"blue":144,"status":"extended"}
   ,{"name":"lightgrey","red":211,"green":211,"blue":211,"status":"extended"}
   ,{"name":"lightpink","red":255,"green":182,"blue":193,"status":"extended"}
   ,{"name":"lightsalmon","red":255,"green":160,"blue":122,"status":"extended"}
   ,{"name":"lightseagreen","red":32,"green":178,"blue":170,"status":"extended"}
   ,{"name":"lightskyblue","red":135,"green":206,"blue":250,"status":"extended"}
   ,{"name":"lightslategray","red":119,"green":136,"blue":153,"status":"extended"}
   ,{"name":"lightsteelblue","red":176,"green":196,"blue":222,"status":"extended"}
   ,{"name":"lightyellow","red":255,"green":255,"blue":224,"status":"extended"}
   ,{"name":"lime","red":0,"green":255,"blue":0,"status":"extended"}
   ,{"name":"limegreen","red":50,"green":205,"blue":50,"status":"extended"}
   ,{"name":"linen","red":250,"green":240,"blue":230,"status":"extended"}
   ,{"name":"magenta","red":255,"green":0,"blue":255,"status":"extended"}
   ,{"name":"maroon","red":128,"green":0,"blue":0,"status":"extended"}
   ,{"name":"mediumaquamarine","red":102,"green":205,"blue":170,"status":"extended"}
   ,{"name":"mediumblue","red":0,"green":0,"blue":205,"status":"extended"}
   ,{"name":"mediumorchid","red":186,"green":85,"blue":211,"status":"extended"}
   ,{"name":"mediumpurple","red":147,"green":112,"blue":219,"status":"extended"}
   ,{"name":"mediumseagreen","red":60,"green":179,"blue":113,"status":"extended"}
   ,{"name":"mediumslateblue","red":123,"green":104,"blue":238,"status":"extended"}
   ,{"name":"mediumspringgreen","red":0,"green":250,"blue":154,"status":"extended"}
   ,{"name":"mediumturquoise","red":72,"green":209,"blue":204,"status":"extended"}
   ,{"name":"mediumvioletred","red":199,"green":21,"blue":133,"status":"extended"}
   ,{"name":"midnightblue","red":25,"green":25,"blue":112,"status":"extended"}
   ,{"name":"mintcream","red":245,"green":255,"blue":250,"status":"extended"}
   ,{"name":"mistyrose","red":255,"green":228,"blue":225,"status":"extended"}
   ,{"name":"moccasin","red":255,"green":228,"blue":181,"status":"extended"}
   ,{"name":"navajowhite","red":255,"green":222,"blue":173,"status":"extended"}
   ,{"name":"navy","red":0,"green":0,"blue":128,"status":"extended"}
   ,{"name":"navyblue","red":159,"green":175,"blue":223,"status":"extended"}
   ,{"name":"oldlace","red":253,"green":245,"blue":230,"status":"extended"}
   ,{"name":"olive","red":128,"green":128,"blue":0,"status":"extended"}
   ,{"name":"olivedrab","red":107,"green":142,"blue":35,"status":"extended"}
   ,{"name":"orange","red":255,"green":165,"blue":0,"status":"extended"}
   ,{"name":"orangered","red":255,"green":69,"blue":0,"status":"extended"}
   ,{"name":"orchid","red":218,"green":112,"blue":214,"status":"extended"}
   ,{"name":"palegoldenrod","red":238,"green":232,"blue":170,"status":"extended"}
   ,{"name":"palegreen","red":152,"green":251,"blue":152,"status":"extended"}
   ,{"name":"paleturquoise","red":175,"green":238,"blue":238,"status":"extended"}
   ,{"name":"palevioletred","red":219,"green":112,"blue":147,"status":"extended"}
   ,{"name":"papayawhip","red":255,"green":239,"blue":213,"status":"extended"}
   ,{"name":"peachpuff","red":255,"green":218,"blue":185,"status":"extended"}
   ,{"name":"peru","red":205,"green":133,"blue":63,"status":"extended"}
   ,{"name":"pink","red":255,"green":192,"blue":203,"status":"extended"}
   ,{"name":"plum","red":221,"green":160,"blue":221,"status":"extended"}
   ,{"name":"powderblue","red":176,"green":224,"blue":230,"status":"extended"}
   ,{"name":"purple","red":128,"green":0,"blue":128,"status":"extended"}
   ,{"name":"red","red":255,"green":0,"blue":0,"status":"extended"}
   ,{"name":"rosybrown","red":188,"green":143,"blue":143,"status":"extended"}
   ,{"name":"royalblue","red":65,"green":105,"blue":225,"status":"extended"}
   ,{"name":"saddlebrown","red":139,"green":69,"blue":19,"status":"extended"}
   ,{"name":"salmon","red":250,"green":128,"blue":114,"status":"extended"}
   ,{"name":"sandybrown","red":250,"green":128,"blue":114,"status":"extended"}
   ,{"name":"seagreen","red":46,"green":139,"blue":87,"status":"extended"}
   ,{"name":"seashell","red":255,"green":245,"blue":238,"status":"extended"}
   ,{"name":"sienna","red":160,"green":82,"blue":45,"status":"extended"}
   ,{"name":"silver","red":192,"green":192,"blue":192,"status":"extended"}
   ,{"name":"skyblue","red":135,"green":206,"blue":235,"status":"extended"}
   ,{"name":"slateblue","red":106,"green":90,"blue":205,"status":"extended"}
   ,{"name":"slategray","red":112,"green":128,"blue":144,"status":"extended"}
   ,{"name":"snow","red":255,"green":250,"blue":250,"status":"extended"}
   ,{"name":"springgreen","red":0,"green":255,"blue":127,"status":"extended"}
   ,{"name":"steelblue","red":70,"green":130,"blue":180,"status":"extended"}
   ,{"name":"tan","red":210,"green":180,"blue":140,"status":"extended"}
   ,{"name":"teal","red":0,"green":128,"blue":128,"status":"extended"}
   ,{"name":"thistle","red":216,"green":191,"blue":216,"status":"extended"}
   ,{"name":"tomato","red":255,"green":99,"blue":71,"status":"extended"}
   ,{"name":"turquoise","red":64,"green":224,"blue":208,"status":"extended"}
   ,{"name":"violet","red":238,"green":130,"blue":238,"status":"extended"}
   ,{"name":"wheat","red":245,"green":222,"blue":179,"status":"extended"}
   ,{"name":"white","red":255,"green":255,"blue":255,"status":"extended"}
   ,{"name":"whitesmoke","red":245,"green":245,"blue":245,"status":"extended"}
   ,{"name":"yellow","red":255,"green":255,"blue":0,"status":"extended"}
   ,{"name":"yellowgreen","red":154,"green":205,"blue":50,"status":"extended"}
   ];
  
   // find the percentage deviation from the colour
   function colourDeviation(c,r,g,b)
       {
       return (100*colourDistance(r,g,b,c.red,c.green,c.blue)/255).toFixed(1)+"%";
       }
   
   // colour distance using Euclidean on the rgb space.
   function colourDistance(r1,g1,b1,r2,g2,b2)
       {
       var deltaR = r1 - r2;
       var deltaG = g1 - g2;
       var deltaB = b1 - b2;
       return Math.sqrt(deltaR*deltaR + deltaG*deltaG + deltaB*deltaB);     
       }
   
   // search through all colours to find the closest match
   function findName(r,g,b)
       {
       var minDist = 255*255*255;
       var minColour = names[0];
       for (var e of names)
           {
           var dist = colourDistance(r,g,b,e.red,e.green,e.blue);
           if (dist < minDist)
               {
               minDist = dist;
               minColour = e;
               }
           }
       return minColour;
       }