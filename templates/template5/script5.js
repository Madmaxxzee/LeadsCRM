let requestedFile = null; // Track which file was requested

function getRandomCTA() {
  const ctas = [
    "Register Your Interest",
    "Discover More",
    "Invest Now",
    "Unlock Exclusive Deals",
    "Get Project Details"
  ];
  return ctas[Math.floor(Math.random() * ctas.length)];
}

document.addEventListener("DOMContentLoaded", () => {
  const pdfContainer = document.getElementById("pdfContainer");
  const url = "/media/105/brochure.pdf";

  pdfjsLib.getDocument(url).promise.then(pdf => {
    const totalPages = pdf.numPages;
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      pdf.getPage(pageNum)
        .then(page => {
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
    
          page.render({ canvasContext: context, viewport }).promise.then(() => {
            pdfContainer.appendChild(canvas);
    
            if (pageNum === 1) {
              // 👉 Insert the Top Brochure/Factsheet buttons AFTER first page
              const topCTA = document.createElement("div");
              topCTA.className = "top-downloads";
              topCTA.innerHTML = `
                <button class="download-btn" data-type="brochure">BROCHURE ⬇</button>
                <button class="download-btn" data-type="factsheet">FACTSHEET ⬇</button>
              `;
              pdfContainer.appendChild(topCTA);
    
              // 👉 Setup download button click handlers again
              topCTA.querySelectorAll(".download-btn").forEach(btn => {
                btn.addEventListener("click", () => {
                  requestedFile = btn.dataset.type;
                  document.getElementById("downloadModal").style.display = "block";
                });
              });
            }
    
            // 👉 Then normal CTA after every page
            const cta = document.createElement("button");
            cta.className = "scroll-cta dynamic";
            cta.textContent = getRandomCTA();
            cta.onclick = scrollToForm;
            pdfContainer.appendChild(cta);
          });
        })    
        .catch(err => console.error(`Error rendering page ${pageNum}:`, err));
    }
  }).catch(err => console.error("PDF loading error:", err));

  // Phone Input for main form
  const iti = window.intlTelInput(document.querySelector("#phone"), {
    initialCountry: "ae",
    utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@17/build/js/utils.js"
  });

  // Main form submission
  const form = document.getElementById("leadForm");
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const data = {
      name: form.name.value,
      email: form.email.value,
      phone: iti.getNumber(),
      projectId: form.projectId.value
    };

    try {
      const res = await fetch("/submit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const msg = document.getElementById("formStatus");
      msg.textContent = res.ok ? "Thank you! We'll contact you soon." : "Something went wrong.";
      if (res.ok) form.reset();
    } catch (err) {
      console.error("Form error:", err);
    }
  });

  // Handle download buttons
  document.querySelectorAll(".download-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      requestedFile = btn.dataset.type; // 'brochure' or 'factsheet'
      document.getElementById("downloadModal").style.display = "block";
    });
  });

  // Modal form submission
  const modalForm = document.getElementById("downloadForm");
  modalForm.addEventListener("submit", async e => {
    e.preventDefault();
    const formData = {
      name: `${modalForm.firstName.value} ${modalForm.lastName.value}`,
      email: modalForm.email.value,
      phone: modalForm.phone.value,
      propertyType: modalForm.propertyType.value,
      budget: modalForm.budget.value,
      projectId: "105"
    };

    try {
      const res = await fetch("/submit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        document.getElementById("formFeedback").textContent = "Thank you! Your download will start shortly.";
        modalForm.reset();
        setTimeout(() => {
          closeModal();
          if (requestedFile === "brochure") {
            window.open("/media/105/Downloads/brochure.pdf", "_blank");
          } else if (requestedFile === "factsheet") {
            window.open("/media/105/Downloads/factsheet.pdf", "_blank");
          }
        }, 1000);
      } else {
        document.getElementById("formFeedback").textContent = "Something went wrong. Try again.";
      }
    } catch (err) {
      console.error("Modal form error:", err);
      document.getElementById("formFeedback").textContent = "Submission failed.";
    }
  });
});

function scrollToForm() {
  document.getElementById("registerForm").scrollIntoView({ behavior: "smooth" });
}

function closeModal() {
  document.getElementById("downloadModal").style.display = "none";
}
