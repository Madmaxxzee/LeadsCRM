document.addEventListener("DOMContentLoaded", async function () {
  const projectId = new URLSearchParams(window.location.search).get("id");
  if (!projectId) return;

  try {
    const res = await fetch(`/projects/${projectId}.json`);
    const data = await res.json();

    document.getElementById("projectTitle").textContent = data.title || "";
    document.getElementById("project-description").innerHTML =
      `<p>${data.description || ""}</p>`;

    // Form Submission
    function handleForm(formId, successId, spinnerId, fields) {
      const form = document.getElementById(formId);
      const success = document.getElementById(successId);
      const spinner = document.getElementById(spinnerId);
      const btn = form.querySelector("button");

      form.addEventListener("submit", async e => {
        e.preventDefault();
        let valid = true;
        const payload = {};

        fields.forEach(id => {
          const input = document.getElementById(id);
          if (!input.value.trim()) {
            input.classList.add("input-error");
            valid = false;
          } else {
            input.classList.remove("input-error");
            if (id.includes("name")) payload.name = input.value;
            if (id.includes("email")) payload.email = input.value;
            if (id.includes("phone")) payload.phone = input.value;
          }
        });

        if (!valid) return;
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
        }
      });
    }

    handleForm("brochureForm", "brochureSuccess", "brochureSpinner", ["nameBrochure", "emailBrochure", "phoneBrochure"]);
    handleForm("enquireForm", "enquireSuccess", "enquireSpinner", ["nameEnquiry", "emailEnquiry", "phoneEnquiry"]);

    // Modal Control
    document.getElementById("downloadBtn").addEventListener("click", () => {
      document.getElementById("brochureModal").classList.add("active");
    });
    document.getElementById("enquireBtn").addEventListener("click", () => {
      document.getElementById("enquireModal").classList.add("active");
    });
    document.querySelectorAll(".close-modal").forEach(btn => {
      btn.addEventListener("click", () => {
        btn.closest(".modal-overlay").classList.remove("active");
      });
    });

    // Intl Input
    intlTelInput(document.getElementById("phoneBrochure"), { initialCountry: "ae" });
    intlTelInput(document.getElementById("phoneEnquiry"), { initialCountry: "ae" });

  } catch (err) {
    console.error("Template 1 load error:", err);
  }
});
