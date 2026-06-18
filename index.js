// initialization

const RESPONSIVE_WIDTH = 1024

let headerWhiteBg = false
let isHeaderCollapsed = window.innerWidth < RESPONSIVE_WIDTH
const collapseBtn = document.getElementById("collapse-btn")
const collapseHeaderItems = document.getElementById("collapsed-header-items")



function onHeaderClickOutside(e) {

    if (!collapseHeaderItems.contains(e.target)) {
        toggleHeader()
    }

}


function toggleHeader() {
    if (isHeaderCollapsed) {
        // collapseHeaderItems.classList.remove("max-md:tw-opacity-0")
        collapseHeaderItems.classList.add("opacity-100",)
        collapseHeaderItems.style.width = "60vw"
        collapseBtn.classList.remove("bi-list")
        collapseBtn.classList.add("bi-x", "max-lg:tw-fixed")
        isHeaderCollapsed = false

        setTimeout(() => window.addEventListener("click", onHeaderClickOutside), 1)

    } else {
        collapseHeaderItems.classList.remove("opacity-100")
        collapseHeaderItems.style.width = "0vw"
        collapseBtn.classList.remove("bi-x", "max-lg:tw-fixed")
        collapseBtn.classList.add("bi-list")
        isHeaderCollapsed = true
        window.removeEventListener("click", onHeaderClickOutside)

    }
}

function responsive() {
    if (window.innerWidth > RESPONSIVE_WIDTH) {
        collapseHeaderItems.style.width = ""

    } else {
        isHeaderCollapsed = true
    }
}

window.addEventListener("resize", responsive)


/**
 * Animations
 */

gsap.registerPlugin(ScrollTrigger)

gsap.to(".reveal-hero-text", {
    opacity: 0,
    y: "100%",
})

gsap.to(".reveal-hero-img", {
    opacity: 0,
    y: "100%",
})

gsap.to("#hero-img-bg", {
    scale: 0
})

gsap.to(".reveal-up", {
    opacity: 0,
    y: "100%",
})


window.addEventListener("load", () => {
    // animate from initial position
    gsap.to(".reveal-hero-text", {
        opacity: 1,
        y: "0%",
        duration: 0.8,
        // ease: "power3.out",
        stagger: 0.5, // Delay between each word's reveal,
        // delay: 3
    })

    gsap.to(".reveal-hero-img", {
        opacity: 1,
        y: "0%",
    })

    gsap.to("#hero-img-bg", {
        scale: 1,
        duration: 0.8,
        delay: 0.4
    })
    
})


// ------------- reveal section animations ---------------

const sections = gsap.utils.toArray("section")

sections.forEach((sec) => {

    const revealUptimeline = gsap.timeline({paused: true, 
                                            scrollTrigger: {
                                                            trigger: sec,
                                                            start: "10% 80%", // top of trigger hits the top of viewport
                                                            end: "20% 90%",
                                                            // markers: true,
                                                            // scrub: 1,
                                                        }})

    revealUptimeline.to(sec.querySelectorAll(".reveal-up"), {
        opacity: 1,
        duration: 0.8,
        y: "0%",
        stagger: 0.2,
    })


})


// ------------- lead capture form -> folk CRM ---------------

const leadForm = document.getElementById("lead-form")

if (leadForm) {
    const statusEl = document.getElementById("lead-form-status")
    const submitBtn = leadForm.querySelector("button[type='submit']")

    const copy = (window.SITE_CONTENT && window.SITE_CONTENT.contact) || {}
    const SUCCESS_MSG = copy.success || "Thanks! We'll be in touch shortly."
    const ERROR_MSG = copy.error || "Something went wrong. Please try again."

    function setStatus(message, ok) {
        if (!statusEl) return
        statusEl.textContent = message
        statusEl.style.color = ok ? "#1a7f37" : "#c0392b"
    }

    leadForm.addEventListener("submit", async (e) => {
        e.preventDefault()

        const data = {
            name: leadForm.name.value.trim(),
            email: leadForm.email.value.trim(),
            phone: leadForm.phone.value.trim(),
            message: leadForm.message.value.trim(),
            source: "Book a demo form",
        }

        if (!data.email && !data.phone) {
            setStatus("Please add an email or phone number.", false)
            return
        }

        submitBtn.disabled = true
        setStatus("Sending…", true)

        try {
            const res = await fetch("/api/lead", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            if (!res.ok) {
                let serverMsg = ERROR_MSG
                try {
                    const payload = await res.json()
                    if (payload && payload.error) serverMsg = payload.error
                } catch (err) { /* ignore */ }
                setStatus(serverMsg, false)
                submitBtn.disabled = false
                return
            }

            leadForm.reset()
            setStatus(SUCCESS_MSG, true)
        } catch (err) {
            setStatus(ERROR_MSG, false)
        } finally {
            submitBtn.disabled = false
        }
    })
}


// ------------- newsletter signup -> folk CRM ---------------

const newsletterForm = document.getElementById("newsletter-form")

if (newsletterForm) {
    const statusEl = document.getElementById("newsletter-status")
    const submitBtn = newsletterForm.querySelector("button[type='submit']")

    const copy = (window.SITE_CONTENT && window.SITE_CONTENT.newsletter) || {}
    const SUCCESS_MSG = copy.success || "You're on the list. Thanks!"
    const ERROR_MSG = copy.error || "Something went wrong. Please try again."

    function setStatus(message, ok) {
        if (!statusEl) return
        statusEl.textContent = message
        statusEl.style.color = ok ? "#1a7f37" : "#c0392b"
    }

    newsletterForm.addEventListener("submit", async (e) => {
        e.preventDefault()

        const email = newsletterForm.email.value.trim()

        if (!email) {
            setStatus("Please enter your email.", false)
            return
        }

        submitBtn.disabled = true
        setStatus("Signing you up…", true)

        try {
            const res = await fetch("/api/lead", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email, source: "Newsletter signup" }),
            })

            if (!res.ok) {
                let serverMsg = ERROR_MSG
                try {
                    const payload = await res.json()
                    if (payload && payload.error) serverMsg = payload.error
                } catch (err) { /* ignore */ }
                setStatus(serverMsg, false)
                submitBtn.disabled = false
                return
            }

            newsletterForm.reset()
            setStatus(SUCCESS_MSG, true)
        } catch (err) {
            setStatus(ERROR_MSG, false)
        } finally {
            submitBtn.disabled = false
        }
    })
}



