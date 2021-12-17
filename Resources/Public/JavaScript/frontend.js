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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJvbnRlbmQuanMiLCJzb3VyY2VzIjpbIi4uLy4uL1ByaXZhdGUvSmF2YVNjcmlwdC9mcm9udGVuZC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqXG4gKiBKUyBmcm9udGVuZCBmdW5jdGlvbnNcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogYSBmZXcgYWRkaXRpb25hbCBmdW5jdGlvbnMgdG8gZW5oYW5jZVxuICogdGhlIHVzZXIgZXhwZXJpZW5jZSBvZiBzb21lIFRZUE8zIGVsZW1lbnRzXG4gKlxuICogQXV0aG9yOiBUaG9tYXMgSnVuZyA8dGhvbWFzQGp1bmcuZGlnaXRhbD5cbiAqXG4gKi9cblxuLypnbG9iYWxzICQ6dHJ1ZSwgZG9jdW1lbnQ6dHJ1ZSAqL1xuLypqc2hpbnQgZXN2ZXJzaW9uOiA2ICovXG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcblxuICAgIC8vIE1haW4gbmF2aWdhdGlvbiB0b2dnbGVcbiAgICAkKFwiLm1haW4tbmF2aWdhdGlvbi10b2dnbGVcIikuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICAkKFwiYm9keVwiKS50b2dnbGVDbGFzcyhcIm1haW4tbmF2aWdhdGlvbi1hY3RpdmVcIik7XG4gICAgICAgICQodGhpcykuYXJpYVRvZ2dsZSgpO1xuICAgICAgICAkKFwiI21haW4tbmF2aWdhdGlvblwiKS5hcmlhVG9nZ2xlKCk7XG4gICAgfSk7XG5cbiAgICAvLyBUb2dnbGUgZnVuY3Rpb24gZm9yIHN1Ym1lbnVzXG4gICAgJChcIi5oYXMtc3VibWVudSA+IGJ1dHRvblwiKS5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICQodGhpcykuYXJpYVRvZ2dsZSgpO1xuICAgICAgICAkKHRoaXMpLnBhcmVudCgpLnRvZ2dsZUNsYXNzKFwic3VibWVudS1hY3RpdmVcIik7XG4gICAgICAgICQodGhpcykubmV4dChcInVsLnN1Ym1lbnVcIikuYXJpYVRvZ2dsZSgpO1xuICAgIH0pO1xuXG59KTtcblxuLy8gVG9nZ2xlIGFyaWEgYXR0cmlidXRlcyBvbiBvcGVuL2Nsb3NlIG5hdmlnYXRpb25cbiQuZm4uYXJpYVRvZ2dsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAkKHRoaXMpLmF0dHIoXCJhcmlhLWV4cGFuZGVkXCIsICgkKHRoaXMpLmF0dHIoXCJhcmlhLWV4cGFuZGVkXCIpID09PSBcImZhbHNlXCIpID8gXCJ0cnVlXCIgOiBcImZhbHNlXCIpO1xufTtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxZQUFZO0FBQzlCO0FBQ0E7QUFDQSxJQUFJLENBQUMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLEtBQUssQ0FBQyxZQUFZO0FBQ25ELFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFdBQVcsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBQ3hELFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQzdCLFFBQVEsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDM0MsS0FBSyxDQUFDLENBQUM7QUFDUDtBQUNBO0FBQ0EsSUFBSSxDQUFDLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBWTtBQUNqRCxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUM3QixRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUN2RCxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDaEQsS0FBSyxDQUFDLENBQUM7QUFDUDtBQUNBLENBQUMsQ0FBQyxDQUFDO0FBQ0g7QUFDQTtBQUNBLENBQUMsQ0FBQyxFQUFFLENBQUMsVUFBVSxHQUFHLFlBQVk7QUFDOUIsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssT0FBTyxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsQ0FBQztBQUNsRyxDQUFDIn0=