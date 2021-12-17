/**
 *
 * JS frontend functions
 * ================================================
 * a few additional functions to enhance
 * the user experience of some TYPO3 elements
 *
 * Author: Thomas Jung <thomas@jung.digital>
 *
 */

/*globals $:true, document:true */
/*jshint esversion: 6 */

$(document).ready(function () {

    // Main navigation toggle
    $(".main-navigation-toggle").click(function () {
        $("body").toggleClass("main-navigation-active");
        $(this).ariaToggle();
        $("#main-navigation").ariaToggle();
    });

    // Toggle function for submenus
    $(".has-submenu > button").click(function () {
        $(this).ariaToggle();
        $(this).parent().toggleClass("submenu-active");
        $(this).next("ul.submenu").ariaToggle();
    });

});

// Toggle aria attributes on open/close navigation
$.fn.ariaToggle = function () {
    $(this).attr("aria-expanded", ($(this).attr("aria-expanded") === "false") ? "true" : "false");
};
