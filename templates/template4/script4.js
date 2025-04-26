document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get("id");
  if (!projectId) return;

  // Load project JSON
  try {
    const res = await fetch(`/projects/${projectId}.json`);
    if (!res.ok) throw new Error("Failed to load project data");
    const data = await res.json();

    // HERO SECTION
    document.querySelector("#heroVideo source").src = `/media/${projectId}/${data.heroVideo}`;
    document.getElementById("heroVideo").load();
    document.querySelector(".bottom-logo").src = `/media/${projectId}/${data.logoOverlay}`;

    // INTRO BLOCK
    document.querySelector(".intro-left").innerHTML = `DISCOVER ${data.name.toUpperCase()}`;
    document.querySelector(".intro-right").innerText = data.descriptionText;

    // PHOTO HIGHLIGHT
    document.querySelector(".photo-highlight img").src = `/media/${projectId}/${data.descriptionImage}`;
    document.querySelector(".photo-highlight p").innerText = data.quote;

    // DEVELOPER
    document.querySelector(".developer-info p").innerText = `Golden Woods Development, established in 2013, is a leading real estate company in Dubai, specializing in high-end residential projects. Known for quality, innovation, and prime locations, they deliver luxury developments like Golden Wood Views V, Casa Vista Residence By Golden Woods, and Views VII by Golden Woods. Committed to excellence, they offer exceptional value and a refined lifestyle for homeowners and investors.`;

    // LOCATION MAP
    document.querySelector(".location-map img").src = `/media/${projectId}/${data.locationImage}`;

    // GALLERY
    const main = document.getElementById("mainPreview");
    const thumbs = document.getElementById("galleryThumbs");
    main.src = `/media/${projectId}/Gallery/${data.gallery[0]}`;
    data.gallery.forEach(imgName => {
      const thumb = document.createElement("img");
      thumb.src = `/media/${projectId}/Gallery/${imgName}`;
      thumb.onclick = () => main.src = thumb.src;
      thumbs.appendChild(thumb);
    });

    // FORM
    const form = document.getElementById("leadForm");
    const phoneInput = document.querySelector("#phone");
    const iti = window.intlTelInput(phoneInput, {
      initialCountry: "ae",
      utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@17/build/js/utils.js"
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        phone: iti.getNumber(),
        projectId: form.projectId.value
      };

      console.log("Submitting lead payload:", payload);

      const msg = document.getElementById("formStatus");
      msg.textContent = "⏳ Submitting...";
      msg.style.color = "#555";

      try {
        const response = await fetch("/submit-lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (response.ok) {
          msg.textContent = "✅ Thank you! We'll contact you shortly.";
          msg.style.color = "green";
          form.reset();
        } else {
          msg.textContent = "❌ " + (result.message || "Submission failed.");
          msg.style.color = "red";
          console.error("Form Error Response:", result);
        }
      } catch (err) {
        msg.textContent = "❌ Internal error. Check console.";
        msg.style.color = "red";
        console.error("Form Submit Error:", err);
      }
    });

  } catch (err) {
    console.error("Error loading project:", err);
  }
});

// CTA scroll
function scrollToForm() {
  document.getElementById("registerForm").scrollIntoView({ behavior: "smooth" });
}

// Fade-in Animation on Scroll
window.addEventListener("scroll", () => {
  document.querySelectorAll(".fade-in").forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.85) {
      el.classList.add("visible");
    }
  });
});

window.dispatchEvent(new Event('scroll'));


function openDownloadModal(type) {
  document.getElementById("downloadType").value = type;
  document.getElementById("downloadModal").style.display = "flex";
}

function closeDownloadModal() {
  document.getElementById("downloadModal").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  const downloadForm = document.getElementById("downloadForm");
  const downloadPhone = document.getElementById("downloadPhone");
  const itiDownload = window.intlTelInput(downloadPhone, {
    initialCountry: "ae",
    utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@17/build/js/utils.js"
  });

  downloadForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const type = document.getElementById("downloadType").value;
    const payload = {
      name: downloadForm.name.value,
      email: downloadForm.email.value,
      phone: itiDownload.getNumber(),
      projectId: downloadForm.projectId.value
    };

    try {
      const res = await fetch("/submit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const msg = document.getElementById("downloadStatus");
      if (res.ok) {
        msg.style.color = "green";
        msg.textContent = "Thank you! Your download will begin shortly.";
        const file = type === "brochure" ? "Views V Brochure.pdf" : "Fact sheet Views V.pdf";
        setTimeout(() => {
          closeDownloadModal();
          window.open(`/media/104/Downloads/${file}`, "_blank");
        }, 1500);
      } else {
        msg.style.color = "red";
        msg.textContent = "Submission failed. Try again.";
      }
    } catch (err) {
      console.error("Download form error:", err);
    }
  });
});