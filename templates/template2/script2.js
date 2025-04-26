document.addEventListener("DOMContentLoaded", async function () {
  const projectId = new URLSearchParams(window.location.search).get("id");
  if (!projectId) return;

  try {
    const res = await fetch(`/projects/${projectId}.json`);
    const data = await res.json();
    const template = data.template || "1";
    document.body.classList.add(`template-${template}`);

    // === TEMPLATE 2 ===
    if (template === "2") {
      document.getElementById("projectTitle").textContent = data.title || "";
      document.getElementById("projectTagline").textContent = data.tagline || "";

      const video = document.getElementById("heroVideo");
      video.querySelector("source").src = `media/${projectId}/Mayfair.mp4`;
      video.load();

      const logo = document.getElementById("projectLogo");
      logo.src = `media/${projectId}/logo.png`;

      document.getElementById("project-description").innerHTML = `
        <div class="container"><p>${data.description || ""}</p></div>`;

      // GALLERY
      const galleryGrid = document.getElementById("galleryGrid");
      if (galleryGrid && data.gallery?.length) {
        data.gallery.forEach(img => {
          const div = document.createElement("div");
          div.innerHTML = `<img src="media/${projectId}/gallery/${img}" class="img-fluid rounded gallery-img" style="max-height:400px;" />`;
          galleryGrid.appendChild(div);
        });

        setInterval(() => {
          galleryGrid.scrollBy({ left: 300, behavior: "smooth" });
        }, 5000);

        galleryGrid.addEventListener("mousemove", e => {
          galleryGrid.scrollLeft += (e.movementX > 0 ? 5 : -5);
        });
      }

      // UNIT TYPES
      const layoutSection = document.getElementById("layout-section");
      data.unit_types?.forEach(unit => {
        const col = document.createElement("div");
        col.className = "col-md-4 text-center mb-4";
        col.innerHTML = `
          <img src="media/${projectId}/${unit.image}" class="img-fluid mb-3" style="max-height:300px;" />
          <h5>${unit.title}</h5>
          <p>${unit.description}</p>`;
        layoutSection.appendChild(col);
      });

      // AMENITIES
      const amenitiesScroll = document.getElementById("amenitiesScroll");
      data.amenities?.forEach(label => {
        const videoName = label.toLowerCase().replace(/\s+/g, "_") + ".mp4";
        const path = `media/${projectId}/videos/${videoName}`;
        const block = document.createElement("div");
        block.className = "amenity-pill";
        block.innerHTML = `
          <video src="${path}" muted loop playsinline class="amenity-video"></video>
          <span>${label}</span>`;
        block.addEventListener("mouseenter", () => block.querySelector("video").play());
        block.addEventListener("mouseleave", () => block.querySelector("video").pause());
        amenitiesScroll.appendChild(block);
      });

      amenitiesScroll.addEventListener("mousemove", e => {
        amenitiesScroll.scrollLeft += (e.movementX > 0 ? 5 : -5);
      });

      // NEARBY
      const nearby = document.getElementById("nearbySection");
      data.nearby?.forEach(loc => {
        const div = document.createElement("div");
        div.className = "border rounded p-3 m-2 bg-light nearby-tile";
        div.innerHTML = `<strong>${loc.place}</strong><br><small>${loc.time}</small>`;
        nearby.appendChild(div);
      });

      // MAP
      if (data.location?.lat && data.location?.lng) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCn3k900b4cvHanhVxuHRPfS4NDV_UHaZ8&callback=initMap`;
        script.async = true;
        window.initMap = () => {
          new google.maps.Map(document.getElementById("google-map"), {
            center: { lat: data.location.lat, lng: data.location.lng },
            zoom: 14
          });
        };
        document.body.appendChild(script);
      }

      // FAQ
      const faqContainer = document.getElementById("faqAccordion");
      data.faqs?.forEach((faq, i) => {
        const card = document.createElement("div");
        card.className = "accordion-item";
        card.innerHTML = `
          <h2 class="accordion-header" id="faqHeading${i}">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faqCollapse${i}" aria-expanded="false" aria-controls="faqCollapse${i}">
              ${faq.question}
            </button>
          </h2>
          <div id="faqCollapse${i}" class="accordion-collapse collapse" aria-labelledby="faqHeading${i}" data-bs-parent="#faqAccordion">
            <div class="accordion-body">${faq.answer}</div>
          </div>`;
        faqContainer.appendChild(card);
      });

      // Brochure Modal Trigger
      document.getElementById("downloadBtn")?.addEventListener("click", () => {
        document.getElementById("brochureModal")?.classList.add("active");
      });

      // Floor Plan Alert
      document.getElementById("downloadFloorPlan")?.addEventListener("click", () => {
        alert("Floor Plan will be emailed to you after registration.");
      });

      // Payment Plan Popup
      document.getElementById("downloadPaymentPlan")?.addEventListener("click", () => {
        document.getElementById("paymentPlanModal")?.classList.add("active");
      });
    }

    // === FORM HANDLING ===
    function handleForm(formId, successId, spinnerId, fields, onSuccess) {
      const form = document.getElementById(formId);
      if (!form) return;

      const success = document.getElementById(successId);
      const spinner = spinnerId ? document.getElementById(spinnerId) : null;
      const btn = form.querySelector("button");

      form.addEventListener("submit", async e => {
        e.preventDefault();
        let isValid = true;
        const payload = {};

        fields.forEach(id => {
          const input = document.getElementById(id);
          if (!input.value.trim()) {
            input.classList.add("input-error");
            isValid = false;
          } else {
            input.classList.remove("input-error");
            if (id.includes("name")) payload.name = input.value.trim();
            if (id.includes("email")) payload.email = input.value.trim();
            if (id.includes("phone")) payload.phone = input.value.trim();
          }
        });

        if (!isValid) return;
        payload.projectId = projectId;

        if (spinner) spinner.classList.remove("d-none");
        btn.disabled = true;

        const res = await fetch("/submit-lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (spinner) spinner.classList.add("d-none");
        btn.disabled = false;

        if (res.ok) {
          form.reset();
          success.style.display = "block";
          setTimeout(() => success.style.display = "none", 3000);
          if (typeof onSuccess === "function") onSuccess();
        }
      });
    }

    handleForm("brochureForm", "brochureSuccess", "brochureSpinner", ["nameBrochure", "emailBrochure", "phoneBrochure"], () => {
      const a = document.createElement("a");
      a.href = `media/${projectId}/106_brochure.pdf`;
      a.download = `106_brochure.pdf`;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });

    handleForm("registerForm", "registerSuccess", null, ["firstName", "lastName", "registerEmail", "registerPhone"]);

    // Modal Closing
    document.querySelectorAll(".modal-overlay").forEach(overlay => {
      overlay.addEventListener("click", function (e) {
        if (e.target === this) this.classList.remove("active");
      });
    });

    // Phone Input Intl
    intlTelInput(document.querySelector("#phoneBrochure"), {
      initialCountry: "ae",
      geoIpLookup: cb => cb("AE")
    });

    intlTelInput(document.querySelector("#registerPhone"), {
      initialCountry: "ae",
      geoIpLookup: cb => cb("AE")
    });

  } catch (err) {
    console.error("Landing Init Error:", err);
  }
});
