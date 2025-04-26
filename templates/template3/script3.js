document.addEventListener("DOMContentLoaded", async () => {
  const projectId = "103";
  const base = `/media/${projectId}`;
  const downloadState = { file: null };

  const data = await fetch(`/projects/${projectId}.json`).then(res => res.json());
  document.getElementById("projectTitle").textContent = data.title;
  document.getElementById("projectSubtitle").textContent = data.tagline;
  document.getElementById("projectDescription").textContent = data.description;

  // Gallery
  const gallery = document.getElementById("galleryGrid");
  data.gallery?.forEach(img => {
    const div = document.createElement("div");
    div.innerHTML = `<img src="${base}/gallery/${img}" alt="${img}" />`;
    gallery.appendChild(div);
  });

  // Layouts
  const layoutImgs = [
    "1bhk_layout.png", "2bhk_layout.png",
    "3bhk_layout.png", "townhouse_layout.png", "penthouse_layout.png"
  ];
  const unitGrid = document.getElementById("unitGrid");
  layoutImgs.forEach(file => {
    const name = file.split("_")[0].toUpperCase();
    const div = document.createElement("div");
    div.innerHTML = `<img src="${base}/layouts/${file}" alt="${name}"><p>${name}</p>`;
    unitGrid.appendChild(div);
  });

  // Amenities
  const amenitiesGrid = document.getElementById("amenitiesGrid");
  const amenitiesRaw = await fetch(`${base}/amenities/amenities.txt`).then(res => res.text());
  amenitiesRaw.split("\n").forEach(line => {
    const [file, label] = line.trim().split("|");
    if (file && label) {
      const div = document.createElement("div");
      div.innerHTML = `<img src="${base}/amenities/${file}" alt="${label}" /><p>${label}</p>`;
      amenitiesGrid.appendChild(div);
    }
  });

  // Sticky CTA
  document.getElementById("ctaBtn").addEventListener("click", () => {
    document.getElementById("leadForm").scrollIntoView({ behavior: "smooth" });
  });

  // Intl input
  const phoneField = document.querySelector("#phone");
  const modalPhone = document.querySelector("#modalPhone");
  const iti = window.intlTelInput(phoneField, {
    initialCountry: "ae", separateDialCode: true,
    utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@18.1.1/build/js/utils.js",
  });
  const itiModal = window.intlTelInput(modalPhone, {
    initialCountry: "ae", separateDialCode: true,
    utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@18.1.1/build/js/utils.js",
  });

  // Register Form
  document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = `${document.getElementById("firstName").value} ${document.getElementById("lastName").value}`;
    const payload = {
      name,
      email: document.getElementById("email").value,
      phone: iti.getNumber(),
      projectId
    };

    await fetch("/submit-lead", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    alert("Lead submitted. Our team will contact you.");
    e.target.reset();
  });

  // Modal Logic
  function openModal(filePath) {
    downloadState.file = filePath;
    document.getElementById("downloadModal").classList.remove("hidden");
  }

  function closeModal() {
    downloadState.file = null;
    document.getElementById("downloadModal").classList.add("hidden");
  }

  // Trigger Buttons
  document.getElementById("downloadBrochureBtn").onclick = () => openModal(`${base}/downloads/brochure.pdf`);
  document.getElementById("downloadFloorplanBtn").onclick = () => openModal(`${base}/downloads/floorplans.pdf`);
  document.getElementById("downloadPaymentBtn").onclick = () => openModal(`${base}/downloads/payment_plan.pdf`);

  // Modal Form Submit
  document.getElementById("modalForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById("modalName").value,
      email: document.getElementById("modalEmail").value,
      phone: itiModal.getNumber(),
      projectId
    };

    const res = await fetch("/submit-lead", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok && downloadState.file) {
      const a = document.createElement("a");
      a.href = downloadState.file;
      a.download = "";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      closeModal();
    }
  });

  // Close modal on outside click
  window.onclick = (e) => {
    const modal = document.getElementById("downloadModal");
    if (e.target === modal) closeModal();
  };
});
