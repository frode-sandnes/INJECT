# INJECTOR

This repository containst the source files for the Inverse Colour Contrast Checker.

A live demo: https://frode-sandnes.github.io/INJECTOR/

You can attach the framework to your web project by adding a javascript callback in the body onload event or by inserting a button on your page.

Then you can cycle through the original page, page with WCAG2.1 aaa corrections and aa corrections using Contrl+Z. You can also adjust the brightness of the text using Contrl+UP/DOWN, or saturation level using Contrl+LEFT/RIGHT.

The repository contains the following
1. colourcontrast.js - the framweork itself.
2. colourapp.js - extra code for the colour tweaker application.
3. searcherapp.js - extra code for the colour searcher application.
4. colourcontrast.css - a simple style file used for the sample
5. injector.html - an example showing how to use the framework with keystroke shortcuts.
6. tweaker.html - an example where one inputs two colours using either names, rgb or hsb notation and get change recommendations.
7. searcher.html - an example for interactively adjusting parameters of the foreground colour, background colour, text size and bold. The other parameters are automatically tuned according to the changes with a lock onto the contrast level setting.
