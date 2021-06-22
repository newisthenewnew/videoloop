// ==UserScript==
// @name         Disable Animated Video Loop
// @namespace    https://es.gizmodo.com/
// @version      0.1
// @description  Disable Animated Video Loops
// @author       Author
// @match        https://*.gizmodo.com/*
// @match        http://*.gizmodo.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';


    function replaceVideoWithImage(videoEl, newParentEl, imgSrcVideoAttrib) {

        // Note:
        // Video/Image flags get loaded from/via the data-transform attribute (eg: "CenteredWideExtraLargeAuto")
        // https://x.kinja-static.com/assets/new-client/categoryPage~curatedHomepage~errorPage~experiments~featuredPermalinkPage~frontPage~permalinkPage~pro~0d1bef01.546e1282bd83f19afc1e.js

        // Gizmodo/kinja is using the Cloudinary image hosting API
        // so add a "first-frame-only" flag to disable the animation ("pg_1") "Delivering a single frame"
        // Also consider: e_loop:1 (one loop)
        // https://cloudinary.com/documentation/animated_images#manipulating_animated_GIFs
        //
        if (videoEl.hasAttribute(imgSrcVideoAttrib) === true) {
            let imgSrc = videoEl.getAttribute(imgSrcVideoAttrib).replace( new RegExp("upload/","gm"),"upload/pg_1,")

            // Then rewrite that url into the image source for a new image tag
            var newImageEl = document.createElement("img");
            newImageEl.setAttribute("src", imgSrc);
            newImageEl.setAttribute("alt", "Video replace");
            newParentEl.appendChild(newImageEl);
            // console.log("---- " + imgSrc + "  ---- ");

            // Remove original video tag
            videoEl.parentNode.removeChild(videoEl);

            return (true); //success
        }
        else {
            // console.log("Could not find attrib: " + imgSrcVideoAttrib);
            return (false);
        }
    }


    // Turns off looping for all videos on the page
    function disableVideoLoop()
    {
        var targetNodeList;

        // Find lazy load video nodes and update them to turn off auto play and looping
        // They are stored as <img> with data tags that get replaced with a <video> tag
        //targetNodeList = document.querySelectorAll('div.js_lazy-image > div > img');
        targetNodeList = document.querySelectorAll('img[data-format="gif" i]');
        if (targetNodeList != null) {
            for(let i = 0; i < targetNodeList.length; ++i) {
                if (targetNodeList[i].hasAttribute("data-format") === true) {
                    if (targetNodeList[i].getAttribute('data-format').toLowerCase() === 'gif') {

                        // UPDATE: changes in their code now seem to remove the image and it's parent div
                        //         if the data-chomp-id can't be read and used to repace it.
                        // So, create a new image element based on the tag info and attach that
                        // to the parent of the parent div

                        replaceVideoWithImage(targetNodeList[i], // video/image to replace
                                              targetNodeList[i].parentNode.parentNode, // new parent
                                              'data-anim-src'); // video attribute to use for new image source
                    }
                }

                targetNodeList[i].parentNode.removeChild(targetNodeList[i]);
            } // for(let i = 0; i < targetNodeList.length; ++i)
        } // if (targetNodeList != null)

        // Find video nodes and update them to turn off auto play and looping
        targetNodeList = document.querySelectorAll('video');
        if (targetNodeList != null) {
            for(let i = 0; i < targetNodeList.length; ++i) {

                // This seems to work, but it's less resource intensive
                // to just entirely remove the video (below)
                /*
                targetNodeList[i].pause(true);
                // Autoplay attribute needs to be removed entirely for it to take effect
                targetNodeList[i].removeAttribute("autoplay");
                */

                if (!replaceVideoWithImage(targetNodeList[i], // video to replace
                                      targetNodeList[i].parentNode.parentNode, // new parent
                                      'data-postersrc') ) // video attribute to use for new image source
                {
                    // If the first attempt didn't succeed, try with a different tag
                    replaceVideoWithImage(targetNodeList[i], // video to replace
                                          targetNodeList[i].parentNode.parentNode, // new parent
                                          'data-anim-src'); // video attribute to use for new image source
                }
            }
        }

    }

    disableVideoLoop();

})();
