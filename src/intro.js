(function ( window, factory ) {

    // taken from jquery/src/intro.js
    if ( typeof module === "object" && typeof module.exports === "object" ) {
        module.exports = function( w ) {
            w = w || window;
            if ( !w.document ) {
                throw new Error("jquery-composer requires a window object");
            }
            return factory( w );
        };
    } else {
        factory( window );
    }
}(this, function ( window ) {

// Can't do this because several apps including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
// Support: Firefox 18+
//"use strict";

