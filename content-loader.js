/**
 * content-loader.js
 *
 * Reads text from content.js and injects it into the page.
 * You normally do NOT need to edit this file — edit content.js instead.
 *
 * How it works: any element with a `data-content="path.to.key"`
 * attribute gets its text replaced by the matching value from
 * window.SITE_CONTENT. Use `data-content-placeholder` to fill an
 * input's placeholder instead of its text.
 */
(function () {
    "use strict";

    function resolve(path, source) {
        return path
            .split(".")
            .reduce(function (obj, key) {
                return obj == null ? undefined : obj[key];
            }, source);
    }

    // Safely set text, converting "\n" into <br> line breaks.
    function setText(el, value) {
        if (typeof value !== "string") {
            value = String(value);
        }
        if (value.indexOf("\n") === -1) {
            el.textContent = value;
            return;
        }
        el.replaceChildren();
        value.split("\n").forEach(function (line, index) {
            if (index > 0) {
                el.appendChild(document.createElement("br"));
            }
            el.appendChild(document.createTextNode(line));
        });
    }

    function populate() {
        var content = window.SITE_CONTENT;
        if (!content) {
            console.warn("[content-loader] window.SITE_CONTENT not found.");
            return;
        }

        if (content.meta && content.meta.title) {
            document.title = content.meta.title;
        }

        document.querySelectorAll("[data-content]").forEach(function (el) {
            var value = resolve(el.getAttribute("data-content"), content);
            if (value != null) {
                setText(el, value);
            }
        });

        document
            .querySelectorAll("[data-content-placeholder]")
            .forEach(function (el) {
                var value = resolve(
                    el.getAttribute("data-content-placeholder"),
                    content
                );
                if (value != null) {
                    el.setAttribute("placeholder", value);
                }
            });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", populate);
    } else {
        populate();
    }
})();
