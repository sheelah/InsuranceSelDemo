/*  generate_screens.js */

(function(){

    var userCount = 1;
    var screenChanged = 0;


    var get_current_screen = function() {
        return window.location.hash || '#availablePlans';
    }

    var check_user_count = function() {
        if (userCount >= 5) {
            $("a[href='add-user']").css("visibility", "hidden");
        }
        else {
            $("a[href='add-user']").css("visibility", "visible");
        }
    };

    // Generate breadcrumbs
    var generateBreadcrumb = function(target) {
        // With each call, append a URL to the  #breadcrumbs div.
        var $nav_text = $(target + " :header").html();
        if ($("nav a[href='" + target + "']").length === 0) {
            // Breadcrumb link doesn't already exist for target
            $("<li><b>&nbsp;&raquo;&nbsp;</b><a href="
                + target
                + ">" + $nav_text
                + "</a></li>").appendTo("nav ul");
            $("nav a").removeClass("disabled");
            $("nav a[href='" + target + "']").addClass("disabled");
            if (target != "#availablePlans") {
                $("nav").show();
            }
        }
        else {
            switch(target) {
                case "#availablePlans":
                    $("nav ul li:gt(0)").remove();
                    $("nav").hide();
                    break;
                // Same action for both limitedCoveragePlans and
                // compCoveragePlans breadcrumbs
                case "#limitedCoveragePlans":
                case "#compCoveragePlans":
                    // Don't re-add a breadcrumb for the same link
                    // Delete all subsequent breadcrumb links in nav
                    $("nav li:gt(1)").remove();
                    break;
                case "#personalDetails":
                    $("nav li:gt(2)").remove();
                    break;
                case "#confirmation":
                    $("nav li:gt(3)").remove();
                    break;
            }
        }
    }

    var generateConfirmation = function() {
       var $user = $('#userData1 input:text[name="name"]').val();
       $user = $('#userData1 input:text[name="name"]').val();
       var header_string = "<h3 class='coverageDetailTitle'>Confirmation"
                           + "</h3><h4>Thank you for your business, "
                           + $user + "!</h4>"
       $("#confirmation").html(header_string);
    };

    var showScreen = function(target) {
        // Display given screen in viewPort
        // Generate confirmation screen if target is #confirmation
        if (target === "send") {
            target = "#confirmation"
            generateConfirmation();
        }
        screenChanged = 1;
        // Update breadcrumbs on new page before showing
        generateBreadcrumb(target);
        $(".screen").hide();
        $(target).animate({opacity: "show"}, 500);
    };

    // Link (button class) click even handler for all screens
    $("a.button").click(function(e) {
        screenChanged = 1;
        showScreen($(this).attr("href"));
    });


    $("#send").click( function(e) {
        var $form_total = $("#userInfo form").length;
        var total_valid = 0;
        $("#userInfo form").each(function() {
            // Set up validation
            if ($(this).valid()) {
                total_valid++;
            }
        });
        if (total_valid === $form_total) {
           screenChanged = 1;
           showScreen($(this).attr("id"));
        }
    });

    // Nav link event handler.  On() is used since not
    // all breadcrumb links exist at first load time
    $("nav").on("click", "a", function(e) {
        showScreen($(this).attr("href"));
    });

    // Use DatePicker plugin for start and end date within userDate form
    $(".date").datepicker({showAnim: "slideDown",
                           buttonImageOnly: true});
    // Add one "add user" registration form when required
    $("a[href='add-user']").click( function(e) {
        e.preventDefault();
        userCount++;
        var $cloned = $("#userForm1").clone();
        var $remove_link = $cloned.find("h5 a");
        $cloned.find("h5").html("Insured #" + userCount).append(
            $remove_link)
            .find("input[name='name']").val("")
            .find("input[name='address']").val("")
            .find("h5 img").show();
        $cloned.attr("id", "userForm" + userCount);
        $cloned.find("#userData1").attr("id", "userData" + userCount);
        // Re-initialize datepicker on cloned form
        $cloned.find("input").filter(".date").removeAttr("id").removeClass(
            "hasDatepicker").datepicker();
        $cloned.appendTo("#userInfo").css({opacity: 0}).animate(
            {opacity: 1});

        // Only allow up to 4 additional users
        check_user_count();
    });

    // Allow user to remove individual registration forms (user #2 - #5)
    $("#userInfo").on("click", "a[href='delete']", function(e) {
        e.preventDefault();
        userCount--;
        // Find parent div and update IDs
        $(this).closest("div").nextAll(".formWrapper").each(function() {
            // Update user div ID name
            $(this).attr("id", function() {
                var $attrval = $(this).attr("id");
                return $attrval.slice(0,-1) + (+$attrval.slice(-1) -1);
            });

            // Update user form ID name
            $(this).find("form").attr("id", function() {
                var $attrval = $(this).attr("id");
                return $attrval.slice(0,-1) + (+$attrval.slice(-1) -1);
            });

            // Update header text
            var $remove_link = $(this).find("h5 a");
            $(this).children("h5").html("Insured #" +
                (+$(this).children("h5").text().slice(-1) -1)).append(
                $remove_link);
            });

        // Delete parent form
        $(this).closest("div").remove();
        check_user_count();
     });

    // Bind to the hashchange event
    $(window).bind('hashchange', function () {
        var hash = get_current_screen();
        // Only fire the screen change if a nav link or button click
        // hasn't done it for us
        if (screenChanged === 0) {
            showScreen(hash);
        }
        // Reset screenChanged back to zero
        screenChanged = 0;
    });

    // When the page loads, trigger a hashchange
    $(window).trigger( "hashchange" );
})();
