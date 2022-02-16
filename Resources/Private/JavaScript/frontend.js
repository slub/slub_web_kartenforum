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

    // Add container to tables to ensure proper scrolling on smaller devices
    $("table.contenttable").each(function () {
        $(this).wrap("<div class=\"table-wrapper\" />");
    });

    // Accordion lists setup
    $(".accordion-item h3").each(function () {
        $(this).parent().append("<a class=\"permalink\" href=\"#" + $(this).parent().attr("id") + "\">Permalink</a>");
    }).click(function () {
        $(this).parents(".accordion-item").toggleClass("active");
        return false;
    });
    var hash = $(location).attr("hash");
    if ($(".accordion > div")[0] && hash) {
        var destinationElement = $("div" + hash);
        $(".accordion-item").removeClass("active");
        destinationElement.find(".accordion-item").addClass("active");
        $("html,body").animate({scrollTop: (destinationElement.offset().top - 20)}, 500);
    }

    // Handle welcome message on first visit
    $('.welcome-content .frame-type-header.frame-layout-40 a').click(function () {
        $('body').removeClass('show-welcome');
        localStorage.setItem('vkf-returning-visit', 'true');
        return false;
    });

    // Show a welcome message if this is the first visit
    if (!localStorage.getItem('vkf-returning-visit')) {
        setTimeout(function () {
            $('body').addClass('show-welcome');
        }, 1500);
    }

});

// Toggle aria attributes on open/close navigation
$.fn.ariaToggle = function () {
    $(this).attr("aria-expanded", ($(this).attr("aria-expanded") === "false") ? "true" : "false");
};
