document.addEventListener("DOMContentLoaded", () => {
  const projectId    = "101";
  const baseUrl      = `media/${projectId}`;
  const jsonUrl      = `/projects/${projectId}.json`;

  // DOM refs
  const heroVideo    = document.getElementById("heroVideo");
  const heroImg      = document.getElementById("heroImg");
  const pageTitle    = document.getElementById("pageTitle");
  const projectTitle = document.getElementById("projectTitle");
  const projectSub   = document.getElementById("projectSub");
  const projectDesc  = document.getElementById("projectDesc");
  const projectLogo  = document.getElementById("projectLogo");
  const btnBrochure  = document.getElementById("btnBrochure");
  const btnPaymentplan = document.getElementById("btnPaymentplan");
  const btnFactsheet = document.getElementById("btnFactsheet");
  const btnCallback  = document.getElementById("btnCallback");
  const galleryDiv   = document.getElementById("gallery");
  const unitsDiv     = document.getElementById("units");
  const amenitiesDiv = document.getElementById("amenities");
  const mapDiv       = document.getElementById("map");
  const form         = document.getElementById("callbackForm");
  const successMsg   = document.getElementById("successMsg");

  // Load JSON
  fetch(jsonUrl)
    .then(r => r.json())
    .then(data => {
      pageTitle.textContent    = data.title;
      projectTitle.textContent = data.title;
      projectSub.textContent   = data.subheading;
      projectDesc.textContent  = data.description;

      // hero media
      heroVideo.addEventListener("canplay", () => { heroImg.style.display = "none"; });
      heroVideo.querySelector("source").src = `${baseUrl}/${data.video}`;
      heroVideo.load();
      projectLogo.src = `${baseUrl}/${data.image}`;

      // docs
      btnBrochure.href     = `${baseUrl}/${data.documents.brochure}`;
      btnPaymentplan.href = `${baseUrl}/${data.documents.paymentplan}`;
      btnFactsheet.onclick = () => window.open(`${baseUrl}/${data.documents.factsheet}`);
    });

  // Gallery
  const galleryFiles = [ "1.jpg","2.jpg","3.png","4.jpg","5.png","6.jpg","7.jpg","8.jpg","9.png","10.jpg","11.jpg","12.png","13.png","14.png","15.jpg","16.jpg","17.png","18.jpg","19.jpg" ];
  galleryFiles.forEach(f => {
    const img = new Image();
    img.src = `${baseUrl}/gallery/${f}`;
    galleryDiv.appendChild(img);
  });

  // Units
  const units = [
    { folder:"Studio Apartment", title:"Studio Apartment" },
    { folder:"1 Bed Apartment",  title:"1 Bed Apartment" },
    { folder:"2 Bed Apartment",  title:"2 Bed Apartment" }
  ];
  units.forEach(u => {
    const col = document.createElement("div");
    col.className = "col-md-4 mb-4";
    col.innerHTML = `
      <div class="card res-card">       
        <img src="${baseUrl}/${u.folder}/image.jpg" class="card-img-top">
        <div class="card-body text-center"><h5>${u.title}</h5></div>
      </div>`;
    unitsDiv.appendChild(col);
  });

  // Amenities
  fetch(`${baseUrl}/amenities.json`)
    .then(r=>r.json())
    .then(list => {
      list.indoor.concat(list.outdoor).forEach(label => {
        const span = document.createElement("span");
        span.className = "badge";
        span.textContent = label;
        amenitiesDiv.appendChild(span);
      });
    });

  // Map
  fetch(`${baseUrl}/map.json`)
    .then(r=>r.json())
    .then(loc => {
      window.initMap = () => new google.maps.Map(mapDiv, { center:loc, zoom:14 });
      const s = document.createElement("script");
      s.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCn3k900b4cvHanhVxuHRPfS4NDV_UHaZ8&callback=initMap`;
      document.body.appendChild(s);
    });

  // Form & downloads
  function validateForm() {
    let ok = true;
    ["name","email","phone"].forEach(id => {
      const inp = document.getElementById(id);
      if (!inp.value.trim()) { inp.classList.add("is-invalid"); ok = false; }
      else inp.classList.remove("is-invalid");
    });
    return ok;
  }
  function scrollToForm() {
    form.scrollIntoView({ behavior:"smooth", block:"center" });
    const inv = form.querySelector(".is-invalid");
    if (inv) inv.focus();
  }

  [btnBrochure, btnPaymentplan, btnFactsheet].forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      if (validateForm()) window.open(btn.href, "_blank");
      else scrollToForm();
    });
  });
  btnCallback.addEventListener("click", e => { e.preventDefault(); scrollToForm(); });

  intlTelInput(document.getElementById("phone"), { initialCountry:"ae" });
  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (!validateForm()) return scrollToForm();
    const payload = {
      name: document.getElementById("name").value.trim(),
      email:     document.getElementById("email").value.trim(),
      phone:     document.getElementById("phone").value.trim(),
      projectId
    };
    const res = await fetch("/submit-lead", {
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload)
    });
    if (res.ok) successMsg.style.display = "block";
  });
});
